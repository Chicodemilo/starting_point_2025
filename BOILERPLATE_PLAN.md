# BOILERPLATE REFACTORING PLAN

## Converting "Right to Remain Fucked" into a Clean, Reusable Full-Stack Boilerplate

**Stack:** React (Vite) + Zustand + Tailwind | Expo React Native | Flask + SQLAlchemy | MySQL 8.0 | Docker Compose | Nginx | JWT Auth + Security Middleware

---

## Phase 1: Strip Project-Specific Content

**Goal:** Remove all "Right to Remain Fucked" branding, political content, and domain-specific references.

### 1.1 Global String Replacements

| Current String | Replacement | Files Affected |
|---|---|---|
| `Right to Remain Fucked` | `My App` | `README.md`, `roadmap.txt` |
| `Right to Remain` | `My App` | `api/app/__init__.py`, `api/main.py`, `api/test_security.py`, `frontend/src/components/Home.jsx`, `frontend/src/components/admin/AdminHeader.jsx`, `frontend/src/components/admin/AdminLogin.jsx`, `scripts/health_check.sh`, `scripts/backup.sh`, `scripts/restore.sh`, `mysql/init/01-init-db.sql`, `mysql/init/02-test-data.sql`, `test-localStorage.html` |
| `right-to-remain-frontend` | `app-frontend` | `frontend/package.json` |
| `righttoremainfucked` | `myapp` | `scripts/deploy_local.sh`, `scripts/backup.sh`, `scripts/restore.sh` |
| `anchor_db_42` | `app_db` | `.env.example`, `mysql/init/01-init-db.sql`, `mysql/init/02-test-data.sql` |
| `excelsiorBarbarino` | `app_user` | `.env.example` |
| `FuckedMeter` / `fucked` | Remove entirely | Various frontend components, `README.md` |

### 1.2 Files to DELETE

- `roadmap.txt` — Political project roadmap
- `README.md` — Will be rewritten in Phase 6
- `test-localStorage.html` — Manual test page with project branding
- `test-error-logging.html` — Manual test page
- `ai_instructions.md` — Windsurf-specific AI instructions
- `backups/*.tar.gz`, `backups/db/*.sql.gz` — Project-specific backups
- `logs/change_log.txt`, `logs/error_log.txt`, `logs/known_issues.txt` — Project history

### 1.3 Directories to Clean

- `backups/` — Delete all contents, keep directory with `.gitkeep`
- `logs/` — Delete all contents, keep directory with `.gitkeep`
- `frontend/src/components/content/content_elements/fucked_elements/` — Delete entirely

---

## Phase 2: Genericize Models and Database

**Goal:** Replace domain models with a reusable set: User, Group, GroupMember, and Item. Remove Evidence, Category, Vote, EvidenceCategoryLink.

### 2.1 Models to KEEP

- `api/app/models/user.py` — Already clean and generic (id, username, email, password_hash, is_admin, timestamps)

### 2.2 Models to DELETE

- `api/app/models/category.py`
- `api/app/models/evidence.py`
- `api/app/models/evidence_category_link.py`
- `api/app/models/vote.py`

### 2.3 New Model: Group

Create `api/app/models/group.py`:
- `id` (PK)
- `name` (string, required)
- `description` (text, optional)
- `type` (string, required) — validated against a config-driven list of allowed types (see 2.8)
- `is_private` (boolean, default TRUE) — private by default, user chooses visibility on creation
- `owner_id` (FK → user.id) — the group creator/owner
- `invite_code` (string, unique) — for invite-based joining
- `created_at`, `updated_at`
- Relationships: `owner` (User), `members` (GroupMember)

### 2.4 New Model: GroupMember

Create `api/app/models/group_member.py`:
- `id` (PK)
- `group_id` (FK → group.id)
- `user_id` (FK → user.id)
- `role` (enum: 'owner', 'admin', 'member') — default 'member'
- `joined_at` (timestamp)
- UNIQUE constraint on (group_id, user_id)

### 2.5 New Model: Item

