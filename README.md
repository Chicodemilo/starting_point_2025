## Overview

**The Right to Remain Fucked** is a single-page political web app designed to track and visualize how various conservative-leaning identity groups and ideologies have been negatively impacted by the policies and actions of the Trump administration. 

Users select categories representing their identity or beliefs — such as income level, religion, political affiliation, or industry — and receive a “fucked score” backed by real evidence, citations, and crowd-sourced user contributions. The system helps highlight contradictions and betrayals in a fact-based, participatory way.

## Purpose

- To provide a factual, source-backed record of policy outcomes
- To educate users about the effects of governance across identity lines
- To provide a civic engagement tool that is grounded, not partisan
- To allow community members to submit evidence and score its credibility

## Architecture

### Frontend

- **Framework**: React (Vite or CRA)
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Auth**: JWT (optional for voting)
- **Deployment**: Vercel, Netlify, or Docker via GCP

### Backend

- **Framework**: Flask (Python)
- **Database**: MySQL
- **Auth**: JWT-based auth with hashed passwords
- **Deployment**: Docker Compose, GCP-compatible

### Key Features

- Anonymous user browsing
- Registered users can submit new:
  - Categories (with evidence + sources)
  - Evidence for existing categories
- Voting system to upvote/downvote evidence (requires registration)
- Real-time score calculator with visual “fucked meter”
- **Admin dashboard** with secure login and session management
- **Responsive admin panel** with user management, system monitoring, and analytics
- **Centralized error handling** with file logging for debugging and monitoring
- **API connector classes** for streamlined frontend-backend communication

## Project Structure

The project is a monorepo containing the `api` (Flask), `frontend` (React), and supporting services, all orchestrated by Docker.

-   **`api/`**: The Python/Flask backend application.
-   **`frontend/`**: The React/Vite frontend application.
-   **`mysql/`**: Database configuration and initialization scripts.
-   **`nginx/`**: NGINX reverse proxy configuration.
-   **`scripts/`**: Deployment, health check, and utility scripts.
-   **`logs/`**: Application logs including change tracking, known issues, and runtime error logs.

We use non-traditional ports for local development:
- **5151**: Backend API (`api`)
- **3151**: Frontend dev server (`frontend`)
- **3316**: MySQL database (`db`)

### File Tree

```
.
├── api/
│   └── app/
│       ├── models
│       ├── routes/
│       │   ├── admin.py
│       │   ├── logs.py
│       │   └── test_route.py
│       ├── services/
│       └── utils/
│       └── __init__.py
│   │── Dockerfile
│   └── requirements.txt
│
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   │   ├── AdminHeader.jsx
│   │   │   │   ├── AdminNavigation.jsx
│   │   │   │   ├── AdminMain.jsx
│   │   │   │   ├── AdminHome.jsx
│   │   │   │   ├── UsersList.jsx
│   │   │   │   └── MainOverview.jsx
│   │   │   ├── content/
│   │   │   │   ├── content_elements/
│   │   │   │   │   ├── category_elements/ 
│   │   │   │   │   ├── evidence_elements/
│   │   │   │   │   ├── fucked_elements/
│   │   │   │   │   └── header_elements/
│   │   │   └── modal/
│   │   ├── db/
│   │   │   ├── adminConnector.js
│   │   │   ├── mainConnector.js
│   │   │   └── ErrorHandler.js
│   │   ├── stores/
│   │   │   ├── adminStore.js
│   │   │   └── mainStore.jsx
│   │   ├── utils/
│   │   │   └── localStorage.js
│   │   ├── main.jsx
│   │   └── main.css
│   ├── App.jsx
│   ├── Dockerfile
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│   
│
├── logs/
│   ├── change_log.txt
│   ├── known_issues.txt
│   └── error_log.txt
│   
├── mysql/
│   ├── init/
│   │   ├── 01-init-db.sql
│   │   └── 02-test-data.sql
│   └── Dockerfile
│    
│
├── nginx/
│   └── Dockerfile
│
│
├── scripts/
│   └── deploy_gcp.sh
│   └── deploy_local.sh
│   └── git_flow.sh
│   └── health_check.sh
│   └── safe_log.sh
│
│
└── .env
├── .env.example
├── .gitignore
├── ai_instructions.md
├── docker-compose.fresh.yml
├── docker-compose.local.yml
├── docker-compose.preserve.yml
├── docker-compose.prod.yml
├── docker-compose.yml
└── README.md
```



