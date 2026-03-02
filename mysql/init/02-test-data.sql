-- Sample data initialization script
-- Runs after 01-init-db.sql due to alphabetical ordering
-- NOTE: Admin user is seeded by the Flask app on first boot (see .env for credentials).
--       Do NOT insert admin here — the app uses werkzeug password hashing.

USE app_db;
