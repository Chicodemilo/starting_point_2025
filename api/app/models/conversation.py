# ==============================================================================
# File:      api/app/models/conversation.py
# Purpose:   Conversation model. Represents a group or direct-message
#            conversation thread. Has relationships to ConversationMember
#            and Message.
# Callers:   messaging_service.py, models/__init__.py
# Callees:   SQLAlchemy (db), datetime
# Modified:  2026-03-01
# ==============================================================================
from app import db
from datetime import datetime


class Conversation(db.Model):
    __tablename__ = 'conversation'

    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(20), nullable=False, default='group')  # group, direct
    group_id = db.Column(db.Integer, db.ForeignKey('group.id', ondelete='CASCADE'), nullable=True)
    name = db.Column(db.String(200), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    members = db.relationship('ConversationMember', backref='conversation', lazy='dynamic', cascade='all, delete-orphan')
    messages = db.relationship('Message', backref='conversation', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'type': self.type,
            'group_id': self.group_id,
            'name': self.name,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
