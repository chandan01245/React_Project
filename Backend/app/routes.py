from flask import Blueprint
from .auth import login

auth_bp = Blueprint('auth', __name__, url_prefix="/app")

auth_bp.route("/login", methods=["POST"])(login)
