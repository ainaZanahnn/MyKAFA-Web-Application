/** @format */
import pool from "../config/db";

/* -------------------------------------------------------------------
   INTERFACES
------------------------------------------------------------------- */
export interface MergedProgress {
  user_id: number;
  lesson_id: number;
  lesson_completed?: boolean;
  quiz_passed?: boolean;
  quiz_score?: number;
  materials_viewed?: number[];
  last_activity?: Date;
  topic_progress?: number; // 0-100 based on materials + quiz
  total_materials?: number;
  viewed_materials?: number;
  subject?: string;
  topic?: string;
  year?: number;
}

/* -------------------------------------------------------------------
   GET ALL MERGED PROGRESS FOR USER
------------------------------------------------------------------- */
export const getMergedUserProgress = async (user_id: number) => {
  // First, ensure all published lessons have progress records for this user
  await ensureAllLessonsHaveProgress(user_id);

  const lessons = await pool.query(
    `SELECT sp.*, l.subject, l.title as topic, l.year_level
     FROM student_progress sp
     JOIN lessons l ON sp.lesson_id = l.id
     WHERE sp.user_id = $1
     ORDER BY l.year_level, l.subject, l.lesson_order`,
    [user_id]
  );
  const quizzes = await pool.query(
    `SELECT sqp.*, q.year, q.subject, q.topic
     FROM student_quiz_progress sqp
     JOIN quizzes q ON sqp.quiz_id = q.id
     WHERE sqp.user_id = $1
     ORDER BY q.year, q.subject, q.topic`,
    [user_id]
  );

  // Get material counts for each lesson
  const materialCounts = await pool.query(`
    SELECT l.id, l.title, l.subject, l.year_level, COUNT(lm.id) as material_count
    FROM lessons l
    LEFT JOIN lesson_materials lm ON l.id = lm.lesson_id
    WHERE l.status = 'published'
    GROUP BY l.id, l.title, l.subject, l.year_level
  `);

  // Merge lesson + quiz + material counts
  const merged: any[] = lessons.rows.map((lesson: any) => {
    // Extract year number from year_level (e.g., "Year 1" -> 1)
    const yearMatch = lesson.year_level.match(/(\d+)/);
    const year = yearMatch ? parseInt(yearMatch[1]) : 1;

    const quiz = quizzes.rows.find(
      (q: any) =>
        q.year === year &&
        q.subject === lesson.subject &&
        q.topic === lesson.topic
    );

    // Find material count for this lesson
    const materialCount = materialCounts.rows.find(
      (mc: any) => mc.id === lesson.lesson_id
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
      year: year,
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
    `SELECT id, subject, title, year_level FROM lessons WHERE status = 'published' ORDER BY year_level, subject, lesson_order`
  );

  // Ensure progress records exist for each lesson
  for (const lesson of publishedLessons.rows) {
    // Check if lesson progress already exists
    const existingLessonProgress = await pool.query(
      `SELECT id FROM student_progress WHERE user_id = $1 AND lesson_id = $2`,
      [user_id, lesson.id]
    );

    if (existingLessonProgress.rows.length === 0) {
      await pool.query(
        `INSERT INTO student_progress
         (user_id, lesson_id, lesson_completed, materials_viewed)
         VALUES ($1, $2, false, '[]')`,
        [user_id, lesson.id]
      );
    }

    // Find corresponding quiz for this lesson
    const quiz = await pool.query(
      `SELECT id FROM quizzes WHERE year = $1 AND subject = $2 AND topic = $3`,
      [parseInt(lesson.year_level.match(/(\d+)/)?.[1] || '1'), lesson.subject, lesson.title]
    );

    if (quiz.rows.length > 0) {
      // Check if quiz progress already exists
      const existingQuizProgress = await pool.query(
        `SELECT id FROM student_quiz_progress WHERE user_id = $1 AND quiz_id = $2`,
        [user_id, quiz.rows[0].id]
      );

      if (existingQuizProgress.rows.length === 0) {
        await pool.query(
          `INSERT INTO student_quiz_progress
           (user_id, quiz_id, total_attempts, best_score, last_score, passed, created_at)
           VALUES ($1, $2, 0, 0, 0, false, NOW())`,
          [user_id, quiz.rows[0].id]
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
  // Find lesson_id from year, subject, topic
  const lesson = await pool.query(
    `SELECT id FROM lessons WHERE year_level = $1 AND subject = $2 AND title = $3`,
    [`Year ${year}`, subject, topic]
  );

  if (lesson.rows.length === 0) {
    throw new Error('Lesson not found');
  }

  await pool.query(
    `UPDATE student_progress
     SET lesson_completed = true, updated_at = NOW()
     WHERE user_id = $1 AND lesson_id = $2`,
    [user_id, lesson.rows[0].id]
  );

  return getMergedUserProgress(user_id);
};

/* -------------------------------------------------------------------
   UPDATE QUIZ PROGRESS
------------------------------------------------------------------- */
export const updateQuizProgress = async (
  user_id: number,
  quiz_id: number,
  score: number,
  passed: boolean
) => {
  const quiz = await pool.query(
    `SELECT * FROM student_quiz_progress
     WHERE user_id = $1 AND quiz_id = $2`,
    [user_id, quiz_id]
  );

  if (quiz.rows.length) {
    await pool.query(
      `UPDATE student_quiz_progress
       SET last_score = $1,
           best_score = GREATEST(best_score, $1),
           passed = $2,
           total_attempts = total_attempts + 1,
           last_activity = NOW()
       WHERE id = $3`,
      [score, passed, quiz.rows[0].id]
    );
  } else {
    await pool.query(
      `INSERT INTO student_quiz_progress
       (user_id, quiz_id, total_attempts, best_score, last_score, passed, created_at)
       VALUES ($1, $2, 1, $3, $3, $4, NOW())`,
      [user_id, quiz_id, score, passed]
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
      // Find lesson_id from year, subject, topic
      const lesson = await pool.query(
        `SELECT id FROM lessons WHERE year_level = $1 AND subject = $2 AND title = $3`,
        [`Year ${year}`, subject, topic]
      );

      if (lesson.rows.length > 0) {
        // Check if progress already exists
        const existingProgress = await pool.query(
          `SELECT id FROM student_progress WHERE user_id = $1 AND lesson_id = $2`,
          [user_id, lesson.rows[0].id]
        );

        if (existingProgress.rows.length === 0) {
          await pool.query(
            `INSERT INTO student_progress
             (user_id, lesson_id, lesson_completed, materials_viewed)
             VALUES ($1, $2, false, '[]')`,
            [user_id, lesson.rows[0].id]
          );
        }

        // Find corresponding quiz
        const quiz = await pool.query(
          `SELECT id FROM quizzes WHERE year = $1 AND subject = $2 AND topic = $3`,
          [year, subject, topic]
        );

        if (quiz.rows.length > 0) {
          // Check if quiz progress already exists
          const existingQuizProgress = await pool.query(
            `SELECT id FROM student_quiz_progress WHERE user_id = $1 AND quiz_id = $2`,
            [user_id, quiz.rows[0].id]
          );

      if (existingQuizProgress.rows.length === 0) {
        await pool.query(
          `INSERT INTO student_quiz_progress
           (user_id, quiz_id, total_attempts, best_score, last_score, passed, created_at)
           VALUES ($1, $2, 0, 0, 0, false, NOW())`,
          [user_id, quiz.rows[0].id]
        );
      }
        }
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

  // Find lesson_id from year, subject, topic
  const lesson = await pool.query(
    `SELECT id FROM lessons WHERE year_level = $1 AND subject = $2 AND title = $3`,
    [`Year ${year}`, subject, topic]
  );

  if (lesson.rows.length === 0) {
    throw new Error('Lesson not found');
  }

  // Check if progress record exists, if not create it
  let currentProgress = await pool.query(
    `SELECT materials_viewed FROM student_progress
     WHERE user_id = $1 AND lesson_id = $2`,
    [user_id, lesson.rows[0].id]
  );

  if (currentProgress.rows.length === 0) {
    // Create the progress record if it doesn't exist
    await pool.query(
      `INSERT INTO student_progress
       (user_id, lesson_id, lesson_completed, materials_viewed)
       VALUES ($1, $2, false, '[]')`,
      [user_id, lesson.rows[0].id]
    );

    // Also create quiz progress if it doesn't exist
    const quiz = await pool.query(
      `SELECT id FROM quizzes WHERE year = $1 AND subject = $2 AND topic = $3`,
      [year, subject, topic]
    );

    if (quiz.rows.length > 0) {
      const existingQuizProgress = await pool.query(
        `SELECT id FROM student_quiz_progress WHERE user_id = $1 AND quiz_id = $2`,
        [user_id, quiz.rows[0].id]
      );

      if (existingQuizProgress.rows.length === 0) {
        await pool.query(
          `INSERT INTO student_quiz_progress
           (user_id, quiz_id, total_attempts, best_score, last_score, passed, created_at)
           VALUES ($1, $2, 0, 0, 0, false, NOW())`,
          [user_id, quiz.rows[0].id]
        );
      }
    }

    // Now fetch the newly created record
    currentProgress = await pool.query(
      `SELECT materials_viewed FROM student_progress
       WHERE user_id = $1 AND lesson_id = $2`,
      [user_id, lesson.rows[0].id]
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
     WHERE user_id = $2 AND lesson_id = $3`,
    [JSON.stringify(currentMaterials), user_id, lesson.rows[0].id]
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
  // Find lesson_id from year, subject, topic
  const lesson = await pool.query(
    `SELECT id FROM lessons WHERE year_level = $1 AND subject = $2 AND title = $3`,
    [`Year ${year}`, subject, topic]
  );

  if (lesson.rows.length === 0) {
    return [];
  }

  const result = await pool.query(
    `SELECT materials_viewed FROM student_progress
     WHERE user_id = $1 AND lesson_id = $2`,
    [user_id, lesson.rows[0].id]
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
