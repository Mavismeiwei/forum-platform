class CustomException(Exception):
    def __init__(self, message, status_code=400, payload=None):
        super().__init__()
        self.message = message
        self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['message'] = self.message
        rv['status_code'] = self.status_code
        return rv

class UnauthorizedError(CustomException):
    def __init__(self, message="Unauthorized access", status_code=401, payload=None):
        super().__init__(message, status_code, payload)

class ServerError(CustomException):
    def __init__(self, message="Internal Server Error", status_code=500, payload=None):
        super().__init__(message, status_code, payload)

class NotFoundError(CustomException):
    def __init__(self, message="Resource not found", status_code=404, payload=None):
        super().__init__(message, status_code, payload)

class ValidationError(CustomException):
    def __init__(self, message="Validation error", status_code=400, payload=None):
        super().__init__(message, status_code, payload)