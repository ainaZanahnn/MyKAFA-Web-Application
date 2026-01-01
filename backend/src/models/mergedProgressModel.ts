/** @format */
import pool from "../config/db";

/* -------------------------------------------------------------------
   INTERFACES
------------------------------------------------------------------- */
export interface MergedProgress {
  user_id: number;
  year: number;
  subject: string;
  topic: string;
  lesson_completed?: boolean;
  quiz_passed?: boolean;
  quiz_score?: number;
  materials_viewed?: number[];
  last_activity?: Date;
  topic_progress?: number; // 0-100 based on materials + quiz
  total_materials?: number;
  viewed_materials?: number;
}

/* -------------------------------------------------------------------
   GET ALL MERGED PROGRESS FOR USER
------------------------------------------------------------------- */
export const getMergedUserProgress = async (user_id: number) => {
  // First, ensure all published lessons have progress records for this user
  await ensureAllLessonsHaveProgress(user_id);

  const lessons = await pool.query(
    `SELECT * FROM student_progress WHERE user_id = $1 ORDER BY year, subject, topic`,
    [user_id]
  );
  const quizzes = await pool.query(
    `SELECT * FROM student_quiz_progress WHERE user_id = $1 ORDER BY year, subject, topic`,
    [user_id]
  );

  // Get material counts for each lesson
  const materialCounts = await pool.query(`
    SELECT l.title, l.subject, l.year_level, COUNT(lm.id) as material_count
    FROM lessons l
    LEFT JOIN lesson_materials lm ON l.id = lm.lesson_id
    WHERE l.status = 'published'
    GROUP BY l.id, l.title, l.subject, l.year_level
  `);

  // Merge lesson + quiz + material counts
  const merged: any[] = lessons.rows.map((lesson: any) => {
    const quiz = quizzes.rows.find(
      (q: any) =>
        q.year === lesson.year &&
        q.subject === lesson.subject &&
        q.topic === lesson.topic
    );

    // Find material count for this lesson
    const materialCount = materialCounts.rows.find(
      (mc: any) =>
        mc.title === lesson.topic &&
        mc.subject === lesson.subject &&
        mc.year_level === `Year ${lesson.year}`
    );

    const totalMaterials = materialCount?.material_count || 0;
    const viewedMaterials = lesson.materials_viewed?.length || 0;
    const quizPassed = quiz?.passed || false;
    const lessonCompleted = lesson.lesson_completed || false;

    // Calculate granular topic progress
    let topicProgress = 0;

    // Lesson progress based on materials viewed (max 50%)
    const lessonProgress = totalMaterials > 0 ? (viewedMaterials / totalMaterials) * 50 : 0;

    // Quiz progress (50% if passed)
    const quizProgress = quizPassed ? 50 : 0;

    topicProgress = Math.min(lessonProgress + quizProgress, 100);

    return {
      ...lesson,
      quiz_passed: quizPassed,
      quiz_score: quiz?.last_score || 0,
      topic_completed: lessonCompleted && quizPassed, // Keep for backward compatibility
      topic_progress: Math.round(topicProgress),
      total_materials: totalMaterials,
      viewed_materials: viewedMaterials,
    };
  });

  return merged;
};

