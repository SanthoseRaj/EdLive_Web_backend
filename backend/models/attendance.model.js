import pool from "../db/connectDB-pg.js";

const getByClassAndDate = async (classId, date) => {
    const result = await pool.query(
        `SELECT s.id student_id,s.full_name,s.class_id,a.id,coalesce(a.date,$2) date,coalesce(is_present_morning,false) is_present_morning,coalesce(is_present_afternoon,false) is_present_afternoon,marked_by_morning,marked_by_afternoon 
       FROM students s
       left JOIN attendance a ON a.student_id = s.id
       WHERE s.class_id = $1 AND coalesce(a.date,$2) = $2`,
        [classId, date]
    );
    return result.rows;
}

const getByStudentAndDate = async (studentId, date) => {
    const result = await pool.query(
        `SELECT s.id student_id,s.full_name,s.class_id,a.id,coalesce(a.date,$2) date,coalesce(is_present_morning,false) is_present_morning,coalesce(is_present_afternoon,false) is_present_afternoon,marked_by_morning,marked_by_afternoon 
       FROM students s
        JOIN attendance a ON a.student_id = s.id
       WHERE s.id = $1 AND coalesce(a.date,$2) = $2`,
        [studentId, date]
    );
    return result.rows;
}

const toggleAttendance= async ({ studentId, date, session, isPresent, markedById }) => {
  const column = session === 'morning' ? 'is_present_morning' : 'is_present_afternoon';
  const markedColumn = session === 'morning' ? 'marked_by_morning' : 'marked_by_afternoon';

  const result = await pool.query(
    `UPDATE attendance
     SET ${column} = $1,
         ${markedColumn} = $2
     WHERE student_id = $3 AND date = $4
     RETURNING *`,
    [isPresent, markedById, studentId, date]
  );

  return result.rows[0];
};
const createIfNotExists= async ({ studentId, classId, date }) => {
    await pool.query(
      `INSERT INTO attendance (student_id, class_id, date)
       VALUES ($1, $2, $3)
       ON CONFLICT (student_id, date) DO NOTHING`,
      [studentId, classId, date]
    );
  }
const getMonthlySummary= async (classId, startDate, endDate) => {
    const result = await pool.query(
      `
       SELECT
  s.id student_id,
  s.full_name,
  s.class_id,
  c.class AS class_name,

  COUNT(*) AS total_days,

  COUNT(*) FILTER (WHERE a.is_present_morning) AS present_morning,
  COUNT(*) FILTER (WHERE NOT a.is_present_morning) AS absent_morning,

  COUNT(*) FILTER (WHERE a.is_present_afternoon) AS present_afternoon,
  COUNT(*) FILTER (WHERE NOT a.is_present_afternoon) AS absent_afternoon,

   ROUND((COUNT(*) FILTER (WHERE a.is_present_morning) + COUNT(*) FILTER (WHERE a.is_present_afternoon))/2.0,2) AS total_present,
  ROUND((COUNT(*) FILTER (WHERE NOT a.is_present_morning) + COUNT(*) FILTER (WHERE NOT a.is_present_afternoon))/2.0,2) AS total_absent

FROM students s
JOIN classmaster c ON c.id = s.class_id
    JOIN attendance a ON s.id = a.student_id and c.id = a.class_id


      WHERE s.class_id = $1 AND date BETWEEN $2 AND $3
      GROUP BY s.id, s.full_name, s.class_id, c.class
      `,
      [classId, startDate, endDate]
    );
    return result.rows;
  }

