# ==============================================================================
# File:      api/app/routes/config.py
# Purpose:   Config route blueprint. Exposes read-only application
#            configuration data to the frontend, such as allowed group types.
# Callers:   routes/__init__.py
# Callees:   config/group_types.py, security/__init__.py, Flask
# Modified:  2026-03-01
# ==============================================================================
from flask import Blueprint, jsonify
from app.config.group_types import GROUP_TYPES
from app.security import lenient_rate_limit

config_bp = Blueprint('config', __name__)


@config_bp.route('/group-types', methods=['GET'])
@lenient_rate_limit
def get_group_types():
    """Return the list of allowed group types"""
    return jsonify({'group_types': GROUP_TYPES}), 200