/* -------------------------------------------------------------------
   ENSURE ALL PUBLISHED LESSONS HAVE PROGRESS RECORDS
------------------------------------------------------------------- */
export const ensureAllLessonsHaveProgress = async (user_id: number) => {
  // Get all published lessons
  const publishedLessons = await pool.query(
    `SELECT subject, title, year_level FROM lessons WHERE status = 'published' ORDER BY year_level, subject, lesson_order`
  );

  // Group lessons by year and subject
  const lessonsByYearSubject: { [key: string]: string[] } = {};

  publishedLessons.rows.forEach((lesson: any) => {
    // Extract year number from year_level (e.g., "Year 1" -> 1)
    const yearMatch = lesson.year_level.match(/(\d+)/);
    const year = yearMatch ? parseInt(yearMatch[1]) : 1;
    const subject = lesson.subject;
    const key = `${year}-${subject}`;

    if (!lessonsByYearSubject[key]) {
      lessonsByYearSubject[key] = [];
    }
    lessonsByYearSubject[key].push(lesson.title);
  });

  // Ensure progress records exist for each lesson
  for (const [key, topics] of Object.entries(lessonsByYearSubject)) {
    const [yearStr, subject] = key.split('-');
    const year = parseInt(yearStr);

    for (const topic of topics) {
      // Check if lesson progress already exists
      const existingLessonProgress = await pool.query(
        `SELECT id FROM student_progress WHERE user_id = $1 AND year = $2 AND subject = $3 AND topic = $4`,
        [user_id, year, subject, topic]
      );

      if (existingLessonProgress.rows.length === 0) {
        await pool.query(
          `INSERT INTO student_progress
           (user_id, year, subject, topic, lesson_completed, materials_viewed)
           VALUES ($1, $2, $3, $4, false, '[]')`,
          [user_id, year, subject, topic]
        );
      }

      // Check if quiz progress already exists
      const existingQuizProgress = await pool.query(
        `SELECT id FROM student_quiz_progress WHERE user_id = $1 AND year = $2 AND subject = $3 AND topic = $4`,
        [user_id, year, subject, topic]
      );

      if (existingQuizProgress.rows.length === 0) {
        await pool.query(
          `INSERT INTO student_quiz_progress
           (user_id, year, subject, topic, total_attempts, best_score, last_score, passed)
           VALUES ($1, $2, $3, $4, 0, 0, 0, false)`,
          [user_id, year, subject, topic]
        );
      }
    }
  }
};

/* -------------------------------------------------------------------
   COMPLETE LESSON TOPIC
------------------------------------------------------------------- */
export const completeLessonTopic = async (
  user_id: number,
  year: number,
  subject: string,
  topic: string
) => {
  await pool.query(
    `UPDATE student_progress
     SET lesson_completed = true, updated_at = NOW()
     WHERE user_id = $1 AND year = $2 AND subject = $3 AND topic = $4`,
    [user_id, year, subject, topic]
  );

  return getMergedUserProgress(user_id);
};

/* -------------------------------------------------------------------
   UPDATE QUIZ PROGRESS
------------------------------------------------------------------- */
export const updateQuizProgress = async (
  user_id: number,
  year: number,
  subject: string,
  topic: string,
  score: number,
  passed: boolean
) => {
  const quiz = await pool.query(
    `SELECT * FROM student_quiz_progress 
     WHERE user_id = $1 AND year = $2 AND subject = $3 AND topic = $4`,
    [user_id, year, subject, topic]
  );

  if (quiz.rows.length) {
    await pool.query(
      `UPDATE student_quiz_progress
       SET last_score = $1,
           passed = $2,
           total_attempts = total_attempts + 1,
           correct_attempts = correct_attempts + $3,
           last_activity = NOW()
       WHERE id = $4`,
      [score, passed, passed ? 1 : 0, quiz.rows[0].id]
    );
  } else {
    await pool.query(
      `INSERT INTO student_quiz_progress
       (user_id, year, subject, topic, total_attempts, best_score, last_score, passed)
       VALUES ($1, $2, $3, $4, 1, $5, $5, $6)`,
      [user_id, year, subject, topic, score, passed]
    );
  }

  return getMergedUserProgress(user_id);
};

/* -------------------------------------------------------------------
   INITIALIZE MERGED PROGRESS
------------------------------------------------------------------- */
export const initializeMergedProgress = async (
  user_id: number,
  registrationYear: number,
  totalYears = 6
) => {
  // Fetch all lessons from the database
  const lessons = await pool.query(
    `SELECT subject, title, year_level FROM lessons WHERE status = 'Published' ORDER BY year_level, subject, lesson_order`
  );

  // Group lessons by year and subject
  const lessonsByYearSubject: { [key: string]: string[] } = {};

  lessons.rows.forEach((lesson: any) => {
    // Extract year number from year_level (e.g., "Year 1" -> 1)
    const yearMatch = lesson.year_level.match(/(\d+)/);
    const year = yearMatch ? parseInt(yearMatch[1]) : 1;
    const subject = lesson.subject;
    const key = `${year}-${subject}`;

    if (!lessonsByYearSubject[key]) {
      lessonsByYearSubject[key] = [];
    }
    lessonsByYearSubject[key].push(lesson.title);
  });

  // Initialize progress for each lesson
  for (const [key, topics] of Object.entries(lessonsByYearSubject)) {
    const [yearStr, subject] = key.split('-');
    const year = parseInt(yearStr);

    for (const topic of topics) {
      // Check if progress already exists
      const existingProgress = await pool.query(
        `SELECT id FROM student_progress WHERE user_id = $1 AND year = $2 AND subject = $3 AND topic = $4`,
        [user_id, year, subject, topic]
      );

      if (existingProgress.rows.length === 0) {
        await pool.query(
          `INSERT INTO student_progress
           (user_id, year, subject, topic, lesson_completed)
           VALUES ($1, $2, $3, $4, false)`,
          [user_id, year, subject, topic]
        );
      }

      // Check if quiz progress already exists
      const existingQuizProgress = await pool.query(
        `SELECT id FROM student_quiz_progress WHERE user_id = $1 AND year = $2 AND subject = $3 AND topic = $4`,
        [user_id, year, subject, topic]
      );

      if (existingQuizProgress.rows.length === 0) {
        await pool.query(
          `INSERT INTO student_quiz_progress
           (user_id, year, subject, topic, passed)
           VALUES ($1, $2, $3, $4, false)`,
          [user_id, year, subject, topic]
        );
      }
    }
  }
};

