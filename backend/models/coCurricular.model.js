import pool from "../db/connectDB-pg.js";

// Get all activity categories
const getCategories = async () => {
  const query = 'SELECT * FROM co_curricular_categories ORDER BY name';
  const { rows } = await pool.query(query);
  return rows;
};

// Get activities by category
const getActivitiesByCategory = async (categoryId) => {
  const query = `
    SELECT * FROM co_curricular_activities 
    WHERE category_id = $1 AND is_active = true 
    ORDER BY name
  `;
  const { rows } = await pool.query(query, [categoryId]);
  return rows;
};

// Get all activities
const getAllActivities = async () => {
  const query = `
    SELECT a.*, c.name as category_name 
    FROM co_curricular_activities a
    JOIN co_curricular_categories c ON a.category_id = c.id
    WHERE a.is_active = true
    ORDER BY c.name, a.name
  `;
  const { rows } = await pool.query(query);
  return rows;
};

// Get student activities
const getStudentActivities = async (studentId, academicYear = null) => {
  let query = `
    SELECT sa.*, 
           a.name as activity_name, 
           c.name as category_name,
           cm.class || ' - ' || cm.section as class_name,
           u.username as student_name
    FROM student_activities sa
    JOIN co_curricular_activities a ON sa.activity_id = a.id
    JOIN co_curricular_categories c ON a.category_id = c.id
    JOIN classmaster cm ON sa.class_id = cm.id
    JOIN users u ON sa.student_id = u.id
    WHERE sa.student_id = $1
  `;
  
  const params = [studentId];
  
  if (academicYear) {
    query += ' AND sa.academic_year = $2';
    params.push(academicYear);
  }
  
  query += ' ORDER BY sa.created_at DESC';
  
  const { rows } = await pool.query(query, params);
  return rows;
};

