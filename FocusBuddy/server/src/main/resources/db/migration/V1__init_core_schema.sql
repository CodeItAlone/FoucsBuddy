-- V1__init_core_schema.sql
-- FocusBuddy Core Database Schema

-- ====================
-- USERS TABLE
-- ====================
CREATE TABLE app_users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    handle VARCHAR(20) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_role CHECK (role IN ('USER', 'ADMIN'))
);

CREATE INDEX idx_users_email ON app_users(email);
CREATE INDEX idx_users_handle ON app_users(handle);

-- ====================
-- STREAKS TABLE
-- ====================
CREATE TABLE streaks (
    user_id BIGINT PRIMARY KEY REFERENCES app_users(id) ON DELETE CASCADE,
    current_streak INT NOT NULL DEFAULT 0,
    grace_days_remaining INT NOT NULL DEFAULT 1,
    last_session_date DATE
);

-- ====================
-- FOCUS SESSIONS TABLE
-- ====================
CREATE TABLE focus_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL,
    task_description VARCHAR(100) NOT NULL,
    planned_duration INT NOT NULL,
    started_at TIMESTAMP NOT NULL,
    paused_at TIMESTAMP,
    resumed_at TIMESTAMP,
    ended_at TIMESTAMP,
    total_paused_seconds INT NOT NULL DEFAULT 0,
    reflection TEXT,
    
    CONSTRAINT chk_session_status CHECK (status IN ('STARTED', 'PAUSED', 'RESUMED', 'ENDED'))
);

CREATE INDEX idx_sessions_user_id ON focus_sessions(user_id);
CREATE INDEX idx_sessions_user_start ON focus_sessions(user_id, started_at DESC);
CREATE INDEX idx_sessions_status ON focus_sessions(status);

-- ====================
-- DISTRACTION LOGS TABLE
-- ====================
CREATE TABLE distraction_logs (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES focus_sessions(id) ON DELETE CASCADE,
    description VARCHAR(255),
    logged_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_distractions_session ON distraction_logs(session_id);

-- ====================
-- TASKS TABLE
-- ====================
CREATE TABLE tasks (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    priority VARCHAR(10) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(15) NOT NULL DEFAULT 'TODO',
    due_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    
    CONSTRAINT chk_task_priority CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
    CONSTRAINT chk_task_status CHECK (status IN ('TODO', 'IN_PROGRESS', 'COMPLETED'))
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
