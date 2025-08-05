from flask import Blueprint, request, jsonify
from app import db
from app.models.user import User

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

@admin_bp.route('/login', methods=['POST'])
def admin_login():
    """Admin login endpoint"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'No data provided'
            }), 400
        
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({
                'success': False,
                'message': 'Email and password are required'
            }), 400
        
        # Find user by email
        user = User.query.filter_by(email=email).first()
        
        if not user:
            return jsonify({
                'success': False,
                'message': 'Invalid credentials'
            }), 401
        
        # Check password
        if not user.check_password(password):
            return jsonify({
                'success': False,
                'message': 'Invalid credentials'
            }), 401
        
        # Check if user is admin
        if not user.is_admin:
            return jsonify({
                'success': False,
                'message': 'Insufficient privileges'
            }), 403
        
        # Login successful
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@admin_bp.route('/stats', methods=['GET'])
def admin_stats():
    """Get admin dashboard statistics"""
    try:
        # Get basic counts from database
        user_count = User.query.count()
        
        # TODO: Add other model counts when they're implemented
        # category_count = Category.query.count()
        # evidence_count = Evidence.query.count()
        # vote_count = Vote.query.count()
        
        return jsonify({
            'success': True,
            'stats': {
                'users': user_count,
                'categories': 0,  # Placeholder
                'evidence': 0,    # Placeholder
                'votes': 0        # Placeholder
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500
