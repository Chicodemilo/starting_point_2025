# Feature Expansion Plan — Starting Point 2025

## Context

The boilerplate has a solid foundation (auth, groups, items, admin panel, mobile app). Now we're adding 6 features that nearly every project will need — so they belong in the scaffold rather than being rebuilt per-fork.

**Build order:**
1. Project Name Passthrough (quick, sets identity)
2. Email Verification (core auth, modifies User model early)
3. Splash Screen (quick mobile win)
4. Active Group Selector (needed before alerts/messaging)
5. Alert System (group-scoped notifications)
6. Messaging System (group chat + DMs)

---

## Feature 1: Project Name Passthrough

`./start.sh "Game For Parties Idea"` names the project everywhere — container names, API responses, frontend title, mobile app name. Falls back to `.env` `APP_NAME` if no arg.

---

## Feature 2: Email Verification

After signup, users get a verification email with a link. Dev mode logs the link to console (no SMTP blocking dev). User model gets `email_verified`, `verification_token`, `verification_sent_at`. Admin can manually verify users. SMTP config in `.env` (all optional).

---

## Feature 3: Splash Screen (React Native)

Custom splash screen component with app name + loading indicator. Replaces blank screen during auth initialization.

---

## Feature 4: Active Group Selector

Users pick an active group from their memberships. Persisted in Zustand (localStorage web, SecureStore mobile). Server-side via `active_group_id` on user model. Used as context for alerts and messaging.

---

## Feature 5: Alert System

Alerts scoped 3 ways: system-wide (no group/user), group-wide, or direct to user. Model tracks: title, content, type (info/warning/urgent/system), sender, viewed, viewed_at, expires_at. Admin can send system alerts and view analytics (sent/read rates).

---

## Feature 6: Messaging System

Group chat auto-created with each group. DMs between users who share a group. Models: Conversation, ConversationMember (with last_read_at for read receipts), Message. Links in messages auto-formatted. Admin can moderate and broadcast.

---

## UX Pattern: Inbox (not separate tabs)

**Mobile:** 3 tabs (Home, Groups, Profile) + bell icon in header with unread badge. Tapping opens Inbox screen with segmented control: Alerts | Messages.

**Web:** Bell icon with badge in nav area → `/inbox` page with Alerts and Messages tabs.

---

## Admin Panel Additions

| Page | Features |
|------|----------|
| **Alerts** | View all alerts, send system/group/user alerts, analytics (sent, read rate) |
| **Messages** | View/moderate conversations, broadcast to groups, delete messages, stats |
| **Health** | Live: API status, DB connection, uptime, record counts. Nightly: test results (pass/fail from cron, failed test details) |
| **Users** (existing) | + email verified badge and toggle |
| **Dashboard** (existing) | + alert/message counts, health indicator, test status badge |

---

## New Database Tables

- `alert` — notifications with scoping (system/group/user)
- `conversation` — group chat or DM container
- `conversation_member` — who's in each conversation + last read time
- `message` — text content within conversations

User table additions: `email_verified`, `verification_token`, `verification_sent_at`, `active_group_id`

---

## No New Dependencies

All features use existing packages (Flask, SQLAlchemy, smtplib, React, Zustand, Axios, Expo).
