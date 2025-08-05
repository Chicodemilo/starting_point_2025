# Infrastructure Base Repository

This repository serves as a comprehensive base template for full-stack web applications with enterprise-grade security and operational features.

## 🎯 What You Get

### **Complete Docker Stack**
- **4-service architecture**: Database, API, Frontend, Reverse Proxy
- **Production-ready**: Health checks, logging, environment configuration
- **Easy deployment**: Single command local setup with `./scripts/deploy_local.sh`

### **Comprehensive Security System**
- **JWT Authentication**: Role-based access control with refresh tokens
- **Rate Limiting**: Sliding window algorithm with multiple tiers
- **Security Headers**: CSP, HSTS, CORS, XSS protection
- **Input Validation**: XSS prevention and sanitization
- **Security Monitoring**: Request/response logging and audit trails

### **Database Management**
- **MySQL 8.0**: Production-ready database with health checks
- **Automated Backups**: Configurable retention and compression
- **Easy Restoration**: One-command database recovery
- **Migration Support**: Flask-Migrate integration

### **Operational Excellence**
- **Health Monitoring**: Comprehensive system health checks
- **Error Logging**: Centralized frontend and backend error tracking
- **Deployment Scripts**: Automated setup and teardown
- **Documentation**: Extensive README with examples

## 🚀 Quick Start

```bash
# Clone and setup
git clone <your-fork>
cd <project-name>

# Deploy everything
./scripts/deploy_local.sh

# Check system health
./scripts/health_check.sh -e local

# Create database backup
./scripts/backup_db.sh

# Setup automated backups
./scripts/setup_backup_cron.sh
```

## 📁 Key Infrastructure Files

### **Docker Configuration**
- `docker-compose.yml` - Multi-service orchestration
- `api/Dockerfile` - Flask API container
- `frontend/Dockerfile` - React frontend container

### **Security Middleware**
- `api/app/security/` - Complete security system
  - `auth_middleware.py` - JWT authentication
  - `rate_limiter.py` - Request rate limiting
  - `security_headers.py` - HTTP security headers
- `frontend/src/security/` - Frontend security components

### **Operational Scripts**
- `scripts/deploy_local.sh` - Full system deployment
- `scripts/health_check.sh` - System health verification
- `scripts/backup_db.sh` - Database backup management
- `scripts/setup_backup_cron.sh` - Automated backup scheduling

### **Configuration**
- `.env` - Environment variables and secrets
- `nginx/nginx.conf` - Reverse proxy configuration
- `api/requirements.txt` - Python dependencies
- `frontend/package.json` - Node.js dependencies

## 🔧 Customization for New Projects

### **1. Update Project Identity**
```bash
# Update project name and description
vim README.md
vim package.json
vim docker-compose.yml

# Update database name and credentials
vim .env
```

### **2. Customize Application Logic**
```bash
# Backend API routes
vim api/app/__init__.py
vim api/app/models.py

# Frontend components
vim frontend/src/components/
vim frontend/src/App.jsx
```

### **3. Configure Security**
```bash
# JWT secrets and security policies
vim .env
vim api/app/security/

# CORS origins and CSP policies
vim api/app/security/security_headers.py
```

### **4. Database Schema**
```bash
# Update database models
vim api/app/models.py

# Create migrations
docker-compose exec api flask db migrate -m "Initial migration"
docker-compose exec api flask db upgrade
```

## 🛡️ Security Features

### **Authentication & Authorization**
- JWT tokens with configurable expiration
- Role-based access control (admin, user)
- Permission-based route protection
- Secure password hashing

### **Request Protection**
- Rate limiting with sliding window algorithm
- Input validation and sanitization
- XSS and injection prevention
- CSRF protection via security headers

### **Network Security**
- HTTPS-ready configuration
- Security headers (CSP, HSTS, etc.)
- CORS policy enforcement
- Reverse proxy with nginx

### **Monitoring & Auditing**
- Request/response logging
- Security event tracking
- Error monitoring and alerting
- Health check endpoints

## 💾 Backup & Recovery

### **Automated Backups**
- Configurable retention policies
- Compression support
- Cron-based scheduling
- Monitoring and alerting

### **Disaster Recovery**
- One-command restoration
- Complete system rebuild capability
- Data validation and verification
- Recovery procedure documentation

## 🔄 Development Workflow

### **Local Development**
```bash
# Start development environment
./scripts/deploy_local.sh

# Make changes to code
# Changes are reflected via volume mounts

# Run tests
docker-compose exec api python -m pytest
docker-compose exec frontend npm test

# Check system health
./scripts/health_check.sh -e local
```

### **Production Deployment**
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d

# Setup automated backups
./scripts/setup_backup_cron.sh

# Monitor system health
./scripts/health_check.sh
```

## 📊 Monitoring & Maintenance

### **Health Checks**
- Container status verification
- Database connectivity testing
- API endpoint validation
- Frontend accessibility checks

### **Log Management**
- Centralized logging via Docker
- Application-specific log files
- Error tracking and alerting
- Performance monitoring

### **Backup Management**
- Automated daily backups
- Configurable retention policies
- Backup verification and testing
- Off-site storage recommendations

## 🎯 Use Cases

This infrastructure base is perfect for:

- **Web Applications**: Full-stack apps with user authentication
- **API Services**: Secure REST APIs with rate limiting
- **Admin Dashboards**: Management interfaces with role-based access
- **Content Management**: Systems requiring data persistence and backups
- **Prototypes**: Rapid development with production-ready features

## 📝 Next Steps

1. **Fork this repository** for your new project
2. **Customize the application logic** for your use case
3. **Update branding and content** to match your project
4. **Configure security policies** for your requirements
5. **Set up monitoring and alerting** for production use
6. **Implement additional features** as needed

## 🤝 Contributing

This infrastructure base is designed to be:
- **Modular**: Easy to extend and customize
- **Documented**: Comprehensive guides and examples
- **Tested**: Verified components and configurations
- **Secure**: Enterprise-grade security by default

Feel free to contribute improvements, additional features, or documentation enhancements!

---

**Built with ❤️ for rapid, secure, and scalable web application development.**
