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
    password_hash = db.Column(db.String(128), nullable=False)
    otp_secret = db.Column(db.String(32), nullable=True)
    is_2fa_enabled = db.Column(db.Boolean, default=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


# --- Routes ---

# 1. Login user (with optional 2FA check)
@app.route('/app/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    if not user or not user.check_password(data['password']):
        return jsonify({'success': False, 'msg': 'Invalid credentials'}), 401

    if user.is_2fa_enabled:
        return jsonify({'success': True, '2fa_required': True, 'user_id': user.id})
    
    return jsonify({'success': True, '2fa_required': False, 'user_id': user.id})


# 2. Setup 2FA (generate secret + QR code)
@app.route('/api/2fa/setup', methods=['GET'])
def setup_2fa():
    user_id = request.args.get('user_id')
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    secret = pyotp.random_base32()
    user.otp_secret = secret
    db.session.commit()

    uri = pyotp.totp.TOTP(secret).provisioning_uri(name=user.email, issuer_name="MyApp")
    qr = qrcode.make(uri)
    buf = io.BytesIO()
    qr.save(buf, format='PNG')
    img_b64 = base64.b64encode(buf.getvalue()).decode()

    return jsonify({'qr_code': img_b64})


# 3. Verify 2FA code (enable 2FA)
@app.route('/api/2fa/verify', methods=['POST'])
def verify_2fa():
    data = request.json
    user = User.query.get(data['user_id'])
    if not user or not user.otp_secret:
        return jsonify({'success': False, 'msg': 'Invalid request'}), 400

    totp = pyotp.TOTP(user.otp_secret)
    if totp.verify(data['code']):
        user.is_2fa_enabled = True
        db.session.commit()
        return jsonify({'success': True})
    else:
        return jsonify({'success': False, 'msg': 'Invalid 2FA code'}), 401


# 4. Login with 2FA code
@app.route('/api/2fa/login', methods=['POST'])
def login_with_2fa():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    if not user or not user.check_password(data['password']):
        return jsonify({'success': False, 'msg': 'Invalid credentials'}), 401

    totp = pyotp.TOTP(user.otp_secret)
    if totp.verify(data['code']):
        return jsonify({'success': True, 'msg': 'Logged in with 2FA'})
    else:
        return jsonify({'success': False, 'msg': 'Invalid 2FA code'}), 401


if __name__ == '__main__':
    app.run(debug=True)
