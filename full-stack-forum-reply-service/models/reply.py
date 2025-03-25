from models import db
from sqlalchemy import CheckConstraint
from datetime import datetime

class Reply(db.Model):
    replyId = db.Column(db.Integer, primary_key=True, autoincrement=True)
    userId = db.Column(db.Integer, nullable=False)
    postId = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text, nullable=False)
    isActive = db.Column(db.Boolean, default=True)
    dateCreated = db.Column(db.DateTime, default=datetime.now())
    parent_reply_id = db.Column(db.Integer, db.ForeignKey('reply.replyId'))
    parent_reply = db.relationship('Reply', remote_side=[replyId], backref='child_replies')

    def __repr__(self):
        return f'<Reply {self.replyId}>'