// Enroll student in activity
const enrollStudent = async (studentId, activityId, classId, categoryId, remarks,academicYear) => {
  const query = `
    INSERT INTO student_activities 
    (student_id, activity_id, class_id, category_id, remarks, academic_year)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (student_id, activity_id, academic_year)
    DO UPDATE SET
      class_id = EXCLUDED.class_id,
      category_id = EXCLUDED.category_id,
      remarks = EXCLUDED.remarks
    RETURNING *
  `;
  const values = [studentId, activityId, classId, categoryId, remarks,academicYear];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

// Remove student from activity
const removeStudentActivity = async (id, studentId) => {
  const query = `
    DELETE FROM student_activities 
    WHERE id = $1 AND student_id = $2
    RETURNING *
  `;
  const { rows } = await pool.query(query, [id, studentId]);
  return rows[0];
};

// Update student activity
const updateStudentActivity = async (id, updates) => {
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
    UPDATE student_activities 
    SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${paramCount + 1}
    RETURNING *
  `;

  const { rows } = await pool.query(query, values);
  return rows[0];
};

// Get activity enrollment statistics
const getEnrollmentStats = async (classId = null, academicYear = null) => {
  let query = `
    SELECT 
      a.name as activity_name,
      c.name as category_name,
      COUNT(sa.id) as enrollment_count,
      cm.class || ' - ' || cm.section as class_name
    FROM co_curricular_activities a
    JOIN co_curricular_categories c ON a.category_id = c.id
    LEFT JOIN student_activities sa ON a.id = sa.activity_id
    LEFT JOIN classmaster cm ON sa.class_id = cm.id
    WHERE sa.status = 'active'
  `;
  
  const params = [];
  let paramCount = 0;
  
  if (classId) {
    query += ` AND sa.class_id = $${++paramCount}`;
    params.push(classId);
  }
  
  if (academicYear) {
    query += ` AND sa.academic_year = $${++paramCount}`;
    params.push(academicYear);
  }
  
  query += ' GROUP BY a.name, c.name, cm.class, cm.section ORDER BY c.name, a.name';
  
  const { rows } = await pool.query(query, params);
  return rows;
};

export const createEvent = async (data) => {
  const eventName = data.event_name ?? data.eventName;
  const startDate = data.start_date ?? data.startDate;
  const endDate = data.end_date ?? data.endDate;
  const categoryId = data.category_id ?? data.categoryId;
  const activityId = data.activity_id ?? data.activityId;
  const staffId = data.staff_id ?? data.staffId;
  const classId = data.class_id ?? data.classId;
  const remarks = data.remarks ?? null;

  const q = `
    INSERT INTO co_curricular_events
    (event_name, start_date, end_date, category_id, activity_id, staff_id, class_id, remarks)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *
  `;
  const v = [eventName, startDate, endDate, categoryId, activityId, staffId, classId, remarks];
  return (await pool.query(q, v)).rows[0];
};

export const getEvents = async () => {
  return (
    await pool.query(`
      SELECT e.*, c.name category_name, a.name activity_name
      FROM co_curricular_events e
      LEFT JOIN co_curricular_categories c ON c.id = e.category_id
      LEFT JOIN co_curricular_activities a ON a.id = e.activity_id
      ORDER BY e.start_date DESC
    `)
  ).rows;
};

export const addParticipants = async (eventId, studentIds) => {
  const values = studentIds.map(sid => `(${eventId}, ${sid})`).join(",");
  await pool.query(`
    INSERT INTO event_participants (event_id, student_id)
    VALUES ${values}
    ON CONFLICT DO NOTHING
  `);
};

export const saveAttendance = async (eventId, records) => {
  const queries = records.map(r => pool.query(
    `
    INSERT INTO event_attendance
    (event_id, student_id, attendance_date, status)
    VALUES ($1,$2,$3,$4)
    ON CONFLICT (event_id, student_id, attendance_date)
    DO UPDATE SET status = EXCLUDED.status
    `,
    [eventId, r.studentId, r.date, r.status]
  ));
  await Promise.all(queries);
};

export const getAttendance = async (eventId) => {
  return (
    await pool.query(
      `
      SELECT ea.*, u.full_name
      FROM event_attendance ea
      JOIN students u ON u.id = ea.student_id
      WHERE event_id = $1
      `,
      [eventId]
    )
  ).rows;
};

export const getEventParticipants = async (eventId) => {
  return (
    await pool.query(
      `
      SELECT s.id, s.full_name
      FROM event_participants ep
      JOIN students s ON s.id = ep.student_id
      WHERE ep.event_id = $1
      ORDER BY s.full_name
      `,
      [eventId]
    )
  ).rows;
};

const getEventParticipationStats = async ({
  classId,
  className,
  startDate,
  endDate,
  academicYear
}) => {

  let query = `
    SELECT 
      COUNT(DISTINCT ep.student_id) AS participating_count,
      COUNT(DISTINCT s.id) AS total_students
    FROM students s
    LEFT JOIN event_participants ep ON ep.student_id = s.id
    LEFT JOIN co_curricular_events e ON e.id = ep.event_id
    LEFT JOIN classmaster cm ON s.class_id = cm.id
    WHERE 1=1
  `;

  const params = [];
  let paramCount = 0;

  // 🔹 Filter by classId (multiple allowed)
  if (classId) {
    query += ` AND s.class_id = ANY(string_to_array($${++paramCount}, ',')::int[])`;
    params.push(classId.toString());
  }

  // 🔹 Filter by className
  else if (className) {
    query += ` AND cm.class = ANY(string_to_array($${++paramCount}, ',')::varchar[])`;
    params.push(className.toString());
  }

  // 🔹 Filter by academic year
  if (academicYear) {
    query += ` AND e.academic_year = $${++paramCount}`;
    params.push(academicYear);
  }

  // 🔹 Filter by date range
  if (startDate) {
    query += ` AND e.start_date >= $${++paramCount}`;
    params.push(startDate);
  }

  if (endDate) {
    query += ` AND e.start_date <= $${++paramCount}`;
    params.push(endDate);
  }

  console.log("Event Stats Query:", query);
  console.log("Params:", params);

  const { rows } = await pool.query(query, params);

  const participating = Number(rows[0]?.participating_count || 0);
  const total = Number(rows[0]?.total_students || 0);

  const percentage =
    total > 0 ? ((participating / total) * 100).toFixed(2) : 0;

  return {
    participating_count: participating,
    total_students: total,
    participation_percentage: percentage
  };
};


export {
  getCategories,
  getActivitiesByCategory,
  getAllActivities,
  getStudentActivities,
  enrollStudent,
  removeStudentActivity,
  updateStudentActivity,
  getEnrollmentStats,
  getEventParticipationStats
};
