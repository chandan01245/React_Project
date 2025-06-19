import base64
import datetime
import io
import paramiko
from dotenv import load_dotenv
import os
import jwt
import pyotp
import qrcode
from flask import Flask, jsonify, make_response, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import check_password_hash, generate_password_hash
from flask import Flask, request, redirect, render_template_string, session
from ldap3 import Server, Connection, ALL, SUBTREE
from ldap3.core.exceptions import LDAPBindError
from ldap3 import MODIFY_REPLACE


load_dotenv()

LDAP_SERVER = f'ldap://{os.getenv("LDAP_SERVER_IP")}:389'
LDAP_BASE_DN = 'dc=example,dc=com'
LDAP_ADMIN_PASSWORD = os.getenv("LDAP_ADMIN_PASSWORD")

# --- Flask App Setup ---
app = Flask(__name__)

app.secret_key = 'supersecretkey'
CORS(app, resources={
    r"/*": {
        "origins": ["http://127.0.0.1:5173", "http://localhost:5173"],
        "supports_credentials": True,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})
SECRET_KEY = 'Hashed-Password'
# PostgreSQL database config (adjust this!)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URI")
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
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=12)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

# --- Routes ---
# returns "API Works" when we use GET.
@app.route('/app/login', methods=['POST'])
def input_form():
    data = request.get_json()
    identifier = data.get("email")  # This can be email or username
    password = data.get("password")

    print(f"[DEBUG] Received login request - Identifier: {identifier}")

    if not identifier or not password:
        return jsonify({'error': 'Email/Username and password are required'}), 400

    try:
        server = Server(LDAP_SERVER, get_info=ALL)
        conn = Connection(server, auto_bind=True)

        # Determine if identifier is an email or username
        if '@' in identifier:
            search_filter = f"(mail={identifier})"
        else:
            search_filter = f"(uid={identifier})"

        print(f"[DEBUG] Searching for user with filter: {search_filter}")
        conn.search(
            search_base=LDAP_BASE_DN,
            search_filter=search_filter,
            search_scope=SUBTREE,
            attributes=[]
        )

        if not conn.entries:
            print(f"[ERROR] No user found for identifier: {identifier}")
            return jsonify({'error': 'User not found in LDAP'}), 404

        user_dn = conn.entries[0].entry_dn
        print(f"[DEBUG] Found user DN: {user_dn}")

        # Bind with DN and password
        conn = Connection(server, user=user_dn, password=password)
        print("[DEBUG] Attempting LDAP bind...")
        if not conn.bind():
            print(f"[ERROR] LDAP bind failed. Result: {conn.result}")
            return jsonify({'error': 'Invalid credentials'}), 401

        print(f"[DEBUG] LDAP bind successful for {user_dn}")

        # Extract OU from DN (e.g., ou=admin,...)
        user_ou = next((rdn.split('=')[1] for rdn in user_dn.split(',') if rdn.lower().startswith('ou=')), None)
        print(f"[DEBUG] Extracted OU: {user_ou}")

        # Local DB check
        user = User.query.filter_by(email=identifier).first()
        if not user:
            print("[ERROR] User not found in local DB.")
            return jsonify({'error': 'User metadata not found'}), 404

        token = generate_token(user)
        session['user'] = identifier
        session['role'] = user_ou

        return jsonify({
            'message': 'Login successful',
            'user': identifier,
            'role': user_ou,
            'token': token,
            '2fa_required': user.is_2fa_enabled,
            'user_id': user.id
        }), 200

    except LDAPBindError as e:
        print(f"[ERROR] LDAP bind error: {str(e)}")
        return jsonify({'error': 'LDAP bind failed'}), 401

    except Exception as e:
        print(f"[ERROR] LDAP connection exception: {str(e)}")
        return jsonify({'error': f'LDAP error: {str(e)}'}), 500


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

@app.route('/api/users', methods=['GET'])
def get_users():
    users = User.query.all()
    user_list = [{'email': u.email, 'password': '*'} for u in users]
    print(f"[DEBUG] Returning {len(user_list)} users")
    print(f"[DEBUG] Users: {user_list}")
    return jsonify(user_list), 200