Create `api/app/models/item.py` — Simple CRUD entity with title, description, user_id (FK), group_id (FK, optional), timestamps. Items can belong to a group or be standalone.

### 2.6 Update `api/app/models/__init__.py`

Export `User`, `Group`, `GroupMember`, and `Item`.

### 2.8 New Config: Group Types

Create `api/app/config/group_types.py` — Single source of truth for allowed group types. Each forked project just edits this one file.

```python
GROUP_TYPES = [
    {"key": "club", "label": "Club"},
    {"key": "team", "label": "Team"},
    {"key": "league", "label": "League"},
    {"key": "group", "label": "Group"},
]
```

- API validates `type` field on group creation against this list
- Add `GET /api/config/group-types` endpoint so frontend + mobile pull options dynamically
- No need to update 3 places when forking — just edit this one config file

### 2.9 Rewrite SQL Init Scripts

**`mysql/init/01-init-db.sql`** — Tables: `user`, `group`, `group_member`, `item`. Use `app_db`.

**`mysql/init/02-test-data.sql`** — Generic test users (admin + testuser), a sample group, group memberships, and sample items.

---

## Phase 3: Clean Frontend

**Goal:** Keep auth flow, admin panel, security layer, modal system. Replace domain-specific pages with clean shells.

### 3.1 Components to DELETE

- `frontend/src/components/content/content_elements/FuckedMeter.jsx` + `.css`
- `frontend/src/components/content/content_elements/Categories.jsx` + `.css`
- `frontend/src/components/content/content_elements/Evidence.jsx` + `.css`
- `frontend/src/components/content/content_elements/Header.jsx` + `.css`
- `frontend/src/components/content/content_elements/fucked_elements/` — entire directory
- `frontend/src/components/content/content_elements/category_elements/` — entire directory
- `frontend/src/components/content/content_elements/evidence_elements/` — entire directory
- `frontend/src/components/content/content_elements/header_elements/` — entire directory
- `frontend/src/components/modal/Submit_Category.jsx` + `.css`
- `frontend/src/components/modal/Submit_Evidence.jsx` + `.css`
- `frontend/src/components/modal/FAQ.jsx`

### 3.2 Components to KEEP (no changes)

All security components, API connectors, error handler, localStorage utils.

### 3.3 Admin Panel (React SPA at `/overview`)

The admin panel is a full React SPA accessible at `/overview`. Clean it up and build out these base views:

**Admin Login:**
- `AdminLogin.jsx` — Remove "Right to Remain" branding
- Admin credentials auto-seeded from `.env` (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) via `02-test-data.sql`
- Login calls `POST /api/admin/login`, stores JWT

**Admin Home / Dashboard:**
- `AdminHome.jsx` — Stats overview cards + quick links
  - Total users count
  - Total groups count
  - Total items count
  - Recent signups (last 7 days)
  - Quick links to Users page, Groups page
  - System health status

**Admin Users Page:**
- `UsersList.jsx` — Already exists, clean up
  - List all users with search/filter
  - View user details (groups they belong to, items they own)
  - Toggle admin status
  - Delete user

**Admin Groups Page (NEW):**
- `GroupsList.jsx` — New component
  - List all groups with search/filter by type
  - View group details (members, owner, type, public/private)
  - Delete group
  - View group membership

**Admin Navigation:**
- `AdminNavigation.jsx` — Sidebar/top nav with links: Dashboard, Users, Groups
- `AdminHeader.jsx` — Change branding to "Admin Panel"
- `AdminMain.jsx` — Route handler for admin sub-pages

### 3.4 Frontend Directory Structure

Reorganize `frontend/src/` into a clean, consistent scaffold:

