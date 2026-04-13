import pool from "../db/connectDB-pg.js";

/**
 * Creates a new parent communication record
 * @param {Object} params
 * @param {number} params.student_id - Student ID
 * @param {number} params.sender_id - User ID of the sender
 * @param {string} params.message_type - Type of message (general, appreciation, etc.)
 * @param {string} params.message_text - The message content
 * @param {boolean} params.is_appreciation - Whether it's an appreciation message
 * @param {boolean} params.is_meeting_request - Whether it's a meeting request
 * @param {Date} [params.meeting_date] - Optional meeting date
 * @returns {Promise<Object>} The created communication record
 */
const createParentCommunication = async ({
  student_id,
  sender_id,
  message_type,
  message_text,
  is_appreciation,
  is_meeting_request,
  meeting_date
}) => {
  const query = `
    INSERT INTO parent_communications 
    (student_id, sender_id, message_type, message_text, 
     is_appreciation, is_meeting_request, meeting_date)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;
  const values = [
    student_id,
    sender_id,
    message_type,
    message_text,
    is_appreciation,
    is_meeting_request,
    meeting_date
  ];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

/**
 * Updates communication status for a specific channel
 * @param {number} id - Communication record ID
 * @param {string} channel - Channel to update (whatsapp, sms, email)
 * @param {string} status - New status (sent, delivered, failed)
 * @returns {Promise<Object>} Updated communication record
 */
const updateCommunicationStatus = async (id, channel, status) => {
  const column = `${channel}_status`;
  const query = `
    UPDATE parent_communications 
    SET ${column} = $1,
        updated_at = CURRENT_TIMESTAMP,
        sent_via = array_append(sent_via, $2::communication_channel)
    WHERE id = $3
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [status, channel, id]);
  return rows[0];
};

/**
 * Gets all communications for a specific student
 * @param {number} student_id - Student ID
 * @returns {Promise<Array>} List of communications
 */
const getCommunicationsByStudent = async (student_id) => {
  const query = `
    SELECT 
      pc.*,
      u.fullname as sender_name,
      s.full_name as student_name
    FROM parent_communications pc
    JOIN users u ON pc.sender_id = u.id
    JOIN students s ON pc.student_id = s.id
    WHERE pc.student_id = $1
    ORDER BY pc.created_at DESC;
  `;
  const { rows } = await pool.query(query, [student_id]);
  return rows;
};

/**
 * Gets all communications for a specific teacher
 * @param {number} sender_id - sender ID
 * @returns {Promise<Array>} List of communications
 */
const getCommunicationsBySender = async (sender_id) => {
  const query = `
    SELECT 
      pc.*,
      u.fullname as sender_name,
      s.full_name as student_name,
      CASE WHEN udv.id IS NULL THEN FALSE ELSE TRUE END as is_read
    FROM parent_communications pc
    JOIN users u ON pc.sender_id = u.id
    JOIN students s ON pc.student_id = s.id
    LEFT JOIN user_dashboard_views udv
      ON udv.user_id = $1
      AND udv.item_type = 'messages'
      AND udv.item_id = pc.id
    WHERE pc.sender_id = $1
    ORDER BY pc.created_at DESC;
  `;
  const { rows } = await pool.query(query, [sender_id]);
  return rows;
};

const markCommunicationAsViewed = async (userId, userType, communicationId) => {
  const query = `
    INSERT INTO user_dashboard_views (user_id, user_type, item_type, item_id, last_viewed)
    VALUES ($1, $2, 'messages', $3, CURRENT_TIMESTAMP)
    ON CONFLICT (user_id, item_type, item_id)
    DO UPDATE SET last_viewed = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [userId, userType, communicationId]);
  return rows[0];
};

export {
  createParentCommunication,
  updateCommunicationStatus,
  getCommunicationsByStudent,
  getCommunicationsBySender,
  markCommunicationAsViewed
};
