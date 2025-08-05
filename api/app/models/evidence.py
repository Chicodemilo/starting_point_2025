from app import db
from datetime import datetime

class Evidence(db.Model):
    __tablename__ = 'evidence'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    content = db.Column(db.Text)  # LONGTEXT in MySQL maps to Text in SQLAlchemy
    source_url = db.Column(db.String(500))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='SET NULL'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref='submitted_evidence')
    category_links = db.relationship('EvidenceCategoryLink', back_populates='evidence', cascade='all, delete-orphan')
    votes = db.relationship('Vote', back_populates='evidence', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Evidence {self.title}>'
    
    def to_dict(self, include_votes=False):
        """Convert evidence to dictionary for JSON serialization"""
        result = {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'content': self.content,
            'source_url': self.source_url,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'categories': [link.category.to_dict() for link in self.category_links]
        }
        
        if include_votes:
            result['votes'] = [vote.to_dict() for vote in self.votes]
            result['vote_score'] = self.vote_score
            result['upvote_count'] = self.upvote_count
            result['downvote_count'] = self.downvote_count
            
        return result
    
    @property
    def vote_score(self):
        """Calculate the net vote score (upvotes - downvotes)"""
        upvotes = sum(1 for vote in self.votes if vote.vote_type == 'up')
        downvotes = sum(1 for vote in self.votes if vote.vote_type == 'down')
        return upvotes - downvotes
    
    @property
    def upvote_count(self):
        """Get count of upvotes"""
        return sum(1 for vote in self.votes if vote.vote_type == 'up')
    
    @property
    def downvote_count(self):
        """Get count of downvotes"""
        return sum(1 for vote in self.votes if vote.vote_type == 'down')
