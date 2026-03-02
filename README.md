# Starting Point 2025

A full-stack boilerplate for web and mobile apps. React + Flask + MySQL + Expo, wired together with Docker Compose. Fork it, rename it, build on it.

For the full technical reference (stack, schema, API endpoints, directory structure, gotchas), see [TECHNICAL.md](TECHNICAL.md).

---

## What's In The Box

- **Backend**: Flask API with JWT auth, groups, messaging, alerts, file uploads
- **Web Frontend**: React (Vite) with Zustand state management
- **Mobile App**: Expo (React Native) with the same API and stores
- **Admin Panel**: Terminal-themed admin site with user management, permissions, health monitoring
- **Database**: MySQL 8.0 with phpMyAdmin
- **Infrastructure**: Docker Compose, Nginx reverse proxy, automated backups

Everything runs locally with one command. No external services required.

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)
- [Node.js](https://nodejs.org/) 18+ (for the mobile app)
- A terminal

---

## Getting Started

### 1. Clone and configure

```bash
git clone https://github.com/Chicodemilo/starting_point_2025.git
cd starting_point_2025
cp .env.example .env
```

Open `.env` and change at minimum:
- `SECRET_KEY` — any random string, used to sign JWTs
- `MYSQL_ROOT_PASSWORD` and `MYSQL_PASSWORD` — database passwords
- `ADMIN_PASSWORD` — your admin account password

### 2. Start the stack

```bash
docker compose up --build
```

Or use the start script to name your project:

```bash
./start.sh "My Project Name"
```

This sets the app name in container names, the web page title, and email subjects.

Wait for all services to start (first build takes a few minutes). You'll know it's ready when you see the Flask API logging requests.

### 3. Open the app

| What | URL |
|------|-----|
| Web app | http://localhost:3151 |
| API | http://localhost:5151 |
| phpMyAdmin | http://localhost:8080 |

Register a new account on the web app. You'll get a verification email — since SMTP isn't configured by default, the verification link is printed to the API container logs:

```bash
docker compose logs api
```

Look for the banner that says `EMAIL VERIFICATION` with a URL. Open that URL to verify your account.

---

## Admin Panel

The admin panel is at **http://localhost:3151/overview**.

Log in with the credentials from your `.env` file (defaults: `admin` / `change_me_admin_password`).

The admin is automatically created on first boot. If you change the admin credentials in `.env`, you need to either:
- Delete the database volume and rebuild: `docker compose down -v && docker compose up --build`
- Or update the admin user manually via phpMyAdmin at http://localhost:8080

### Admin sections

- **Dashboard** — user/group/item/alert/message counts
- **Users** — search users, toggle admin, invite new users by email, set per-section permissions
- **Groups** — browse and delete groups
- **Alerts** — view all alerts, send system/group/user alerts
- **Messages** — view conversations, broadcast messages
- **Health** — live system health (auto-refreshes), test results
- **Terms** — edit terms & conditions, reset all user acceptances

Admin permissions are per-section. A super admin can restrict other admins to only see certain sections (e.g., Users only).

---

## Mobile App (Expo)

The mobile app runs outside Docker via Expo.

### On your Mac

```bash
cd mobile
npm install
npx expo start
```

This opens the Expo dev tools in your terminal. From there:

- Press **i** to open in the iOS Simulator (requires Xcode)
- Press **a** to open in the Android Emulator (requires Android Studio)
- Scan the QR code with [Expo Go](https://expo.dev/go) on a physical device

### Connecting to your API

**Simulator/Emulator**: The default `localhost:5151` should work.

**Physical device**: Your phone needs to reach the API over your local network. Find your Mac's local IP:

```bash
ipconfig getifaddr en0
```

Then set the API URL before starting Expo:

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.XXX:5151 npx expo start
```

Replace `192.168.1.XXX` with your actual IP. Your phone and Mac must be on the same Wi-Fi network.

---

## Running Tests

### Backend

```bash
cd api
pip install -r requirements.txt
DATABASE_URL=sqlite:///:memory: SECRET_KEY=test pytest app/tests/ -v
```

### Frontend

```bash
cd frontend
npm install
npm test
```

---

## Stopping and Cleaning Up

```bash
# Stop all services (keeps data)
docker compose down

# Stop and delete all data (database, uploads)
docker compose down -v
```

---

## Project Configuration

All settings are in `.env`. The main ones:

| Variable | What it does |
|----------|-------------|
| `APP_NAME` | App name in UI, emails, container names |
| `SECRET_KEY` | JWT signing (change this) |
| `ADMIN_USERNAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Auto-created admin account |
| `FRONTEND_PORT` | Web app port (default 3151) |
| `BACKEND_PORT` | API port (default 5151) |
| `SMTP_*` | Email config (optional — logs to console if not set) |

To customize group types (team, club, league, etc.), edit `api/app/config/group_types.py`.

---

## Scripts

| Script | What it does |
|--------|-------------|
| `./start.sh "Name"` | Start with a project name |
| `scripts/deploy_local.sh` | Build and start |
| `scripts/health_check.sh` | Check all services |
| `scripts/backup_db.sh` | Back up the database |
| `scripts/restore.sh` | Restore from backup |
| `scripts/run_tests.sh` | Run backend + frontend tests |
