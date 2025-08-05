-- Database initialization script for Right to Remain application
-- This script creates the necessary tables for the application

USE anchor_db_42;

-- Create user table
CREATE TABLE IF NOT EXISTS user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(80) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create category table
CREATE TABLE IF NOT EXISTS category (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create evidence table
CREATE TABLE IF NOT EXISTS evidence (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    content LONGTEXT,
    source_url VARCHAR(500),
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE SET NULL
);

-- Create evidence category link table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS evidencecategorylink (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evidence_id INT NOT NULL,
    category_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (evidence_id) REFERENCES evidence(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE CASCADE,
    UNIQUE KEY unique_evidence_category (evidence_id, category_id)
);

-- Create vote table
CREATE TABLE IF NOT EXISTS vote (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evidence_id INT NOT NULL,
    user_id INT,
    vote_type ENUM('up', 'down') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (evidence_id) REFERENCES evidence(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE SET NULL,
    UNIQUE KEY unique_user_evidence_vote (user_id, evidence_id)
);

-- Default categories and test data are loaded via 02-test-data.sql

-- Create indexes for better performance
CREATE INDEX idx_evidence_user_id ON evidence(user_id);
CREATE INDEX idx_evidence_created_at ON evidence(created_at);
CREATE INDEX idx_vote_evidence_id ON vote(evidence_id);
CREATE INDEX idx_vote_user_id ON vote(user_id);
CREATE INDEX idx_evidencecategorylink_evidence_id ON evidencecategorylink(evidence_id);
CREATE INDEX idx_evidencecategorylink_category_id ON evidencecategorylink(category_id);
