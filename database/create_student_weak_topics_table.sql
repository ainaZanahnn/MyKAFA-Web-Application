-- Create student_weak_topics table for tracking topic weaknesses and remediation
CREATE TABLE IF NOT EXISTS student_weak_topics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    subject VARCHAR(255) NOT NULL,
    topic VARCHAR(255) NOT NULL,
    weakness_score DECIMAL(3,2) NOT NULL DEFAULT 0.50 CHECK (weakness_score >= 0.00 AND weakness_score <= 1.00),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    improvement_trend VARCHAR(20) DEFAULT 'stable' CHECK (improvement_trend IN ('improving', 'declining', 'stable')),
    remediation_attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure one record per user-topic combination
    UNIQUE(user_id, year, subject, topic)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_student_weak_topics_user_id ON student_weak_topics(user_id);
CREATE INDEX IF NOT EXISTS idx_student_weak_topics_weakness_score ON student_weak_topics(weakness_score);
CREATE INDEX IF NOT EXISTS idx_student_weak_topics_last_updated ON student_weak_topics(last_updated);

-- Add comments for documentation
COMMENT ON TABLE student_weak_topics IS 'Tracks student topic weaknesses for adaptive learning and guardian monitoring';
COMMENT ON COLUMN student_weak_topics.weakness_score IS 'Score from 0.0 (no weakness) to 1.0 (maximum weakness)';
COMMENT ON COLUMN student_weak_topics.improvement_trend IS 'Current trend: improving, declining, or stable';
COMMENT ON COLUMN student_weak_topics.remediation_attempts IS 'Number of times this topic has been targeted for remediation';
