from flask import request, jsonify
from flask_jwt_extended import create_access_token
from .db import get_db_connection
from . import bcrypt

def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"msg": "Email and password required"}), 400

    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT password FROM users WHERE email = %s", (email,))
        user = cur.fetchone()
        cur.close()
        conn.close()

        if user and bcrypt.check_password_hash(user[0], password):
            token = create_access_token(identity=email)
            return jsonify(token=token), 200

        return jsonify({"msg": "Invalid credentials"}), 401

    except Exception as e:
        return jsonify({"msg": "Server error", "error": str(e)}), 500