## Layout Overview

The application is a true single-page app (SPA). The entire interface is managed within a single `BodyContainer` component which holds two primary children: the main content and the modal system.

-   **Main Content**: The main content area is organized into four primary components:
    -   **Header**: Renders at the top of the page (`components/content/Header.jsx`). Its supporting elements are in `header_elements/`.
    -   **Categories Panel**: Displays the list of identity categories for user selection (`components/content/Categories.jsx`). Supporting elements are in `category_elements/`.
    -   **Evidence Panel**: Shows evidence related to the selected categories (`components/content/Evidence.jsx`). Supporting elements are in `evidence_elements/`.
    -   **Fucked Meter**: Visualizes the “fucked score” for the current selection (`components/content/FuckedMeter.jsx`). Supporting elements are in `fucked_elements/`.

Each main component is directly in the `content/` folder, while their sub-elements are organized in their respective subfolders for modularity and clarity.

-   **Modal System**: A single `MainModal` component acts as a container for all other modals, which are rendered on top of the main content area as needed. This includes modals for login/registration, evidence/category submission, and the FAQ.

-   **Admin Functionality**: Admin features will be accessed via a direct, unlinked URL. This will likely render a unique set of components for content moderation and site management within the SPA, accessible only to authenticated admin users.

## Data Models (High-Level)

A preliminary look at the database schema:

- **User**: `id`, `username`, `email`, `password_hash`, `created_at`, `is_admin`
- **Category**: `id`, `name`, `description`, `slug`, `submitted_by_id`, `is_approved`, `created_at`
- **Evidence**: `id`, `title`, `source_url`, `summary`, `submitted_by_id`, `is_approved`, `created_at`
- **EvidenceCategoryLink**: `evidence_id`, `category_id` (Many-to-Many relationship)
- **Vote**: `id`, `user_id`, `evidence_id`, `direction` (e.g., +1 for upvote, -1 for downvote)

## Core Logic: The "Fucked Score"

The score will be calculated based on the evidence linked to selected categories. A potential formula could be:

`Score = Σ (sum of upvotes - sum of downvotes) for each piece of approved evidence`

This keeps the calculation transparent and community-driven, though it will require active moderation to maintain quality.

## Getting Started (Development)

1.  **Clone the repository**: `git clone <repository-url>`
2.  **Environment Setup**:
    - Navigate to the project root directory.
    - Create a `.env` file from the `.env.example` template and fill in your database credentials.
3.  **Deploy Everything**:
    ```bash
    # Fresh deployment (default) - creates new database with test data
    ./scripts/deploy_local.sh
    
    # OR preserve existing data during redeployment
    ./scripts/deploy_local.sh --preserve-data
    ```
    - Fresh mode will:
      - Tear down containers and volumes completely
      - Build and start all services (MySQL, API, Frontend, Nginx)
      - Initialize database with schema and test data via init scripts
    - Preserve mode will:
      - Stop containers but keep database volume
      - Skip init scripts to preserve existing data
      - Rebuild and restart services with existing data
4.  **Check Application Health**:
    ```bash
    ./scripts/health_check.sh
    ```
5.  **Access the Application**:
    - Frontend: http://localhost:5151
    - API Health Check: http://localhost:5151/healthz
    - Test Users Available (fresh deployments only)

## Docker Compose Strategy

This project uses a multi-file Docker Compose setup to manage different environments effectively.

-   **`docker-compose.yml`**: This is the base configuration file. It defines all the services (`api`, `frontend`, `db`, etc.) and their common settings that apply to all environments.

-   **`docker-compose.local.yml`**: This file contains overrides specifically for local development. It extends the base configuration to add things like volume mounts for hot-reloading code and exposing ports to the host machine. It is used by the `./scripts/deploy_local.sh` script.

-   **`docker-compose.prod.yml`**: This file contains overrides for the production environment (GCP). It will be configured for production-ready deployments, potentially using different image tags or environment variables. It will be used by the `./scripts/deploy_gcp.sh` script.

