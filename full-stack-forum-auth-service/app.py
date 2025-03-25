# app.py
from flask import Flask
from dotenv import load_dotenv
import os
load_dotenv()


from auth import auth_bp

app = Flask(__name__)
app.register_blueprint(auth_bp, url_prefix='/auth')

from shared.error_handlers import register_error_handlers
register_error_handlers(app)

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5006))
    print(f"Starting Auth Service on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True)