@app.route('/api/users', methods=['POST'])
def add_user():
    print("DEBUG: Received request to add user")
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    user_group = data.get('user_group', 'viewer')
    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'error': 'User already exists'}), 409

    user = User(email=email)
    user.set_password(password)
    user.set_user_group(user_group)
    db.session.add(user)
    db.session.commit()
    print("DEBUG: User added to PostgreSQL")

    username = email.split('@')[0]
    user_dn = f"uid={username},ou={user_group},{LDAP_BASE_DN}"
    try:
        print(f"DEBUG: Connecting to LDAP server {LDAP_SERVER}")
        server = Server(LDAP_SERVER, get_info=ALL)
        conn = Connection(server, user=f'cn=admin,{LDAP_BASE_DN}', password=LDAP_ADMIN_PASSWORD, auto_bind=True)
        print(f"DEBUG: Adding user to LDAP with DN {user_dn}")
        conn.add(
            user_dn,
            ['inetOrgPerson', 'top'],
            {
                'cn': username,
                'sn': username,
                'mail': email,
                'userPassword': password
            }
        )
        conn.unbind()
        print("DEBUG: User added to LDAP")

        # Append to LDIF file
        ldif_path = os.getenv("LDAP_PATH").replace("<DUMMY_USERNAME>", username)
        entry = (
            f"dn: {user_dn}\n"
            f"cn: {username}\n"
            f"sn: {username}\n"
            f"mail: {email}\n"
            f"userPassword: {password}\n"
            f"objectClass: inetOrgPerson\n"
            f"objectClass: top\n\n"
        )

        with open(ldif_path, 'a', encoding='utf-8') as f:
            f.write(entry)
        print("DEBUG: User appended to LDIF file")

    except Exception as e:
        print(f"DEBUG: LDAP error: {e}")
        db.session.delete(user)
        db.session.commit()
        return jsonify({'error': f'LDAP error: {str(e)}'}), 500

    print("DEBUG: User successfully added to both DB and LDAP/LDIF")
    return jsonify({'message': 'User added'}), 201

@app.route('/api/users/<path:email>', methods=['DELETE'])
def delete_user(email):
    print(f"DEBUG: Received request to delete user: {email}")
    user = User.query.filter_by(email=email).first()
    print(f"DEBUG: User found: {user}")

    if not user:
        print("DEBUG: User not found in database")
        return jsonify({'error': 'User not found'}), 404

    try:
        db.session.delete(user)
        db.session.commit()
        print("DEBUG: User deleted from database")
    except Exception as e:
        print(f"DEBUG: Error deleting user from database: {e}")
        return jsonify({'error': f'Database error: {str(e)}'}), 500

    username = email.split('@')[0]
    user_dn = f"uid={username},{LDAP_BASE_DN}"
    ldif_path = os.getenv("LDAP_PATH").replace("<DUMMY_USERNAME>", username)

    try:
        with open(ldif_path, 'r', encoding='utf-8') as f:
            existing_content = f.read()
    except FileNotFoundError:
        print("DEBUG: LDIF file not found, skipping LDAP deletion.")
        existing_content = ''
    
    pattern = rf"^dn: {re.escape(user_dn)}\n(?:.+\n)*?\n(?=dn:|\Z)"
    new_content, count = re.subn(pattern, '', existing_content, flags=re.MULTILINE)
    print(f"DEBUG: Entries removed: {count}")

    try:
        with open(ldif_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("DEBUG: User deleted from LDIF file")
    except Exception as e:
        print(f"DEBUG: Error writing to LDIF file: {e}")
        return jsonify({'error': f'LDIF file error: {str(e)}'}), 500

    print("DEBUG: User successfully deleted from both DB and LDIF")
    return jsonify({'message': 'User deleted'}), 200

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
        "pwd": "chandan01245",
        "group": "admin"
    }
}

# driver function
if __name__ == '__main__':
    # with app.app_context():
    # 	db.create_all()
    # 	print("Created Users")
    # 	for email in users:
    # 		user = User(email=email)
    # 		print("Created User")
    # 		user.set_password(users[email]["pwd"])
    # 		print("Set Password")
    # 		user.set_user_group(users[email]["group"])
    # 		print("Set Group")
    # 		user._2fa_completed = False  # Initialize 2FA completion status
    # 		db.session.add(user)
    # 		print("Added User to Session")
    # 	db.session.commit()
    # 	print("Committed Session")
    app.run(host='0.0.0.0', port=5000, debug=True)