This approach keeps the base configuration clean while allowing for environment-specific adjustments without duplicating code. The deployment scripts automatically select the correct override file.

## Data Persistence Options

The deployment script supports two modes for handling database data:

### Fresh Deployment (Default)
```bash
./scripts/deploy_local.sh
```
- **Complete teardown**: Removes all containers, volumes, and cached images
- **Fresh database**: Creates new database with schema and test data
- **Init scripts run**: Both `01-init-db.sql` and `02-test-data.sql` execute
- **Use case**: Clean development start, testing, or when you want to reset everything

### Data Preservation Mode
```bash
./scripts/deploy_local.sh --preserve-data
```
- **Selective teardown**: Stops containers but preserves database volume
- **Existing data kept**: Database retains all existing data and users
- **No init scripts**: Skips initialization to avoid data conflicts
- **Use case**: Development continuation, preserving custom data, or iterative testing

### Technical Implementation
- Uses Docker Compose override files (`docker-compose.fresh.yml` and `docker-compose.preserve.yml`)
- Fresh mode mounts init scripts to `/docker-entrypoint-initdb.d`
- Preserve mode excludes init script mounting entirely
- Health check adapts to detect either test users (fresh) or any users (preserved)

## Database Initialization System

The project uses MySQL's automatic initialization system with two SQL files in `mysql/init/`:

- **`01-init-db.sql`**: Creates the database schema (tables, indexes, constraints)
  - 5 core tables: `user`, `category`, `evidence`, `evidencecategorylink`, `vote`
  - Proper foreign key relationships and indexes for performance
  - Admin support with `is_admin` column in user table

- **`02-test-data.sql`**: Populates the database with test data
  - 4 test users including admin (`m@test.com`) and regular users
  - 12 categories covering various evidence types
  - Sample evidence entries with category links and votes
  - Weak passwords for development (must be changed for production)

These files run automatically in alphabetical order when the MySQL container starts fresh. The "Easy Up/Down" deployment philosophy ensures you get a clean, predictable database state every time you deploy.

**Note**: The legacy `create_tables.sql` file is now redundant but kept for reference.

## Health Check Script

A comprehensive `scripts/health_check.sh` utility is provided to verify the health of your local or GCP-based deployment. This script runs a series of checks on your containers and services, including:

- Verifying that required tools (like `docker-compose` or `gcloud`) are installed
- Ensuring all containers (nginx, frontend, api, db) are running and healthy
- Checking that all 5 database tables were created successfully
- Verifying that test data was inserted (admin user exists)
- Testing that backend and frontend endpoints are reachable
- Displaying recent container logs for debugging
- Reporting results in a clear, color-coded table with ✔/✘ indicators

The health check is automatically run at the end of `deploy_local.sh`, but you can also run it manually:
- Local environment: `./scripts/health_check.sh -e local`
- GCP environment: `./scripts/health_check.sh` (omit `-e` flag)

All checks should show green checkmarks (✔) for a successful deployment.

## Database Backup System

A comprehensive database backup system is included to ensure data safety and enable easy restoration. The system supports both manual and automated backups with configurable retention policies.

### Features

- **Manual and automated backups** via cron scheduling
- **Compression support** to save storage space
- **Configurable retention** with automatic cleanup of old backups
- **Easy restoration** from any backup file
- **Backup verification** and listing capabilities
- **Environment-based configuration** via `.env` file

### Quick Start

```bash
# Create a manual backup
./scripts/backup_db.sh

# List existing backups
./scripts/backup_db.sh list

# Restore from a backup
./scripts/backup_db.sh restore backups/db/backup_20250804_100530.sql.gz

# Setup automated daily backups at 2 AM
./scripts/setup_backup_cron.sh

# Setup custom backup schedule (every 6 hours)
./scripts/setup_backup_cron.sh -s "0 */6 * * *"
```

### Backup Script (`scripts/backup_db.sh`)

The main backup script provides comprehensive database backup functionality:

**Commands:**
- `backup` (default) - Create a new database backup
- `list` - List all existing backups with sizes and dates
- `restore <file>` - Restore database from a backup file
- `cleanup` - Remove old backups based on retention policy

