from flask import jsonify
from shared.exceptions import CustomException

def register_error_handlers(app):
    @app.errorhandler(CustomException)
    def handle_custom_exception(error):
        response = jsonify(error.to_dict())
        response.status_code = error.status_code
        return response

    @app.errorhandler(404)
    def handle_not_found(error):
        response = jsonify({
            "message": "Resource not found",
            "status_code": 404
        })
        response.status_code = 404
        return response

    @app.errorhandler(500)
    def handle_server_error(error):
        response = jsonify({
            "message": "Internal server error",
            "status_code": 500
        })
        response.status_code = 500
        return response