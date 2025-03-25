from models import db
from sqlalchemy import CheckConstraint
from datetime import datetime
import enum

class PostStatus(enum.Enum):
    UNPUBLISHED = "Unpublished"
    PUBLISHED = "Published"
    HIDDEN = "Hidden"
    BANNED = "Banned"
    DELETED = "Deleted"

def get_status(self):
        return {
            "status": self.status.value if self.status else None,
        }

class Post(db.Model):
    postId = db.Column(db.Integer, primary_key=True, autoincrement=True)
    userId = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    isArchived = db.Column(db.Boolean, default=False)
    status = db.Column(db.Enum(PostStatus), nullable=False, default=PostStatus.UNPUBLISHED)
    dateCreated = db.Column(db.DateTime, default=datetime.now())
    dateModified = db.Column(db.DateTime, default=datetime.now(), onupdate=datetime.now())
    images = db.Column(db.Text, nullable=True)
    attachments = db.Column(db.Text, nullable=True)

    def __repr__(self):
        return f'<Post {self.title}>'