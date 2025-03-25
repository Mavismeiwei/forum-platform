import boto3
import uuid
import os
from flask import Blueprint, request, jsonify
from dotenv import load_dotenv
from botocore.exceptions import ClientError

# Load environment variables
load_dotenv()

# AWS S3 Configuration
S3_BUCKET = "forum-platform-post-service-bucket"
S3_REGION = "us-east-2"
S3_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY")
S3_SECRET_KEY = os.getenv("AWS_SECRET_KEY")

s3_client = boto3.client(
    "s3",
    region_name=S3_REGION,
    aws_access_key_id=S3_ACCESS_KEY,
    aws_secret_access_key=S3_SECRET_KEY
)

upload_bp = Blueprint("upload", __name__)

# Upload Files to S3
@upload_bp.route("/upload", methods=["POST"])
def upload_files():
    if "file" not in request.files:
        return jsonify({"error": "No files provided"}), 400

    files = request.files.getlist("file")  # Get multiple files
    if not files:
        return jsonify({"error": "No files provided"}), 400

    uploaded_files = []

    for file in files:
        file_extension = file.filename.split('.')[-1]
        file_id = str(uuid.uuid4())
        file_key = f"uploads/{file_id}.{file_extension}"

        try:
            s3_client.upload_fileobj(file, S3_BUCKET, file_key)
            file_url = f"https://{S3_BUCKET}.s3.{S3_REGION}.amazonaws.com/{file_key}"

            uploaded_files.append({"file_id": file_id, "file_url": file_url})
        except Exception as e:
            return jsonify({"error": f"Upload failed for {file.filename}: {str(e)}"}), 500

    return jsonify({"message": "Files uploaded successfully", "files": uploaded_files}), 201


# Retrieve File Metadata by ID
@upload_bp.route("/upload/<path:file_id>", methods=["GET"])
def get_file_metadata(file_id):
    try:
        metadata = s3_client.head_object(Bucket=S3_BUCKET, Key=file_id)
        return jsonify({"file_id": file_id, "metadata": metadata}), 200
    except ClientError as e:
        error_code = e.response["Error"]["Code"]
        error_message = e.response["Error"]["Message"]
        
        return jsonify({"error": f"Error retrieving file: {error_message}"}), error_code
    
    except Exception as e:
        return jsonify({"error": f"Delete failed: {str(e)}"}), 500
    
# Delete File from S3  
@upload_bp.route("/upload/<path:file_id>", methods=["DELETE"])
def delete_file(file_id):
    try:
        # Check if the file exists using head_object
        s3_client.head_object(Bucket=S3_BUCKET, Key=file_id)
        # Proceed to delete if file exists
        s3_client.delete_object(Bucket=S3_BUCKET, Key=file_id)
        return jsonify({"message": "File deleted successfully"}), 200
    except ClientError as e:
        error_code = e.response["Error"]["Code"]
        error_message = e.response["Error"]["Message"]

        return jsonify({"error": f"Error deleting file: {error_message}"}), error_code
    
    except Exception as e:
        return jsonify({"error": f"Delete failed: {str(e)}"}), 500
    

