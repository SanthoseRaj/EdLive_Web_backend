import pool from "../db/connectDB-pg.js";

const quickNoteCreate = async ({
  title,
  description,
  webLinks,
  studentIds,
  classId,
  createdBy
}) => {
  const query = `
    INSERT INTO quick_notes 
    (title, description, web_links, student_ids, class_id, created_by)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  const values = [
    title, 
    description, 
    webLinks || [], 
    studentIds || [], 
    classId, 
    createdBy
  ];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const quickNoteFindAll = async (filters = {}) => {
  let query = `
    SELECT qn.*, 
           c.class ||' - '|| c.section as class_name,
           u.username as created_by_name,
           ARRAY(
             SELECT s.full_name 
             FROM students s 
             WHERE s.id = ANY(qn.student_ids)
           ) as student_names
    FROM quick_notes qn
    LEFT JOIN classmaster c ON qn.class_id = c.id
    LEFT JOIN users u ON qn.created_by = u.id
    WHERE 1=1
  `;
  
  const conditions = [];
  const params = [];
  let paramCount = 0;

  // Apply filters
  if (filters.classId) {
    conditions.push(`qn.class_id = $${++paramCount}`);
    params.push(filters.classId);
  }

  if (filters.studentId) {
    conditions.push(`$${++paramCount} = ANY(qn.student_ids)`);
    params.push(filters.studentId);
  }

  if (filters.createdBy) {
    conditions.push(`qn.created_by = $${++paramCount}`);
    params.push(filters.createdBy);
  }

  if (conditions.length > 0) {
    query += ' AND ' + conditions.join(' AND ');
  }

  query += ' ORDER BY qn.created_at DESC';

  const { rows } = await pool.query(query, params);
  return rows;
};

const quickNoteFindById = async (id) => {
  const query = `
    SELECT qn.*, 
           c.class ||' - '|| c.section as class_name,
           u.username as created_by_name,
           ARRAY(
             SELECT json_build_object('id', s.id, 'name', s.full_name)
             FROM students s 
             WHERE s.id = ANY(qn.student_ids)
           ) as students
    FROM quick_notes qn
    LEFT JOIN classmaster c ON qn.class_id = c.id
    LEFT JOIN users u ON qn.created_by = u.id
    WHERE qn.id = $1
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

const quickNoteUpdate = async (id, updates) => {
  const fields = [];
  const values = [];
  let paramCount = 0;

  Object.keys(updates).forEach(key => {
    if (updates[key] !== undefined) {
      fields.push(`${key} = $${++paramCount}`);
      values.push(updates[key]);
    }
  });

  if (fields.length === 0) {
    throw new Error('No valid fields to update');
  }

  values.push(id);
  const query = `
    UPDATE quick_notes 
    SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${paramCount + 1}
    RETURNING *
  `;

  const { rows } = await pool.query(query, values);
  return rows[0];
};

const quickNoteDelete = async (id) => {
  const query = 'DELETE FROM quick_notes WHERE id = $1 RETURNING *';
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

const getClassesForTeacher = async (teacherId) => {
  const query = `
    select class_id id,b.class,b.section,b.class ||' - '|| b.section name from staff a,classmaster b where a.class_id=b.id and
    WHERE a_id = $1
    ORDER BY a.class_id
  `;
  const { rows } = await pool.query(query, [teacherId]);
  return rows;
};

const getStudentsByClass = async (classId) => {
  const query = `
    SELECT id, full_name 
    FROM students 
    WHERE class_id = $1 
    ORDER BY full_name
  `;
  const { rows } = await pool.query(query, [classId]);
  return rows;
};

const getStudentsByIds = async (studentIds) => {
  if (!studentIds || studentIds.length === 0) {
    return [];
  }
  
  const query = `
    SELECT id, full_name 
    FROM students 
    WHERE id = ANY($1)
    ORDER BY full_name
  `;
  const { rows } = await pool.query(query, [studentIds]);
  return rows;
};

export {
  quickNoteCreate,
  quickNoteFindAll,
  quickNoteFindById,
  quickNoteUpdate,
  quickNoteDelete,
  getClassesForTeacher,
  getStudentsByClass,
  getStudentsByIds
};