**Features:**
- Automatic compression (configurable via `DB_BACKUP_COMPRESS`)
- Retention management (configurable via `DB_BACKUP_RETENTION_DAYS`)
- Support for both `.sql` and `.sql.gz` files
- Comprehensive error handling and logging
- Container health checks before operations

**Example Usage:**
```bash
# Create backup with custom retention
DB_BACKUP_RETENTION_DAYS=14 ./scripts/backup_db.sh

# Create uncompressed backup
DB_BACKUP_COMPRESS=false ./scripts/backup_db.sh

# Restore with confirmation prompt
./scripts/backup_db.sh restore backups/db/backup_20250804_100530.sql.gz
```

### Automated Backup Setup (`scripts/setup_backup_cron.sh`)

Setup automated backups using cron scheduling:

**Commands:**
- `setup` (default) - Setup automated backup cron job
- `remove` - Remove existing backup cron job
- `list` - List current backup-related cron jobs

**Common Schedules:**
```bash
# Daily at 2 AM (default)
./scripts/setup_backup_cron.sh

# Every 6 hours
./scripts/setup_backup_cron.sh -s "0 */6 * * *"

# Weekly on Sunday at 2 AM
./scripts/setup_backup_cron.sh -s "0 2 * * 0"

# Twice daily (2 AM and 2 PM)
./scripts/setup_backup_cron.sh -s "0 2,14 * * *"
```

### Configuration

Backup behavior is controlled via environment variables in `.env`:

```bash
# Database Backup Configuration
DB_BACKUP_RETENTION_DAYS=7    # Days to keep backups (default: 7)
DB_BACKUP_COMPRESS=true       # Compress backups with gzip (default: true)
```

### Backup Storage

- **Location**: `./backups/db/`
- **Naming**: `backup_YYYYMMDD_HHMMSS.sql[.gz]`
- **Structure**: Organized by date for easy management
- **Permissions**: Readable by owner only for security

### Monitoring

Automated backups log to `./logs/backup.log`:

```bash
# Monitor backup logs in real-time
tail -f logs/backup.log

# Check recent backup status
tail -20 logs/backup.log
```

### Disaster Recovery

For complete disaster recovery:

1. **Backup the entire project** (including `.env` and custom configurations)
2. **Store backups off-site** (cloud storage, external drives)
3. **Test restoration regularly** to ensure backups are valid
4. **Document recovery procedures** for your team

**Example Recovery Process:**
```bash
# 1. Deploy fresh infrastructure
./scripts/deploy_local.sh

# 2. Restore database from backup
./scripts/backup_db.sh restore path/to/backup.sql.gz

# 3. Verify system health
./scripts/health_check.sh -e local
```

### Best Practices

- **Regular Testing**: Periodically test backup restoration
- **Multiple Retention Policies**: Keep daily, weekly, and monthly backups
- **Off-site Storage**: Store critical backups in cloud storage
- **Monitoring**: Set up alerts for backup failures
- **Documentation**: Keep recovery procedures updated

## Frontend Error Logging System

The application includes a comprehensive error logging system that captures and stores all frontend errors for debugging and monitoring purposes.

### Architecture

**ErrorHandler Class** (`src/db/ErrorHandler.js`):
- Centralized error processing and categorization
- User-friendly error message generation
- Console logging with appropriate log levels and emojis
- File logging via backend API with structured format
- Retry logic and delay calculation for failed requests
- Session management for authentication errors

**API Connector Classes**:
- **AdminConnector** (`src/db/adminConnector.js`): Admin panel API communications
- **MainConnector** (`src/db/mainConnector.js`): General frontend API communications
- Both classes integrate ErrorHandler for consistent error processing
- Automatic retry logic with exponential backoff
- Request/response interceptors for authentication and error handling

**Backend Logging API** (`api/app/routes/logs.py`):
- `POST /api/logs/error`: Accepts error logs from frontend
- `POST /api/logs/info`: Accepts info logs from frontend
- `GET /api/logs/health`: Health check for logging system
- Thread-safe file writing to `/logs/error_log.txt`
- Docker volume mount for persistent log storage

### Log Format

All errors are logged with a standardized format:
```
[yyyy-mm-dd hh:mm:ss:millisec] [source] error_message
```

