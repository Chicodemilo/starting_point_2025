"""
Test routes for verifying Flask-SQLAlchemy models
"""
from flask import Blueprint, jsonify
from app import db
from app.models import User, Category, Evidence, EvidenceCategoryLink, Vote

test_models_bp = Blueprint('test_models', __name__, url_prefix='/test')

@test_models_bp.route('/models')
def test_models():
    """Test that all models can be queried"""
    try:
        results = {}
        
        # Test User model
        user_count = db.session.query(User).count()
        results['users'] = {
            'count': user_count,
            'model_name': User.__tablename__
        }
        
        # Test Category model
        category_count = db.session.query(Category).count()
        results['categories'] = {
            'count': category_count,
            'model_name': Category.__tablename__
        }
        
        # Test Evidence model
        evidence_count = db.session.query(Evidence).count()
        results['evidence'] = {
            'count': evidence_count,
            'model_name': Evidence.__tablename__
        }
        
        # Test EvidenceCategoryLink model
        link_count = db.session.query(EvidenceCategoryLink).count()
        results['evidence_category_links'] = {
            'count': link_count,
            'model_name': EvidenceCategoryLink.__tablename__
        }
        
        # Test Vote model
        vote_count = db.session.query(Vote).count()
        results['votes'] = {
            'count': vote_count,
            'model_name': Vote.__tablename__
        }
        
        return jsonify({
            'status': 'success',
            'message': 'All models tested successfully',
            'models': results
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Model test failed: {str(e)}'
        }), 500

@test_models_bp.route('/sample-data')
def test_sample_data():
    """Test retrieving sample data with relationships"""
    try:
        results = {}
        
        # Get a sample user
        sample_user = db.session.query(User).first()
        if sample_user:
            results['sample_user'] = sample_user.to_dict()
        
        # Get sample categories
        sample_categories = db.session.query(Category).limit(3).all()
        results['sample_categories'] = [cat.to_dict() for cat in sample_categories]
        
        # Get sample evidence with relationships
        sample_evidence = db.session.query(Evidence).first()
        if sample_evidence:
            results['sample_evidence'] = sample_evidence.to_dict(include_votes=True)
        
        # Get sample votes
        sample_votes = db.session.query(Vote).limit(5).all()
        results['sample_votes'] = [vote.to_dict() for vote in sample_votes]
        
        return jsonify({
            'status': 'success',
            'message': 'Sample data retrieved successfully',
            'data': results
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Sample data test failed: {str(e)}'
        }), 500

@test_models_bp.route('/relationships')
def test_relationships():
    """Test model relationships work correctly"""
    try:
        results = {}
        
        # Test User -> Evidence relationship
        user_with_evidence = db.session.query(User).filter(User.submitted_evidence.any()).first()
        if user_with_evidence:
            results['user_evidence_relationship'] = {
                'user': user_with_evidence.username,
                'evidence_count': len(user_with_evidence.submitted_evidence),
                'evidence_titles': [e.title for e in user_with_evidence.submitted_evidence[:3]]
            }
        
        # Test Evidence -> Categories relationship
        evidence_with_categories = db.session.query(Evidence).filter(Evidence.category_links.any()).first()
        if evidence_with_categories:
            results['evidence_category_relationship'] = {
                'evidence': evidence_with_categories.title,
                'category_count': len(evidence_with_categories.category_links),
                'categories': [link.category.name for link in evidence_with_categories.category_links]
            }
        
        # Test Evidence -> Votes relationship
        evidence_with_votes = db.session.query(Evidence).filter(Evidence.votes.any()).first()
        if evidence_with_votes:
            results['evidence_vote_relationship'] = {
                'evidence': evidence_with_votes.title,
                'vote_count': len(evidence_with_votes.votes),
                'vote_score': evidence_with_votes.vote_score,
                'upvotes': evidence_with_votes.upvote_count,
                'downvotes': evidence_with_votes.downvote_count
            }
        
        return jsonify({
            'status': 'success',
            'message': 'Relationship tests completed',
            'relationships': results
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Relationship test failed: {str(e)}'
        }), 500
