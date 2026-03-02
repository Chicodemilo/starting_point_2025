# ==============================================================================
# File:      api/app/routes/admin.py
# Purpose:   Admin route blueprint. Provides endpoints for user/group/alert
#            management, messaging oversight, terms & conditions, admin
#            invites, permissions, health checks, and test results.
# Callers:   routes/__init__.py
# Callees:   models/user.py, models/group.py, models/group_member.py,
#            models/item.py, models/alert.py, models/message.py,
#            services/alert_service.py, services/messaging_service.py,
#            services/auth_service.py, security/__init__.py, Flask, db
# Modified:  2026-03-01
# ==============================================================================
from flask import Blueprint, request, jsonify, g
from app import db
from app.models.user import User
from app.models.group import Group
from app.models.group_member import GroupMember
from app.models.item import Item
from app.models.alert import Alert
from app.models.message import Message
from app.services.alert_service import AlertService
from app.services.messaging_service import MessagingService
from app.services.auth_service import AuthService
from app.security import auth_middleware, admin_rate_limit, token_required, admin_required, moderate_rate_limit
from datetime import datetime, timedelta
import logging
import json
import os

admin_bp = Blueprint('admin', __name__)
logger = logging.getLogger(__name__)


@admin_bp.route('/login', methods=['POST'])
@moderate_rate_limit
def admin_login():
    """Admin login endpoint"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400

        email = data.get('email')
        password = data.get('password')
        if not email or not password:
            return jsonify({'success': False, 'message': 'Email and password are required'}), 400

        user = User.query.filter_by(email=email).first()
        if not user or not user.check_password(password):
            return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

        if not user.is_admin:
            return jsonify({'success': False, 'message': 'Insufficient privileges'}), 403

        token = auth_middleware.generate_token(user.to_dict())

        return jsonify({
            'success': True,
            'message': 'Login successful',
            'token': token,
            'user': user.to_dict()
        }), 200

    except Exception as e:
        logger.error(f"Admin login error: {str(e)}")
        return jsonify({'success': False, 'message': 'Server error'}), 500


@admin_bp.route('/stats', methods=['GET'])
@admin_rate_limit
@token_required
@admin_required
def admin_stats():
    """Get admin dashboard statistics"""
    try:
        user_count = User.query.count()
        group_count = Group.query.count()
        item_count = Item.query.count()
        alert_count = Alert.query.count()
        message_count = Message.query.count()

        # Recent signups (last 7 days)
        week_ago = datetime.utcnow() - timedelta(days=7)
        recent_users = User.query.filter(User.created_at >= week_ago).count()

        return jsonify({
            'success': True,
            'stats': {
                'users': user_count,
                'groups': group_count,
                'items': item_count,
                'alerts': alert_count,
                'messages': message_count,
                'recent_signups': recent_users
            }
        }), 200

    except Exception as e:
        logger.error(f"Admin stats error: {str(e)}")
        return jsonify({'success': False, 'message': 'Server error'}), 500


@admin_bp.route('/users', methods=['GET'])
@admin_rate_limit
@token_required
@admin_required
def list_users():
    """List all users with search/filter"""
    search = request.args.get('search', '')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    query = User.query
    if search:
        query = query.filter(
            (User.username.ilike(f'%{search}%')) |
            (User.email.ilike(f'%{search}%'))
        )

    query = query.order_by(User.created_at.desc())
    pagination = query.paginate(page=page, per_page=min(per_page, 100), error_out=False)

    return jsonify({
        'users': [u.to_dict() for u in pagination.items],
        'total': pagination.total,
        'page': pagination.page,
        'pages': pagination.pages
    }), 200


@admin_bp.route('/users/<int:user_id>', methods=['GET'])
@admin_rate_limit
@token_required
@admin_required
def get_user(user_id):
    """Get user detail with groups and items"""
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    memberships = GroupMember.query.filter_by(user_id=user_id).all()
    groups = []
    for m in memberships:
        group = Group.query.get(m.group_id)
        if group:
            groups.append({'group': group.to_dict(), 'role': m.role})

    items = Item.query.filter_by(user_id=user_id).limit(50).all()

    return jsonify({
        'user': user.to_dict(),
        'groups': groups,
        'items': [i.to_dict() for i in items]
    }), 200


@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@admin_rate_limit
@token_required
@admin_required
def update_user(user_id):
    """Update user (toggle admin, etc.)"""
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()
    if 'is_admin' in data:
        user.is_admin = data['is_admin']
    if 'email_verified' in data:
        user.email_verified = data['email_verified']

    db.session.commit()
    return jsonify({'user': user.to_dict()}), 200


@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@admin_rate_limit
@token_required
@admin_required
def delete_user(user_id):
    """Delete a user"""
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Prevent deleting yourself
    if user.id == g.current_user.get('user_id'):
        return jsonify({'error': 'Cannot delete your own account'}), 400

    db.session.delete(user)
    db.session.commit()
    logger.info(f"Admin deleted user: {user.username}")
    return jsonify({'message': 'User deleted'}), 200


@admin_bp.route('/groups', methods=['GET'])
@admin_rate_limit
@token_required
@admin_required
def list_groups():
    """List all groups with search/filter"""
    search = request.args.get('search', '')
    group_type = request.args.get('type', '')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    query = Group.query
    if search:
        query = query.filter(Group.name.ilike(f'%{search}%'))
    if group_type:
        query = query.filter_by(type=group_type)

    query = query.order_by(Group.created_at.desc())
    pagination = query.paginate(page=page, per_page=min(per_page, 100), error_out=False)

    return jsonify({
        'groups': [g_item.to_dict() for g_item in pagination.items],
        'total': pagination.total,
        'page': pagination.page,
        'pages': pagination.pages
    }), 200


@admin_bp.route('/groups/<int:group_id>', methods=['GET'])
@admin_rate_limit
@token_required
@admin_required
def get_group(group_id):
    """Get group detail with members"""
    group = Group.query.get(group_id)
    if not group:
        return jsonify({'error': 'Group not found'}), 404

    return jsonify({'group': group.to_dict(include_members=True)}), 200


@admin_bp.route('/groups/<int:group_id>', methods=['DELETE'])
@admin_rate_limit
@token_required
@admin_required
def delete_group(group_id):
    """Delete a group"""
    group = Group.query.get(group_id)
    if not group:
        return jsonify({'error': 'Group not found'}), 404

    db.session.delete(group)
    db.session.commit()
    logger.info(f"Admin deleted group: {group.name}")
    return jsonify({'message': 'Group deleted'}), 200


# --- Alert Admin Endpoints ---

@admin_bp.route('/alerts', methods=['GET'])
@admin_rate_limit
@token_required
@admin_required
def admin_list_alerts():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    result = AlertService.get_all_alerts(page, per_page)
    return jsonify(result), 200


@admin_bp.route('/alerts', methods=['POST'])
@admin_rate_limit
@token_required
@admin_required
def admin_create_alert():
    data = request.get_json()
    if not data or not data.get('title'):
        return jsonify({'error': 'Title required'}), 400
    alert = AlertService.create_alert(
        title=data['title'],
        content=data.get('content'),
        alert_type=data.get('type', 'system'),
        sender_id=g.current_user.get('user_id'),
        group_id=data.get('group_id'),
        receiver_id=data.get('receiver_id'),
        is_urgent=data.get('is_urgent', False),
    )
    return jsonify({'alert': alert.to_dict()}), 201


# --- Messaging Admin Endpoints ---

@admin_bp.route('/conversations', methods=['GET'])
@admin_rate_limit
@token_required
@admin_required
def admin_list_conversations():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    result = MessagingService.get_all_conversations(page, per_page)
    return jsonify(result), 200


@admin_bp.route('/conversations/<int:conv_id>/messages', methods=['GET'])
@admin_rate_limit
@token_required
@admin_required
def admin_get_messages(conv_id):
    page = request.args.get('page', 1, type=int)
    from app.models.message import Message as Msg
    pagination = Msg.query.filter_by(conversation_id=conv_id).order_by(
        Msg.created_at.desc()
    ).paginate(page=page, per_page=50, error_out=False)
    return jsonify({
        'messages': [m.to_dict() for m in pagination.items],
        'total': pagination.total,
    }), 200


@admin_bp.route('/messages/<int:message_id>', methods=['DELETE'])
@admin_rate_limit
@token_required
@admin_required
def admin_delete_message(message_id):
    success, error = MessagingService.delete_message(message_id, is_admin=True)
    if error:
        return jsonify({'error': error}), 404
    return jsonify({'message': 'Message deleted'}), 200


@admin_bp.route('/broadcast', methods=['POST'])
@admin_rate_limit
@token_required
@admin_required
def admin_broadcast():
    data = request.get_json()
    if not data or not data.get('title'):
        return jsonify({'error': 'Title required'}), 400
    alert = AlertService.create_alert(
        title=data['title'],
        content=data.get('content'),
        alert_type='system',
        sender_id=g.current_user.get('user_id'),
        is_urgent=data.get('is_urgent', False),
    )
    return jsonify({'alert': alert.to_dict(), 'message': 'Broadcast sent'}), 201


# --- Terms & Conditions ---

@admin_bp.route('/terms', methods=['GET'])
@admin_rate_limit
@token_required
@admin_required
def admin_get_terms():
    terms = AuthService.get_terms()
    return jsonify({'terms': terms.to_dict()}), 200


@admin_bp.route('/terms', methods=['PUT'])
@admin_rate_limit
@token_required
@admin_required
def admin_update_terms():
    data = request.get_json()
    if not data or not data.get('content'):
        return jsonify({'error': 'Content required'}), 400
    terms = AuthService.update_terms(data['content'], g.current_user.get('user_id'))
    return jsonify({'terms': terms.to_dict(), 'message': 'Terms updated'}), 200


@admin_bp.route('/terms/reset', methods=['POST'])
@admin_rate_limit
@token_required
@admin_required
def admin_reset_terms():
    AuthService.reset_all_terms()
    return jsonify({'message': 'All users must re-accept terms'}), 200


# --- Admin Invite ---

@admin_bp.route('/invite', methods=['POST'])
@admin_rate_limit
@token_required
@admin_required
def admin_invite_user():
    data = request.get_json()
    if not data or not data.get('email'):
        return jsonify({'error': 'Email required'}), 400
    user, error = AuthService.invite_user(data['email'], g.current_user.get('user_id'))
    if error:
        return jsonify({'error': error}), 400
    return jsonify({'user': user.to_dict(), 'message': 'Invite sent'}), 201


# --- Admin Users Management ---

@admin_bp.route('/admin-users', methods=['GET'])
@admin_rate_limit
@token_required
@admin_required
def list_admin_users():
    admins = AuthService.get_admin_users()
    return jsonify({'users': [u.to_dict() for u in admins]}), 200


# --- Admin Permissions ---

@admin_bp.route('/users/<int:user_id>/permissions', methods=['PUT'])
@admin_rate_limit
@token_required
@admin_required
def update_user_permissions(user_id):
    data = request.get_json()
    if not data or 'permissions' not in data:
        return jsonify({'error': 'Permissions object required'}), 400
    user, error = AuthService.update_admin_permissions(user_id, data['permissions'])
    if error:
        return jsonify({'error': error}), 400
    return jsonify({'user': user.to_dict()}), 200


# --- Health & Test Results ---

@admin_bp.route('/health', methods=['GET'])
@admin_rate_limit
@token_required
@admin_required
def admin_health():
    from app import db as _db
    try:
        with _db.engine.connect() as conn:
            conn.execute(_db.text('SELECT 1'))
        db_status = 'connected'
    except Exception:
        db_status = 'disconnected'

    return jsonify({
        'api_status': 'running',
        'database': db_status,
        'users': User.query.count(),
        'groups': Group.query.count(),
        'items': Item.query.count(),
        'alerts': Alert.query.count(),
        'messages': Message.query.count(),
        'timestamp': datetime.utcnow().isoformat(),
    }), 200


@admin_bp.route('/test-results', methods=['GET'])
@admin_rate_limit
@token_required
@admin_required
def admin_test_results():
    results_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'test-results.json')
    if not os.path.exists(results_path):
        return jsonify({'error': 'No test results available', 'results': None}), 200
    try:
        with open(results_path, 'r') as f:
            results = json.load(f)
        return jsonify({'results': results}), 200
    except Exception:
        return jsonify({'error': 'Failed to read test results', 'results': None}), 200