**Example:**
```
[2025-07-22 08:33:47:123] [admin_connector] Category: network | Message: Failed to fetch users | Status: 500 | Retryable: true
[2025-07-22 08:34:12:456] [main_connector] Category: authentication | Message: Session expired | Status: 401 | Retryable: false
```

### Error Categories

- **Network**: Connection timeouts, DNS failures, network unavailable
- **Authentication**: Invalid credentials, expired sessions, unauthorized access
- **Authorization**: Insufficient permissions, forbidden resources
- **Validation**: Invalid input data, missing required fields
- **Server**: Internal server errors, service unavailable
- **Client**: Bad requests, malformed data
- **Unknown**: Unclassified errors

### Features

✅ **Automatic Error Capture**: All API errors are automatically logged
✅ **User-Friendly Messages**: Technical errors converted to readable messages
✅ **Persistent Storage**: Logs stored in `/logs/error_log.txt` with Docker volume mount
✅ **Source Identification**: Each log entry tagged with source (admin_connector, main_connector)
✅ **Retry Logic**: Automatic retry for transient errors with exponential backoff
✅ **Session Management**: Automatic session cleanup on authentication failures
✅ **Non-Blocking**: Async logging doesn't impact user experience
✅ **Production Ready**: Configurable timeouts and error handling

### Usage

The error logging system works automatically - no manual intervention required. All API calls through AdminConnector and MainConnector are automatically logged on errors. Developers can view logs in:

- **Console**: Real-time error logging with emojis and log levels
- **File**: Persistent logs in `./logs/error_log.txt`
- **Backend API**: Health check at `/api/logs/health`

For debugging, check the error log file:
```bash
cat logs/error_log.txt
```

## Security Middleware System

The application includes a comprehensive security middleware system that provides enterprise-grade protection for both frontend and backend components. The security system is designed to prevent common web vulnerabilities and provide robust authentication, authorization, and monitoring capabilities.

### Architecture Overview

The security system is divided into two main components:
- **Backend Security Middleware** (`api/app/security/`): Server-side protection
- **Frontend Security Middleware** (`frontend/src/security/`): Client-side protection

### Backend Security Components

#### Rate Limiting (`api/app/security/rate_limiter.py`)
Provides configurable rate limiting using a sliding window algorithm to prevent abuse and ensure API stability.

**Features:**
- Thread-safe sliding window rate limiting
- Client identification (user_id > api_key > ip_address)
- Configurable limits per minute/hour with user multipliers
- Memory cleanup to prevent leaks
- Status monitoring for debugging

**Usage:**
```python
from app.security import rate_limit, strict_rate_limit, moderate_rate_limit

@app.route('/api/data')
@moderate_rate_limit  # 30 req/min, 500/hour
def get_data():
    return jsonify({'data': 'protected'})

@app.route('/api/sensitive')
@strict_rate_limit  # 10 req/min, 100/hour
def sensitive_endpoint():
    return jsonify({'sensitive': 'information'})

# Custom rate limiting
@app.route('/api/custom')
@rate_limit(requests_per_minute=5, requests_per_hour=50)
def custom_endpoint():
    return jsonify({'message': 'custom rate limited'})
```

**Predefined Rate Limit Decorators:**
- `@strict_rate_limit`: 10 req/min, 100/hour (sensitive endpoints)
- `@moderate_rate_limit`: 30 req/min, 500/hour (standard API)
- `@lenient_rate_limit`: 100 req/min, 2000/hour (public endpoints)
- `@admin_rate_limit`: 200 req/min, 5000/hour (admin endpoints)

#### Authentication Middleware (`api/app/security/auth_middleware.py`)
Provides JWT-based authentication and role-based access control.

**Features:**
- JWT token generation/verification with configurable expiration
- Role-based access control (RBAC)
- Permission-based authorization
- API key validation for service-to-service communication
- Refresh token support
- Multiple authentication decorators

**Usage:**
```python
from app.security import token_required, admin_required, permission_required

@app.route('/api/protected')
@token_required
def protected_endpoint():
    user = g.current_user
    return jsonify({'user_id': user.get('user_id')})

@app.route('/api/admin/users')
@token_required
@admin_required
def admin_users():
    return jsonify({'users': []})

@app.route('/api/content')
@token_required
@permission_required('write_content')
def create_content():
    return jsonify({'message': 'content created'})
```

