from flask import Flask
from controllers.upload_blueprint import upload_bp

app = Flask(__name__)

# Register the Blueprint
app.register_blueprint(upload_bp, url_prefix='/files')

if __name__ == "__main__":
    app.run(port=5008)