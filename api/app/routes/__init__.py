# ==============================================================================
# File:      api/app/routes/__init__.py
# Purpose:   Package init for routes. Imports all blueprint modules and
#            provides register_blueprints() to mount them on the Flask app.
# Callers:   app/__init__.py
# Callees:   routes/auth.py, routes/admin.py, routes/groups.py,
#            routes/items.py, routes/config.py, routes/logs.py,
#            routes/alerts.py, routes/conversations.py, routes/uploads.py
# Modified:  2026-03-01
# ==============================================================================
from .auth import auth_bp
from .admin import admin_bp
from .groups import groups_bp
from .items import items_bp
from .config import config_bp
from .logs import logs_bp
from .alerts import alerts_bp
from .conversations import conversations_bp
from .uploads import uploads_bp


def register_blueprints(app):
    """Register all blueprints with the Flask app"""
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(groups_bp, url_prefix='/api/groups')
    app.register_blueprint(items_bp, url_prefix='/api/items')
    app.register_blueprint(config_bp, url_prefix='/api/config')
    app.register_blueprint(logs_bp, url_prefix='/api/logs')
    app.register_blueprint(alerts_bp, url_prefix='/api/alerts')
    app.register_blueprint(conversations_bp, url_prefix='/api/conversations')
    app.register_blueprint(uploads_bp, url_prefix='/api/uploads')
