# ==============================================================================
# File:      api/app/models/item.py
# Purpose:   Item model. Generic content item belonging to a user and
#            optionally scoped to a group. Supports title and description.
# Callers:   item_service.py, routes/admin.py, models/__init__.py
# Callees:   SQLAlchemy (db), datetime
# Modified:  2026-03-01
# ==============================================================================
from app import db
from datetime import datetime


class Item(db.Model):
    __tablename__ = 'item'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='SET NULL'))
    group_id = db.Column(db.Integer, db.ForeignKey('group.id', ondelete='SET NULL'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship('User', backref='items')
    group = db.relationship('Group', backref='items')

    def __repr__(self):
        return f'<Item {self.title}>'

    def to_dict(self):
        """Convert item to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'user_id': self.user_id,
            'group_id': self.group_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
