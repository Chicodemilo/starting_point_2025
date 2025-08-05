from flask import Flask, request, g
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
import os
import logging
from datetime import datetime

# Import security middleware
from app.security import (
    rate_limiter,
    security_headers,
    auth_middleware,
    moderate_rate_limit,
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
    
    # Configure the Flask app
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Security configuration
    app.config.update({
        'JWT_SECRET_KEY': os.getenv('JWT_SECRET_KEY', 'dev-secret-key-change-in-production'),
        'JWT_EXPIRATION_HOURS': int(os.getenv('JWT_EXPIRATION_HOURS', '24')),
        'SECURITY_HEADERS': {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
            'Referrer-Policy': 'strict-origin-when-cross-origin'
        },
        'CORS_ORIGINS': [
            'http://localhost:3151',
            'http://localhost:5151',
            'http://127.0.0.1:3151',
            'http://127.0.0.1:5151'
        ]
    })
    
    # Initialize CORS with security configuration
    CORS(app, origins=app.config['CORS_ORIGINS'])
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    
    # Initialize security middleware (rate_limiter, security_headers, and auth_middleware are global instances)
    # Initialize security headers with the app
    security_headers.init_app(app)
    # Initialize auth middleware with the app
    auth_middleware.init_app(app)
    
    # Security monitoring middleware
    @app.before_request
    def security_monitoring():
        # Log all requests for security monitoring
        security_logger.info(f"Request: {request.method} {request.path} from {request.remote_addr}")
        
        # Store request start time for performance monitoring
        g.request_start_time = datetime.utcnow()
        
        # Initialize user context
        g.current_user = None
    
    @app.after_request
    def log_response(response):
        # Log response for security monitoring
        if hasattr(g, 'request_start_time'):
            duration = (datetime.utcnow() - g.request_start_time).total_seconds()
            security_logger.info(
                f"Response: {response.status_code} for {request.method} {request.path} "
                f"in {duration:.3f}s"
            )
        return response
    
    # Import models to ensure they're registered with SQLAlchemy
    from app.models import User, Category, Evidence, EvidenceCategoryLink, Vote
    
    # Register blueprints with security middleware
    from app.routes.admin import admin_bp
    app.register_blueprint(admin_bp)
    
    from app.routes.test_models import test_models_bp
    app.register_blueprint(test_models_bp)
    
    from app.routes.logs import logs_bp
    app.register_blueprint(logs_bp, url_prefix='/api/logs')
    
    # Add security-enhanced API routes
    @app.route('/api/auth/login', methods=['POST'])
    @moderate_rate_limit
    def login():
        """Login endpoint with rate limiting"""
        from flask import jsonify, request
        from app.security import auth_middleware, hash_password, verify_password
        
        try:
            data = request.get_json()
            if not data or not data.get('username') or not data.get('password'):
                security_logger.warning(f"Invalid login attempt from {request.remote_addr}")
                return jsonify({'error': 'Username and password required'}), 400
            
            # In a real app, validate against database
            # For demo purposes, using hardcoded admin user
            if data['username'] == 'admin' and data['password'] == 'admin123':
                token = auth_middleware.generate_token({
                    'id': 1,
                    'username': 'admin',
                    'email': 'admin@example.com',
                    'is_admin': True
                })
                
                security_logger.info(f"Successful login for user: {data['username']}")
                return jsonify({
                    'token': token,
                    'user': {
                        'id': 1,
                        'username': 'admin',
                        'roles': ['admin']
                    }
                }), 200
            else:
                security_logger.warning(f"Failed login attempt for user: {data.get('username')} from {request.remote_addr}")
                return jsonify({'error': 'Invalid credentials'}), 401
                
        except Exception as e:
            security_logger.error(f"Login error: {str(e)}")
            return jsonify({'error': 'Internal server error'}), 500
    
    @app.route('/api/auth/verify', methods=['GET'])
    @token_required
    def verify_token():
        """Token verification endpoint"""
        from flask import jsonify
        return jsonify({
            'valid': True,
            'user': {
                'id': g.current_user.get('user_id'),
                'username': g.current_user.get('username'),
                'roles': g.current_user.get('roles', [])
            }
        }), 200
    
    @app.route('/api/security/status', methods=['GET'])
    @lenient_rate_limit
    @optional_auth
    def security_status():
        """Security status endpoint"""
        from flask import jsonify
        
        status = {
            'security_active': True,
            'rate_limiting': True,
            'authentication': True,
            'headers_enabled': True,
            'cors_configured': True,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        # Add user info if authenticated
        if g.current_user:
            status['authenticated'] = True
            status['user'] = g.current_user.get('username')
        else:
            status['authenticated'] = False
        
        return jsonify(status), 200
    
    @app.route('/api/admin/security', methods=['GET'])
    @admin_rate_limit
    @token_required
    @admin_required
    def admin_security_dashboard():
        """Admin security dashboard endpoint"""
        from flask import jsonify
        
        # Get rate limiter statistics
        rate_stats = rate_limiter.get_status()
        
        dashboard_data = {
            'rate_limiter': {
                'active_clients': len(rate_stats),
                'total_requests': sum(len(client_data['requests']) for client_data in rate_stats.values()),
                'clients': rate_stats
            },
            'security_events': {
                'total_requests': 'logged',
                'failed_auth': 'monitored',
                'rate_limited': 'tracked'
            },
            'system_status': {
                'security_middleware': 'active',
                'authentication': 'enabled',
                'rate_limiting': 'enabled',
                'security_headers': 'enabled'
            },
            'timestamp': datetime.utcnow().isoformat()
        }
        
        return jsonify(dashboard_data), 200

    
    @app.route('/')
    @lenient_rate_limit
    def hello():
        return {
            "message": "Right to Remain API",
            "version": "1.0.0",
            "security": "enabled",
            "status": "running"
        }

    @app.route('/healthz')
    def healthz():
        """Health check endpoint (no rate limiting for monitoring)"""
        try:
            # Test database connection
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

    return app

# Create the app instance
app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("BACKEND_PORT", 5151))
    app.run(host="0.0.0.0", port=port)
