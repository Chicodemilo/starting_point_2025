-- Test data initialization script
-- Runs after 01-init-db.sql due to alphabetical ordering
-- WARNING: Development only - do not use these credentials in production

USE app_db;

-- Insert test users (plain text passwords for dev convenience)
-- Admin credentials should match ADMIN_EMAIL / ADMIN_PASSWORD in .env
INSERT IGNORE INTO user (username, email, password_hash, is_admin) VALUES
('admin', 'admin@example.com', 'admin123', TRUE),
('testuser', 'user@example.com', 'test123', FALSE);

-- Insert a sample group
INSERT IGNORE INTO `group` (name, description, type, is_private, owner_id, invite_code) VALUES
('Demo Group', 'A sample group for demonstration purposes.', 'club', FALSE, 1, 'DEMO2025');

-- Add group memberships
INSERT IGNORE INTO group_member (group_id, user_id, role) VALUES
(1, 1, 'owner'),
(1, 2, 'member');

-- Insert sample items
INSERT IGNORE INTO item (title, description, user_id, group_id) VALUES
('Example Item 1', 'This is a sample item for demonstration.', 1, 1),
('Example Item 2', 'Another sample item created by a regular user.', 2, 1),
('Example Item 3', 'A standalone item not belonging to any group.', 2, NULL);
