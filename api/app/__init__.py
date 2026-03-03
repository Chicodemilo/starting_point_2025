# ==============================================================================
# File:      api/app/__init__.py
# Purpose:   Flask application factory. Initializes extensions (SQLAlchemy,
#            Migrate, CORS), registers security middleware, blueprints,
#            seeds admin user, and provides health/status endpoints.
# Callers:   Direct entry point (WSGI/Gunicorn), tests
# Callees:   Flask, flask_sqlalchemy, flask_migrate, flask_cors,
#            config/settings.py, security/__init__.py, models/__init__.py,
#            routes/__init__.py, services/auth_service.py
# Modified:  2026-03-01
# ==============================================================================
from flask import Flask, request, g, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from werkzeug.exceptions import HTTPException
import os
import logging
from datetime import datetime

# Import security middleware
from app.security import (
    rate_limiter,
    security_headers,
    auth_middleware,
    lenient_rate_limit,
    admin_rate_limit,
    token_required,
    admin_required,
    optional_auth
)

db = SQLAlchemy()
migrate = Migrate()

# Configure logging for security events
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
security_logger = logging.getLogger('security')


def create_app():
    app = Flask(__name__)

    # Load config
    from app.config.settings import Config
    app.config.from_object(Config)

    # Fallback for DATABASE_URL if not set via Config
    if not app.config.get('SQLALCHEMY_DATABASE_URI'):
        app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')

    # Initialize CORS
    CORS(app, origins=Config.CORS_ORIGINS)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)

    # Initialize security middleware
    security_headers.init_app(app)
    auth_middleware.init_app(app)

    # Security monitoring middleware
    @app.before_request
    def security_monitoring():
        security_logger.info(f"Request: {request.method} {request.path} from {request.remote_addr}")
        g.request_start_time = datetime.utcnow()
        g.current_user = None

    @app.after_request
    def log_response(response):
        if hasattr(g, 'request_start_time'):
            duration = (datetime.utcnow() - g.request_start_time).total_seconds()
            security_logger.info(
                f"Response: {response.status_code} for {request.method} {request.path} "
                f"in {duration:.3f}s"
            )
        return response

    # Import models to register with SQLAlchemy
    from app.models import User, Group, GroupMember, Item, Alert, Conversation, ConversationMember, Message

    # Register all blueprints
    from app.routes import register_blueprints
    register_blueprints(app)

    # JSON error handlers (API should never return HTML error pages)
    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({'error': 'Bad request', 'message': str(e.description)}), 400

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'error': 'Not found'}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({'error': 'Method not allowed'}), 405

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({'error': 'Internal server error'}), 500

    # Security status endpoint
    @app.route('/api/security/status', methods=['GET'])
    @lenient_rate_limit
    @optional_auth
    def security_status():
        status = {
            'security_active': True,
            'rate_limiting': True,
            'authentication': True,
            'headers_enabled': True,
            'cors_configured': True,
            'timestamp': datetime.utcnow().isoformat()
        }
        if g.current_user:
            status['authenticated'] = True
            status['user'] = g.current_user.get('username')
        else:
            status['authenticated'] = False
        return status, 200

    # Admin security dashboard
    @app.route('/api/admin/security', methods=['GET'])
    @admin_rate_limit
    @token_required
    @admin_required
    def admin_security_dashboard():
        from flask import jsonify
        rate_stats = rate_limiter.get_status()
        return jsonify({
            'rate_limiter': {
                'active_clients': len(rate_stats),
                'total_requests': sum(len(cd['requests']) for cd in rate_stats.values()),
                'clients': rate_stats
            },
            'system_status': {
                'security_middleware': 'active',
                'authentication': 'enabled',
                'rate_limiting': 'enabled',
                'security_headers': 'enabled'
            },
            'timestamp': datetime.utcnow().isoformat()
        }), 200

    # Root endpoint
    @app.route('/')
    @lenient_rate_limit
    def hello():
        return {
            "message": f"{Config.APP_NAME} API",
            "version": "1.0.0",
            "security": "enabled",
            "status": "running"
        }

    # Health check
    @app.route('/healthz')
    def healthz():
        try:
            with db.engine.connect() as connection:
                connection.execute(db.text('SELECT 1'))
            return {
                "status": "healthy",
                "database": "connected",
                "security": "active",
                "timestamp": datetime.utcnow().isoformat()
            }, 200
        except Exception as e:
            security_logger.error(f"Health check failed: {str(e)}")
            return {
                "status": "unhealthy",
                "error": "Database connection failed",
                "timestamp": datetime.utcnow().isoformat()
            }, 503

    # Seed admin user on first request (retries until DB is ready)
    @app.before_request
    def seed_admin_once():
        if not getattr(app, '_admin_seeded', False):
            try:
                from app.services.auth_service import AuthService
                AuthService.seed_admin(
                    username=Config.ADMIN_USERNAME,
                    email=Config.ADMIN_EMAIL,
                    password=Config.ADMIN_PASSWORD
                )
                from app.services.seed_service import seed_demo_data
                seed_demo_data()
                app._admin_seeded = True
            except Exception as e:
                security_logger.warning(f"Admin seed skipped: {str(e)}")

    return app
