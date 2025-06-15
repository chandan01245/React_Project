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


LDAP_SERVER = 'ldap://192.168.0.61'
LDAP_BASE_DN = 'dc=example,dc=com'
LDAP_ADMIN_PASSWORD = 'ILAeon@12'

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
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:ILIkari7@172.28.112.1:5432/kero'
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
	email = data.get("email")
	password = data.get("password")

	print(f"[DEBUG] Received login request - Email: {email}")

	if not email or not password:
		return jsonify({'error': 'Email and password are required'}), 400

	try:
		server = Server(LDAP_SERVER, get_info=ALL)
		conn = Connection(server, auto_bind=True)

		# Search for DN using mail
		print(f"[DEBUG] Searching for user with mail={email}")
		conn.search(
			search_base=LDAP_BASE_DN,
			search_filter=f"(mail={email})",
			search_scope=SUBTREE,
			attributes=[]
		)

		if not conn.entries:
			print(f"[ERROR] No user found for email: {email}")
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
		user = User.query.filter_by(email=email).first()
		if not user:
			print("[ERROR] User not found in local DB.")
			return jsonify({'error': 'User metadata not found'}), 404

		token = generate_token(user)
		session['user'] = email
		session['role'] = user_ou

		return jsonify({
			'message': 'Login successful',
			'user': email,
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
	def append_to_ldif(new_content):
		#Write to LDIF File
		hostname = os.getenv("LDAP_SERVER_IP")
		port = 22
		username = os.getenv("LDAP_USERNAME")
		password = os.getenv("LDAP_PASSWORD")
		remote_path = os.getenv("LDAP_PATH").replace("<DUMMY_USERNAME>",username)

		# Step 1: Connect
		transport = paramiko.Transport((hostname, port))
		transport.connect(username=username, password=password)
		sftp = paramiko.SFTPClient.from_transport(transport)

		# Step 2: Read existing file content
		try:
			with sftp.file(remote_path, 'r') as remote_file:
				existing_content = remote_file.read().decode()
		except IOError:
			existing_content = ''  # If file doesn't exist, treat as empty

		# Step 3: Append new content
		combined_content = existing_content + new_content

		# Step 4: Write it all back (overwrite mode)
		with sftp.file(remote_path, 'w') as remote_file:
			remote_file.write(combined_content)
			
		# Cleanup
		sftp.close()
		transport.close()

	print("DEBUG: Received request to add user")
	data = request.get_json()
	print(f"DEBUG: Request data: {data}")
	email = data.get('email')
	password = data.get('password')
	user_group = data.get('user_group', 'viewer')  # default to 'user' if not provided
	print(f"DEBUG: Email: {email}, Password: {'*' * len(password) if password else None}, Group: {user_group}")

	if not email or not password:
		print("DEBUG: Missing email or password")
		return jsonify({'error': 'Email and password required'}), 400

	# Check if user already exists
	existing_user = User.query.filter_by(email=email).first()
	print(f"DEBUG: Existing user: {existing_user}")
	if existing_user:
		print("DEBUG: User already exists")
		return jsonify({'error': 'User already exists'}), 409

	# Create new user and set password and group
	user = User(email=email)
	user.set_password(password)
	user.set_user_group(user_group)
	db.session.add(user)
	db.session.commit()
	print("DEBUG: User added to PostgreSQL")

	# Add to LDAP
	username = email.split('@')[0]
	user_dn = f"uid={username},ou=viewer,{LDAP_BASE_DN}"
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
	except Exception as e:
		print(f"DEBUG: LDAP error: {e}")
		db.session.delete(user)
		db.session.commit()
		return jsonify({'error': f'LDAP error: {str(e)}'}), 500

	#Write to LDIF File
	user_entry = f"""\n# {user_group.title()} user: {username}
dn: {user_dn}
objectClass: top
objectClass: inetOrgPerson
cn: {username.split()[0]}
sn: {username.split()[1] if len(username.split()) > 1 else ""}
mail: {email}
userPassword: {password}
"""
	append_to_ldif(user_entry)

	print("DEBUG: User successfully added to both DB and LDAP")
	return jsonify({'message': 'User added'}), 201

@app.route('/api/users/<username>', methods=['DELETE'])
def delete_user(username):
	# Remove from PostgreSQL
	user = User.query.filter(User.email.like(f"{username}@%")).first()
	if not user:
		return jsonify({'error': 'User not found'}), 404
	db.session.delete(user)
	db.session.commit()

	# Remove from LDAP
	user_dn = f"uid={username},{LDAP_BASE_DN}"
	try:
		server = Server(LDAP_SERVER, get_info=ALL)
		conn = Connection(server, user=LDAP_BASE_DN, password=LDAP_ADMIN_PASSWORD, auto_bind=True)
		conn.delete(user_dn)
		conn.unbind()
	except Exception as e:
		return jsonify({'error': f'LDAP error: {str(e)}'}), 500

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
		"pwd": "Hashed-Password",
		"group": "admin"
	}
}

# driver function
if __name__ == '__main__':
	# with app.app_context():
	#     db.create_all()
	#     print("Created Users")
	#     for email in users:
	#         user = User(email=email)
	#         print("Created User")
	#         user.set_password(users[email]["pwd"])
	#         print("Set Password")
	#         user.set_user_group(users[email]["group"])
	#         print("Set Group")
	#         user._2fa_completed = False  # Initialize 2FA completion status
	#         db.session.add(user)
	#         print("Added User to Session")
	#     db.session.commit()
	#     print("Committed Session")
	app.run(host='0.0.0.0', port=5000, debug=True)