# ==============================================================================
# File:      api/app/models/group_member.py
# Purpose:   GroupMember model. Join table linking users to groups with a
#            role (owner, admin, or member). Enforces unique group-user
#            constraint.
# Callers:   group_service.py, alert_service.py, messaging_service.py,
#            routes/admin.py, routes/uploads.py, auth_service.py,
#            models/__init__.py
# Callees:   SQLAlchemy (db), datetime
# Modified:  2026-03-01
# ==============================================================================
from app import db
from datetime import datetime


class GroupMember(db.Model):
    __tablename__ = 'group_member'

    id = db.Column(db.Integer, primary_key=True)
    group_id = db.Column(db.Integer, db.ForeignKey('group.id', ondelete='CASCADE'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    role = db.Column(db.Enum('owner', 'admin', 'member'), default='member', nullable=False)
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('group_id', 'user_id', name='unique_group_user'),
    )

    user = db.relationship('User', backref='group_memberships')

    def __repr__(self):
        return f'<GroupMember group={self.group_id} user={self.user_id} role={self.role}>'

    def to_dict(self):
        """Convert group member to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'group_id': self.group_id,
            'user_id': self.user_id,
            'role': self.role,
            'joined_at': self.joined_at.isoformat() if self.joined_at else None,
            'username': self.user.username if self.user else None
        }