const getMonthlyStudentSummary = async (studentId, startDate, endDate) => {
  const result = await pool.query(
    `
    SELECT
      s.id student_id,
      s.full_name,
      s.class_id,
      c.class AS class_name,
      date,
      COUNT(*) AS total_days,

      COUNT(*) FILTER (WHERE a.is_present_morning) AS present_morning,
      COUNT(*) FILTER (WHERE NOT a.is_present_morning) AS absent_morning,

      COUNT(*) FILTER (WHERE a.is_present_afternoon) AS present_afternoon,
      COUNT(*) FILTER (WHERE NOT a.is_present_afternoon) AS absent_afternoon,

      ROUND((COUNT(*) FILTER (WHERE a.is_present_morning) + COUNT(*) FILTER (WHERE a.is_present_afternoon)) / 2.0, 2) AS total_present,
      ROUND((COUNT(*) FILTER (WHERE NOT a.is_present_morning) + COUNT(*) FILTER (WHERE NOT a.is_present_afternoon)) / 2.0, 2) AS total_absent

    FROM students s
    JOIN classmaster c ON c.id = s.class_id
    JOIN attendance a ON s.id = a.student_id AND c.id = a.class_id

    WHERE s.id = $1 AND date BETWEEN $2 AND $3
    GROUP BY s.id, s.full_name, s.class_id, c.class, date
    ORDER BY date
    `,
    [studentId, startDate, endDate]
  );

  const rows = result.rows;

  const summary = {
    total_days: 0,
    present_morning: 0,
    absent_morning: 0,
    present_afternoon: 0,
    absent_afternoon: 0,
    total_present: 0.0,
    total_absent: 0.0,
    percentage: "0.00",
    daily_attendance: {}
  };

  for (const row of rows) {
    const dateStr = new Date(row.date).toISOString().split("T")[0];

    summary.total_days += Number(row.total_days);
    summary.present_morning += Number(row.present_morning);
    summary.absent_morning += Number(row.absent_morning);
    summary.present_afternoon += Number(row.present_afternoon);
    summary.absent_afternoon += Number(row.absent_afternoon);
    summary.total_present += parseFloat(row.total_present);
    summary.total_absent += parseFloat(row.total_absent);

    summary.daily_attendance[dateStr] = {
      morning_present: Number(row.present_morning) > 0,
      afternoon_present: Number(row.present_afternoon) > 0
    };
  }

  const totalSessions = summary.total_present + summary.total_absent;
  if (totalSessions > 0) {
    summary.percentage = ((summary.total_present / totalSessions) * 100).toFixed(2);
  }
  // Convert all numeric fields (except daily_attendance) to strings with formatting
  for (const key of Object.keys(summary)) {
    if (key !== 'daily_attendance' && key !== 'percentage') {
      summary[key] =
        typeof summary[key] === 'number'
          ? summary[key].toFixed(2).replace(/\.00$/, '') // Format nicely
          : summary[key];
    }
  }
  summary.percentage = parseFloat(summary.percentage).toFixed(2);
  return summary;
};

const getAdminAttendanceStats = async ({ classId, className, startDate, endDate }) => {
  let query = `
    SELECT
      COUNT(*) * 2 as total_possible_sessions,
      (COUNT(*) FILTER (WHERE is_present_morning) + COUNT(*) FILTER (WHERE is_present_afternoon)) as total_present_sessions
    FROM attendance a
    LEFT JOIN classmaster cm ON a.class_id = cm.id
    WHERE a.date BETWEEN $1 AND $2
  `;

  const params = [startDate, endDate];
  let paramCount = 2;

  if (classId) {
    // FIX: Use string_to_array to convert "1,2,3" string into an integer array
    // and use the ANY operator to match against it.
    query += ` AND a.class_id = ANY(string_to_array($${++paramCount}, ',')::int[])`;
    params.push(classId.toString()); // Ensure it's a string
  } else if (className) {
    query += ` AND cm.class = $${++paramCount}`;
    params.push(className);
  }

  const result = await pool.query(query, params);
  
  const row = result.rows[0];
  const total = parseInt(row.total_possible_sessions || 0);
  const present = parseInt(row.total_present_sessions || 0);
  
  return {
    percentage: total > 0 ? ((present / total) * 100).toFixed(2) : "0.00",
    total_sessions: total,
    total_present: present
  };
};


export {
    getByClassAndDate,
    getByStudentAndDate,
    toggleAttendance,
    createIfNotExists,
    getMonthlySummary,
  getMonthlyStudentSummary,
    getAdminAttendanceStats
}