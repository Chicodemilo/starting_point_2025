# ==============================================================================
# File:      api/app/routes/conversations.py
# Purpose:   Conversations route blueprint. Provides endpoints for listing
#            conversations, creating direct messages, and sending/fetching
#            messages within a conversation.
# Callers:   routes/__init__.py
# Callees:   services/messaging_service.py, security/__init__.py, Flask
# Modified:  2026-03-01
# ==============================================================================
from flask import Blueprint, jsonify, request, g
from app.services.messaging_service import MessagingService
from app.security import moderate_rate_limit, token_required
import logging

conversations_bp = Blueprint('conversations', __name__)
logger = logging.getLogger(__name__)


@conversations_bp.route('', methods=['GET'])
@moderate_rate_limit
@token_required
def get_conversations():
    convs = MessagingService.get_user_conversations(g.current_user.get('user_id'))
    return jsonify({'conversations': convs}), 200


@conversations_bp.route('', methods=['POST'])
@moderate_rate_limit
@token_required
def create_conversation():
    """Create a direct message conversation."""
    data = request.get_json()
    if not data or not data.get('user_id'):
        return jsonify({'error': 'user_id required'}), 400

    conv, error = MessagingService.create_direct_conversation(
        g.current_user.get('user_id'),
        data['user_id']
    )
    if error:
        return jsonify({'error': error}), 400
    return jsonify({'conversation': conv.to_dict()}), 201


@conversations_bp.route('/<int:conversation_id>/messages', methods=['GET'])
@moderate_rate_limit
@token_required
def get_messages(conversation_id):
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    result, error = MessagingService.get_messages(conversation_id, g.current_user.get('user_id'), page, per_page)
    if error:
        return jsonify({'error': error}), 403
    return jsonify(result), 200


@conversations_bp.route('/<int:conversation_id>/messages', methods=['POST'])
@moderate_rate_limit
@token_required
def send_message(conversation_id):
    data = request.get_json()
    if not data or not data.get('content'):
        return jsonify({'error': 'content required'}), 400

    message, error = MessagingService.send_message(
        conversation_id,
        g.current_user.get('user_id'),
        data['content']
    )
    if error:
        return jsonify({'error': error}), 400
    return jsonify({'message': message.to_dict()}), 201
