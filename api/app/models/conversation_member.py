# ==============================================================================
# File:      api/app/models/conversation_member.py
# Purpose:   ConversationMember model. Join table linking users to
#            conversations. Tracks when the member last read messages.
# Callers:   messaging_service.py, models/__init__.py
# Callees:   SQLAlchemy (db), datetime
# Modified:  2026-03-01
# ==============================================================================
from app import db
from datetime import datetime


class ConversationMember(db.Model):
    __tablename__ = 'conversation_member'

    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(db.Integer, db.ForeignKey('conversation.id', ondelete='CASCADE'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_read_at = db.Column(db.DateTime, nullable=True)

    __table_args__ = (
        db.UniqueConstraint('conversation_id', 'user_id', name='unique_conversation_user'),
    )

    user = db.relationship('User', backref='conversation_memberships')

    def to_dict(self):
        return {
            'id': self.id,
            'conversation_id': self.conversation_id,
            'user_id': self.user_id,
            'username': self.user.username if self.user else None,
            'joined_at': self.joined_at.isoformat() if self.joined_at else None,
            'last_read_at': self.last_read_at.isoformat() if self.last_read_at else None,
        }
