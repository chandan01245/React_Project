import base64
import datetime
import io
from functools import wraps

import jwt
import pyotp
import qrcode
from flask import Flask, jsonify, make_response, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import check_password_hash, generate_password_hash

# --- Flask App Setup ---
app = Flask(__name__)
CORS(app, resources={
    r"/app/*": {
        "origins": ["http://localhost:5173"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})
SECRET_KEY = 'Hashed-Password'
# PostgreSQL database config (adjust this!)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:DBUSER@localhost:5432/Dummy_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


# --- User Model ---
class User(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	email = db.Column(db.String(120), unique=True, nullable=False)
	password_hash = db.Column(db.Text, nullable=False)
	user_group = db.Column(db.Text, nullable=True)
	otp_secret = db.Column(db.String(32), nullable=True)
	is_2fa_enabled = db.Column(db.Boolean, default=False)
	_2fa_completed = db.Column(db.Boolean, default=False)

	def set_password(self, password):
		self.password_hash = generate_password_hash(password)

	def set_user_group(self, user_group):
		self.user_group = user_group

	def check_password(self, password):
		return check_password_hash(self.password_hash, password)

def generate_token(user):
	payload = {
		'user_id': user.id,
		'exp': datetime.datetime.now() + datetime.timedelta(hours=12)
	}
	return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

# --- Routes ---
# returns "API Works" when we use GET.
# returns the data that we send when we use POST.
@app.route('/app/login', methods=['POST'])
def input_form():
	data = request.get_json()
	email = data.get("email")
	password = data.get("password")

	user = User.query.filter_by(email=email).first()
	if user and user.check_password(password):
		token = generate_token(user)
		# Only require 2FA if it's enabled for the user
		return jsonify({
			'token': token,
			'user_group': user.user_group,
			'2fa_required': user.is_2fa_enabled,
			'user_id': user.id
		}), 200
	else:
		return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/app/2fa', methods=['POST'])
def setup_2fa():
	try:
		data = request.get_json()
		if not data:
			return jsonify({'error': 'No data provided'}), 400

		email = data.get('email')
		if not email:
			return jsonify({'error': 'Email is required'}), 400

		user = User.query.filter_by(email=email).first()
		if not user:
			return jsonify({'error': 'User not found'}), 404

		# Only generate a new secret if not already set
		if not user.otp_secret:
			secret = pyotp.random_base32()
			user.otp_secret = secret
			db.session.commit()
		else:
			secret = user.otp_secret

		# Generate the provisioning URI
		uri = pyotp.totp.TOTP(secret).provisioning_uri(
			name=user.email,
			issuer_name="MyApp"
		)
		
		# Generate QR code
		qr = qrcode.make(uri)
		buf = io.BytesIO()
		qr.save(buf, format='PNG')
		img_b64 = base64.b64encode(buf.getvalue()).decode()

		return jsonify({'qr_code': img_b64}), 200

	except Exception as e:
		return jsonify({'error': 'Failed to generate QR code'}), 500

@app.route('/app/user', methods=['GET'])
def verify_user():
	token = None
	# Get token from Authorization header
	auth_header = request.headers.get('Authorization')
	if auth_header and auth_header.startswith('Bearer '):
		token = auth_header.split(" ")[1]

	if not token:
		return jsonify({'message': 'Token is missing!'}), 401

	try:
		decoded = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
		current_user = User.query.filter_by(id=decoded['user_id']).first()
		return jsonify({'message': 'User verified!',"user_group": current_user.user_group}), 200
	except jwt.ExpiredSignatureError:
		return jsonify({'message': 'Token has expired!'}), 401
	except jwt.InvalidTokenError:
		return jsonify({'message': 'Invalid token!'}), 401

@app.route('/app/verify-2fa', methods=['POST'])
def verify_2fa():
	try:
		data = request.get_json()
		if not data:
			return jsonify({'error': 'No data provided'}), 400

		email = data.get('email')
		code = data.get('code')

		if not email or not code:
			return jsonify({'error': 'Email and code are required'}), 400

		user = User.query.filter_by(email=email).first()
		if not user:
			return jsonify({'error': 'User not found'}), 404

		if not user.otp_secret:
			return jsonify({'error': '2FA not set up'}), 400

		totp = pyotp.TOTP(user.otp_secret)
		if totp.verify(code):
			user._2fa_completed = True
			db.session.commit()
			return jsonify({
				'status': 'success',
				'user_group': user.user_group
			}), 200
		else:
			return jsonify({'error': 'Invalid code'}), 401

	except Exception as e:
		return jsonify({'error': 'Internal server error'}), 500

@app.route('/app/2fa-status', methods=['GET'])
def get_2fa_status():
    token = None
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(" ")[1]

    if not token:
        return jsonify({'error': 'Token is missing!'}), 401

    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user = User.query.filter_by(id=decoded['user_id']).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        return jsonify({
            'is_2fa_enabled': user.is_2fa_enabled,
            'email': user.email,
            '2fa_completed': user._2fa_completed
        }), 200
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token has expired!'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token!'}), 401

@app.route('/app/update-2fa-status', methods=['POST'])
def update_2fa_status():
    data = request.get_json()
    email = data.get('email')
    is_2fa_enabled = data.get('is_2fa_enabled')

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    user.is_2fa_enabled = True if is_2fa_enabled else False
    db.session.commit()

    return jsonify({'message': '2FA status updated successfully'}), 200

users = {
	"jonathan@example.com": {
		"pwd": "ILIkari7",
		"group": "viewer"
	},
	"madhu@example.com": {
		"pwd": "Kickass-Password",
		"group": "viewer"
	},
	"chandan@example.com": {
		"pwd": "Hashed-Password",
		"group": "admin"
	}
}

# driver function
if __name__ == '__main__':
    # with app.app_context():
    #     db.create_all()
    #     for email in users:
    #         user = User(email=email)
    #         user.set_password(users[email]["pwd"])
    #         user.set_user_group(users[email]["group"])
    #         user._2fa_completed = False  # Initialize 2FA completion status
    #         db.session.add(user)
    #     db.session.commit()
    app.run(debug = True)