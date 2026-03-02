# ==============================================================================
# File:      api/app/models/alert.py
# Purpose:   Alert model. Represents notifications sent to individual users,
#            groups, or system-wide. Tracks read status and expiration.
# Callers:   alert_service.py, routes/admin.py, routes/alerts.py,
#            models/__init__.py
# Callees:   SQLAlchemy (db), datetime
# Modified:  2026-03-01
# ==============================================================================
from app import db
from datetime import datetime


class Alert(db.Model):
    __tablename__ = 'alert'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=True)
    type = db.Column(db.String(20), nullable=False, default='info')  # info, warning, urgent, system
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='SET NULL'), nullable=True)
    group_id = db.Column(db.Integer, db.ForeignKey('group.id', ondelete='CASCADE'), nullable=True)
    receiver_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=True)
    is_urgent = db.Column(db.Boolean, default=False)
    viewed = db.Column(db.Boolean, default=False)
    viewed_at = db.Column(db.DateTime, nullable=True)
    expires_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    sender = db.relationship('User', foreign_keys=[sender_id], backref='sent_alerts')

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'type': self.type,
            'sender_id': self.sender_id,
            'sender_username': self.sender.username if self.sender else None,
            'group_id': self.group_id,
            'receiver_id': self.receiver_id,
            'is_urgent': self.is_urgent,
            'viewed': self.viewed,
            'viewed_at': self.viewed_at.isoformat() if self.viewed_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
