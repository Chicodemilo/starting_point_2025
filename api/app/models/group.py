from app import db
from datetime import datetime
import secrets
import string


class Group(db.Model):
    __tablename__ = 'group'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    type = db.Column(db.String(50), nullable=False)
    is_private = db.Column(db.Boolean, default=True, nullable=False)
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    invite_code = db.Column(db.String(20), unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = db.relationship('User', backref='owned_groups')
    members = db.relationship('GroupMember', backref='group', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Group {self.name}>'

    def generate_invite_code(self):
        """Generate a unique invite code"""
        chars = string.ascii_uppercase + string.digits
        self.invite_code = ''.join(secrets.choice(chars) for _ in range(8))
        return self.invite_code

    def to_dict(self, include_members=False):
        """Convert group to dictionary for JSON serialization"""
        data = {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'type': self.type,
            'is_private': self.is_private,
            'owner_id': self.owner_id,
            'invite_code': self.invite_code,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        if include_members:
            data['members'] = [m.to_dict() for m in self.members]
        return data
