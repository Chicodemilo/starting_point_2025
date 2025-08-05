from app import db
from datetime import datetime

class EvidenceCategoryLink(db.Model):
    __tablename__ = 'evidencecategorylink'
    
    id = db.Column(db.Integer, primary_key=True)
    evidence_id = db.Column(db.Integer, db.ForeignKey('evidence.id', ondelete='CASCADE'), nullable=False, index=True)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id', ondelete='CASCADE'), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    evidence = db.relationship('Evidence', back_populates='category_links')
    category = db.relationship('Category', back_populates='evidence_links')
    
    # Unique constraint for evidence-category pair
    __table_args__ = (
        db.UniqueConstraint('evidence_id', 'category_id', name='unique_evidence_category'),
    )
    
    def __repr__(self):
        return f'<EvidenceCategoryLink evidence_id={self.evidence_id} category_id={self.category_id}>'
    
    def to_dict(self):
        """Convert link to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'evidence_id': self.evidence_id,
            'category_id': self.category_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'evidence': self.evidence.to_dict() if self.evidence else None,
            'category': self.category.to_dict() if self.category else None
        }
