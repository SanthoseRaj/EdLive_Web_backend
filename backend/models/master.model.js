import pool from "../db/connectDB-pg.js";

const getAllStaff = async () => {
  const { rows } = await pool.query('SELECT * FROM staff ORDER BY id');
  return rows;
};
const getAllStudents = async () => {
  const { rows } = await pool.query('SELECT * FROM students ORDER BY id');
  return rows;
};

const getAllClasses = async () => {
  const { rows } = await pool.query('SELECT * FROM classmaster ORDER BY class, section');
  return rows;
};

const getClassById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM classmaster WHERE id = $1', [id]);
  return rows[0];
};

const createClass = async (classData) => {
  const { class: className, section } = classData;
  const { rows } = await pool.query(
    'INSERT INTO classmaster (class, section) VALUES ($1, $2) RETURNING *',
    [className, section]
  );
  return rows[0];
};

const updateClass = async (id, classData) => {
  const { class: className, section } = classData;
  const { rows } = await pool.query(
    'UPDATE classmaster SET class = $1, section = $2 WHERE id = $3 RETURNING *',
    [className, section, id]
  );
  return rows[0];
};

const deleteClass = async (id) => {
  const { rows } = await pool.query('DELETE FROM classmaster WHERE id = $1 RETURNING *', [id]);
  return rows[0];
};

const getAllSubjects = async () => {
    const { rows } = await pool.query('SELECT * FROM subjects ORDER BY subject_name');
    return rows;
  };
  
  const getSubjectById = async (id) => {
    const { rows } = await pool.query('SELECT * FROM subjects WHERE subject_id = $1', [id]);
    return rows[0];
  };
  
  const createSubject = async (subjectData) => {
    const {
      subject_code,
      subject_name,
      short_name,
      description,
      category,
      grade_levels,
      credit_value,
      weekly_periods,
      department_id,
      is_active
    } = subjectData;
    
    const { rows } = await pool.query(
      `INSERT INTO subjects (
        subject_code, subject_name, short_name, description, category, 
        grade_levels, credit_value, weekly_periods, department_id, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        subject_code, subject_name, short_name, description, category,
        grade_levels, credit_value, weekly_periods, department_id, is_active
      ]
    );
    return rows[0];
  };
  
  const updateSubject = async (id, subjectData) => {
    const {
      subject_code,
      subject_name,
      short_name,
      description,
      category,
      grade_levels,
      credit_value,
      weekly_periods,
      department_id,
      is_active
    } = subjectData;
    
    const { rows } = await pool.query(
      `UPDATE subjects SET 
        subject_code = $1, subject_name = $2, short_name = $3, description = $4, 
        category = $5, grade_levels = $6, credit_value = $7, weekly_periods = $8, 
        department_id = $9, is_active = $10, updated_at = CURRENT_TIMESTAMP
      WHERE subject_id = $11 RETURNING *`,
      [
        subject_code, subject_name, short_name, description, category,
        grade_levels, credit_value, weekly_periods, department_id, is_active, id
      ]
    );
    return rows[0];
  };
  
  const deleteSubject = async (id) => {
    const { rows } = await pool.query('DELETE FROM subjects WHERE subject_id = $1 RETURNING *', [id]);
    return rows[0];
  };

  const getAllPeriods = async () => {
    const { rows } = await pool.query('SELECT *, EXTRACT(EPOCH FROM (timeout - timein)) / 60 AS duration_minutes FROM periodmaster ORDER BY timein');
    return rows;
  };
  
  const getPeriodById = async (id) => {
    const { rows } = await pool.query('SELECT *, EXTRACT(EPOCH FROM (timeout - timein)) / 60 AS duration_minutes FROM periodmaster WHERE periodid = $1', [id]);
    return rows[0];
  };
  
  const createPeriod = async (periodData) => {
    const { periodname, timein, timeout } = periodData;
    const { rows } = await pool.query(
      'INSERT INTO periodmaster (periodname, timein, timeout) VALUES ($1, $2, $3) RETURNING *',
      [periodname, timein, timeout]
    );
    return rows[0];
  };
  
  const updatePeriod = async (id, periodData) => {
    const { periodname, timein, timeout } = periodData;
    const { rows } = await pool.query(
      'UPDATE periodmaster SET periodname = $1, timein = $2, timeout = $3 WHERE periodid = $4 RETURNING *',
      [periodname, timein, timeout, id]
    );
    return rows[0];
  };
  
  const deletePeriod = async (id) => {
    const { rows } = await pool.query('DELETE FROM periodmaster WHERE periodid = $1 RETURNING *', [id]);
    return rows[0];
};
  
const getSubjectTeacherAllocations = async (subjectId) => {
  const query = `
    WITH StaffDegrees AS (
      SELECT staff_id, STRING_AGG(DISTINCT degree, ', ') as degrees
      FROM staff_education
      GROUP BY staff_id
    )
    SELECT 
      c.full_name as teacher_name, 
      sd.degrees as degree, 
      b.subject_name, 
      d.class, 
      d.section,
      CONCAT_WS(', ',
        CASE WHEN pm1.periodid IS NOT NULL THEN 'Mon ' || TO_CHAR(pm1.timein, 'HH12:MI AM') || '-' || TO_CHAR(pm1.timeout, 'HH12:MI AM') END,
        CASE WHEN pm2.periodid IS NOT NULL THEN 'Tue ' || TO_CHAR(pm2.timein, 'HH12:MI AM') || '-' || TO_CHAR(pm2.timeout, 'HH12:MI AM') END,
        CASE WHEN pm3.periodid IS NOT NULL THEN 'Wed ' || TO_CHAR(pm3.timein, 'HH12:MI AM') || '-' || TO_CHAR(pm3.timeout, 'HH12:MI AM') END,
        CASE WHEN pm4.periodid IS NOT NULL THEN 'Thu ' || TO_CHAR(pm4.timein, 'HH12:MI AM') || '-' || TO_CHAR(pm4.timeout, 'HH12:MI AM') END,
        CASE WHEN pm5.periodid IS NOT NULL THEN 'Fri ' || TO_CHAR(pm5.timein, 'HH12:MI AM') || '-' || TO_CHAR(pm5.timeout, 'HH12:MI AM') END,
        CASE WHEN pm6.periodid IS NOT NULL THEN 'Sat ' || TO_CHAR(pm6.timein, 'HH12:MI AM') || '-' || TO_CHAR(pm6.timeout, 'HH12:MI AM') END
      ) as schedule
    FROM timetable a
    JOIN subjects b ON a.subject_id = b.subject_id
    JOIN staff c ON a.staff_id = c.id
    JOIN classmaster d ON a.class_id = d.id
    LEFT JOIN StaffDegrees sd ON c.id = sd.staff_id
    LEFT JOIN periodmaster pm1 ON a.monday = pm1.periodid
    LEFT JOIN periodmaster pm2 ON a.tuesday = pm2.periodid
    LEFT JOIN periodmaster pm3 ON a.wednesday = pm3.periodid
    LEFT JOIN periodmaster pm4 ON a.thursday = pm4.periodid
    LEFT JOIN periodmaster pm5 ON a.friday = pm5.periodid
    LEFT JOIN periodmaster pm6 ON a.saturday = pm6.periodid
    WHERE a.subject_id = $1
  `;
  
  const { rows } = await pool.query(query, [subjectId]);
  return rows;
};


export {
  getAllStaff,
  getAllStudents,
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  getAllPeriods,
  getPeriodById,
  createPeriod,
  updatePeriod,
  deletePeriod,
  getSubjectTeacherAllocations,
};