/* -------------------------------------------------------------------
   MARK MATERIAL AS VIEWED
------------------------------------------------------------------- */
export const markMaterialViewed = async (
  user_id: number,
  year: number,
  subject: string,
  topic: string,
  materialId: number
) => {
  // Ensure progress record exists first
  await ensureAllLessonsHaveProgress(user_id);

  // Check if progress record exists, if not create it
  let currentProgress = await pool.query(
    `SELECT materials_viewed FROM student_progress
     WHERE user_id = $1 AND year = $2 AND subject = $3 AND topic = $4`,
    [user_id, year, subject, topic]
  );

  if (currentProgress.rows.length === 0) {
    // Create the progress record if it doesn't exist
    await pool.query(
      `INSERT INTO student_progress
       (user_id, year, subject, topic, lesson_completed, materials_viewed)
       VALUES ($1, $2, $3, $4, false, '[]')`,
      [user_id, year, subject, topic]
    );

    // Also create quiz progress if it doesn't exist
    const existingQuizProgress = await pool.query(
      `SELECT id FROM student_quiz_progress WHERE user_id = $1 AND year = $2 AND subject = $3 AND topic = $4`,
      [user_id, year, subject, topic]
    );

    if (existingQuizProgress.rows.length === 0) {
      await pool.query(
        `INSERT INTO student_quiz_progress
         (user_id, year, subject, topic, total_attempts, best_score, last_score, passed)
         VALUES ($1, $2, $3, $4, 0, 0, 0, false)`,
        [user_id, year, subject, topic]
      );
    }

    // Now fetch the newly created record
    currentProgress = await pool.query(
      `SELECT materials_viewed FROM student_progress
       WHERE user_id = $1 AND year = $2 AND subject = $3 AND topic = $4`,
      [user_id, year, subject, topic]
    );
  }

  const currentMaterials = currentProgress.rows[0].materials_viewed || [];

  // Add the material ID if not already present
  if (!currentMaterials.includes(materialId)) {
    currentMaterials.push(materialId);
  }

  // Update the database
  await pool.query(
    `UPDATE student_progress
     SET materials_viewed = $1, updated_at = NOW()
     WHERE user_id = $2 AND year = $3 AND subject = $4 AND topic = $5`,
    [JSON.stringify(currentMaterials), user_id, year, subject, topic]
  );

  return getMergedUserProgress(user_id);
};

/* -------------------------------------------------------------------
   GET MATERIAL PROGRESS
------------------------------------------------------------------- */
export const getMaterialProgress = async (
  user_id: number,
  year: number,
  subject: string,
  topic: string
) => {
  const result = await pool.query(
    `SELECT materials_viewed FROM student_progress
     WHERE user_id = $1 AND year = $2 AND subject = $3 AND topic = $4`,
    [user_id, year, subject, topic]
  );

  if (result.rows.length === 0) {
    return [];
  }

  return result.rows[0].materials_viewed || [];
};

/* -------------------------------------------------------------------
   GET CURRENT LEARNING YEAR
------------------------------------------------------------------- */
export const getCurrentMergedProgressYear = async (user_id: number) => {
  const progress = await getMergedUserProgress(user_id);

  for (let year = 1; year <= 6; year++) {
    const yearTopics = progress.filter((p) => p.year === year);
    const completedCount = yearTopics.filter((p) => p.topic_completed).length;
    const percentage = (completedCount / yearTopics.length) * 100;
    if (percentage < 90) return year;
  }

  return 6;
};
