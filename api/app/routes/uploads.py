from flask import Blueprint, request, jsonify, g, send_from_directory
from app import db
from app.models.user import User
from app.models.group import Group
from app.models.group_member import GroupMember
from app.security import moderate_rate_limit, token_required
from app.utils.uploads import save_avatar, save_group_icon, delete_avatar, delete_group_icon, UPLOAD_DIR
import os

uploads_bp = Blueprint('uploads', __name__)


@uploads_bp.route('/avatar', methods=['POST'])
@moderate_rate_limit
@token_required
def upload_avatar():
    """Upload or replace user avatar."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    base_name, error = save_avatar(file)
    if error:
        return jsonify({'error': error}), 400

    user = User.query.get(g.current_user['user_id'])
    if user.avatar:
        delete_avatar(user.avatar)
    user.avatar = base_name
    db.session.commit()
    return jsonify({'user': user.to_dict()}), 200


@uploads_bp.route('/group/<int:group_id>/icon', methods=['POST'])
@moderate_rate_limit
@token_required
def upload_group_icon(group_id):
    """Upload or replace group icon. Owner/admin only."""
    group = Group.query.get(group_id)
    if not group:
        return jsonify({'error': 'Group not found'}), 404

    membership = GroupMember.query.filter_by(
        group_id=group_id, user_id=g.current_user['user_id']
    ).first()
    if not membership or membership.role not in ('owner', 'admin'):
        return jsonify({'error': 'Permission denied'}), 403

    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    base_name, error = save_group_icon(file)
    if error:
        return jsonify({'error': error}), 400

    if group.icon:
        delete_group_icon(group.icon)
    group.icon = base_name
    db.session.commit()
    return jsonify({'group': group.to_dict()}), 200


@uploads_bp.route('/<path:filepath>', methods=['GET'])
def serve_upload(filepath):
    """Serve uploaded files."""
    return send_from_directory(UPLOAD_DIR, filepath)
