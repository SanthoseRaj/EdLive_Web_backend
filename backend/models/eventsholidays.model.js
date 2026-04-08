import pool from "../db/connectDB-pg.js";

const createEventHoliday = async ({
  title,
  description,
  start_date,
  end_date,
    is_holiday,  
  holiday_type,
  is_recurring,
  recurrence_pattern,
  created_by
}) => {
  const query = `
    INSERT INTO events_holidays 
    (title, description, start_date, end_date, is_holiday, holiday_type,
     is_recurring, recurrence_pattern, created_by)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *;
  `;
  const values = [
    title,
    description,
    start_date,
    end_date || start_date, // Use start_date as end_date if not provided
      is_holiday,
    holiday_type,
    is_recurring,
    recurrence_pattern,
    created_by
  ];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const getEventsHolidaysByMonth = async (year, month) => {
  const query = `
    WITH date_series AS (
      SELECT 
        e.id,
        e.title,
        e.description,
        e.is_holiday,
        e.holiday_type,
        generate_series(
          GREATEST(e.start_date, DATE_TRUNC('month', $1::date)),
          LEAST(e.end_date, (DATE_TRUNC('month', $1::date) + INTERVAL '1 month - 1 day')::date),
          INTERVAL '1 day'
        )::date AS event_date
      FROM events_holidays e
      WHERE 
        e.start_date <= (DATE_TRUNC('month', $1::date) + INTERVAL '1 month - 1 day') AND
        e.end_date >= DATE_TRUNC('month', $1::date)
    )
    SELECT 
      id,
      title,
      description,
      to_char(event_date, 'YYYY-MM-DD') as date,
      is_holiday,
      holiday_type
    FROM date_series
    WHERE 
      EXTRACT(YEAR FROM event_date) = $2 AND
      EXTRACT(MONTH FROM event_date) = $3
    ORDER BY event_date;
  `;
  
  // Create a date object for the first day of the requested month
  const firstDayOfMonth = new Date(year, month - 1, 1);
  
  const { rows } = await pool.query(query, [firstDayOfMonth, year, month]);
  return rows;
};

const approveEventHoliday = async (id, approved_by) => {
  const query = `
    UPDATE events_holidays 
    SET 
      is_approved = TRUE, 
      approved_by = $1, 
      approved_at = CURRENT_TIMESTAMP 
    WHERE id = $2 
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [approved_by, id]);
  return rows[0];
};

const deleteEventHoliday = async (id) => {
  const query = 'DELETE FROM events_holidays WHERE id = $1 RETURNING *';
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

export {
  createEventHoliday,
  getEventsHolidaysByMonth,
  approveEventHoliday,
  deleteEventHoliday
};