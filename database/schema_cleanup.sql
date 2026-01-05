-- =====================================================
-- SCHEMA CLEANUP MIGRATION
-- Remove redundant columns from normalized tables
-- =====================================================

-- STEP 1: Backup data before cleanup (optional but recommended)
-- This creates backup tables with current data

-- Backup student_weak_topics before cleanup
CREATE TABLE IF NOT EXISTS student_weak_topics_backup_pre_cleanup AS
SELECT * FROM student_weak_topics;

-- Backup student_quiz_progress before cleanup
CREATE TABLE IF NOT EXISTS student_quiz_progress_backup_pre_cleanup AS
SELECT * FROM student_quiz_progress;

-- =====================================================
-- CLEANUP 1: student_weak_topics table
-- Remove redundant year, subject, topic columns
-- =====================================================

-- First, verify that quiz_id FK is working and we can get the data from quizzes table
-- Check if all records have valid quiz_id references
SELECT COUNT(*) as total_records,
       COUNT(CASE WHEN swt.quiz_id IS NOT NULL THEN 1 END) as with_quiz_id,
       COUNT(CASE WHEN swt.quiz_id IS NULL THEN 1 END) as missing_quiz_id
FROM student_weak_topics swt;

-- If all records have quiz_id, proceed with cleanup
-- Remove redundant columns from student_weak_topics
ALTER TABLE student_weak_topics
DROP COLUMN IF EXISTS year,
DROP COLUMN IF EXISTS subject,
DROP COLUMN IF EXISTS topic;

-- =====================================================
-- CLEANUP 2: student_quiz_progress table
-- Remove redundant year, subject, topic columns
-- =====================================================

-- First, verify that quiz_id FK is working
SELECT COUNT(*) as total_records,
       COUNT(CASE WHEN sqp.quiz_id IS NOT NULL THEN 1 END) as with_quiz_id,
       COUNT(CASE WHEN sqp.quiz_id IS NULL THEN 1 END) as missing_quiz_id
FROM student_quiz_progress sqp;

-- If all records have quiz_id, proceed with cleanup
-- Remove redundant columns from student_quiz_progress
ALTER TABLE student_quiz_progress
DROP COLUMN IF EXISTS year,
DROP COLUMN IF EXISTS subject,
DROP COLUMN IF EXISTS topic;

-- =====================================================
-- CLEANUP 3: Remove old backup tables (optional)
-- =====================================================

-- Drop old backup tables if they're no longer needed
-- WARNING: Only run this after confirming the cleanup worked correctly
/*
DROP TABLE IF EXISTS student_progress_backup;
DROP TABLE IF EXISTS student_quiz_progress_backup;
DROP TABLE IF EXISTS student_weak_topics_backup;
*/

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify student_weak_topics cleanup
SELECT
    'student_weak_topics' as table_name,
    COUNT(*) as total_records,
    COUNT(quiz_id) as records_with_quiz_id,
    array_agg(DISTINCT column_name) as remaining_columns
FROM student_weak_topics
CROSS JOIN information_schema.columns
WHERE table_name = 'student_weak_topics'
    AND table_schema = 'public'
    AND column_name NOT IN ('id', 'user_id', 'quiz_id', 'weakness_score',
                           'last_updated', 'improvement_trend', 'remediation_attempts', 'created_at');

-- Verify student_quiz_progress cleanup
SELECT
    'student_quiz_progress' as table_name,
    COUNT(*) as total_records,
    COUNT(quiz_id) as records_with_quiz_id,
    array_agg(DISTINCT column_name) as remaining_columns
FROM student_quiz_progress
CROSS JOIN information_schema.columns
WHERE table_name = 'student_quiz_progress'
    AND table_schema = 'public'
    AND column_name NOT IN ('id', 'user_id', 'quiz_id', 'total_attempts', 'best_score',
                           'last_score', 'passed', 'last_activity', 'created_at');

-- =====================================================
-- TEST QUERIES (run after cleanup)
-- =====================================================

-- Test that we can still get quiz information through FK relationships
SELECT
    swt.id,
    swt.user_id,
    swt.quiz_id,
    q.year,
    q.subject,
    q.topic,
    swt.weakness_score,
    swt.last_updated
FROM student_weak_topics swt
JOIN quizzes q ON swt.quiz_id = q.id
LIMIT 5;

-- Test student_quiz_progress with quiz info
SELECT
    sqp.id,
    sqp.user_id,
    sqp.quiz_id,
    q.year,
    q.subject,
    q.topic,
    sqp.best_score,
    sqp.last_score,
    sqp.passed
FROM student_quiz_progress sqp
JOIN quizzes q ON sqp.quiz_id = q.id
LIMIT 5;
