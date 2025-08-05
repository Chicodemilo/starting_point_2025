-- Test data initialization script for Right to Remain application
-- This script loads test data after the schema is created
-- Runs after 01-init-db.sql due to alphabetical ordering

USE anchor_db_42;

-- Insert test users (TESTING ONLY - weak passwords for development)
-- NOTE: These passwords violate security rules and must be changed in production
INSERT IGNORE INTO user (username, email, password_hash, is_admin) VALUES
('m', 'm@test.com', '111', TRUE),  -- Admin user with password '111'
('v', 'v@test.com', '222', FALSE), -- Regular user with password '222'
('c', 'c@test.com', '222', FALSE), -- Regular user with password '222'
('dl', 'dl@test.com', '222', FALSE); -- Regular user with password '222'

-- Insert additional test categories (beyond the 5 default ones)
INSERT IGNORE INTO category (name, description) VALUES
('Court Decisions', 'Federal and state court decisions affecting immigration law'),
('Administrative Guidance', 'USCIS, ICE, and CBP policy memos and guidance documents'),
('Legislative History', 'Congressional records and legislative intent documentation'),
('International Law', 'Treaties, international agreements, and comparative law'),
('Academic Research', 'Peer-reviewed studies and academic analysis'),
('Advocacy Reports', 'Reports from immigrant rights organizations'),
('Government Data', 'Official statistics and government-published data'),
('Case Studies', 'Detailed analysis of specific immigration cases'),
('Historical Context', 'Historical background and precedent information'),
('Regional Variations', 'State and local policy differences'),
('Procedural Guidance', 'Step-by-step process documentation'),
('Rights Information', 'Know-your-rights materials and resources');

-- Insert test evidence entries
INSERT IGNORE INTO evidence (title, description, content, source_url, user_id) VALUES
('Sample Legal Precedent', 'This is a test evidence entry for legal precedent category', 'Detailed content about this legal case and its implications for immigration law...', 'https://example.com/legal-case-1', 2),
('Immigration Policy Analysis 2024', 'Analysis of recent policy changes and their impact', 'Comprehensive analysis of policy changes implemented in 2024...', 'https://example.com/policy-analysis-2024', 2),
('Statistical Report on Asylum Cases', 'Government data on asylum case outcomes', 'Statistical breakdown of asylum case approvals and denials...', 'https://example.com/asylum-stats', 3),
('Personal Immigration Story', 'First-hand account of immigration process', 'Personal narrative describing the challenges and successes...', NULL, 4);

-- Link evidence to categories (many-to-many relationships)
INSERT IGNORE INTO evidencecategorylink (evidence_id, category_id) VALUES
-- Sample Legal Precedent -> Legal Precedent category (id=1)
(1, 1),
-- Immigration Policy Analysis -> Policy Analysis category (id=2)  
(2, 2),
-- Statistical Report -> Statistical Data category (id=3)
(3, 3),
-- Personal Story -> Personal Stories category (id=4)
(4, 4),
-- Cross-link some evidence to multiple categories
(1, 7), -- Legal Precedent also in Court Decisions
(2, 8), -- Policy Analysis also in Administrative Guidance
(3, 12); -- Statistical Report also in Government Data

-- Insert test votes
INSERT IGNORE INTO vote (evidence_id, user_id, vote_type) VALUES
(1, 2, 'up'),
(1, 3, 'up'),
(2, 2, 'up'),
(2, 4, 'down'),
(3, 3, 'up'),
(4, 2, 'up'),
(4, 3, 'up');
