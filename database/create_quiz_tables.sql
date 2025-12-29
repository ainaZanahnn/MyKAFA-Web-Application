-- Create quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
    id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL CHECK (year >= 1 AND year <= 6),
    subject VARCHAR(100) NOT NULL,
    topic VARCHAR(255) NOT NULL,
    quiz_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quiz_templates table
CREATE TABLE IF NOT EXISTS quiz_templates (
    id SERIAL PRIMARY KEY,
    bloom_level VARCHAR(20) NOT NULL CHECK (bloom_level IN ('remember', 'understand', 'apply', 'analyze')),
    quiz_types JSONB NOT NULL, -- Array of quiz types for this bloom level
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quiz_questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of 4 options stored as JSON
    correct_answers JSONB NOT NULL, -- Array of correct answers stored as JSON
    hints JSONB, -- Array of hints stored as JSON
    difficulty VARCHAR(20) DEFAULT 'medium', -- Difficulty level
    topic VARCHAR(255), -- Topic of the question
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quizzes_level ON quizzes(level);
CREATE INDEX IF NOT EXISTS idx_quizzes_subject ON quizzes(subject);
CREATE INDEX IF NOT EXISTS idx_quizzes_year ON quizzes(year);
CREATE INDEX IF NOT EXISTS idx_quizzes_status ON quizzes(status);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);

-- Add updated_at trigger for quizzes table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_quizzes_updated_at
    BEFORE UPDATE ON quizzes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
