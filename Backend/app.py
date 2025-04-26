import base64
import io

import pyotp
import qrcode
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import check_password_hash, generate_password_hash

# --- Flask App Setup ---
app = Flask(__name__)
CORS(app)  # Allow requests from frontend (React)

# PostgreSQL database config (adjust this!)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:DBUSER@localhost:5432/Users_info'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


# --- User Model ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.Text, nullable=False)
    otp_secret = db.Column(db.String(32), nullable=True)
    is_2fa_enabled = db.Column(db.Boolean, default=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


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
        user.is_2fa_enabled = True
        db.session.commit()
        # If 2FA is enabled, tell the frontend to go to 2FA
        return jsonify({
            'user_group': 'admin',
            '2fa_required': user.is_2fa_enabled,
            'user_id': user.id
        }), 200
    else:
        return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/app/2fa', methods=['POST'])
def setup_2fa():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid credentials'}), 401

    # Only generate a new secret if not already set
    if not user.otp_secret:
        secret = pyotp.random_base32()
        user.otp_secret = secret
        db.session.commit()
    else:
        secret = user.otp_secret

    uri = pyotp.totp.TOTP(secret).provisioning_uri(name=user.email, issuer_name="MyApp")
    qr = qrcode.make(uri)
    buf = io.BytesIO()
    qr.save(buf, format='PNG')
    img_b64 = base64.b64encode(buf.getvalue()).decode()

    return jsonify({'qr_code': img_b64})

@app.route('/app/verify-2fa', methods=['POST'])
def verify_2fa():
    data = request.get_json()
    email = data.get('email')
    code = data.get('code')

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if not user.otp_secret:
        return jsonify({'error': '2FA not set up'}), 400

    totp = pyotp.TOTP(user.otp_secret)
    if totp.verify(code):
        return jsonify({'status': 'success'}), 200
    else:
        return jsonify({'error': 'Invalid code'}), 401

# driver function 
if __name__ == '__main__': 
    # with app.app_context():
    #     db.create_all()
    #     new_user = User(email="chandan@example.com")
    #     new_user.set_password("Hashed-Password")
    #     db.session.add(new_user)
    #     db.session.commit()
    app.run(debug = True) 