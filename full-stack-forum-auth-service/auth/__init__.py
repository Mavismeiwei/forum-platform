# auth/__init__.py
from flask import Blueprint

# Create the blueprint for auth-related routes
auth_bp = Blueprint('auth', __name__)

# Import routes so they get registered with this blueprint
from auth import routes
