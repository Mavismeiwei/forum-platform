from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from models import db
from dotenv import load_dotenv
from flask_cors import CORS
from controllers.reply_blueprint import reply_bp
import os

load_dotenv()
app = Flask(__name__)
app.register_blueprint(reply_bp, url_prefix='/replies')
CORS(app, resources={r"/*": {"origins": "*"}})

# Configure MySQL database connection
DB_USER = os.getenv("DATABASE_USER")
DB_PASSWORD = os.getenv("DATABASE_PASSWORD")
DB_HOST = os.getenv("DATABASE_HOST")
DB_PORT = os.getenv("DATABASE_PORT")
DB_NAME = os.getenv("DATABASE_NAME")
DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Create the database and tables
with app.app_context():
    db.create_all()
    print("---Reply table created successfully!---")

if __name__ == '__main__':
    app.run(port=5003, debug=True)