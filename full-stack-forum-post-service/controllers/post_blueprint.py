import requests
from flask import Blueprint, request, jsonify
from models import db
from models.post import Post, PostStatus
from werkzeug.utils import secure_filename
from decorator import authenticate_user

post_bp = Blueprint("post_bp", __name__)

FILE_SERVICE_GET = "http://127.0.0.1:5009/files/upload"

def format_post(post):
    return {
    "post": {
        "id": post.postId,
        "title": post.title,
        "userId": post.userId,
        "content": post.content,
        "status": post.status.value if hasattr(post.status, 'value') else post.status,
        "isArchived": post.isArchived,
        "dateCreated": post.dateCreated.strftime("%Y/%m/%d %H:%M:%S") if post.dateCreated else None,  # update the date format
        "images": post.images,
        "attachments": post.attachments
    }
}

def upload_files_to_service(files):
    """Upload multiple files to the file service and return their URLs."""
    if not files:
        return None

    uploaded_file_urls = []

    # Get the Authorization header
    auth_header = request.headers.get("Authorization")
    headers = {"Authorization": auth_header} if auth_header else {}

    # Prepare files data for multipart upload
    files_data = [("file", (secure_filename(file.filename), file.stream, file.mimetype)) for file in files if file.filename]
    print("HERE", files_data)
    # If no valid files, return None
    if not files_data:
        return None

    # Send POST request to file service
    response = requests.post(FILE_SERVICE_GET, files=files_data, headers=headers)

    # Print API response for debugging
    print(f"Upload Response: {response.status_code}, {response.text}")

    # Process response
    if response.status_code == 201:
        try:
            file_data = response.json()
            files_list = file_data.get("files", [])  # Ensure API returns `files` list
            uploaded_file_urls = [file["file_url"] for file in files_list]  # Extract `file_url`
            print(f"Extracted URLs: {uploaded_file_urls}")  # Debugging print
        except Exception as e:
            raise Exception(f"JSON Decode Error: {e}, Response: {response.text}")
    else:
        raise Exception(f"File upload failed: {response.text}")

    return ",".join(uploaded_file_urls) if uploaded_file_urls else None  # Return URLs as a single string

@post_bp.route("/", methods=["GET"], strict_slashes=False)
@authenticate_user()
def get_all_posts(user_id, user_role, user_verified):
    # Base query for posts
    query = Post.query

    if user_role and user_role.lower() in ["admin", "super_admin"]:
        # Admins and super admins can see:
        # - All published, banned, and deleted posts
        # - Their own unpublished and hidden posts
        query = query.filter(
            (Post.status == PostStatus.PUBLISHED.value) |
            (Post.status == PostStatus.BANNED.value) |
            (Post.status == PostStatus.DELETED.value) |
            ((Post.userId == user_id) & (Post.status.in_([
                PostStatus.UNPUBLISHED.value,
                PostStatus.HIDDEN.value
            ])))
        )
    elif user_role == 'user': 
        if user_verified:
            # Verified users can see:
            # - All published posts
            # - Their own unpublished, hidden, banned, and deleted posts
            query = query.filter(
                (Post.status == PostStatus.PUBLISHED.value) |
                ((Post.userId == user_id) & (Post.status.in_([
                    PostStatus.UNPUBLISHED.value,
                    PostStatus.HIDDEN.value,
                    PostStatus.BANNED.value,
                    PostStatus.DELETED.value
                ])))
            )
        else:
            # Unverified users can only see published posts
            query = query.filter(Post.status == PostStatus.PUBLISHED.value)

    # Sort posts by dateCreated (most recent first)
    posts = query.order_by(Post.dateCreated.desc()).all()

    return jsonify(list(map(format_post, posts))), 200

