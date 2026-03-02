# Starting Point 2025

> A clean, forkable full-stack boilerplate for building web and mobile apps. Fork it, rename it, build on it.

**Last updated:** March 2026

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend API** | Python 3.11, Flask 2.3, SQLAlchemy, Flask-Migrate |
| **Web Frontend** | React 18, Vite, Zustand, React Router |
| **Mobile App** | Expo (React Native), expo-router, Zustand |
| **Database** | MySQL 8.0 |
| **Auth** | JWT (PyJWT), bcrypt password hashing |
| **Infrastructure** | Docker Compose, Nginx, phpMyAdmin |
| **Testing** | pytest (backend), Vitest (frontend) |
| **CI/CD** | GitHub Actions |

---

## Quick Start

```bash
# 1. Clone and enter
git clone <your-repo-url>
cd starting_point_2025

# 2. Copy environment config
cp .env.example .env
# Edit .env with your values (passwords, secret key, etc.)

# 3. Start everything
docker compose up --build

# 4. Access
# API:          http://localhost:5151
# Frontend:     http://localhost:3151
# phpMyAdmin:   http://localhost:8080
# Admin panel:  http://localhost:3151/overview
```

The admin user is automatically seeded from your `.env` values on first boot.

---

## Project Structure

```
starting_point_2025/
├── api/                          # Flask backend
│   ├── main.py                   # Entry point
│   ├── requirements.txt
│   ├── Dockerfile
│   └── app/
│       ├── __init__.py           # App factory
│       ├── config/
│       │   ├── settings.py       # Config from env vars
│       │   └── group_types.py    # ← Edit this per project
│       ├── models/
│       │   ├── user.py
│       │   ├── group.py
│       │   ├── group_member.py
│       │   └── item.py
│       ├── routes/
│       │   ├── auth.py           # /api/auth/*
│       │   ├── groups.py         # /api/groups/*
│       │   ├── items.py          # /api/items/*
│       │   ├── admin.py          # /api/admin/*
│       │   └── config.py         # /api/config/*
│       ├── services/
│       │   ├── auth_service.py
│       │   ├── group_service.py
│       │   └── item_service.py
│       ├── security/
│       │   ├── auth_middleware.py
│       │   ├── rate_limiter.py
│       │   └── security_headers.py
│       └── tests/
│           ├── conftest.py
│           ├── test_auth.py
│           ├── test_groups.py
│           ├── test_items.py
│           └── test_health.py
│
├── frontend/                     # React web app
│   ├── App.jsx                   # Routes
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── api/                  # API client layer
│       │   ├── client.js         # Axios + JWT interceptor
│       │   ├── auth.js
│       │   ├── groups.js
│       │   ├── items.js
│       │   └── admin.js
│       ├── store/                # Zustand state
│       │   ├── authStore.js
│       │   ├── groupStore.js
│       │   ├── itemStore.js
│       │   └── adminStore.js
│       ├── services/
│       │   ├── auth.js           # Token/session management
│       │   └── validation.js     # Form validation
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── Dashboard.jsx
│       │   ├── Groups.jsx
│       │   ├── GroupDetail.jsx
│       │   └── admin/
│       │       ├── AdminLayout.jsx
│       │       ├── AdminDashboard.jsx
│       │       ├── AdminUsers.jsx
│       │       └── AdminGroups.jsx
│       └── __tests__/
│           ├── validation.test.js
│           └── stores.test.js
│
├── mobile/                       # Expo React Native app
│   ├── app.json
│   ├── package.json
│   ├── app/
│   │   ├── _layout.tsx           # Root layout + auth guard
│   │   ├── (auth)/
│   │   │   ├── login.tsx
│   │   │   └── register.tsx
│   │   └── (tabs)/
│   │       ├── _layout.tsx       # Tab bar (Home, Groups, Profile)
│   │       ├── index.tsx         # Home tab
│   │       ├── profile.tsx       # Profile tab
│   │       └── groups/
│   │           ├── index.tsx     # Groups list
│   │           ├── create.tsx    # Create group
│   │           ├── join.tsx      # Join with invite code
│   │           └── [id].tsx      # Group detail
│   └── src/                      # ← Same structure as frontend/src/
│       ├── api/
│       │   ├── client.js         # Axios + SecureStore JWT
│       │   ├── auth.js
│       │   ├── groups.js
│       │   └── items.js
│       ├── store/
│       │   ├── authStore.js
│       │   ├── groupStore.js
│       │   └── itemStore.js
│       └── services/
│           ├── auth.js           # SecureStore token mgmt
│           └── validation.js     # Same validation rules
│
├── mysql/
│   ├── Dockerfile
│   └── init/
│       ├── 01-init-db.sql        # Schema
│       └── 02-test-data.sql      # Seed data
│
├── nginx/
│   ├── default.conf
│   ├── nginx.conf
│   └── nginx.prod.conf
│
├── scripts/
│   ├── deploy_local.sh
│   ├── deploy_gcp.sh
│   ├── backup.sh
│   ├── backup_db.sh
│   ├── restore.sh
│   ├── health_check.sh
│   └── setup_backup_cron.sh
│
├── .github/workflows/ci.yml     # GitHub Actions CI
├── docker-compose.yml
├── .env.example
└── .gitignore
```

