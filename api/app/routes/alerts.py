# ==============================================================================
# File:      api/app/routes/alerts.py
# Purpose:   Alerts route blueprint. Provides user-facing endpoints for
#            listing, creating, marking as read, and deleting alerts.
# Callers:   routes/__init__.py
# Callees:   services/alert_service.py, security/__init__.py, Flask
# Modified:  2026-03-01
# ==============================================================================
from flask import Blueprint, jsonify, request, g
from app.services.alert_service import AlertService
from app.security import moderate_rate_limit, token_required
import logging

alerts_bp = Blueprint('alerts', __name__)
logger = logging.getLogger(__name__)


@alerts_bp.route('', methods=['GET'])
@moderate_rate_limit
@token_required
def get_alerts():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    result = AlertService.get_alerts_for_user(g.current_user.get('user_id'), page, per_page)
    return jsonify(result), 200


@alerts_bp.route('/unread-count', methods=['GET'])
@moderate_rate_limit
@token_required
def get_unread_count():
    count = AlertService.get_unread_count(g.current_user.get('user_id'))
    return jsonify({'unread_count': count}), 200


@alerts_bp.route('', methods=['POST'])
@moderate_rate_limit
@token_required
def create_alert():
    data = request.get_json()
    if not data or not data.get('title'):
        return jsonify({'error': 'Title required'}), 400

    alert = AlertService.create_alert(
        title=data['title'],
        content=data.get('content'),
        alert_type=data.get('type', 'info'),
        sender_id=g.current_user.get('user_id'),
        group_id=data.get('group_id'),
        receiver_id=data.get('receiver_id'),
        is_urgent=data.get('is_urgent', False),
        expires_at=data.get('expires_at'),
    )
    return jsonify({'alert': alert.to_dict()}), 201


@alerts_bp.route('/<int:alert_id>/read', methods=['PUT'])
@moderate_rate_limit
@token_required
def mark_read(alert_id):
    alert, error = AlertService.mark_read(alert_id, g.current_user.get('user_id'))
    if error:
        return jsonify({'error': error}), 404
    return jsonify({'alert': alert.to_dict()}), 200


@alerts_bp.route('/<int:alert_id>', methods=['DELETE'])
@moderate_rate_limit
@token_required
def delete_alert(alert_id):
    success, error = AlertService.delete_alert(alert_id)
    if error:
        return jsonify({'error': error}), 404
    return jsonify({'message': 'Alert deleted'}), 200