**Authentication Decorators:**
- `@token_required`: Requires valid JWT token
- `@admin_required`: Requires admin privileges (use with @token_required)
- `@optional_auth`: Optional authentication (sets g.current_user if token provided)
- `@role_required('role1', 'role2')`: Requires specific roles
- `@permission_required('permission')`: Requires specific permission
- `@validate_api_key`: Validates API key for service-to-service calls

#### Security Headers (`api/app/security/security_headers.py`)
Adds essential security headers to protect against common web vulnerabilities.

**Features:**
- Comprehensive security headers (CSP, HSTS, X-Frame-Options, etc.)
- CORS configuration with origin validation
- CSP nonce generation for inline scripts/styles
- Input sanitization utilities
- Password hashing with PBKDF2 and salt
- Safe URL validation

**Security Headers Added:**
- `Content-Security-Policy`: Prevents XSS attacks
- `X-Frame-Options`: Prevents clickjacking
- `X-Content-Type-Options`: Prevents MIME sniffing
- `X-XSS-Protection`: Browser XSS protection
- `Strict-Transport-Security`: Enforces HTTPS (when enabled)
- `Referrer-Policy`: Controls referrer information
- `Cross-Origin-*`: CORS and cross-origin policies

**Utility Functions:**
```python
from app.security import hash_password, verify_password, sanitize_filename

# Password hashing
hashed, salt = hash_password('user_password')
is_valid = verify_password('user_password', hashed, salt)

# File upload security
safe_name = sanitize_filename('../../malicious.exe')  # Returns 'malicious.exe'

# Input validation
if validate_input_length(user_input, max_length=1000):
    safe_input = escape_html(user_input)
```

### Frontend Security Components

#### Authentication Guard (`frontend/src/security/AuthGuard.js`)
Provides React components and hooks for authentication and route protection.

**Features:**
- React hooks for auth state management
- Route protection components
- Session timeout monitoring with activity tracking
- Authentication context provider
- Higher-order components for auth wrapping

**Usage:**
```jsx
import { AuthProvider, ProtectedRoute, AdminRoute, useAuth } from './security';

// App setup
function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/profile" element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                } />
                <Route path="/admin" element={
                    <AdminRoute>
                        <AdminPanel />
                    </AdminRoute>
                } />
            </Routes>
        </AuthProvider>
    );
}

// Using auth hook
function Dashboard() {
    const { user, logout, hasPermission } = useAuth();
    
    return (
        <div>
            <h1>Welcome, {user?.username}</h1>
            {hasPermission('admin') && <AdminButton />}
            <button onClick={logout}>Logout</button>
        </div>
    );
}
```

**Components and Hooks:**
- `<AuthProvider>`: Provides auth context to app
- `<ProtectedRoute>`: Protects routes requiring authentication
- `<AdminRoute>`: Protects routes requiring admin privileges
- `useAuth()`: Hook for accessing auth state and methods
- `useAuthGuard()`: Lower-level auth hook
- `useSessionTimeout()`: Hook for session timeout management

#### Input Sanitizer (`frontend/src/security/InputSanitizer.js`)
Provides comprehensive input validation, sanitization, and XSS protection.

**Features:**
- HTML escaping/unescaping for XSS prevention
- HTML sanitization with allowed tags/attributes
- Form validation with comprehensive schemas
- Password strength validation
- Email/URL validation
- Client-side rate limiting
- React validation hooks

**Usage:**
```jsx
import { sanitizeInput, validateFormData, useInputValidation, VALIDATION_SCHEMAS } from './security';

// Form validation
function ContactForm() {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [errors, setErrors] = useState({});
    
    const handleSubmit = (e) => {
        e.preventDefault();
        
        const validation = validateFormData(formData, VALIDATION_SCHEMAS.CONTACT);
        
        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }
        
        // Use sanitized data
        console.log(validation.sanitizedData);
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <input 
                value={formData.name}
                onChange={(e) => setFormData(prev => ({
                    ...prev, 
                    name: sanitizeInput(e.target.value, { maxLength: 100 })
                }))}
            />
            {errors.name && <div>{errors.name.join(', ')}</div>}
        </form>
    );
}

// Input validation hook
function EmailInput() {
    const email = useInputValidation('', {
        required: true,
        type: 'email',
        maxLength: 254
    });
    
    return (
        <div>
            <input 
                value={email.value}
                onChange={(e) => email.handleChange(e.target.value)}
            />
            {!email.isValid && <div>{email.errors.join(', ')}</div>}
        </div>
    );
}
```