```
frontend/src/
├── api/                    # API connector layer (hitting our Flask API)
│   ├── client.js           # Axios instance, base URL, JWT interceptor
│   ├── auth.js             # login, register, getProfile
│   ├── groups.js           # CRUD groups, join, invite
│   ├── items.js            # CRUD items
│   └── admin.js            # Admin API calls (stats, users, groups)
├── components/             # Reusable UI components
│   ├── common/             # Buttons, inputs, modals, cards, loaders
│   ├── auth/               # LoginForm, RegisterForm
│   ├── groups/             # GroupCard, GroupList, MemberList, InviteLink
│   └── items/              # ItemCard, ItemList, ItemForm
├── pages/                  # Top-level route pages
│   ├── Home.jsx            # Landing page
│   ├── Login.jsx           # Login page
│   ├── Register.jsx        # Sign-up page
│   ├── Dashboard.jsx       # Authenticated user dashboard
│   ├── Groups.jsx          # User's groups list
│   ├── GroupDetail.jsx     # Single group view
│   └── admin/              # Admin panel pages
│       ├── AdminLogin.jsx
│       ├── AdminDashboard.jsx
│       ├── AdminUsers.jsx
│       └── AdminGroups.jsx
├── store/                  # Zustand state management
│   ├── authStore.js        # Auth state (user, token, login/logout)
│   ├── groupStore.js       # Groups state
│   ├── itemStore.js        # Items state
│   └── adminStore.js       # Admin state (stats, user list, group list)
├── services/               # Business logic, helpers
│   ├── auth.js             # Token storage, session management
│   └── validation.js       # Form validation rules
├── security/               # KEEP existing security layer as-is
│   ├── AuthGuard.jsx
│   ├── InputSanitizer.js
│   ├── SecurityUtils.js
│   └── examples.jsx
├── utils/                  # KEEP existing utils
│   └── localStorage.js
└── main.jsx                # Entry point
```

Move existing reusable code into the new structure. Delete old `db/`, `content/`, `modal/` directories after migration.

### 3.5 Admin Panel Structure (inside frontend)

The admin panel lives at `frontend/src/pages/admin/` and is accessed at `/overview`. It's a self-contained section within the web frontend with its own components, store, and API layer.

```
frontend/src/
├── pages/
│   └── admin/
│       ├── AdminLogin.jsx          # Login page (email + password)
│       ├── AdminLayout.jsx         # Shared layout: sidebar nav + header + content area
│       ├── AdminDashboard.jsx      # Home — stats cards, recent activity, quick links
│       ├── AdminUsers.jsx          # Users list — search, filter, toggle admin, delete
│       ├── AdminUserDetail.jsx     # Single user — groups they belong to, items, activity
│       ├── AdminGroups.jsx         # Groups list — search, filter by type, public/private
│       └── AdminGroupDetail.jsx    # Single group — members, owner, type, items
├── components/
│   └── admin/
│       ├── StatCard.jsx            # Reusable stat card (count + label + icon)
│       ├── DataTable.jsx           # Reusable table with search/sort/pagination
│       ├── AdminSidebar.jsx        # Sidebar nav (Dashboard, Users, Groups)
│       ├── AdminHeader.jsx         # Top bar (branding, logged-in admin, logout)
│       ├── RecentActivity.jsx      # Recent signups / group creations feed
│       └── ConfirmDialog.jsx       # "Are you sure?" modal for destructive actions
├── api/
│   └── admin.js                    # Admin API calls (stats, users CRUD, groups CRUD)
└── store/
    └── adminStore.js               # Admin state (stats, userList, groupList, loading)
```

---

## Phase 4: Clean Backend

**Goal:** Keep auth, admin, security middleware, logging. Replace domain routes with generic Item CRUD API.

### 4.1 Routes to KEEP & EXPAND

- `api/app/routes/logs.py` — Already generic

- `api/app/routes/admin.py` — Expand to support the admin SPA:
  - `POST /api/admin/login` — Admin login (already exists)
  - `GET /api/admin/stats` — Dashboard stats (users, groups, items counts, recent signups)
  - `GET /api/admin/users` — List all users (with search/filter, pagination)
  - `GET /api/admin/users/<id>` — User detail (groups, items)
  - `PUT /api/admin/users/<id>` — Update user (toggle admin, etc.)
  - `DELETE /api/admin/users/<id>` — Delete user
  - `GET /api/admin/groups` — List all groups (with search/filter by type)
  - `GET /api/admin/groups/<id>` — Group detail (members, owner)
  - `DELETE /api/admin/groups/<id>` — Delete group

