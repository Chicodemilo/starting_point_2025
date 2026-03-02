# Technical Reference

Detailed technical documentation for the starting_point_2025 boilerplate.

---

## Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Backend | Python, Flask, SQLAlchemy | 3.11, 2.3.x |
| Web Frontend | React, Vite, Zustand, React Router | 18, 5.x, 4.x, 6.x |
| Mobile | Expo (React Native), expo-router, Zustand | SDK 55, RN 0.83 |
| Database | MySQL | 8.0 |
| Auth | PyJWT, bcrypt | |
| Image Processing | Pillow (PIL) | 10.1 |
| HTTP Client | Axios (web + mobile) | |
| Infrastructure | Docker Compose, Nginx, phpMyAdmin | |
| Testing | pytest (backend), Vitest (frontend) | |
| CI | GitHub Actions | |

No external services required. SMTP is optional (falls back to console logging in dev).

---

## Directory Structure

```
starting_point_2025/
│
├── api/                              # Flask backend
│   ├── main.py                       # Entry point
│   ├── requirements.txt
│   ├── Dockerfile
│   └── app/
│       ├── __init__.py               # App factory, middleware init, admin seed
│       ├── config/
│       │   ├── settings.py           # All config from env vars
│       │   └── group_types.py        # Edit this per project
│       ├── models/
│       │   ├── __init__.py           # Registers all models
│       │   ├── user.py               # User + avatar, admin perms, email verification
│       │   ├── group.py              # Group + icon, invite codes
│       │   ├── group_member.py       # Membership with roles (owner/admin/member)
│       │   ├── item.py               # Generic item (user or group scoped)
│       │   ├── alert.py              # Notifications (system/group/user scoped)
│       │   ├── conversation.py       # Group chat + DM conversations
│       │   ├── conversation_member.py
│       │   ├── message.py            # Chat messages
│       │   └── terms_content.py      # Admin-managed T&C content
│       ├── routes/
│       │   ├── __init__.py           # Blueprint registration
│       │   ├── auth.py               # /api/auth/*
│       │   ├── admin.py              # /api/admin/*
│       │   ├── groups.py             # /api/groups/*
│       │   ├── items.py              # /api/items/*
│       │   ├── alerts.py             # /api/alerts/*
│       │   ├── conversations.py      # /api/conversations/*
│       │   ├── uploads.py            # /api/uploads/* (avatars, icons, file serving)
│       │   ├── config.py             # /api/config/*
│       │   └── logs.py               # /api/log (frontend error logging)
│       ├── services/
│       │   ├── auth_service.py       # Auth, verification, invite, terms, admin perms
│       │   ├── group_service.py      # Group CRUD, membership, invite-by-email
│       │   ├── item_service.py
│       │   ├── alert_service.py
│       │   └── messaging_service.py
│       ├── security/
│       │   ├── __init__.py           # Exports decorators: @token_required, @admin_required
│       │   ├── auth_middleware.py     # JWT extraction, g.current_user
│       │   ├── rate_limiter.py       # In-memory sliding window
│       │   └── security_headers.py   # HSTS, X-Frame-Options, etc.
│       ├── utils/
│       │   ├── email.py              # SMTP send or console log (dev mode)
│       │   └── uploads.py            # Pillow resize, save avatars/icons as sm+md JPEG
│       └── tests/
│           ├── conftest.py           # SQLite in-memory fixtures
│           ├── test_auth.py
│           ├── test_groups.py
│           ├── test_items.py
│           ├── test_health.py
│           ├── test_alerts.py
│           ├── test_messaging.py
│           ├── test_email_verification.py
│           ├── test_email_change.py
│           ├── test_terms.py
│           └── test_admin_features.py
│
├── frontend/                         # React web app (Vite)
│   ├── App.jsx                       # All route definitions
│   ├── package.json
│   ├── vite.config.js
│   ├── Dockerfile
│   └── src/
│       ├── main.jsx                  # React entry, sets document.title from env
│       ├── api/
│       │   ├── client.js             # Axios instance + JWT interceptor (localStorage)
│       │   ├── auth.js               # Login, register, profile, email change, avatar, terms
│       │   ├── groups.js             # Group CRUD, icon upload, invite-by-email, members
│       │   ├── items.js
│       │   ├── alerts.js
│       │   ├── conversations.js      # Messaging + admin broadcast
│       │   └── admin.js              # Stats, users, groups, terms, invite, permissions
│       ├── store/                    # Zustand global state (localStorage persistence)
│       │   ├── authStore.js
│       │   ├── groupStore.js
│       │   ├── itemStore.js
│       │   ├── alertStore.js
│       │   ├── messagingStore.js
│       │   └── adminStore.js
│       ├── services/
│       │   ├── auth.js               # Token get/set/clear (localStorage)
│       │   └── validation.js
│       ├── security/
│       │   ├── AuthGuard.jsx
│       │   ├── InputSanitizer.js
│       │   └── SecurityUtils.js
│       ├── pages/
│       │   ├── Home.jsx              # Landing, redirects to /terms if needed
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── CheckEmail.jsx
│       │   ├── VerifyEmail.jsx       # Handles both signup + email-change verification
│       │   ├── Terms.jsx             # T&C acceptance gate
│       │   ├── Dashboard.jsx         # Authenticated home with bell icon for inbox
│       │   ├── Profile.jsx           # Avatar upload, email change, logout
│       │   ├── Groups.jsx
│       │   ├── GroupDetail.jsx       # Group view with icon, "Manage" link for owners
│       │   ├── GroupAdmin.jsx        # Owner panel: name, icon, invite, members
│       │   ├── GroupPicker.jsx       # Set active group
│       │   ├── Invite.jsx            # Complete admin invite (set username/password)
│       │   ├── Inbox.jsx             # Alerts + messages tabs
│       │   ├── MessageThread.jsx
│       │   └── admin/                # Terminal-themed admin panel
│       │       ├── AdminLayout.jsx   # Sidebar + permission-based nav
│       │       ├── AdminLogin.jsx
│       │       ├── AdminDashboard.jsx
│       │       ├── AdminUsers.jsx    # Invite, permissions, admin tabs
│       │       ├── AdminGroups.jsx
│       │       ├── AdminAlerts.jsx
│       │       ├── AdminMessages.jsx
│       │       ├── AdminHealth.jsx   # Live health + test results
│       │       └── AdminTerms.jsx    # Edit T&C, reset user acceptance
│       └── __tests__/
│
├── mobile/                           # Expo React Native app
│   ├── app.config.js                 # Dynamic config from EXPO_PUBLIC_APP_NAME
│   ├── package.json
│   ├── app/                          # File-based routing (expo-router)
│   │   ├── _layout.tsx               # Root: auth guard, terms gate, splash
│   │   ├── terms.tsx
│   │   ├── (auth)/
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   └── check-email.tsx
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx           # 3 tabs: Home, Groups, Profile
│   │   │   ├── index.tsx             # Home
│   │   │   ├── profile.tsx           # Avatar upload, email change, logout
│   │   │   └── groups/
│   │   │       ├── index.tsx
│   │   │       ├── [id].tsx          # Detail with icon, "Manage" for owners
│   │   │       ├── admin.tsx         # Owner panel: name, icon, invite, members
│   │   │       ├── create.tsx
│   │   │       ├── join.tsx
│   │   │       └── picker.tsx
│   │   └── inbox/
│   │       ├── index.tsx             # Alerts + Messages segments
│   │       ├── [id].tsx              # Message thread
│   │       ├── alerts.tsx
│   │       └── conversations.tsx
│   └── src/                          # Mirrors frontend/src (different storage layer)
│       ├── config.js                 # API_URL from env
│       ├── api/                      # Same endpoints, Axios + SecureStore JWT
│       ├── store/                    # Same Zustand stores, SecureStore persistence
│       ├── services/
│       └── components/
│           └── SplashScreen.tsx
│
├── mysql/
│   └── init/
│       ├── 01-init-db.sql           # Full schema + indexes
│       └── 02-test-data.sql         # Seed data
│
├── nginx/
│   ├── nginx.conf                    # Routes: /api/* → api:5000, /* → frontend:3000
│   └── nginx.prod.conf
│
├── scripts/
│   ├── deploy_local.sh
│   ├── deploy_gcp.sh
│   ├── health_check.sh
│   ├── backup.sh / backup_db.sh / restore.sh
│   ├── setup_backup_cron.sh
│   ├── run_tests.sh                  # pytest + vitest, writes JSON results
│   └── setup_test_cron.sh
│
├── docker-compose.yml                # Main (5 services)
├── docker-compose.prod.yml
├── .env.example
├── start.sh                          # ./start.sh "App Name" — sets identity everywhere
└── .github/workflows/ci.yml
```

