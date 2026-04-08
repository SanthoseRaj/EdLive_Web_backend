import pool from "../db/connectDB-pg.js";

const stickyNoteCreate = async ({
  user_id,
  user_type,
  notes,
  color = 'yellow',
  position_x = 0,
  position_y = 0
}) => {
  const query = `
    INSERT INTO sticky_notes 
    (user_id, user_type, notes, color, position_x, position_y)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  const values = [user_id, user_type, notes, color, position_x, position_y];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const stickyNoteFindAll = async (filters = {}) => {
  let query = `
    SELECT sn.*,
           CASE 
             WHEN sn.user_type = 'Teacher' THEN s.full_name
             WHEN sn.user_type = 'Student' THEN stu.full_name
             ELSE u.fullname 
           END as user_name
    FROM sticky_notes sn
    LEFT JOIN users u ON sn.user_type NOT IN ('Teacher', 'Student') AND sn.user_id = u.id
    LEFT JOIN staff s ON sn.user_type = 'Teacher' AND sn.user_id = s.id
    LEFT JOIN students stu ON sn.user_type = 'Student' AND sn.user_id = stu.id
    WHERE 1=1
  `;
  
  const conditions = [];
  const params = [];
  let paramCount = 0;

  // Apply filters
  if (filters.user_id) {
    conditions.push(`sn.user_id = $${++paramCount}`);
    params.push(filters.user_id);
  }

  if (filters.user_type) {
    conditions.push(`sn.user_type = $${++paramCount}`);
    params.push(filters.user_type);
  }

  if (filters.is_archived !== undefined) {
    conditions.push(`sn.is_archived = $${++paramCount}`);
    params.push(filters.is_archived);
  }

  if (conditions.length > 0) {
    query += ' AND ' + conditions.join(' AND ');
  }

  query += ' ORDER BY sn.update_date DESC';

  const { rows } = await pool.query(query, params);
  return rows;
};

const stickyNoteFindById = async (id) => {
  const query = `
    SELECT sn.*,
           CASE 
             WHEN sn.user_type = 'Teacher' THEN s.full_name
             WHEN sn.user_type = 'Student' THEN stu.full_name
             ELSE u.fullname 
           END as user_name
    FROM sticky_notes sn
    LEFT JOIN users u ON sn.user_type NOT IN ('Teacher', 'Student') AND sn.user_id = u.id
    LEFT JOIN staff s ON sn.user_type = 'Teacher' AND sn.user_id = s.id
    LEFT JOIN students stu ON sn.user_type = 'Student' AND sn.user_id = stu.id
    WHERE sn.id = $1
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

const stickyNoteUpdate = async (id, updates) => {
  const allowedFields = ['notes', 'color', 'position_x', 'position_y', 'is_archived'];
  const fields = [];
  const values = [];
  let paramCount = 0;

  Object.keys(updates).forEach(key => {
    if (updates[key] !== undefined && allowedFields.includes(key)) {
      fields.push(`${key} = $${++paramCount}`);
      values.push(updates[key]);
    }
  });

  if (fields.length === 0) {
    throw new Error('No valid fields to update');
  }

  // Always update the update_date
  fields.push('update_date = CURRENT_TIMESTAMP');
  
  values.push(id);
  const query = `
    UPDATE sticky_notes 
    SET ${fields.join(', ')}
    WHERE id = $${paramCount + 1}
    RETURNING *
  `;

  const { rows } = await pool.query(query, values);
  return rows[0];
};

const stickyNoteDelete = async (id) => {
  const query = 'DELETE FROM sticky_notes WHERE id = $1 RETURNING *';
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

const stickyNoteArchive = async (id) => {
  const query = `
    UPDATE sticky_notes 
    SET is_archived = TRUE, update_date = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

const stickyNoteUnarchive = async (id) => {
  const query = `
    UPDATE sticky_notes 
    SET is_archived = FALSE, update_date = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

// Helper function to get the correct user ID based on user type
const getUserIdByUserType = async (userId, userType) => {
  if (userType === 'Teacher') {
    // Get staff ID from staff table using user ID
    const query = 'SELECT id FROM staff WHERE user_id = $1';
    const { rows } = await pool.query(query, [userId]);
    return rows[0]?.id || userId; // Fallback to user ID if not found
  } else if (userType === 'Student') {
    // Get student ID from students table using user ID
    const query = 'SELECT id FROM students WHERE user_id = $1';
    const { rows } = await pool.query(query, [userId]);
    return rows[0]?.id || userId; // Fallback to user ID if not found
  } else {
    // For admin, parent, etc. - use the user ID directly
    return userId;
  }
};

// Helper function to get user details for display
const getUserDisplayInfo = async (userId, userType) => {
  if (userType === 'Teacher') {
    const query = 'SELECT id, full_name as name FROM staff WHERE user_id = $1';
    const { rows } = await pool.query(query, [userId]);
    return rows[0] || { id: userId, name: 'Unknown Teacher' };
  } else if (userType === 'Student') {
    const query = 'SELECT id, full_name as name FROM students WHERE user_id = $1';
    const { rows } = await pool.query(query, [userId]);
    return rows[0] || { id: userId, name: 'Unknown Student' };
  } else {
    const query = 'SELECT id, fullname as name FROM users WHERE id = $1';
    const { rows } = await pool.query(query, [userId]);
    return rows[0] || { id: userId, name: 'Unknown User' };
  }
};

export {
  stickyNoteCreate,
  stickyNoteFindAll,
  stickyNoteFindById,
  stickyNoteUpdate,
  stickyNoteDelete,
  stickyNoteArchive,
  stickyNoteUnarchive,
  getUserIdByUserType,
  getUserDisplayInfo
};