### 4.2 Routes to DELETE

- `api/app/routes/test_models.py` — Domain-specific model tests
- `api/app/routes/test_route.py` — Unused test endpoint

### 4.3 New Route: Groups API

Create `api/app/routes/groups.py`:
- `POST /api/groups` — Create a group (user becomes owner). Accepts `name`, `description`, `type` (validated against config), `is_private` (default true)
- `GET /api/groups` — List user's groups (+ optionally browse public groups)
- `GET /api/config/group-types` — Returns the allowed group types from config (frontend + mobile use this to populate dropdowns)
- `GET /api/groups/<id>` — Get group details + members
- `PUT /api/groups/<id>` — Update group (owner/admin only)
- `DELETE /api/groups/<id>` — Delete group (owner only)
- `POST /api/groups/<id>/invite` — Generate/regenerate invite code (owner/admin)
- `POST /api/groups/join` — Join a group via invite code
- `POST /api/groups/<id>/members` — Add a member (owner/admin)
- `PUT /api/groups/<id>/members/<user_id>` — Update member role (owner only)
- `DELETE /api/groups/<id>/members/<user_id>` — Remove member (owner/admin, or self to leave)

### 4.4 New Route: Items CRUD API

Create `api/app/routes/items.py`:
- `GET /api/items` — List all (with pagination, optional group_id filter)
- `GET /api/items/<id>` — Get single item
- `POST /api/items` — Create (requires auth, optional group_id)
- `PUT /api/items/<id>` — Update (requires auth, must be owner)
- `DELETE /api/items/<id>` — Delete (requires auth + owner or admin)

### 4.5 Update Core Files

- `api/app/__init__.py` — Update imports, register groups + items + config blueprints, fix hardcoded auth to use DB lookup, remove "Right to Remain" branding, add admin auto-seed on startup
- `api/main.py` — Remove project-specific comments/logs
- `api/test_security.py` — Remove project branding

### 4.6 Security Middleware — NO CHANGES (already generic and production-grade)

### 4.8 Reorganize API Directory Structure

Final clean structure:

```
api/
├── main.py                     # Entry point
├── requirements.txt
├── Dockerfile
└── app/
    ├── __init__.py             # App factory (create_app) — just wiring, no routes
    ├── config/
    │   ├── __init__.py
    │   ├── settings.py         # App config from env vars (DB URL, JWT secret, etc.)
    │   └── group_types.py      # Allowed group types (edit per-project)
    ├── models/
    │   ├── __init__.py
    │   ├── user.py
    │   ├── group.py
    │   ├── group_member.py
    │   └── item.py
    ├── routes/
    │   ├── __init__.py         # Registers all blueprints
    │   ├── auth.py             # POST /register, POST /login
    │   ├── admin.py            # Admin dashboard endpoints
    │   ├── groups.py           # CRUD + invite/join
    │   ├── items.py            # CRUD
    │   ├── config.py           # GET /config/group-types
    │   └── logs.py             # Error/info logging
    ├── services/               # Business logic (keeps routes thin)
    │   ├── __init__.py
    │   ├── auth_service.py     # Hash passwords, verify, create tokens
    │   ├── group_service.py    # Create, join, invite logic
    │   └── item_service.py     # CRUD logic
    ├── security/               # Existing middleware (no changes)
    │   ├── __init__.py
    │   ├── auth_middleware.py
    │   ├── rate_limiter.py
    │   └── security_headers.py
    └── tests/
        ├── conftest.py
        ├── test_auth.py
        ├── test_groups.py
        ├── test_items.py
        └── test_health.py
```

Key change: pull auth routes OUT of `__init__.py` into `routes/auth.py`. Add `config/` and `services/` directories. `__init__.py` becomes just the app factory — wiring only.