---

## Database Schema

9 tables defined in `mysql/init/01-init-db.sql`:

| Table | Purpose |
|-------|---------|
| `user` | Accounts. Fields for auth, verification, terms, avatar, admin perms, active group, invite tokens. |
| `group` | Teams/clubs/groups. Has type (validated), privacy, owner, invite code, icon. |
| `group_member` | Membership join table. Roles: `owner`, `admin`, `member`. Unique per group+user. |
| `item` | Generic content item scoped to a user and/or group. |
| `alert` | Notifications. Scoped by: receiver (direct), group (broadcast), or neither (system-wide). Types: info, warning, urgent, system. |
| `conversation` | Chat threads. Type: `group` (auto-created with group) or `direct` (DM). |
| `conversation_member` | Conversation membership with `last_read_at` for unread tracking. |
| `message` | Individual chat messages in a conversation. |
| `terms_content` | Admin-managed T&C text. Versioned. Seeded with placeholder on init. |

Key relationships:
- `user.active_group_id` → `group.id` (SET NULL on delete)
- `group.owner_id` → `user.id` (CASCADE)
- Group member roles control permissions for group operations
- Conversations auto-created when groups are created; members added on join

---

## API Endpoints

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | No | Create account, sends verification email |
| POST | `/login` | No | Returns JWT + user |
| GET | `/verify` | JWT | Validate token |
| GET | `/profile` | JWT | Full user profile |
| GET | `/verify-email?token=` | No | Verify email from link |
| POST | `/resend-verification` | JWT | Resend verification email |
| PUT | `/active-group` | JWT | Set user's active group |
| PUT | `/accept-terms` | JWT | Accept T&C |
| GET | `/terms` | No | Get current T&C content |
| PUT | `/change-email` | JWT | Start email change (sends verification to new address) |
| GET | `/verify-new-email?token=` | No | Confirm email change |
| POST | `/complete-invite` | No | Complete admin invite (set username/password) |

