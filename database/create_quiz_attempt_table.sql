-- Create quiz_attempt table for detailed attempt logging
CREATE TABLE IF NOT EXISTS quiz_attempt (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    attempt_number INTEGER NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    time_taken INTEGER NOT NULL DEFAULT 0, -- Time in seconds
    questions_answered INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL DEFAULT 0,
    ability_estimate DECIMAL(3,2) DEFAULT 0.5,
    passed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quiz_attempt_user_id ON quiz_attempt(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempt_quiz_id ON quiz_attempt(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempt_created_at ON quiz_attempt(created_at);
