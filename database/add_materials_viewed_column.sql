-- Add materials_viewed column to existing student_progress table
ALTER TABLE student_progress
ADD COLUMN IF NOT EXISTS materials_viewed INTEGER[] DEFAULT '{}';

-- Update existing records to have empty array if null
UPDATE student_progress
SET materials_viewed = '{}'
WHERE materials_viewed IS NULL;
