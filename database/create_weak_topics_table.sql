-- Create student_weak_topics table for real-time weak topic tracking
CREATE TABLE IF NOT EXISTS student_weak_topics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    subject VARCHAR(255) NOT NULL,
    topic VARCHAR(255) NOT NULL,
    weakness_score DECIMAL(3,2) DEFAULT 0.00 CHECK (weakness_score >= 0.00 AND weakness_score <= 1.00),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    improvement_trend VARCHAR(20) DEFAULT 'stable' CHECK (improvement_trend IN ('improving', 'stable', 'declining')),
    remediation_attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, year, subject, topic)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_weak_topics_user_id ON student_weak_topics(user_id);
CREATE INDEX IF NOT EXISTS idx_student_weak_topics_weakness_score ON student_weak_topics(weakness_score DESC);
CREATE INDEX IF NOT EXISTS idx_student_weak_topics_last_updated ON student_weak_topics(last_updated DESC);
