# auth/routes.py
from flask import request, jsonify
from auth import auth_bp
from auth.controllers.auth_controller import login_user, logout_user

@auth_bp.route('/login', methods=['POST'])
def login():
    print("[Auth Routes] /login endpoint called")
    response = login_user(request)
    print("[Auth Routes] /login endpoint returning response:", response)
    return response

# @auth_bp.route('/refresh', methods=['POST'])
# def refresh():
#     print("[Auth Routes] /refresh endpoint called")
#     response = refresh_token(request)
#     print("[Auth Routes] /refresh endpoint returning response:", response)
#     return response

# @auth_bp.route('/verify', methods=['GET'])
# def verify():
#     print("[Auth Routes] /verify endpoint called")
#     response = verify_token(request)
#     print("[Auth Routes] /verify endpoint returning response:", response)
#     return response

@auth_bp.route('/logout', methods=['POST'])
def logout():
    print("[Auth Routes] /logout endpoint called")
    response = logout_user(request)
    print("[Auth Routes] /logout endpoint returning response:", response)
    return response

# @auth_bp.route('/admin-test', methods=['GET'])
# @authorize(allowed_roles=['admin', 'superadmin'])
# def admin_test():
#     print("[Auth Routes] /admin-test endpoint called")
#     response = jsonify({"message": "You are authorized as an admin."})
#     print("[Auth Routes] /admin-test endpoint returning response:", response.get_json())
#     return response
