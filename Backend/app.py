import base64
import datetime
import io
import json
import os
import shlex
import subprocess

import jwt
import pyotp
import qrcode
from dotenv import load_dotenv
from flask import (Flask, jsonify, make_response, redirect,
                   render_template_string, request, session)
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import check_password_hash, generate_password_hash

load_dotenv()


# --- Flask App Setup ---
app = Flask(__name__)

# Use environment-provided secrets; fall back to unsafe defaults for local dev only
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'change-me-in-prod')
CORS(app, resources={
    r"/*": {
        "origins": [
            "http://127.0.0.1:5173",
            "http://localhost:5173",
            "http://127.0.0.1:8080",
            "http://localhost:8080",
        ],
        "supports_credentials": True,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})
# JWT signing key
SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'change-me-jwt-in-prod')
# PostgreSQL database config (adjust this!)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URI")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


# --- User Model ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    username = db.Column(db.String(120), nullable=True)
    password_hash = db.Column(db.Text, nullable=False)
    user_group = db.Column(db.Text, nullable=True)
    otp_secret = db.Column(db.String(32), nullable=True)
    is_2fa_enabled = db.Column(db.Boolean, default=False)
    _2fa_completed = db.Column(db.Boolean, default=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def set_user_group(self, user_group):
        self.user_group = user_group

    def set_username(self, username):  
        self.username = username

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

# --- Dashboard Model ---
class Dashboard(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    panels = db.Column(db.Text, nullable=False)  # JSON string of panel configurations
    pinned_panels = db.Column(db.Text, nullable=True)  # JSON string of pinned panel configurations
    created_at = db.Column(db.DateTime, default=datetime.datetime.now(datetime.UTC))
    updated_at = db.Column(db.DateTime, default=datetime.datetime.now(datetime.UTC), onupdate=datetime.datetime.now(datetime.UTC))
    
    # Relationship
    user = db.relationship('User', backref=db.backref('dashboards', lazy=True))

def generate_token(user):
    payload = {
        'user_id': user.id,
        'exp': datetime.datetime.now(datetime.UTC) + datetime.timedelta(hours=12)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

# Ensure tables exist on startup (container may restart until DB is ready)
with app.app_context():
    try:
        db.create_all()
    except Exception:
        # Avoid crashing on import logs; container orchestration will retry
        pass

"""
ORIGINAL LOGIN ROUTE (DB-auth only)
"""

@app.route('/app/login', methods=['POST'])
def input_form():
    data = request.get_json()
    identifier = data.get("email")
    password = data.get("password")

    if not identifier or not password:
        return jsonify({'error': 'Email/Username and password are required'}), 400

    user = User.query.filter((User.email == identifier) | (User.username == identifier)).first()

    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid username or password'}), 401

    token = generate_token(user)
    session['user'] = user.email
    session['role'] = user.user_group

    return jsonify({
        'message': 'Login successful',
        'user': user.email,
        'username': user.username,
        'role': user.user_group,
        'token': token,
        '2fa_required': user.is_2fa_enabled,
        'user_id': user.id
    }), 200

"""
NEW: API ROUTE FOR REMOTE FILE LISTING VIA SSH
"""

@app.route('/api/list-ldap-server-files', methods=['GET'])
def list_ldap_server_files():
    # Configuration for the remote server
    # !!! IMPORTANT: Replace with your actual LDAP Server IP and username !!!
    LDAP_SERVER_IP = "IPHERE"
    LDAP_SERVER_USER = "user_on_ldap_server"

    # Command to execute on the remote server
    command_to_run = "ls -la /home"  # Example: list contents of /home

    try:
        ssh_command = [
            "ssh",
            "-o", "StrictHostKeyChecking=no",  # Bypasses host key verification
            f"{LDAP_SERVER_USER}@{LDAP_SERVER_IP}",
            command_to_run
        ]

        result = subprocess.run(
            ssh_command,
            capture_output=True,
            text=True,
            check=True,  # Raise an error if SSH fails
            timeout=15
        )
        return jsonify({'status': 'success', 'files': result.stdout.splitlines()})
    except subprocess.CalledProcessError as e:
        return jsonify({'status': 'error', 'message': f"Command failed on remote server: {e.stderr}"}), 500
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/protected')
def protected():
	if 'user' in session:
		return f"Welcome, {session['user']}! <a href='/logout'>Logout</a>"
	return redirect('/')

@app.route('/logout')
def logout():
	session.clear()
	return redirect('/')

@app.route('/app/2fa', methods=['POST'])
def setup_2fa():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        identifier = data.get('email')  # can be email or username
        if not identifier:
            return jsonify({'error': 'Email/Username is required'}), 400

        user = User.query.filter((User.email == identifier) | (User.username == identifier)).first()
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
        import traceback
        traceback.print_exc()
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

        identifier = data.get('email')  # can be email or username
        code = data.get('code')

        if not identifier or not code:
            return jsonify({'error': 'Email/Username and code are required'}), 400

        user = User.query.filter((User.email == identifier) | (User.username == identifier)).first()
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

@app.route('/api/users', methods=['GET'])
def get_users():
    users = User.query.all()
    user_list = [{'email': u.email, 'username': u.username, 'user_group': u.user_group, 'password': '*'} for u in users]
    print(f"[DEBUG] Returning {len(user_list)} users")
    print(f"[DEBUG] Users: {user_list}")
    return jsonify(user_list), 200

@app.route('/api/users', methods=['POST'])
def add_user():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    username = data.get('username')
    user_group = data.get('user_group', 'viewer')

    if not email or not password or not username or not user_group:
        return jsonify({'error': 'Email, username, password, and user group are required'}), 400

    # Check local DB
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'User already exists'}), 409

    # Add to local DB
    user = User(email=email)
    user.set_password(password)
    user.set_user_group(user_group)
    user.set_username(username)
    db.session.add(user)
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Database error: {str(e)}'}), 500

    return jsonify({'message': 'User added'}), 201

@app.route('/api/users/<path:identifier>', methods=['DELETE'])
def delete_user(identifier):
    user = User.query.filter((User.email == identifier) | (User.username == identifier)).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Remove from local DB
    db.session.delete(user)
    db.session.commit()

    return jsonify({'message': 'User deleted'}), 200

# --- Dashboard Routes ---
@app.route('/app/dashboard', methods=['GET'])
def get_dashboard():
    """Get the current user's dashboard configuration"""
    token = None
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(" ")[1]

    if not token:
        return jsonify({'error': 'Token is missing!'}), 401

    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user_id = decoded['user_id']
        
        # Get user's dashboard
        dashboard = Dashboard.query.filter_by(user_id=user_id).first()
        
        if dashboard:
            return jsonify({
                'panels': json.loads(dashboard.panels),
                'pinned_panels': json.loads(dashboard.pinned_panels) if dashboard.pinned_panels else [],
                'created_at': dashboard.created_at.isoformat(),
                'updated_at': dashboard.updated_at.isoformat()
            }), 200
        else:
            # Return empty dashboard if none exists
            return jsonify({'panels': [], 'pinned_panels': []}), 200
            
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token has expired!'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token!'}), 401
    except Exception as e:
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@app.route('/app/dashboard', methods=['POST'])
def save_dashboard():
    """Save the current user's dashboard configuration"""
    token = None
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(" ")[1]

    if not token:
        return jsonify({'error': 'Token is missing!'}), 401

    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user_id = decoded['user_id']
        
        data = request.get_json()
        if not data or 'panels' not in data:
            return jsonify({'error': 'Panels data is required'}), 400
        
        panels = data['panels']
        pinned_panels = data.get('pinned_panels', []) # Get pinned panels from request
        
        # Check if dashboard exists for this user
        dashboard = Dashboard.query.filter_by(user_id=user_id).first()
        
        if dashboard:
            # Update existing dashboard
            dashboard.panels = json.dumps(panels)
            dashboard.pinned_panels = json.dumps(pinned_panels) # Update pinned panels
            dashboard.updated_at = datetime.datetime.now(datetime.UTC)
        else:
            # Create new dashboard
            dashboard = Dashboard(
                user_id=user_id,
                panels=json.dumps(panels),
                pinned_panels=json.dumps(pinned_panels) # Initialize pinned panels
            )
            db.session.add(dashboard)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Dashboard saved successfully',
            'panels': panels,
            'pinned_panels': pinned_panels
        }), 200
        
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token has expired!'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token!'}), 401
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@app.route('/app/dashboard/pin', methods=['POST'])
def pin_panel():
    """Pin or unpin a panel to/from dashboard"""
    token = None
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(" ")[1]

    if not token:
        return jsonify({'error': 'Token is missing!'}), 401

    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user_id = decoded['user_id']
        
        data = request.get_json()
        if not data or 'panel' not in data or 'action' not in data:
            return jsonify({'error': 'Panel data and action are required'}), 400
        
        panel = data['panel']
        action = data['action']  # 'pin' or 'unpin'
        
        # Get user's dashboard
        dashboard = Dashboard.query.filter_by(user_id=user_id).first()
        
        if not dashboard:
            return jsonify({'error': 'Dashboard not found'}), 404
        
        # Get current pinned panels
        current_pinned = json.loads(dashboard.pinned_panels) if dashboard.pinned_panels else []
        
        if action == 'pin':
            # Check if panel is already pinned
            if not any(p['id'] == panel['id'] for p in current_pinned):
                current_pinned.append(panel)
                message = 'Panel pinned successfully'
            else:
                return jsonify({'error': 'Panel is already pinned'}), 400
        elif action == 'unpin':
            # Remove panel from pinned list
            current_pinned = [p for p in current_pinned if p['id'] != panel['id']]
            message = 'Panel unpinned successfully'
        else:
            return jsonify({'error': 'Invalid action. Use "pin" or "unpin"'}), 400
        
        # Update dashboard
        dashboard.pinned_panels = json.dumps(current_pinned)
        dashboard.updated_at = datetime.datetime.now(datetime.UTC)
        db.session.commit()
        
        return jsonify({
            'message': message,
            'pinned_panels': current_pinned
        }), 200
        
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token has expired!'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token!'}), 401
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500


users = {
	"jonathan@example.com": {
		"pwd": "ILIkari7",
		"group": "viewer",
		"username": "jonathan"
	},
	"madhu@example.com": {
		"pwd": "Kickass-Password",
		"group": "viewer",
		"username": "madhu"
	},
	"chandan@example.com": {
		"pwd": "Hashed-Password",
		"group": "admin",
		"username": "chandan"
	}
}

# driver function
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        print("Created Users")
        for email in users:
            user = User(email=email)
            print("Created User")
            user.set_password(users[email]["pwd"])
            print("Set Password")
            user.set_user_group(users[email]["group"])
            print("Set Group")
            user.set_username(users[email]["username"])
            print("Set Username")
            user._2fa_completed = False  # Initialize 2FA completion status
            db.session.add(user)
            print("Added User to Session")
        db.session.commit()
        print("Committed Session")
    app.run(host='0.0.0.0', port=5000, debug=True)