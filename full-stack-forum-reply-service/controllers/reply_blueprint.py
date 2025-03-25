from flask import Blueprint, request, jsonify
from models import db
from models.reply import Reply
from decorator import authenticate_user

reply_bp = Blueprint("reply_bp", __name__)

def format_reply(reply):
    return {
            "reply": {
                "replyId": reply.replyId,
                "userId": reply.userId,
                "postId": reply.postId,
                "comment": reply.comment,
                "isActive": reply.isActive,
                "dateCreated": str(reply.dateCreated),
            }
        }

@reply_bp.route('/post/<int:post_id>', methods=['GET'])
def get_replies(post_id):
    if not post_id:
        return jsonify({"error": "Invalid request, post id required"}), 400
    
    replies = Reply.query.filter_by(postId=post_id).all()
    
    if not replies:
        return jsonify({"message": "No replies found for this post"}), 200

    return jsonify(list(map(format_reply, replies))), 200

@reply_bp.route('/post/<int:post_id>', methods=['POST'])
@authenticate_user()
def create_reply(post_id, user_id, user_role, user_verified):
    data = request.get_json()

    if not data:
        return jsonify({"error": "Invalid request, JSON data required"}), 400

    if not post_id:
        return jsonify({"error": "Invalid request, post id required"}), 400
    
    try:
        new_reply = Reply(
            userId=user_id,
            postId=post_id,
            comment=data["comment"],
        )

        db.session.add(new_reply)
        db.session.commit()
        
        return jsonify({
            "message": "Reply Created",
            "reply": format_reply(new_reply)
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Post creation failed: {str(e)}"}), 500

@reply_bp.route('/<int:reply_id>', methods=["PUT"])
@authenticate_user()
def edit_reply(reply_id, user_id, user_role, user_verified):
    reply = Reply.query.get(reply_id)
    data = request.get_json()

    if not reply:
        return jsonify({"error": "Reply not found"}), 404

    print(reply.userId)
    print(user_id)
    if reply.userId != user_id:
        return jsonify({"error": "Invalid request, unauthorized to change status"}), 400

    try:
        reply.comment = data.get("comment", reply.comment)

        db.session.commit()

        return jsonify({
            "message": "Reply updated successfully!",
            "reply": format_reply(reply)
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Reply update failed: {str(e)}"}), 500
    
@reply_bp.route('/delete/<int:reply_id>', methods=["PUT"])
@authenticate_user()
def soft_delete_reply(reply_id, user_id, user_role, user_verified):
    reply = Reply.query.get(reply_id)
    data = request.get_json()

    if not reply:
        return jsonify({"error": "Reply not found"}), 404

    if reply.userId != user_id:
        return jsonify({"error": "Invalid request, unauthorized to change status"}), 400

    try:
        reply.isActive = False

        db.session.commit()

        return jsonify({
            "message": "Reply soft deleted successfully!",
            "reply": format_reply(reply)
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Reply update failed: {str(e)}"}), 500
    
# use post id to get the reply count
@reply_bp.route("/reply-count", methods=["POST"])
def get_reply_counts():
    data = request.get_json()
    post_ids = data.get("postIds", [])

    if not post_ids:
        return jsonify({"error": "No postIds provided"}), 400

    reply_counts = (
        db.session.query(Reply.postId, db.func.count(Reply.replyId))
        .filter(Reply.postId.in_(post_ids))
        .group_by(Reply.postId)
        .all()
    )

    reply_count_dict = {str(post_id): count for post_id, count in reply_counts}

    return jsonify({"replyCounts": reply_count_dict}), 200