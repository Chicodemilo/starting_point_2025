from app import db
from datetime import datetime

class Category(db.Model):
    __tablename__ = 'category'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    evidence_links = db.relationship('EvidenceCategoryLink', back_populates='category', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Category {self.name}>'
    
    def to_dict(self):
        """Convert category to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    @property
    def evidence_count(self):
        """Get count of evidence linked to this category"""
        return len(self.evidence_links)
