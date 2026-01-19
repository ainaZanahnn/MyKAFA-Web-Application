const pool = require('./src/config/db');

async function showAbilityCalculation() {
  try {
    // Get a sample user ID (first student)
    const userQuery = 'SELECT id FROM users WHERE role = \'student\' LIMIT 1';
    const userResult = await pool.query(userQuery);
    if (userResult.rows.length === 0) {
      console.log('No students found');
      return;
    }
    const userId = userResult.rows[0].id;
    console.log('Sample User ID:', userId);
    console.log('=====================================\n');

    // Show the raw data used in calculation
    const abilityQuery = `
      SELECT
        q.subject,
        q.year,
        AVG(qa.ability_estimate) as avg_ability,
        MAX(qa.ability_estimate) as max_ability,
        COUNT(*) as attempts_count
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      WHERE qa.user_id = $1
      GROUP BY q.subject, q.year
      ORDER BY q.year DESC, q.subject ASC
    `;
    const result = await pool.query(abilityQuery, [userId]);

    console.log('Raw Data from Database:');
    console.log('Subject | Year | Avg Ability | Max Ability | Attempts');
    console.log('--------|------|------------|------------|----------');

    let totalWeighted = 0;
    let totalAttempts = 0;
    let highestAbility = 0;

    result.rows.forEach(row => {
      const avg = parseFloat(row.avg_ability);
      const max = parseFloat(row.max_ability);
      const attempts = parseInt(row.attempts_count);

      console.log(`${row.subject.padEnd(8)} | ${row.year}    | ${avg.toFixed(3)}      | ${max.toFixed(3)}      | ${attempts}`);

      totalWeighted += avg * attempts;
      totalAttempts += attempts;
      highestAbility = Math.max(highestAbility, max);
    });

    console.log('\nCalculation Steps:');
    console.log('==================');
    console.log(`Total Weighted Sum: ${totalWeighted.toFixed(3)}`);
    console.log(`Total Attempts: ${totalAttempts}`);
    console.log(`Current Ability: ${totalAttempts > 0 ? (totalWeighted / totalAttempts).toFixed(3) : '0.500'}`);
    console.log(`Highest Ability: ${highestAbility.toFixed(3)}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

showAbilityCalculation();