---

## API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Log in, get JWT |
| GET | `/api/auth/verify` | Verify token |
| GET | `/api/auth/profile` | Get current user |

### Groups
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/groups` | List user's groups |
| POST | `/api/groups` | Create group |
| GET | `/api/groups/:id` | Group detail + members |
| PUT | `/api/groups/:id` | Update group |
| DELETE | `/api/groups/:id` | Delete group (owner only) |
| POST | `/api/groups/join` | Join via invite code |
| POST | `/api/groups/:id/invite` | Regenerate invite code |

### Items
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/items` | List items (paginated) |
| POST | `/api/items` | Create item |
| PUT | `/api/items/:id` | Update item |
| DELETE | `/api/items/:id` | Delete item |

### Config
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/config/group-types` | Get available group types |

### Admin
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/admin/login` | Admin login |
| GET | `/api/admin/stats` | Dashboard stats |
| GET | `/api/admin/users` | List users (search, paginate) |
| PUT | `/api/admin/users/:id` | Update user |
| DELETE | `/api/admin/users/:id` | Delete user |
| GET | `/api/admin/groups` | List groups (search, filter) |
| DELETE | `/api/admin/groups/:id` | Delete group |

---

## Customization Guide

### 1. Group Types (edit one file)

Edit `api/app/config/group_types.py`:

```python
GROUP_TYPES = [
    {"key": "book_club", "label": "Book Club"},
    {"key": "movie_club", "label": "Movie Club"},
]
```

The mobile and web apps pull types from the `/api/config/group-types` endpoint automatically.

### 2. Add New Models

1. Create `api/app/models/your_model.py`
2. Import it in `api/app/models/__init__.py`
3. Add a service in `api/app/services/`
4. Add routes in `api/app/routes/`
5. Register the blueprint in `api/app/routes/__init__.py`
6. Add API functions in `frontend/src/api/` and `mobile/src/api/`
7. Add a Zustand store in `frontend/src/store/` and `mobile/src/store/`

### 3. Environment Variables

All config is in `.env`. See `.env.example` for the full list. Key vars:

- `APP_NAME` — Used in API responses
- `SECRET_KEY` — JWT signing key (change this!)
- `ADMIN_USERNAME/EMAIL/PASSWORD` — Auto-seeded admin account
- `VITE_API_URL` — Frontend API base URL
- `EXPO_API_URL` — Mobile app API base URL

---

## Running Tests

### Backend (pytest)
```bash
cd api
pip install -r requirements.txt
DATABASE_URL=sqlite:///:memory: SECRET_KEY=test pytest app/tests/ -v
```

### Frontend (Vitest)
```bash
cd frontend
npm install
npm test
```

---

## Docker Services

| Service | Port | Description |
|---------|------|-------------|
| `api` | 5151 | Flask API |
| `frontend` | 3151 | React + Vite |
| `db` | 3316 | MySQL 8.0 |
| `phpmyadmin` | 8080 | Database browser |
| `nginx` | 80 | Reverse proxy (production) |

All ports are configurable via `.env`.

---

## Scripts

| Script | Description |
|--------|-------------|
| `scripts/deploy_local.sh` | Build and start locally |
| `scripts/deploy_gcp.sh` | Deploy to GCP |
| `scripts/backup.sh` | Full project backup |
| `scripts/backup_db.sh` | Database backup only |
| `scripts/restore.sh` | Restore from backup |
| `scripts/health_check.sh` | Check service health |
| `scripts/setup_backup_cron.sh` | Set up automated backups |

---

## Mobile App (Expo)

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with Expo Go, or press `i` for iOS simulator / `a` for Android emulator.

Set `EXPO_PUBLIC_API_URL` in your environment for the mobile app to connect to your API. For physical devices on the same network, use your machine's local IP instead of `localhost`.

---

## Admin Panel

Access at `http://localhost:3151/overview`. Features:

- **Dashboard** — User count, group count, item count, recent signups
- **Users** — Search, toggle admin status, delete users
- **Groups** — Search, filter by type, delete groups

Admin credentials are set in `.env` and auto-seeded on first boot.