### 4.7 User Registration Route

Add `POST /api/auth/register` to `api/app/__init__.py` or a new `api/app/routes/auth.py`:
- Accept username, email, password
- Hash password, create user
- Return JWT token
- This is the foundation for both web and mobile sign-up

---

## Phase 5: Update Configuration

### 5.0 Centralize Sensitive Config in `.env`

All sensitive and environment-specific values must live in `.env` (never hardcoded):
- `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`
- `SECRET_KEY` (JWT signing)
- `API_URL` (for frontend/mobile to know where the API lives)
- `ADMIN_USERNAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (initial admin seed)
- `PHPMYADMIN_PORT` (default 8080)
- Port mappings: `BACKEND_PORT`, `FRONTEND_PORT`, `DB_PORT`

Ensure Docker Compose, Flask app, SQL init scripts, and deploy scripts all read from `.env` — no hardcoded credentials anywhere.

**Packages for reading `.env`:**
- **Flask** — Add `python-dotenv` to `requirements.txt`. Flask auto-detects and loads `.env`
- **Vite** — Built-in. Prefix vars with `VITE_` → available via `import.meta.env.VITE_API_URL`
- **Expo** — Use `expo-constants` + `app.config.js` with `dotenv` at build time

**Complete `.env.example`:**
```env
# APP CONFIG
APP_NAME=My App
APP_ENV=development

# PORT MAPPINGS (local development)
BACKEND_PORT=5151
FRONTEND_PORT=3151
DB_PORT=3316
PHPMYADMIN_PORT=8080

# MySQL DATABASE
MYSQL_ROOT_PASSWORD=change_me_root_password
MYSQL_DATABASE=app_db
MYSQL_USER=app_user
MYSQL_PASSWORD=change_me_password

# JWT / AUTH
SECRET_KEY=change_me_to_a_random_string

# ADMIN SEED (created on first boot)
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change_me_admin_password

# API URL (used by frontend + mobile)
VITE_API_URL=http://localhost:5151
EXPO_API_URL=http://localhost:5151

# DATABASE BACKUP
DB_BACKUP_RETENTION_DAYS=7
DB_BACKUP_COMPRESS=true
```

### 5.0.1 Auto-Seed Admin User

The `mysql/init/02-test-data.sql` script should create the admin user using env vars passed through Docker. Alternatively, add a Flask CLI command or startup hook in `api/app/__init__.py` that checks if an admin exists and creates one from `ADMIN_USERNAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` env vars on first boot. This ensures the admin login works immediately after `deploy_local.sh`.

### 5.0.2 Add phpMyAdmin to Docker Compose

Add a `phpmyadmin` service to `docker-compose.yml` and `docker-compose.local.yml`:

```yaml
phpmyadmin:
  image: phpmyadmin:latest
  ports:
    - "${PHPMYADMIN_PORT:-8080}:80"
  environment:
    PMA_HOST: db
    PMA_PORT: 3306
    MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
  depends_on:
    - db
  networks:
    - app-network
```

Accessible at `http://localhost:8080` in dev. NOT included in `docker-compose.prod.yml` (security risk in production).

### 5.1 `.env.example` — Genericize all names and credentials
### 5.2 `.gitignore` — Expand to cover node_modules, __pycache__, .venv, .DS_Store, etc.
### 5.3 Docker Compose files — Already generic (use env vars), no changes needed
### 5.4 Nginx configs — Remove project branding in `nginx.prod.conf`
### 5.5 Scripts