**Validation Schemas:**
- `VALIDATION_SCHEMAS.LOGIN`: Email and password validation
- `VALIDATION_SCHEMAS.REGISTER`: User registration with password strength
- `VALIDATION_SCHEMAS.CONTACT`: Contact form validation
- `VALIDATION_SCHEMAS.PROFILE`: User profile validation

#### Security Utils (`frontend/src/security/SecurityUtils.js`)
Provides advanced security utilities including secure storage, monitoring, and encryption helpers.

**Features:**
- Secure storage with encryption and expiration
- Security monitoring for suspicious activities
- CSP helper with nonce generation
- Secure random generators
- Security headers checker
- Client fingerprinting for security tracking

**Usage:**
```jsx
import { secureStorage, securityMonitor, SecureRandom } from './security';

// Secure storage
secureStorage.setItem('user_preferences', { theme: 'dark' }, 60); // 60 minutes
const preferences = secureStorage.getItem('user_preferences');

// Security monitoring
securityMonitor.logEvent('USER_ACTION', { action: 'profile_update' });
const report = securityMonitor.getSecurityReport();

// Secure random generation
const token = SecureRandom.string(32);
const uuid = SecureRandom.uuid();
const randomNumber = SecureRandom.number(1000, 9999);
```

### Security Configuration

The security system uses centralized configuration for consistent behavior:

```javascript
// Frontend configuration
export const SECURITY_CONFIG = {
    SESSION_TIMEOUT: 30, // minutes
    RATE_LIMIT: {
        MAX_REQUESTS_PER_MINUTE: 60,
        MAX_LOGIN_ATTEMPTS: 5,
        LOCKOUT_DURATION: 15 // minutes
    },
    PASSWORD_REQUIREMENTS: {
        MIN_LENGTH: 8,
        REQUIRE_UPPERCASE: true,
        REQUIRE_LOWERCASE: true,
        REQUIRE_NUMBERS: true,
        REQUIRE_SPECIAL_CHARS: true
    }
};
```

```python
# Backend configuration
app.config.update({
    'JWT_SECRET_KEY': 'your-secret-key',
    'JWT_EXPIRATION_HOURS': 24,
    'SECURITY_HEADERS': {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block'
    },
    'CORS_ORIGINS': ['http://localhost:3151', 'http://localhost:5151']
})
```

### Security Features Summary

**🔐 Authentication & Authorization:**
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Permission-based authorization
- Session management with timeout
- Multi-level auth (user, admin, API key)

**🚫 Attack Prevention:**
- Rate limiting with sliding window algorithm
- XSS protection with input sanitization
- CSRF protection with security headers
- SQL injection prevention (input validation)
- Path traversal protection
- Clickjacking protection (X-Frame-Options)

**📊 Security Monitoring:**
- Suspicious activity detection
- Console access monitoring
- Dev tools detection
- Rapid clicking detection
- Security event logging
- CSP violation reporting

**🔒 Data Protection:**
- Secure encrypted storage with expiration
- Password hashing with PBKDF2 and salt
- Input length validation
- HTML sanitization with allowed tags
- Safe URL validation for redirects
- Filename sanitization for uploads

### Usage Examples

Complete usage examples are available in:
- **Backend**: `api/app/security/examples.py`
- **Frontend**: `frontend/src/security/examples.jsx`

These files contain comprehensive examples showing how to integrate all security features into your application.

### Security Best Practices

1. **Always validate and sanitize user input** on both client and server
2. **Use HTTPS in production** to protect data in transit
3. **Implement proper session management** with timeouts and secure storage
4. **Monitor security events** and respond to suspicious activities
5. **Keep security headers up to date** and test them regularly
6. **Use strong passwords** and implement proper password policies
7. **Regularly update dependencies** to patch security vulnerabilities
8. **Implement proper error handling** without exposing sensitive information
9. **Use rate limiting** to prevent abuse and DoS attacks
10. **Regularly audit and test** your security implementation
