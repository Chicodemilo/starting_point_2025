from flask import Blueprint, jsonify, request, g
from app.services.item_service import ItemService
from app.security import moderate_rate_limit, token_required
import logging

items_bp = Blueprint('items', __name__)
logger = logging.getLogger(__name__)


@items_bp.route('', methods=['GET'])
@moderate_rate_limit
@token_required
def list_items():
    """List items with optional filtering and pagination"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    group_id = request.args.get('group_id', type=int)
    user_id = request.args.get('user_id', type=int)

    result = ItemService.get_items(
        page=page,
        per_page=min(per_page, 100),
        group_id=group_id,
        user_id=user_id
    )
    return jsonify(result), 200


@items_bp.route('/<int:item_id>', methods=['GET'])
@moderate_rate_limit
@token_required
def get_item(item_id):
    """Get a single item"""
    item = ItemService.get_item(item_id)
    if not item:
        return jsonify({'error': 'Item not found'}), 404
    return jsonify({'item': item.to_dict()}), 200


@items_bp.route('', methods=['POST'])
@moderate_rate_limit
@token_required
def create_item():
    """Create a new item"""
    data = request.get_json()
    if not data or not data.get('title'):
        return jsonify({'error': 'Title is required'}), 400

    item = ItemService.create_item(
        title=data['title'],
        description=data.get('description'),
        user_id=g.current_user['user_id'],
        group_id=data.get('group_id')
    )
    return jsonify({'item': item.to_dict()}), 201


@items_bp.route('/<int:item_id>', methods=['PUT'])
@moderate_rate_limit
@token_required
def update_item(item_id):
    """Update an item (must be owner)"""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body required'}), 400

    item, error = ItemService.update_item(
        item_id=item_id,
        user_id=g.current_user['user_id'],
        **data
    )
    if error:
        return jsonify({'error': error}), 403 if 'Permission' in error else 404

    return jsonify({'item': item.to_dict()}), 200


@items_bp.route('/<int:item_id>', methods=['DELETE'])
@moderate_rate_limit
@token_required
def delete_item(item_id):
    """Delete an item (owner or admin)"""
    is_admin = g.current_user.get('is_admin', False)
    success, error = ItemService.delete_item(
        item_id=item_id,
        user_id=g.current_user['user_id'],
        is_admin=is_admin
    )
    if not success:
        return jsonify({'error': error}), 403 if 'Permission' in error else 404

    return jsonify({'message': 'Item deleted'}), 200