### Groups — `/api/groups`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | JWT | List user's groups (or `?public=true` for public) |
| POST | `/` | JWT | Create group |
| GET | `/:id` | JWT | Group detail with members |
| PUT | `/:id` | JWT | Update group (owner/admin) |
| DELETE | `/:id` | JWT | Delete group (owner only) |
| POST | `/join` | JWT | Join via invite code |
| POST | `/:id/invite` | JWT | Regenerate invite code (owner/admin) |
| POST | `/:id/invite-email` | JWT | Invite by email (owner/admin) |
| POST | `/:id/members` | JWT | Add member (owner/admin) |
| PUT | `/:id/members/:uid` | JWT | Change member role (owner) |
| DELETE | `/:id/members/:uid` | JWT | Remove member (owner/admin or self) |

### Items — `/api/items`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | JWT | List items (paginated, filterable by group) |
| POST | `/` | JWT | Create item |
| PUT | `/:id` | JWT | Update item |
| DELETE | `/:id` | JWT | Delete item |

### Alerts — `/api/alerts`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | JWT | User's alerts (scoped) |
| GET | `/unread-count` | JWT | Unread count |
| POST | `/` | JWT | Create alert |
| PUT | `/:id/read` | JWT | Mark as read |
| DELETE | `/:id` | JWT | Delete alert |

### Conversations — `/api/conversations`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | JWT | User's conversations with last message + unread count |
| POST | `/` | JWT | Create DM (requires shared group) |
| GET | `/:id/messages` | JWT | Paginated messages |
| POST | `/:id/messages` | JWT | Send message |

### Uploads — `/api/uploads`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/avatar` | JWT | Upload user avatar (JPG/PNG, max 5MB) |
| POST | `/group/:id/icon` | JWT | Upload group icon (owner/admin) |
| GET | `/<path>` | No | Serve uploaded file |

Uploaded images are resized to two variants:
- `sm`: 64x64 px
- `md`: 256x256 px

Stored as JPEG (quality 85) in `/app/uploads/avatars/` and `/app/uploads/group_icons/`.
URL pattern: `/api/uploads/avatars/{uuid}_{sm|md}.jpg`

### Admin — `/api/admin`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/login` | No | Admin login |
| GET | `/stats` | Admin | Dashboard stats |
| GET | `/users` | Admin | Search/paginate users |
| PUT | `/users/:id` | Admin | Update user (toggle admin, verified, etc.) |
| DELETE | `/users/:id` | Admin | Delete user |
| GET | `/groups` | Admin | Search/filter groups |
| DELETE | `/groups/:id` | Admin | Delete group |
| GET | `/health` | Admin | Live system health |
| GET | `/test-results` | Admin | Latest test run results |
| GET | `/terms` | Admin | Get T&C for editing |
| PUT | `/terms` | Admin | Update T&C content |
| POST | `/terms/reset` | Admin | Reset all user T&C acceptance |
| POST | `/invite` | Admin | Send user invite by email |
| GET | `/admin-users` | Admin | List admin users with permissions |
| PUT | `/users/:id/permissions` | Admin | Set per-section admin permissions |
| GET | `/alerts` | Admin | All alerts |
| POST | `/alerts` | Admin | Send alert as admin |
| GET | `/conversations` | Admin | All conversations |
| POST | `/broadcast` | Admin | Send broadcast message |

