import pool from "../db/connectDB-pg.js";

const achievementCreate =async({
  studentId, title, description, categoryId, 
  achievementDate, awardedBy, imageUrl,
  isVisible, classId, academicYearId
}) => {
    const query = `
    INSERT INTO achievements 
    (student_id, title, description, category, achievement_date, 
     awarded_by, evidence_url, visibility, class_id, academic_year)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *;
  `;
  const values = [
    studentId, title, description, categoryId, achievementDate,
    awardedBy, imageUrl, isVisible, classId, academicYearId
  ];
  const { rows } = await pool.query(query, values);
  return rows[0];
}
const achievementFindVisible = async (student_id, user_role,user_id)=>{
    let query = `
    SELECT a.*, s.full_name
    FROM achievements a
    JOIN students s ON a.student_id = s.id
  `;

  const conditions = [];
  const params = [];
  let paramCount = 0;

  if (user_role === 'Student') {
    // Student can see:
    // 1. Their own private achievements
    // 2. Class achievements (same class)
    // 3. School/public achievements
    conditions.push(`
      (a.visibility = 'private' AND a.student_id = $${++paramCount})
      OR (a.visibility = 'class' AND a.class_id in (select class_id from students where id= $${++paramCount}))
      OR (a.visibility IN ('school', 'public'))
    `);
    params.push(student_id, user_id);
  } 
  else if (user_role === 'Teacher') {
    // Teacher can see:
    // 1. Private achievements of their students (same class)
    // 2. Class achievements (same class)
    // 3. School/public achievements
    conditions.push(`
      (a.visibility = 'private' AND a.class_id in (select class_id from staff where user_id= $${++paramCount}))
      OR (a.visibility = 'class' AND a.class_id in (select class_id from staff where user_id= $${++paramCount}))
      OR (a.visibility IN ('school', 'public'))
    `);
    params.push(user_id, user_id);
  }
  // Admins see everything
  else if (user_role === 'admin') {
    // No conditions needed, will return all achievements
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' OR ');
  }

  query += ' ORDER BY a.achievement_date DESC';
  
  const { rows } = await pool.query(query, params);
  return rows;
}
const achievementApprove = async (id, approved_by) => {
    const query = `
      UPDATE achievements 
      SET approved = TRUE, approved_by = $1, approved_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [approved_by, id]);
    return rows[0];
}
const achievementDelete = async (id) => {
    const query = 'DELETE FROM achievements WHERE id = $1 RETURNING *';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
}

export {
    achievementCreate,
    achievementFindVisible,
    achievementApprove,
    achievementDelete
}