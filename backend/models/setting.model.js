import pool from "../db/connectDB-pg.js";

const getDashBoardElements = async () => {
  const { rows } = await pool.query(
    "SELECT * FROM dashboard_elements ORDER BY default_position"
  );
  return rows;
};
const getUserDashBoard = async (userId) => {
  const { rows } = await pool.query(
    `SELECT de.*, ds.is_enabled, ds.position
      FROM dashboard_elements de
      LEFT JOIN dashboard_settings ds ON de.element_key = ds.element_key AND ds.user_id = $1
      ORDER BY COALESCE(ds.position, de.default_position)`,
    [userId]
  );
  return rows;
};
const delUserDashBoard = async (userId) => {
  const { rows } = await pool.query(
      `DELETE FROM dashboard_settings WHERE user_id = $1
    RETURNING * `,
    [userId]
    );
    return rows;
};
const updateUserDashBoard = async (userId, element_key, is_enabled, position) => {
    const { rows } = await pool.query(`INSERT INTO dashboard_settings (user_id, element_key, is_enabled, position)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, element_key) DO UPDATE
         SET is_enabled = EXCLUDED.is_enabled, position = EXCLUDED.position
         RETURNING *`,
        [userId, element_key, is_enabled, position]);
    return rows;
}
export {
    getDashBoardElements,
    getUserDashBoard,
    delUserDashBoard,
    updateUserDashBoard
}
