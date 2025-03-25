# auth/controllers/auth_controller.py
import os
import datetime
import jwt
from flask import jsonify, request
from werkzeug.security import check_password_hash  # Use this instead of bcrypt.checkpw
from auth.services.user_service_client import get_user_by_email
from auth.utils.jwt_utils import generate_jwt, decode_jwt
from dotenv import load_dotenv

import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..")))
from shared.exceptions import ServerError

load_dotenv()  # Ensure environment variables are loaded

def login_user(request_obj):
    try:
        data = request_obj.get_json(silent=True)
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400

        # get user information
        user = get_user_by_email(email)
        print(f"Retrieved user data: {user}")  # Debug user data

        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401

        # make sure the active is included
        user_active = user.get('active')
        if user_active is None:
            raise ServerError('User account status is undefined', status_code=500)
            # return jsonify({'error': 'User account status is undefined'}), 500

        # if user is banned
        if user_active == 0:
            print(f"Login blocked: Banned user -> {email}")
            return jsonify({'error': 'Your account has been banned. Please contact support.'}), 403

        # validate password
        if not check_password_hash(user.get('hashedPassword', ''), password):
            return jsonify({'error': 'Invalid credentials'}), 401

        # generate jwt token
        user_payload = {
            'id': user.get('id'),
            'email': user.get('email'),
            'role': user.get('type', 'user'),
            'verified': user.get('verified') == 1,
            'active': user_active  
        }

        token = generate_jwt(user_payload)
        # refresh = generate_refresh_token(user_payload)

        print(f"Successful login: {email} (Role: {user['type']}, Active: {user_active})")

        return jsonify({
            'token': token,
            'user': {
                'id': user['id'],
                'email': user['email'],
                'role': user['type'],
                'verified': user['verified'] == 1,
                'active': user_active
            }
        }), 200

    except Exception as e:
        print(f"Server error during login: {str(e)}")
        raise ServerError("Internal Server Error", status_code=500)
        # return jsonify({'error': 'Internal Server Error', 'message': str(e)}), 500


def verify_token(request_obj):
    """
    Verifies the access token sent in the Authorization header.
    """
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Missing or invalid Authorization header.'}), 401

    token = auth_header.split(' ')[1]
    try:
        payload = decode_jwt(token)
        return jsonify({'message': 'Token is valid', 'decoded': payload}), 200
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token has expired.'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token.'}), 401

def logout_user(request_obj):
    """
    Simulate logout by returning a success message.
    In a real system, you might implement token blacklisting.
    """
    return jsonify({'message': 'Logout successful. Please discard your token.'}), 200
