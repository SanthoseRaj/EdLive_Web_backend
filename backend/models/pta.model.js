import pool from "../db/connectDB-pg.js";

const createMeeting = async ({
  title,
  description,
  date,
  time,
  class_ids, // Now using class_ids instead of class names
  include_all_sections,
  created_by
}) => {
  const query = `
    INSERT INTO pta_meetings 
    (title, description, date, time, class_ids, include_all_sections, created_by)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;
  const values = [
    title,
    description,
    date,
    time,
    class_ids,
    include_all_sections,
    created_by
  ];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const getUpcomingMeetings = async () => {
  const query = `
    SELECT * FROM pta_meetings
    WHERE date >= CURRENT_DATE
    ORDER BY date, time;
  `;
  const { rows } = await pool.query(query);
  return rows;
};

const getMeetingHistory = async () => {
  const query = `
    SELECT * FROM pta_meetings
    WHERE date < CURRENT_DATE
    ORDER BY date DESC, time DESC;
  `;
  const { rows } = await pool.query(query);
  return rows;
};

const getPTAMembers = async () => {
  const query = `
    SELECT 
      m.id,
      m.position,
      u.fullname name,
      u.email,
      s.phone
    FROM pta_members m
    JOIN users u ON m.user_id = u.id join staff s on u.id=s.user_id
    ORDER BY 
      CASE m.position
        WHEN 'President' THEN 1
        WHEN 'Secretary' THEN 2
        ELSE 3
      END;
  `;
  const { rows } = await pool.query(query);
  return rows;
};

const getRecipientsForAnnouncement = async (class_ids, include_all_sections) => {
  let query = `
    SELECT 
      u.id,
      u.name,
      u.email,
      u.phone
    FROM users u
    JOIN students s ON u.id = s.user_id
    JOIN classmaster c ON s.class_id = c.id
    WHERE c.id = ANY($1::integer[])
  `;

  if (!include_all_sections) {
    query += ` AND c.section = s.section`;
  }

  const { rows } = await pool.query(query, [class_ids]);
  return rows;
};

const getMeetingDetails = async (meetingId) => {
  const query = `
    SELECT 
      m.title,
      m.description,
      to_char(m.date, 'DD, Mon YYYY') as date,
      to_char(m.time, 'HH12:MI AM') as time,
      array_agg(c.class || COALESCE('-' || c.section, '')) as classes
    FROM pta_meetings m
    JOIN classmaster c ON c.id = ANY(m.class_ids)
    WHERE m.id = $1
    GROUP BY m.id, m.title, m.description, m.date, m.time;
  `;
  const { rows } = await pool.query(query, [meetingId]);
  return rows[0];
};

const updateAnnouncementStatus = async (communicationId, channel, status) => {
  // Implementation depends on your communication tracking system
  // This would typically insert or update a record in a communications table
};

export {
  createMeeting,
  getUpcomingMeetings,
  getMeetingHistory,
  getPTAMembers,
  getRecipientsForAnnouncement,
  getMeetingDetails,
  updateAnnouncementStatus
};