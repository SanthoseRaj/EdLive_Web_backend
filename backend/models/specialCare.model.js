import pool from "../db/connectDB-pg.js";

const specialCareCategoryCreate = async ({ name, description }) => {
  const query = `
    INSERT INTO special_care_categories (name, description)
    VALUES ($1, $2)
    RETURNING *;
  `;
  const values = [name, description];
  const { rows } = await pool.query(query, values);
  return rows[0];
}

const specialCareCategoryFindAll = async () => {
  const query = 'SELECT * FROM special_care_categories ORDER BY name;';
  const { rows } = await pool.query(query);
  return rows;
}

const specialCareCategoryFindById = async (id) => {
  const query = 'SELECT * FROM special_care_categories WHERE id = $1;';
  const { rows } = await pool.query(query, [id]);
  return rows[0];
}

const specialCareCategoryUpdate = async (id, { name, description }) => {
  const query = `
    UPDATE special_care_categories 
    SET name = $1, description = $2
    WHERE id = $3
    RETURNING *;
  `;
  const values = [name, description, id];
  const { rows } = await pool.query(query, values);
  return rows[0];
}

const specialCareCategoryDelete = async (id) => {
  const query = 'DELETE FROM special_care_categories WHERE id = $1 RETURNING *;';
  const { rows } = await pool.query(query, [id]);
  return rows[0];
}

const specialCareCreate = async ({
  studentIds, // Changed from studentId to studentIds (array)
  categoryId,
  title,
  description,
  careType,
  scheduleDetails,
  resources,
  assignedTo,
  status = 'active',
  startDate,
  endDate,
  visibility = 'private',
  createdBy
}) => {
  const query = `
    INSERT INTO special_care_items 
    (student_ids, category_id, title, description, care_type, schedule_details, 
     resources, assigned_to, status, start_date, end_date, visibility, created_by)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *;
  `;
  const values = [
    studentIds, // Now passing array of student IDs
    categoryId, 
    title, 
    description, 
    careType, 
    scheduleDetails,
    resources, 
    assignedTo, 
    status, 
    startDate, 
    endDate, 
    visibility, 
    createdBy
  ];
  const { rows } = await pool.query(query, values);
  return rows[0];
}

const specialCareFindVisible = async (user_id, user_role, class_id = null) => {
  let query = `
    SELECT 
      sci.*, 
      -- Get student names as an array
      ARRAY(
        SELECT s.full_name 
        FROM students s 
        WHERE s.id = ANY(sci.student_ids)
      ) as student_names,
      sc.name as category_name, 
      st.full_name as assigned_to_name
    FROM special_care_items sci
    JOIN special_care_categories sc ON sci.category_id = sc.id
    LEFT JOIN staff st ON sci.assigned_to = st.id
  `;

  const conditions = [];
  const params = [];
  let paramCount = 0;

  if (user_role === 'Student') {
    // Students can only see items that include their ID in the student_ids array
    conditions.push(`$${++paramCount} = ANY(sci.student_ids)`);
    params.push(user_id);
  } 
  else if (user_role === 'Teacher') {
    // Teachers can see:
    // 1. Items where ANY student in the array is in their class
    // 2. Items assigned to them
    
    // For class-based visibility, we need to check if any student in the array belongs to the class
    conditions.push(`
      (EXISTS (
        SELECT 1 FROM students s 
        WHERE s.id = ANY(sci.student_ids) 
        AND s.class_id = $${++paramCount}
      ) AND sci.visibility IN ('class', 'school'))
      OR sci.assigned_to = $${++paramCount}
    `);
    params.push(class_id, user_id);
  }
  // Admins see everything
  else if (user_role === 'admin') {
    // No conditions needed
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' OR ');
  }

  query += ' ORDER BY sci.created_at DESC';
  
  const { rows } = await pool.query(query, params);
  return rows;
}

const specialCareUpdate = async (id, updates) => {
  const fields = Object.keys(updates);
  const values = Object.values(updates);
  
  const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
  
  const query = `
    UPDATE special_care_items 
    SET ${setClause}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${fields.length + 1}
    RETURNING *;
  `;
  
  const { rows } = await pool.query(query, [...values, id]);
  return rows[0];
}

const specialCareDelete = async (id) => {
  const query = 'DELETE FROM special_care_items WHERE id = $1 RETURNING *';
  const { rows } = await pool.query(query, [id]);
  return rows[0];
}

const specialCareAddProgress = async (careItemId, notes, progressPercentage, resourcesAdded, updatedBy) => {
  const query = `
    INSERT INTO special_care_progress 
    (care_item_id, notes, progress_percentage, resources_added, updated_by)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const values = [careItemId, notes, progressPercentage, resourcesAdded, updatedBy];
  const { rows } = await pool.query(query, values);
  return rows[0];
}

const specialCareGetProgress = async (careItemId) => {
  const query = `
    SELECT scp.*, st.full_name as updated_by_name
    FROM special_care_progress scp
    JOIN staff st ON scp.updated_by = st.id
    WHERE scp.care_item_id = $1
    ORDER BY scp.created_at DESC;
  `;
  const { rows } = await pool.query(query, [careItemId]);
  return rows;
}

export {
  specialCareCategoryCreate,
  specialCareCategoryFindAll,
  specialCareCategoryFindById,
  specialCareCategoryUpdate,
  specialCareCategoryDelete,
  specialCareCreate,
  specialCareFindVisible,
  specialCareUpdate,
  specialCareDelete,
  specialCareAddProgress,
  specialCareGetProgress
};