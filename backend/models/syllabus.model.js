import pool from "../db/connectDB-pg.js";

const createSyllabus = async ({ class_id, subject_id, term, academic_year, created_by }) => {
  const query = `
    INSERT INTO syllabus 
    (class_id, subject_id, term, academic_year, created_by)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const values = [class_id, subject_id, term, academic_year, created_by];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const addSyllabusItem = async ({ syllabus_id, title, description, sequence }) => {
  const query = `
    INSERT INTO syllabus_items 
    (syllabus_id, title, description, sequence)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [syllabus_id, title, description, sequence];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const getSyllabusByClassSubject = async (class_id, subject_id, academic_year) => {
  const query = `
    SELECT 
      s.id,
      s.term,
      s.academic_year,
      s.created_at,
      s.updated_at,
      json_agg(
        json_build_object(
          'id', si.id,
          'title', si.title,
          'description', si.description,
          'sequence', si.sequence
        ) ORDER BY si.sequence
      ) as items
    FROM syllabus s
    LEFT JOIN syllabus_items si ON s.id = si.syllabus_id
    WHERE s.class_id = $1 AND s.subject_id = $2 AND s.academic_year = $3
    GROUP BY s.id
    ORDER BY s.term;
  `;
  const { rows } = await pool.query(query, [class_id, subject_id, academic_year]);
  return rows;
};

const getClassSubjects = async (class_id) => {
  const query = `
    SELECT distinct
      sub.subject_id,
      sub.subject_name,
      sub.subject_code
    FROM subjects sub
    JOIN syllabus cs ON sub.subject_id = cs.subject_id
    WHERE cs.class_id = $1
    ORDER BY sub.subject_name;
  `;
  const { rows } = await pool.query(query, [class_id]);
  return rows;
};

const updateSyllabusItem = async (id, { title, description, sequence }) => {
  const query = `
    UPDATE syllabus_items
    SET 
      title = $1,
      description = $2,
      sequence = $3
    WHERE id = $4
    RETURNING *;
  `;
  const values = [title, description, sequence, id];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const deleteSyllabusItem = async (id) => {
  const query = `
    DELETE FROM syllabus_items
    WHERE id = $1
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

export {
  createSyllabus,
  addSyllabusItem,
  getSyllabusByClassSubject,
  getClassSubjects,
  updateSyllabusItem,
  deleteSyllabusItem
};