@post_bp.route("/", methods=["OPTIONS", "POST"], strict_slashes=False)
@authenticate_user(require_verified=True)
def create_draft_post(user_id, user_role, user_verified):
    try:
        print(f": Received files: {request.files}")
        print(f": Received form data: {request.form}")
        print(f": Received content type: {request.content_type}")
        
        # Validate required fields
        if "title" not in request.form or "content" not in request.form:
            return jsonify({"error": "Missing required fields"}), 400
        
        # Upload files 
        images_urls = upload_files_to_service(request.files.getlist("images")) if "images" in request.files else None
        if any(key.startswith("attachments[") for key in request.files):
            attachments = [file for key, file in request.files.items() if key.startswith("attachments[")]
            attachments_urls = upload_files_to_service(attachments)
        else:
            attachments_urls = None

        # Create a new post
        new_post = Post(
            userId=user_id,  # Use authenticated user ID instead of form field
            title=request.form["title"],
            content=request.form["content"],
            status=request.form["status"],  # Store Enum as string
            images=images_urls if images_urls else None,
            attachments=attachments_urls if attachments_urls else None
        )

        db.session.add(new_post)
        db.session.commit()
        print(f": New Post Images: {new_post.images}")  # Debugging print
        print(f":New Post Attachments: {new_post.attachments}")

        return jsonify({
            "message": "Post Created",
            "post": format_post(new_post)
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Post creation failed: {str(e)}"}), 500

@post_bp.route("/<int:post_id>/status", methods=["PUT"])
@authenticate_user(require_verified=True)
def set_post_status(post_id, user_id, user_role, user_verified):
    data = request.get_json()

    if not data or "status" not in data:
        return jsonify({"error": "Invalid request, JSON data with 'status' required"}), 400
    
    try:
        post = Post.query.get(post_id)
        if not post:
            return jsonify({"error": "Post not found"}), 404

        # Check if the user is authorized to change the status
        if post.userId != user_id and user_role not in ["admin", "super_admin"]:
            return jsonify({"error": "Unauthorized to change status"}), 403

        # Validate status transitions
        new_status = data["status"]
        current_status = post.status.value
        # Define allowed status transitions
        allowed_transitions = {
            "Unpublished": ["Published", "Deleted"],
            "Published": ["Hidden", "Banned", "Deleted"],  # Only admins can ban posts
            "Hidden": ["Published", "Deleted"],
            "Banned": ["Published"],  # Only admins can unban posts
            "Deleted": ["Published"] # Only admins can recover posts
        }

        # Check if the transition is allowed
        if new_status not in allowed_transitions.get(current_status, []):
            return jsonify({"error": f"Invalid status transition: {current_status} -> {new_status}"}), 400

        # Additional checks for banned posts
        if current_status == "Banned" and user_role not in ["admin", "super_admin"]:
            return jsonify({"error": "Only admins can unban posts"}), 403
        if new_status == "Banned" and user_role not in ["admin", "super_admin"]:
            return jsonify({"error": "Only admins can ban posts"}), 403

        # Update the post status
        post.status = new_status
        db.session.commit()

        return jsonify({
            "message": f"Post status updated to {post.status}",
            "post": format_post(post)
        }), 200


    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Post status update failed: {str(e)}"}), 500

@post_bp.route("/<int:post_id>/toggle-archive", methods=["PUT"])
@authenticate_user(require_verified=True)
def toggle_post_archive(post_id, user_id, user_role, user_verified):
    try:
        # Skip the Content-Type check
        post = Post.query.get(post_id)

        if not post:
            return jsonify({"error": "Invalid request, Post not found"}), 404

        if post.userId != user_id:
            return jsonify({"error": "Invalid request, unauthorized to change status"}), 403

        if post.status.value != "Published":
            return jsonify({"error": "Invalid request, only Published posts can be archived"}), 400

        post.isArchived = not post.isArchived
        db.session.commit()

        return jsonify({
            "message": f"Post archived set to {post.isArchived}",
            "post": format_post(post)
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Post status update failed: {str(e)}"}), 500

@post_bp.route("/<int:post_id>", methods=["GET"], strict_slashes=False)
@authenticate_user()
def get_post(post_id, user_id, user_role, user_verified):
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"error": "Post not found"}), 404
    print(post.status)
    # Check post visibility based on status
    if post.status == PostStatus.PUBLISHED:
        # Published posts are visible to everyone (verified and unverified)
        return jsonify(format_post(post)), 200

    elif post.status in [PostStatus.UNPUBLISHED, PostStatus.HIDDEN]:
        # Unpublished/Hidden posts are only visible to the post owner
        if post.userId == user_id:
            return jsonify(format_post(post)), 200
        else:
            return jsonify({"error": "Unauthorized to view this post"}), 403

    elif post.status in [PostStatus.BANNED, PostStatus.DELETED]:
        # Banned/Deleted posts are visible to the post owner and admins
        if post.userId == user_id or user_role in ["admin", "super_admin"]:
            return jsonify(format_post(post)), 200
        else:
            return jsonify({"error": "Unauthorized to view this post"}), 403

    else:
        # Handle unexpected post status
        return jsonify({"error": "Invalid post status"}), 400

from datetime import datetime
@post_bp.route("/<int:post_id>", methods=["PUT"])
@authenticate_user(require_verified=True)
def edit_post(post_id, user_id, user_role, user_verified):
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"error": "Post not found"}), 404

    # Only the owner can edit the post
    if post.userId != user_id:
        return jsonify({"error": "Invalid request, unauthorized to edit this post"}), 403

    try:
        # Update title and content if provided
        title = request.form.get("title", post.title)
        content = request.form.get("content", post.content)
        status = request.form.get("status", post.status)

        if title != post.title or content != post.content or status != post.status:
            post.title = title
            post.content = content
            post.status = status
            post.last_edited = datetime.now() 

        # handle current images
        existing_images = request.form.get("images", "")
        existing_images_list = existing_images.split(",") if existing_images else []

        # handle updated images
        new_images_urls = upload_files_to_service(request.files.getlist("newImages")) if "newImages" in request.files else None
        new_images_list = new_images_urls.split(",") if new_images_urls else []

        final_images = existing_images_list + new_images_list
        post.images = ",".join(final_images) if final_images else None

        # Handle existing attachments
        existing_attachments = request.form.get("attachments", "")
        existing_attachments_list = existing_attachments.split(",") if existing_attachments else []

        # Handle new attachments uploaded
        new_attachments_urls = upload_files_to_service(request.files.getlist("newAttachments")) if "newAttachments" in request.files else None
        new_attachments_list = new_attachments_urls.split(",") if new_attachments_urls else []

        # Merge existing and new attachments correctly
        final_attachments = existing_attachments_list + new_attachments_list if new_attachments_list else existing_attachments_list
        post.attachments = ",".join(final_attachments) if final_attachments else None

        db.session.commit()

        return jsonify({
            "message": "Post updated successfully!",
            "post": format_post(post)
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Post update failed: {str(e)}"}), 500

# get 3 top posts from user
REPLY_SERVICE_URL = "http://127.0.0.1:5009/replies/reply-count"
@post_bp.route("/<int:user_id>/top-posts", methods=["GET"])
@authenticate_user()
def get_user_top_posts(user_id, user_role, user_verified):
    posts = Post.query.filter_by(userId=user_id, isArchived=False).all()
    if not posts:
        return jsonify({"posts": []}), 200
    post_ids = [post.postId for post in posts]
    # use reply service to get the reply count
    try:
        reply_response = requests.post(REPLY_SERVICE_URL, json={"postIds": post_ids})
        reply_counts = reply_response.json().get("replyCounts", {})
    except Exception as e:
        return jsonify({"error": f"Failed to fetch reply counts: {str(e)}"}), 500
    posts_with_replies = [
        (post, reply_counts.get(str(post.postId), 0))  # default set to 0
        for post in posts
    ]
    posts_with_replies.sort(key=lambda x: x[1], reverse=True)
    top_posts = posts_with_replies[:3]
    return jsonify({"posts": [format_post(post) for post, _ in top_posts]}), 200

# get drafts from users
@post_bp.route("/<int:user_id>/drafts", methods=["GET"])
@authenticate_user()
def get_user_drafts(user_id, user_role, user_verified):
    drafts = (
        Post.query
        .filter_by(userId=user_id, status=PostStatus.UNPUBLISHED.value)  # get unpublished post
        .order_by(Post.dateCreated.desc())  # order by creating time
        .all()
    )
    return jsonify({"drafts": list(map(format_post, drafts))}), 200