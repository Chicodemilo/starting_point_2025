from app import db
from datetime import datetime

class Vote(db.Model):
    __tablename__ = 'vote'
    
    id = db.Column(db.Integer, primary_key=True)
    evidence_id = db.Column(db.Integer, db.ForeignKey('evidence.id', ondelete='CASCADE'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='SET NULL'), index=True)
    vote_type = db.Column(db.Enum('up', 'down', name='vote_type_enum'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    evidence = db.relationship('Evidence', back_populates='votes')
    user = db.relationship('User', backref='votes')
    
    # Unique constraint for user-evidence pair (one vote per user per evidence)
    __table_args__ = (
        db.UniqueConstraint('user_id', 'evidence_id', name='unique_user_evidence_vote'),
    )
    
    def __repr__(self):
        return f'<Vote user_id={self.user_id} evidence_id={self.evidence_id} type={self.vote_type}>'
    
    def to_dict(self):
        """Convert vote to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'evidence_id': self.evidence_id,
            'user_id': self.user_id,
            'vote_type': self.vote_type,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    @property
    def is_upvote(self):
        """Check if this is an upvote"""
        return self.vote_type == 'up'
    
    @property
    def is_downvote(self):
        """Check if this is a downvote"""
        return self.vote_type == 'down'
