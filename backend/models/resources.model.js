import pool from "../db/connectDB-pg.js";

const resourceCreate = async ({
  title,
  description,
  webLinks,
  classId,
  subjectId,
  createdBy
}) => {
  const query = `
    INSERT INTO resources 
    (title, description, web_links, class_id, subject_id, created_by)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  const values = [
    title, 
    description, 
    webLinks || [], 
    classId, 
    subjectId, 
    createdBy
  ];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const resourceFindAll = async (filters = {}) => {
  let query = `
    SELECT r.*, 
           c.class ||' - '|| c.section as class_name,
           s.subject_name,
           u.username as created_by_name
    FROM resources r
    LEFT JOIN classmaster c ON r.class_id = c.id
    LEFT JOIN subjects s ON r.subject_id = s.subject_id
    LEFT JOIN users u ON r.created_by = u.id
    WHERE 1=1
  `;
  
  const conditions = [];
  const params = [];
  let paramCount = 0;

  // Apply filters
  if (filters.classId) {
    conditions.push(`r.class_id = $${++paramCount}`);
    params.push(filters.classId);
  }

  if (filters.subjectId) {
    conditions.push(`r.subject_id = $${++paramCount}`);
    params.push(filters.subjectId);
  }

  if (filters.createdBy) {
    conditions.push(`r.created_by = $${++paramCount}`);
    params.push(filters.createdBy);
  }

  if (conditions.length > 0) {
    query += ' AND ' + conditions.join(' AND ');
  }

  query += ' ORDER BY r.created_at DESC';

  const { rows } = await pool.query(query, params);
  return rows;
};

const resourceFindById = async (id) => {
  const query = `
    SELECT r.*, 
           c.class ||' - '|| c.section as class_name,
           s.subject_name,
           s.subject_id,
           u.username as created_by_name
    FROM resources r
    LEFT JOIN classmaster c ON r.class_id = c.id
    LEFT JOIN subjects s ON r.subject_id = s.subject_id
    LEFT JOIN users u ON r.created_by = u.id
    WHERE r.id = $1
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

const resourceUpdate = async (id, updates) => {
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
    UPDATE resources 
    SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${paramCount + 1}
    RETURNING *
  `;

  const { rows } = await pool.query(query, values);
  return rows[0];
};

const resourceDelete = async (id) => {
  const query = 'DELETE FROM resources WHERE id = $1 RETURNING *';
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

const getSubjects = async (classId = null) => {
  let query = `
    SELECT subject_id, subject_code, subject_name, short_name
    FROM subjects 
    WHERE is_active = true
  `;
  
  const params = [];
  
  if (classId) {
    query += ` AND (select class from classmaster where id=$1)::int = ANY(grade_levels)`;
    params.push(classId);
  }
  
  query += ' ORDER BY subject_name';
  
  const { rows } = await pool.query(query, params);
  return rows;
};

const getSubjectsByTeacher = async (teacherId) => {
  const query = `
    SELECT DISTINCT s.subject_id, s.subject_code, s.subject_name, s.short_name
    FROM timetable ss
    JOIN subjects s ON ss.subject_id = s.subject_id
	join staff st on ss.staff_id=st.id
    WHERE st.user_id = $1 AND s.is_active = true
    ORDER BY s.subject_name
  `;
  const { rows } = await pool.query(query, [teacherId]);
  return rows;
};

export {
  resourceCreate,
  resourceFindAll,
  resourceFindById,
  resourceUpdate,
  resourceDelete,
  getSubjects,
  getSubjectsByTeacher
};