| Script | Action | Changes |
|---|---|---|
| `deploy_local.sh` | **MODIFY** | Replace `righttoremainfucked` image grep with `APP_NAME` from `.env`. Parameterize service names. |
| `deploy_gcp.sh` | **KEEP** | Fix health_check.sh path. Keep as a GCP deployment template. |
| `health_check.sh` | **MODIFY** | Update expected table count from 5 → 4 (user, group, group_member, item). Replace test email `m@test.com` → `admin@example.com`. Remove "Right to Remain" keyword checks. |
| `backup_db.sh` | **KEEP AS-IS** | Already generic, reads from `.env`. |
| `backup.sh` | **MODIFY** | Replace hardcoded `righttoremainfucked` DB name + `Right to Remain` branding with `.env` vars. |
| `restore.sh` | **MODIFY** | Replace hardcoded `righttoremainfucked` DB name, port `5151`, and branding with `.env` vars. |
| `setup_backup_cron.sh` | **KEEP AS-IS** | Already generic. |
| `git_flow.sh` | **DELETE** | Unsafe — `git add .` can stage `.env` and secrets. Users should use git directly. |
| `safe_log.sh` | **MODIFY** | Add `mkdir -p logs` before writing. Otherwise fine. |

### 5.6 Frontend config — Update `package.json` name, set `index.html` title

---

## Phase 6: Expo React Native App

**Goal:** Scaffold a basic Expo React Native app with auth and group flows, connecting to the same Flask API. **Use the same directory structure and patterns as the web frontend** so both codebases feel identical.

### 6.1 Initialize Expo App

Create `mobile/` directory with `npx create-expo-app@latest --template tabs`.

### 6.2 Shared Directory Structure (mirrors web frontend)

```
mobile/src/
├── api/                    # SAME structure as frontend/src/api/
│   ├── client.js           # Axios instance, base URL, JWT interceptor
│   ├── auth.js             # login, register, getProfile
│   ├── groups.js           # CRUD groups, join, invite
│   └── items.js            # CRUD items
├── components/             # SAME naming as frontend/src/components/
│   ├── common/             # Button, Input, Card, Loader (RN versions)
│   ├── auth/               # LoginForm, RegisterForm
│   ├── groups/             # GroupCard, GroupList, MemberList, InviteLink
│   └── items/              # ItemCard, ItemList, ItemForm
├── store/                  # SAME Zustand stores as frontend/src/store/
│   ├── authStore.js        # Identical API — just uses expo-secure-store instead of localStorage
│   ├── groupStore.js       # Identical to web
│   └── itemStore.js        # Identical to web
├── services/               # SAME structure as frontend/src/services/
│   ├── auth.js             # Token storage (expo-secure-store instead of localStorage)
│   └── validation.js       # Same validation rules as web
├── screens/                # Equivalent to frontend/src/pages/ (RN convention)
│   ├── (auth)/             # Auth stack (expo-router group)
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   └── (tabs)/             # Tab bar (expo-router group)
│       ├── Home.jsx
│       ├── Groups.jsx
│       └── Profile.jsx
├── config.js               # API_URL from env/constants
└── app/                    # expo-router file-based routing
    ├── _layout.jsx         # Root layout (auth check)
    ├── (auth)/
    │   ├── _layout.jsx
    │   ├── login.jsx
    │   └── register.jsx
    └── (tabs)/
        ├── _layout.jsx     # Tab bar config
        ├── index.jsx       # Home tab
        ├── groups/
        │   ├── index.jsx   # Groups list
        │   ├── [id].jsx    # Group detail
        │   ├── create.jsx  # Create group
        │   └── join.jsx    # Join via invite code
        └── profile.jsx     # Profile + settings + logout
```

### 6.3 What's IDENTICAL between web and mobile

These layers should be copy-paste identical (or near-identical) between `frontend/src/` and `mobile/src/`:

| Layer | Identical? | Only difference |
|---|---|---|
| `api/client.js` | ~95% | Base URL source (env var vs config.js) |
| `api/auth.js` | 100% | — |
| `api/groups.js` | 100% | — |
| `api/items.js` | 100% | — |
| `store/authStore.js` | ~90% | Token persist method (localStorage vs SecureStore) |
| `store/groupStore.js` | 100% | — |
| `store/itemStore.js` | 100% | — |
| `services/validation.js` | 100% | — |
| `services/auth.js` | ~50% | Storage mechanism differs |

### 6.4 Zustand Usage (stubbed in both web + mobile)

