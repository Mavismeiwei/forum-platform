from flask import Flask, jsonify
from models import db
import os
from dotenv import load_dotenv
from flask_cors import CORS
from routes.history_blueprint import history_bp

# load env file
load_dotenv()

# get information from .env file
DB_USER = os.getenv("DATABASE_USER")
DB_PASSWORD = os.getenv("DATABASE_PASSWORD")
DB_HOST = os.getenv("DATABASE_HOST")
DB_PORT = os.getenv("DATABASE_PORT")
DB_NAME = os.getenv("DATABASE_NAME")

# construct the database url
DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
# app.url_map.strict_slashes = False

app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

app.register_blueprint(history_bp, url_prefix='/history')

# Create user table
with app.app_context():
    db.create_all()
    print("---History table created successfully!---")

# root path
@app.route("/")
def index():
    return "Hello from flask"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5004, debug=True)

