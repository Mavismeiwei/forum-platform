from flask import Blueprint, request, jsonify
from models import db  # Use the shared db instance
from models.user import User
from werkzeug.security import generate_password_hash
from werkzeug.utils import secure_filename
from werkzeug.datastructures import MultiDict
import json
import random
import redis
import pika
import boto3
import os
import re
from validate_email_address import validate_email
from decorator import authenticate_user

admin_bp = Blueprint("admin_bp", __name__)

# get all user's information
@admin_bp.route("/users", methods=["GET"])
@authenticate_user()
def get_all_users(user_id, user_verified, user_role):
    if user_role not in ["admin", "super_admin"]:
        return jsonify({"error": "Forbidden: Only admin can access this data"})

    users = User.query.all()
    user_list = [
        {
            "userId": user.userId,
            "firstName": user.firstName,
            "lastName": user.lastName,
            "email": user.email,
            "dateJoined": user.dateJoined.strftime("%Y-%m-%d"),
            "type": user.type,
            "active": user.active
        }
        for user in users
    ]
    return jsonify({"users": user_list}), 200

# Update user's account (active/banned)
@admin_bp.route("/users/<int:user_id>/update-status", methods=["PUT"])
@authenticate_user()
def update_user_status(user_id, user_verified, user_role):
    if user_role not in ["admin", "super_admin"]:
        return jsonify({"error": "Forbidden: Only admin can access this data"})

    target_user = User.query.get(user_id)
    if not target_user:
        return jsonify({"error": "User not found"}), 404
    
    data = request.get_json()
    new_status = data.get("active")

    if new_status is None:
        return jsonify({"error": "Invalid request: 'active' field is required"})
    
    if user_role == "admin" and target_user.type in ["admin", "super_admin"]:
        return jsonify({"error": "Forbidden: Action forbiddened"})
    
    target_user.active = not target_user.active  # update the user's active status
    db.session.commit()

    return jsonify({
        "message": f"User {'unbanned' if target_user.active else 'banned'} successfully",
        "user": {
            "userId": target_user.userId,
            "fullName": f"{target_user.firstName} {target_user.lastName}",
            "email": target_user.email,
            "active": target_user.active,
        }
    }), 200

# Super admin: promote a normal user to admin
@admin_bp.route("/users/<int:user_id>/promote", methods=["PUT"])
@authenticate_user()
def promote_user(user_id, user_verified, user_role):
    if user_role != "super_admin":
        return jsonify({"error": "Forbidden: Only super_admin can promote users"}), 403
    
    target_user = User.query.get(user_id)
    if not target_user:
        return jsonify({"error": "User not found"}), 404
    
    if target_user.type == "admin":
        return jsonify({"message": "User is already an admin"}), 200
    if target_user.type == "super_admin":
        return jsonify({"error": "Cannot promote a super_admin"}), 400

    target_user.type = "admin"
    db.session.commit()

    return jsonify({
        "message": "User promoted to admin successfully",
        "user": {
            "userId": target_user.userId,
            "fullName": f"{target_user.firstName} {target_user.lastName}",
            "email": target_user.email,
            "type": target_user.type,
        }
    }), 200

