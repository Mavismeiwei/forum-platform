from models import db
from datetime import datetime

class History(db.Model):
    __tablename__ = 'history'

    historyId = db.Column(db.Integer, primary_key=True, autoincrement=True)  # Unique history entry ID
    userId = db.Column(db.Integer, nullable=False, index=True)  # User who viewed the post
    postId = db.Column(db.Integer, nullable=False, index=True)  # The viewed post
    viewDate = db.Column(db.DateTime, default=datetime.utcnow)  # Timestamp when viewed

    def to_dict(self):
        return {
            "historyId": self.historyId,
            "userId": self.userId,
            "postId": self.postId,
            "viewDate": self.viewDate.isoformat()  # Convert datetime to string format
        }