Each store should include basic stubbed usage. Example pattern used in BOTH:

```javascript
// store/groupStore.js (identical in frontend/ and mobile/)
import { create } from 'zustand';
import { getGroups, createGroup, joinGroup } from '../api/groups';

const useGroupStore = create((set, get) => ({
  groups: [],
  currentGroup: null,
  loading: false,
  error: null,

  fetchGroups: async () => {
    set({ loading: true, error: null });
    try {
      const groups = await getGroups();
      set({ groups, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  createGroup: async (data) => {
    const group = await createGroup(data);
    set((state) => ({ groups: [...state.groups, group] }));
    return group;
  },

  joinGroup: async (inviteCode) => {
    const group = await joinGroup(inviteCode);
    set((state) => ({ groups: [...state.groups, group] }));
    return group;
  },

  setCurrentGroup: (group) => set({ currentGroup: group }),
  clearError: () => set({ error: null }),
}));

export default useGroupStore;
```

### 6.5 Config

- `mobile/src/config.js` — Read `API_URL` from env/constants (dev: `http://localhost:5151`, prod: configurable)

---

## Phase 7: Documentation

### 7.1 New README.md

Date the README (e.g. "Last updated: March 2026").

Include these sections:

**1. Title + Date**
- "Full-Stack Boilerplate: React + Flask + MySQL + Docker"
- Created / last updated date

**2. Tech Stack**
Full breakdown:
| Layer | Tech |
|---|---|
| Web Frontend | React 18 (Vite), Zustand, Tailwind CSS |
| Mobile App | Expo React Native (tabs, expo-router) |
| Backend API | Python 3.11, Flask 2.3, SQLAlchemy |
| Database | MySQL 8.0 |
| Auth | JWT (PyJWT) |
| Containerization | Docker Compose (5 services: db, api, frontend, nginx, phpmyadmin) |
| Reverse Proxy | Nginx |
| Security | Rate limiting, security headers, input sanitization, XSS protection |
| State Management | Zustand (shared pattern across web + mobile) |

**3. Features** — What comes pre-built (auth, admin panel, groups, invite system, security, etc.)

**4. Quick Start** — Clone, copy `.env.example` → `.env`, run `./scripts/deploy_local.sh`

**5. Full Directory Structures** — All three codebases:

API structure:
```
api/
├── main.py
├── requirements.txt
├── Dockerfile
└── app/
    ├── __init__.py
    ├── config/
    │   ├── settings.py
    │   └── group_types.py
    ├── models/
    │   ├── user.py
    │   ├── group.py
    │   ├── group_member.py
    │   └── item.py
    ├── routes/
    │   ├── auth.py
    │   ├── admin.py
    │   ├── groups.py
    │   ├── items.py
    │   ├── config.py
    │   └── logs.py
    ├── services/
    │   ├── auth_service.py
    │   ├── group_service.py
    │   └── item_service.py
    ├── security/
    │   ├── auth_middleware.py
    │   ├── rate_limiter.py
    │   └── security_headers.py
    └── tests/
```

Web frontend structure:
```
frontend/src/
├── api/          # client.js, auth.js, groups.js, items.js, admin.js
├── components/   # common/, auth/, groups/, items/
├── pages/        # Home, Login, Register, Dashboard, Groups, admin/
├── store/        # authStore, groupStore, itemStore, adminStore (Zustand)
├── services/     # auth.js, validation.js
├── security/     # AuthGuard, InputSanitizer, SecurityUtils
└── utils/
```

Admin panel structure (inside web frontend):
```
frontend/src/
├── pages/admin/          # AdminLogin, AdminLayout, AdminDashboard,
│                         # AdminUsers, AdminUserDetail, AdminGroups, AdminGroupDetail
├── components/admin/     # StatCard, DataTable, AdminSidebar, AdminHeader,
│                         # RecentActivity, ConfirmDialog
├── api/admin.js          # Admin API calls
└── store/adminStore.js   # Admin state (stats, userList, groupList)
```

