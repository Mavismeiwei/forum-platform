from models import db
from sqlalchemy.dialects.mysql import ENUM

class User(db.Model):
    __tablename__ = 'user'

    userId = db.Column(db.Integer, primary_key=True, autoincrement=True)
    firstName = db.Column(db.String(50), nullable=False)
    lastName = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    active = db.Column(db.Boolean, default=True)
    dateJoined = db.Column(db.DateTime, server_default=db.func.now())
    type = db.Column(ENUM('super_admin', 'admin', 'user'), nullable=False, default='user')  
    profileImageURL = db.Column(db.String(255))
    
    # Indicates whether the email is verified (True = verified, False = unverified)
    verified = db.Column(db.Boolean, default=False, nullable=False,)

    def __repr__(self):
        return f"<User {self.email}>"
