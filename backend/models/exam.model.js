import pool from "../db/connectDB-pg.js";

class ExamType {
  static async findAll() {
    const query = 'SELECT * FROM examtypemaster WHERE is_active = TRUE';
    const { rows } = await pool.query(query);
    return rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM examtypemaster WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
}

class Exam {
    static async create({ title, subject, exam_date, class_id, description, exam_type_id, created_by }) {
        const query = `
      INSERT INTO exams (title, subject, exam_date, class_id, description, exam_type_id, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
        const values = [title, subject, exam_date, class_id, description, exam_type_id, created_by];
        const { rows } = await pool.query(query, values);
        return rows[0];
  }
  static async findClassesByStudent(student_id) {
    const query = `
      SELECT class_id 
      FROM students 
      WHERE id = $1
    `;
    const { rows } = await pool.query(query, [student_id]);
    return rows[0].class_id??0;
  }
    static async findByClass(class_id) {
    const query = `
      SELECT e.*, et.exam_type 
      FROM exams e
      JOIN examtypemaster et ON e.exam_type_id = et.id
      WHERE e.class_id = $1 
      ORDER BY e.exam_date DESC
    `;
    const { rows } = await pool.query(query, [class_id]);
    return rows;
    }
    static async findUpcomingByClass(class_id) {
        const query = `
    SELECT e.*, et.exam_type
    FROM exams e
      JOIN examtypemaster et ON e.exam_type_id = et.id
      WHERE e.class_id = $1 AND exam_date > NOW()
      ORDER BY exam_date ASC`;
    const { rows } = await pool.query(query, [class_id]);
    return rows;
  }

  static async findPastByClass(class_id) {
      const query = `    
    SELECT e.*, et.exam_type
    FROM exams e
      JOIN examtypemaster et ON e.exam_type_id = et.id
      WHERE e.class_id = $1 AND exam_date <= NOW()
      ORDER BY exam_date DESC`;
    const { rows } = await pool.query(query, [class_id]);
    return rows;
  }

  static async findByTeacher(teacher_id) {
    const query = `
    SELECT e.*, et.exam_type
    FROM exams e
      JOIN examtypemaster et ON e.exam_type_id = et.id
      WHERE e.created_by = $1
      ORDER BY exam_date DESC`;
    const { rows } = await pool.query(query, [teacher_id]);
    return rows;
  }

  static async findById(id) {
    const query = `
    SELECT e.*, et.exam_type
    FROM exams e
      JOIN examtypemaster et ON e.exam_type_id = et.id
       WHERE e.id = $1`;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
  static async update(id, { title, subject, exam_date, class_id, description, exam_type_id }) {
  const query = `
    UPDATE exams 
    SET title = $1, 
        subject = $2, 
        exam_date = $3, 
        class_id = $4, 
        description = $5, 
        exam_type_id = $6,
        updated_at = NOW()
    WHERE id = $7
    RETURNING *;
  `;
  const values = [title, subject, exam_date, class_id, description, exam_type_id, id];
  const { rows } = await pool.query(query, values);
  return rows[0];
}

}
class ExamResult {
  static async create({
    exam_id,
    student_id,
    marks,
    percentage,
    grade,
    term,
    is_final,
    class_rank
  }) {
    const query = `
      INSERT INTO exam_results (
        exam_id, student_id, marks, 
        percentage, grade, term, is_final, class_rank
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const values = [
      exam_id,
      student_id,
      marks,
      percentage,
      grade,
      term,
      is_final,
      class_rank
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findByStudent(student_id) {
    const query = `
      SELECT 
        er.*, 
        e.title as exam_title, 
        e.subject,  -- Get subject from exams table
        e.exam_date, 
        et.exam_type
      FROM exam_results er
      JOIN exams e ON er.exam_id = e.id
      LEFT JOIN examtypemaster et ON e.exam_type_id = et.id
      WHERE er.student_id = $1
      ORDER BY 
        CASE WHEN er.term IS NOT NULL THEN 0 ELSE 1 END,
        er.term DESC,
        e.exam_date DESC;
    `;
    const { rows } = await pool.query(query, [student_id]);
    return rows;
  }

  static async findByExam(exam_id) {
    const query = `
      SELECT 
        er.*, 
        u.name as student_name, 
        et.exam_type,
        e.subject  -- Get subject from exams table
      FROM exam_results er
      JOIN users u ON er.student_id = u.id
      JOIN exams e ON er.exam_id = e.id
      LEFT JOIN examtypemaster et ON e.exam_type_id = et.id
      WHERE er.exam_id = $1
      ORDER BY u.name;
    `;
    const { rows } = await pool.query(query, [exam_id]);
    return rows;
  }

  static async getStudentTermResults(student_id) {
    const query = `
      SELECT 
        er.term,
        SUM(er.marks) as total_marks,
        AVG(er.percentage) as average_percentage,
        MAX(er.grade) as overall_grade,
        MAX(er.class_rank) as class_rank,
        e.subject  -- Get subject from exams table
      FROM exam_results er
      JOIN exams e ON er.exam_id = e.id
      WHERE er.student_id = $1 AND er.term IS NOT NULL
      GROUP BY er.term, e.subject
      ORDER BY er.term DESC;
    `;
    const { rows } = await pool.query(query, [student_id]);
    return rows;
  }
  static async findById(id) {
  const query = `
    SELECT 
      er.*,
      e.title as exam_title,
      e.subject,
      e.exam_date,
      et.exam_type,
      u.name as student_name
    FROM exam_results er
    JOIN exams e ON er.exam_id = e.id
    LEFT JOIN examtypemaster et ON e.exam_type_id = et.id
    JOIN users u ON er.student_id = u.id
    WHERE er.id = $1
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
}

static async update(id, {
  exam_id,
  student_id,
  marks,
  percentage,
  grade,
  term,
  is_final,
  class_rank
}) {
  const query = `
    UPDATE exam_results 
    SET 
      exam_id = $1,
      student_id = $2,
      marks = $3,
      percentage = $4,
      grade = $5,
      term = $6,
      is_final = $7,
      class_rank = $8,
      updated_at = NOW()
    WHERE id = $9
    RETURNING *;
  `;
  const values = [
    exam_id,
    student_id,
    marks,
    percentage,
    grade,
    term,
    is_final,
    class_rank,
    id
  ];
  const { rows } = await pool.query(query, values);
  return rows[0];
}

static async delete(id) {
  const query = 'DELETE FROM exam_results WHERE id = $1 RETURNING *';
  const { rows } = await pool.query(query, [id]);
  return rows[0];
  }
  
  // In class ExamResult
static async getAdminStats({ classId, className, startDate, endDate }) {
  let query = `
    SELECT 
      round(AVG(er.percentage),2) as average_percentage,
      COUNT(er.id) as total_records
    FROM exam_results er
    JOIN exams e ON er.exam_id = e.id
    LEFT JOIN classmaster cm ON e.class_id::int = cm.id
    WHERE 1=1
  `;
  
  const params = [];
  let paramCount = 0;

  // Filter by specific Class ID (Class + Section)
  if (classId) {
    query += ` AND e.class_id = $${++paramCount}`;
    params.push(classId);
  }
  // OR Filter by Class Name (All Sections)
  else if (className) {
    query += ` AND cm.class = $${++paramCount}`;
    params.push(className);
  }

  if (startDate) {
    query += ` AND e.exam_date >= $${++paramCount}`;
    params.push(startDate);
  }

  if (endDate) {
    query += ` AND e.exam_date <= $${++paramCount}`;
    params.push(endDate);
  }

  const { rows } = await pool.query(query, params);
  return rows[0];
}
}
export  { Exam, ExamType,ExamResult };