### Config — `/api/config`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/group-types` | No | Available group types |

---

## Features

### Authentication & User Management
- JWT-based auth with 24h token expiration (configurable)
- bcrypt password hashing
- Email verification flow (sends link, dev mode logs to console)
- Email change with re-verification (holds new email as `pending_email` until confirmed)
- Admin invite flow (admin sends email → user sets username/password via token link)
- Rate limiting on auth endpoints (sliding window, in-memory)

### Terms & Conditions
- Admin-managed T&C content with versioning
- Users must accept after login before accessing the app
- Admin can reset all acceptances (forces re-accept on next login)

### Groups
- Create groups with configurable types (edit `group_types.py`)
- Owner/admin/member role hierarchy
- Invite codes for joining
- Invite-by-email (adds existing users directly, emails non-users the invite code)
- Group admin page for owners (rename, icon, member management)
- Group icons (upload, resize, serve)

### Alerts
- Scoped notifications: direct to user, group-wide, or system-wide
- Types: info, warning, urgent, system
- Read/unread tracking with timestamps
- Admin can broadcast and view analytics

### Messaging
- Group conversations auto-created with groups
- DMs between users who share a group
- Unread tracking via `last_read_at`
- Paginated message history
- Admin broadcast and moderation

### Image Uploads
- User avatars and group icons
- Accepts JPG and PNG, max 5MB
- Resized to sm (64x64) and md (256x256) via Pillow
- Stored on the API server filesystem, persisted via Docker volume (`uploads_data`)
- UUID-based filenames prevent conflicts

### Admin Panel
- Terminal aesthetic: monospace font, black background, green/grey text
- Per-admin section permissions (stored as JSON on user record)
- Sections: Dashboard, Users, Groups, Alerts, Messages, Health, Terms
- Live system health monitoring (auto-refresh 30s)
- Test results display (from `scripts/run_tests.sh` output)
- User invite, permission editing, T&C management

### Security
- `@token_required` and `@admin_required` route decorators
- Security headers: HSTS, X-Frame-Options, X-Content-Type-Options, CSP
- Rate limiting with configurable tiers (moderate, strict)
- CORS restricted to known origins
- Input sanitization on the frontend (XSS prevention)

---

## State Management

Web and mobile share identical Zustand store patterns:

| Store | State | Key Actions |
|-------|-------|-------------|
| `authStore` | user, token, isAuthenticated | login, logout, register, refreshProfile |
| `groupStore` | groups, currentGroup | fetchGroups, fetchGroup, createGroup, deleteGroup |
| `itemStore` | items | fetchItems, createItem, deleteItem |
| `alertStore` | alerts, unreadCount | fetchAlerts, markRead |
| `messagingStore` | conversations, messages | fetchConversations, sendMessage |
| `adminStore` | stats, users, groups | fetchStats, fetchUsers, fetchGroups |

The only difference is the storage layer:
- **Web**: `localStorage` via `services/auth.js`
- **Mobile**: `expo-secure-store` via `src/services/auth.js`

---

## Docker Services

| Service | Internal Port | Exposed Port | Purpose |
|---------|--------------|--------------|---------|
| `db` | 3306 | 3316 | MySQL 8.0 |
| `api` | 5000 | — | Flask API (behind Nginx) |
| `frontend` | 3000 | 3151 | React Vite dev server |
| `nginx` | 80 | 5151 | Reverse proxy (routes `/api/*` to api, `/*` to frontend) |
| `phpmyadmin` | 80 | 8080 | Database browser |

Volumes:
- `mysql_data` — persistent database storage
- `uploads_data` — persistent uploaded images (avatars, icons)

---

## Environment Variables

All configuration is in `.env` (copy from `.env.example`). Key variables:

| Variable | Purpose | Default |
|----------|---------|---------|
| `APP_NAME` | Container names, UI titles, email subjects | My App |
| `SECRET_KEY` | JWT signing key | (must change) |
| `ADMIN_USERNAME/EMAIL/PASSWORD` | Auto-seeded admin account | admin / admin@example.com / (must change) |
| `VITE_API_URL` | Web frontend API base | http://localhost:5151 |
| `EXPO_PUBLIC_API_URL` | Mobile API base | http://localhost:5151 |
| `FRONTEND_URL` | Used in email verification links | http://localhost:3151 |
| `SMTP_*` | Email sending (optional) | Logs to console if unset |
| `BACKEND_PORT` | Nginx → API port | 5151 |
| `FRONTEND_PORT` | React dev server port | 3151 |
| `DB_PORT` | MySQL port | 3316 |
| `PHPMYADMIN_PORT` | phpMyAdmin port | 8080 |

---

## Gotchas

### Database

- **First boot only**: `mysql/init/` scripts only run when the MySQL data volume is empty. If you change the schema and need to re-init, delete the volume: `docker compose down -v` then `docker compose up --build`.
- **SQLAlchemy relationship ambiguity**: The `Group.owner` relationship has an explicit `foreign_keys=[owner_id]` because `User.active_group_id` creates a second FK path between the two tables. If you add more FKs between User and Group, you'll need to specify `foreign_keys` on those relationships too.

### Auth & Admin

- **Admin seeding**: The admin user is created on first API request (via `before_request` hook), not on container start. Credentials come from `.env`.
- **JWT in tests**: After updating a user's `is_admin` in the database, the JWT still reflects the old value. You need to re-login to get a fresh token. The test helper `register_admin()` handles this.
- **Admin permissions**: Stored as a JSON string in `user.admin_permissions`. The `AdminLayout` checks these client-side to show/hide sections. The backend admin routes use `@admin_required` (checks `is_admin` on the JWT), not per-section permissions — section permissions are a UI concern.
- **Terms gating**: Both web (`Home.jsx`, `Login.jsx`) and mobile (`_layout.tsx`) redirect to `/terms` if `user.terms_accepted` is false. If you remove this feature, remove those checks.

### Email

- **No SMTP = console logs**: If `SMTP_HOST`, `SMTP_USER`, or `SMTP_PASSWORD` are unset, all emails (verification, invite, etc.) print to the API container's stdout with a banner. Check `docker compose logs api` to see them.
- **Email change flow**: The new email is stored in `user.pending_email` with a separate verification token. It doesn't replace `user.email` until the user clicks the verification link sent to the new address.

### Uploads

- **Docker volume**: Uploaded images live in the `uploads_data` Docker volume mounted at `/app/uploads`. If you `docker compose down -v`, uploads are deleted. The `-v` flag destroys all volumes.
- **File serving**: Images are served by Flask (`send_from_directory`), not Nginx. This is fine for moderate traffic. For high traffic, configure Nginx to serve `/api/uploads/` directly from the volume.
- **Image format**: All uploads are converted to JPEG regardless of input format. Transparency (PNG alpha channel) is lost.

### Mobile

- **Physical device API URL**: `localhost` won't work from a phone. Set `EXPO_PUBLIC_API_URL` to your Mac's local IP (e.g., `http://192.168.1.x:5151`).
- **expo-image-picker**: Required for avatar and group icon uploads on mobile. It's included in Expo SDK but requires camera roll permissions (requested at runtime).
- **SecureStore vs localStorage**: Mobile stores JWT in `expo-secure-store` (encrypted). The store pattern is identical to web but the underlying storage is different. Don't mix them up if sharing code.

### Rate Limiting

- **In-memory only**: Rate limiting resets on API container restart. Not shared across instances. Fine for single-container deployments.
- **Testing bypass**: When `app.config['TESTING']` is True, rate limiting is skipped. This is set automatically by the test fixtures.

### Group Types

- **Single source of truth**: Edit `api/app/config/group_types.py`. Both web and mobile fetch types from `/api/config/group-types`. Don't hardcode type lists in the frontend.

### Testing

- **Backend tests use SQLite in-memory**: Run with `DATABASE_URL=sqlite:///:memory: SECRET_KEY=test`. Some MySQL-specific features (like ENUMs) are approximated. The test conftest handles this.
- **Known pre-existing failures**: `test_get_group_types` expects a `types` key but the API returns `group_types`. Some messaging tests have session-scoped fixture isolation issues. These predate the current feature set.

---

## Customization Checklist

When forking for a new project:

1. `cp .env.example .env` — set `APP_NAME`, `SECRET_KEY`, admin credentials, DB passwords
2. Edit `api/app/config/group_types.py` — define your group types
3. Edit `mysql/init/02-test-data.sql` — adjust or remove seed data
4. Replace `mobile/assets/images/` — app icon, splash screen
5. To add a new model: model → service → route → register blueprint → frontend API + store
6. Run `./start.sh "Your App Name"` — names everything in one shot
