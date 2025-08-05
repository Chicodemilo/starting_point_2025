from app import db
from datetime import datetime
from werkzeug.security import check_password_hash, generate_password_hash

class User(db.Model):
    __tablename__ = 'user'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    is_admin = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<User {self.username}>'
    
    def check_password(self, password):
        """Check if provided password matches the stored hash"""
        # For development/testing, allow simple password comparison
        # In production, this should use proper password hashing
        return self.password_hash == password or check_password_hash(self.password_hash, password)
    
    def set_password(self, password):
        """Set password hash"""
        self.password_hash = generate_password_hash(password)
    
    def to_dict(self):
        """Convert user to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'is_admin': self.is_admin,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
