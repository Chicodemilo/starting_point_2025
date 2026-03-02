from flask import Blueprint, jsonify, request, g
from app.services.group_service import GroupService
from app.security import moderate_rate_limit, token_required
import logging

groups_bp = Blueprint('groups', __name__)
logger = logging.getLogger(__name__)


@groups_bp.route('', methods=['POST'])
@moderate_rate_limit
@token_required
def create_group():
    """Create a new group"""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body required'}), 400

    name = data.get('name')
    group_type = data.get('type')
    if not name or not group_type:
        return jsonify({'error': 'Name and type are required'}), 400

    group, error = GroupService.create_group(
        name=name,
        description=data.get('description'),
        group_type=group_type,
        owner_id=g.current_user['user_id'],
        is_private=data.get('is_private', True)
    )
    if error:
        return jsonify({'error': error}), 400

    return jsonify({'group': group.to_dict(include_members=True)}), 201


@groups_bp.route('', methods=['GET'])
@moderate_rate_limit
@token_required
def list_groups():
    """List user's groups, optionally browse public groups"""
    browse_public = request.args.get('public', '').lower() == 'true'

    if browse_public:
        groups = GroupService.get_public_groups()
    else:
        groups = GroupService.get_user_groups(g.current_user['user_id'])

    return jsonify({
        'groups': [g_item.to_dict() for g_item in groups]
    }), 200


@groups_bp.route('/<int:group_id>', methods=['GET'])
@moderate_rate_limit
@token_required
def get_group(group_id):
    """Get group details with members"""
    group = GroupService.get_group(group_id)
    if not group:
        return jsonify({'error': 'Group not found'}), 404

    return jsonify({'group': group.to_dict(include_members=True)}), 200


@groups_bp.route('/<int:group_id>', methods=['PUT'])
@moderate_rate_limit
@token_required
def update_group(group_id):
    """Update a group (owner/admin only)"""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body required'}), 400

    group, error = GroupService.update_group(
        group_id=group_id,
        user_id=g.current_user['user_id'],
        **data
    )
    if error:
        return jsonify({'error': error}), 403 if 'Permission' in error else 404

    return jsonify({'group': group.to_dict()}), 200


@groups_bp.route('/<int:group_id>', methods=['DELETE'])
@moderate_rate_limit
@token_required
def delete_group(group_id):
    """Delete a group (owner only)"""
    success, error = GroupService.delete_group(group_id, g.current_user['user_id'])
    if not success:
        return jsonify({'error': error}), 403 if 'owner' in error else 404

    return jsonify({'message': 'Group deleted'}), 200


@groups_bp.route('/join', methods=['POST'])
@moderate_rate_limit
@token_required
def join_group():
    """Join a group via invite code"""
    data = request.get_json()
    invite_code = data.get('invite_code') if data else None
    if not invite_code:
        return jsonify({'error': 'Invite code required'}), 400

    group, error = GroupService.join_by_invite(invite_code, g.current_user['user_id'])
    if error:
        return jsonify({'error': error}), 400

    return jsonify({'group': group.to_dict()}), 200


@groups_bp.route('/<int:group_id>/invite', methods=['POST'])
@moderate_rate_limit
@token_required
def regenerate_invite(group_id):
    """Generate a new invite code (owner/admin only)"""
    code, error = GroupService.regenerate_invite(group_id, g.current_user['user_id'])
    if error:
        return jsonify({'error': error}), 403

    return jsonify({'invite_code': code}), 200


@groups_bp.route('/<int:group_id>/invite-email', methods=['POST'])
@moderate_rate_limit
@token_required
def invite_member_by_email(group_id):
    """Invite a user to a group by email (owner/admin only)"""
    data = request.get_json()
    email = data.get('email') if data else None
    if not email:
        return jsonify({'error': 'Email required'}), 400

    result, error = GroupService.invite_member_by_email(
        group_id=group_id,
        email=email,
        requester_id=g.current_user['user_id']
    )
    if error:
        status = 403 if 'Permission' in error else 400
        return jsonify({'error': error}), status

    return jsonify(result), 200


@groups_bp.route('/<int:group_id>/members', methods=['POST'])
@moderate_rate_limit
@token_required
def add_member(group_id):
    """Add a member to a group (owner/admin only)"""
    data = request.get_json()
    user_id = data.get('user_id') if data else None
    if not user_id:
        return jsonify({'error': 'user_id required'}), 400

    member, error = GroupService.add_member(
        group_id=group_id,
        user_id=user_id,
        requester_id=g.current_user['user_id'],
        role=data.get('role', 'member')
    )
    if error:
        return jsonify({'error': error}), 403 if 'Permission' in error else 400

    return jsonify({'member': member.to_dict()}), 201


@groups_bp.route('/<int:group_id>/members/<int:user_id>', methods=['PUT'])
@moderate_rate_limit
@token_required
def update_member_role(group_id, user_id):
    """Update a member's role (owner only)"""
    data = request.get_json()
    new_role = data.get('role') if data else None
    if not new_role:
        return jsonify({'error': 'Role required'}), 400

    member, error = GroupService.update_member_role(
        group_id=group_id,
        user_id=user_id,
        new_role=new_role,
        requester_id=g.current_user['user_id']
    )
    if error:
        return jsonify({'error': error}), 403 if 'owner' in error else 404

    return jsonify({'member': member.to_dict()}), 200


@groups_bp.route('/<int:group_id>/members/<int:user_id>', methods=['DELETE'])
@moderate_rate_limit
@token_required
def remove_member(group_id, user_id):
    """Remove a member (owner/admin, or self to leave)"""
    success, error = GroupService.remove_member(
        group_id=group_id,
        user_id=user_id,
        requester_id=g.current_user['user_id']
    )
    if not success:
        return jsonify({'error': error}), 403 if 'Permission' in error or 'Owner' in error else 404

    return jsonify({'message': 'Member removed'}), 200
