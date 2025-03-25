from functools import wraps
from flask import request, jsonify

# Decorator used to extract user_id, user_role and user verified status from request headers and enforce access control
def authenticate_user(required_roles=None, require_verified=False):
    """
    Middleware to authenticate users based on headers injected by API Gateway.
    """
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            header_user_id = request.headers.get("X-User-ID")
            user_role = request.headers.get("X-User-Role")
            user_verified = request.headers.get("X-User-Verified")

            if not header_user_id or not user_role:
                return jsonify({"error": "Unauthorized: Missing authentication headers"}), 401

            try:
                header_user_id = int(header_user_id)
            except ValueError:
                return jsonify({"error": "Invalid user ID format"}), 400
            
            # Convert user_verified to boolean
            user_verified = user_verified.lower() == "true" if user_verified else False

            # Check if role is allowed
            if required_roles and user_role not in required_roles:
                return jsonify({"error": "Forbidden: You do not have permission to access this resource"}), 403

            # Check email verification status if required
            if require_verified and not user_verified:
                return jsonify({"error": "Forbidden: Email verification required"}), 403
            
            # ✅ Avoid overriding `user_id` if it already exists in kwargs (like in route parameters)
            if "user_id" not in kwargs:
                return f(*args, user_id=header_user_id, user_role=user_role, user_verified=user_verified, **kwargs)
            else:
                return f(*args, user_role=user_role, user_verified=user_verified, **kwargs)
        return wrapper
    return decorator
