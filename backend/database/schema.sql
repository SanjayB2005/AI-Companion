-- Emotion Companion Database Schema
-- PostgreSQL Database Setup

-- Create database (run this separately as postgres user)
-- CREATE DATABASE emotion_companion;
-- \c emotion_companion;

-- Enable UUID extension (optional, for future use)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (managed by Django ORM)
-- This is for reference only - Django will create this table through migrations

-- CREATE TABLE users (
--     id BIGSERIAL PRIMARY KEY,
--     password VARCHAR(128) NOT NULL,
--     last_login TIMESTAMP WITH TIME ZONE,
--     is_superuser BOOLEAN NOT NULL DEFAULT FALSE,
--     email VARCHAR(255) UNIQUE NOT NULL,
--     username VARCHAR(150) UNIQUE NOT NULL,
--     first_name VARCHAR(150),
--     last_name VARCHAR(150),
--     profile_picture VARCHAR(100),
--     is_active BOOLEAN NOT NULL DEFAULT TRUE,
--     is_staff BOOLEAN NOT NULL DEFAULT FALSE,
--     date_joined TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
-- );

-- CREATE INDEX idx_users_email ON users(email);
-- CREATE INDEX idx_users_username ON users(username);
-- CREATE INDEX idx_users_is_active ON users(is_active);


-- Future tables for ML model integration

-- Emotion sessions table (for tracking emotion detection sessions)
CREATE TABLE IF NOT EXISTS emotion_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    session_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    session_end TIMESTAMP WITH TIME ZONE,
    voice_emotion VARCHAR(50),
    face_emotion VARCHAR(50),
    combined_emotion VARCHAR(50),
    confidence_score DECIMAL(5, 2),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_emotion_sessions_user_id ON emotion_sessions(user_id);
CREATE INDEX idx_emotion_sessions_created_at ON emotion_sessions(created_at);


-- Conversation history table
CREATE TABLE IF NOT EXISTS conversations (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT REFERENCES emotion_sessions(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    user_message TEXT,
    ai_response TEXT,
    emotion_context VARCHAR(50),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_conversations_session_id ON conversations(session_id);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_timestamp ON conversations(timestamp);


-- Emotion analytics table (for tracking emotion patterns)
CREATE TABLE IF NOT EXISTS emotion_analytics (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    emotion_type VARCHAR(50) NOT NULL,
    detection_method VARCHAR(20) NOT NULL, -- 'voice', 'face', 'combined'
    frequency INTEGER DEFAULT 1,
    last_detected TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_emotion_analytics_user_id ON emotion_analytics(user_id);
CREATE INDEX idx_emotion_analytics_emotion_type ON emotion_analytics(emotion_type);


-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    voice_detection_enabled BOOLEAN DEFAULT TRUE,
    face_detection_enabled BOOLEAN DEFAULT TRUE,
    notification_enabled BOOLEAN DEFAULT TRUE,
    theme VARCHAR(20) DEFAULT 'light',
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);


-- Grant permissions (adjust username as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO emotion_companion_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO emotion_companion_user;