Mobile app structure:
```
mobile/src/
├── api/          # SAME as frontend (client.js, auth.js, groups.js, items.js)
├── components/   # SAME naming (common/, auth/, groups/, items/)
├── store/        # SAME Zustand stores (authStore, groupStore, itemStore)
├── services/     # SAME (auth.js uses SecureStore instead of localStorage)
├── screens/      # (auth)/ and (tabs)/ groups
└── app/          # expo-router file-based routing
```

**6. Architecture Overview** — Container diagram (db, api, frontend, nginx, phpmyadmin)

**7. Customization Guide** — Step-by-step for forking:
- Rename "My App"
- Edit `api/app/config/group_types.py` for your group types
- Update `.env`
- Add your own models, routes, components, screens

**8. API Reference** — All endpoints documented (auth, groups, items, admin, config)

**9. Security Overview**

**10. Scripts Documentation**

**11. Development Workflow**

**12. Production Deployment**

### 7.2 Update INFRASTRUCTURE.md — Remove project-specific references

---

## Phase 8: Testing and CI/CD

### 7.1 Backend Tests (pytest)

Create `api/tests/` with:
- `conftest.py` — Test client + test DB fixtures
- `test_health.py` — Health endpoint
- `test_auth.py` — Login, tokens, invalid creds
- `test_items.py` — CRUD operations
- `test_security.py` — Rate limiting, headers, CORS

### 7.2 Frontend Tests (Vitest)

Add Vitest + Testing Library. Create `frontend/src/__tests__/` with:
- `Home.test.jsx`, `security.test.js`, `stores.test.js`

### 7.3 GitHub Actions CI

Create `.github/workflows/ci.yml` — Backend tests, frontend tests, Docker build verification.

---

## Implementation Order

1. **Phase 1** — Strip content (must be first)
2. **Phase 5** — Configuration/.env (get env vars right before building new code)
3. **Phase 2** — Models/Database (backend models must exist before routes)
4. **Phase 4** — Backend routes (depends on Phase 2)
5. **Phase 3** — Frontend cleanup (after backend is stable)
6. **Phase 6** — Expo React Native app (after API is solid)
7. **Phase 8** — Testing (after all code changes)
8. **Phase 7** — Documentation (last, to document final state)

---

## Post-Refactor Verification Checklist

- [ ] `./scripts/deploy_local.sh` starts all 4 containers
- [ ] `./scripts/health_check.sh -e local` passes
- [ ] No grep hits for "Right to Remain", "Fucked", "anchor_db_42", "righttoremainfucked"
- [ ] Admin login works at `/overview`
- [ ] `/api/groups` CRUD + invite/join endpoints work with JWT auth
- [ ] `/api/items` CRUD endpoints work with JWT auth
- [ ] `/api/auth/register` creates new user and returns JWT
- [ ] Expo app builds and runs on iOS simulator
- [ ] Mobile sign-up, login, create group, join group flows work end-to-end
- [ ] `/healthz` returns healthy
- [ ] Security middleware functional (rate limiting, headers, CORS)
- [ ] Frontend builds without errors
- [ ] Backend starts without import errors
- [ ] Tests pass (pytest + vitest)
- [ ] GitHub Actions CI passes

---

## Decisions for User

1. **Project name:** Use literal "My App" or template variable `{{PROJECT_NAME}}`? (Recommend: literal with sed one-liner in docs)
2. **Keep `ai_instructions.md`?** Delete or convert to generic `.claude/instructions.md`?
3. **Test data passwords:** Keep plain text for dev convenience or use proper hashing?
4. **E2E tests:** Include Playwright/Cypress or out of scope for initial boilerplate?
5. ~~**Expo template:**~~ Tabs template ✅
6. ~~**Group privacy:**~~ Private by default, user chooses on creation ✅
7. ~~**Group types:**~~ Config-driven. One file (`api/app/config/group_types.py`) defines allowed types. API serves them via endpoint. Frontend/mobile pull dynamically. Just edit the config when forking. ✅
