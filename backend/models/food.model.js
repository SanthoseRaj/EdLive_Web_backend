import pool from "../db/connectDB-pg.js";

// Food Categories
const createFoodCategory = async ({ name, description, price }) => {
  const query = `
    INSERT INTO food_categories (name, description, price)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [name, description, price]);
  return rows[0];
};

const getFoodCategories = async () => {
  const { rows } = await pool.query("SELECT * FROM food_categories ORDER BY name");
  return rows;
};

const updateFoodCategory = async (id, { name, description, price }) => {
  const query = `
    UPDATE food_categories 
    SET name = $1, description = $2, price = $3, updated_at = CURRENT_TIMESTAMP
    WHERE id = $4
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [name, description, price, id]);
  return rows[0];
};

const deleteFoodCategory = async (id) => {
  const query = `
    DELETE FROM food_categories 
    WHERE id = $1
    RETURNING *;
  `;
  const { rows } =await pool.query(query, [id]);
  return rows[0];
};
// Food Items
const createFoodItem = async ({ category_id, name, description }) => {
  const query = `
    INSERT INTO food_items (category_id, name, description)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [category_id, name, description]);
  return rows[0];
};

const getFoodItemsByCategory = async (category_id) => {
  const { rows } = await pool.query(
    "SELECT * FROM food_items WHERE category_id = $1 ORDER BY name",
    [category_id]
  );
  return rows;
};

const updateFoodItem = async (id, { category_id, name, description }) => {
  const query = `
    UPDATE food_items 
    SET category_id = $1, name = $2, description = $3, updated_at = CURRENT_TIMESTAMP
    WHERE id = $4
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [category_id, name, description, id]);
  return rows[0];
};

const deleteFoodItem = async (id) => {
  const query = `
    DELETE FROM food_items 
    WHERE id = $1
    RETURNING *;
  `;
  const { rows } =await pool.query(query, [id]);
  return rows[0];
};
// Weekly Menus
const createWeeklyMenu = async ({ category_id, day_of_week, effective_date }) => {
  const query = `
    INSERT INTO weekly_menus (category_id, day_of_week, effective_date)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [category_id, day_of_week, effective_date]);
  return rows[0];
};

const addMenuItemToWeeklyMenu = async ({ menu_id, food_item_id }) => {
  const query = `
    INSERT INTO weekly_menu_items (menu_id, food_item_id)
    VALUES ($1, $2)
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [menu_id, food_item_id]);
  return rows[0];
};

const getWeeklyMenuByDay = async (day_of_week, date = new Date()) => {
  const query = `
    SELECT 
      wm.*,
      fc.name as category_name,
      fc.price as category_price,
      ARRAY(
        SELECT json_build_object(
          'id', fi.id,
          'name', fi.name,
          'description', fi.description
        )
        FROM weekly_menu_items wmi
        JOIN food_items fi ON wmi.food_item_id = fi.id
        WHERE wmi.menu_id = wm.id
      ) as items
    FROM weekly_menus wm
    JOIN food_categories fc ON wm.category_id = fc.id
    WHERE wm.day_of_week = $1 
    AND wm.effective_date <= $2
    AND wm.is_active = true
    ORDER BY wm.effective_date DESC
    LIMIT 1;
  `;
  const { rows } = await pool.query(query, [day_of_week, date]);
  return rows[0];
};

const getFullWeeklyMenu = async (date = new Date()) => {
  const query = `
    SELECT 
      wm.day_of_week,
      fc.name as category_name,
      fc.price as category_price,
      ARRAY(
        SELECT json_build_object(
          'id', wmi.menu_id,
          'name', fi.name,
          'description', fi.description
        )
        FROM weekly_menu_items wmi
        JOIN food_items fi ON wmi.food_item_id = fi.id
        WHERE wmi.menu_id = wm.id
      ) as items
    FROM weekly_menus wm
    JOIN food_categories fc ON wm.category_id = fc.id
    WHERE wm.effective_date <= $1
    AND wm.is_active = true
    AND (wm.day_of_week, wm.category_id, wm.effective_date) IN (
      SELECT 
        day_of_week, 
        category_id, 
        MAX(effective_date)
      FROM weekly_menus
      WHERE effective_date <= $1
      AND is_active = true
      GROUP BY day_of_week, category_id
    )
    ORDER BY wm.day_of_week, fc.name;
  `;
  const { rows } = await pool.query(query, [date]);
  return rows;
};
const updateWeeklyMenu = async (id, { category_id, day_of_week, effective_date, is_active }) => {
  const query = `
    UPDATE weekly_menus 
    SET 
      category_id = $1, 
      day_of_week = $2, 
      effective_date = $3,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $4
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [category_id, day_of_week, effective_date, id]);
  return rows[0];
};

const deleteWeeklyMenu = async (id) => {
  // First delete menu items
  await pool.query('DELETE FROM weekly_menu_items WHERE menu_id = $1', [id]);
  
  // Then delete the menu
  const query = `
    DELETE FROM weekly_menus 
    WHERE id = $1
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

const removeMenuItemFromWeeklyMenu = async (id) => {
  const query = `
    DELETE FROM weekly_menu_items 
    WHERE id = $1
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

const getAllWeeklyMenus = async (filters = {}) => {
  const {
    page = 1,
    limit = 10,
    day_of_week,
    category_id,
    is_active
  } = filters;

  const offset = (page - 1) * limit;
  
  let whereConditions = [];
  let queryParams = [];
  let paramCount = 0;

  if (day_of_week !== undefined) {
    paramCount++;
    whereConditions.push(`wm.day_of_week = $${paramCount}`);
    queryParams.push(day_of_week);
  }

  if (category_id) {
    paramCount++;
    whereConditions.push(`wm.category_id = $${paramCount}`);
    queryParams.push(category_id);
  }

  if (is_active !== undefined) {
    paramCount++;
    whereConditions.push(`wm.is_active = $${paramCount}`);
    queryParams.push(is_active);
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  // Count query for pagination
  const countQuery = `
    SELECT COUNT(*) 
    FROM weekly_menus wm
    ${whereClause}
  `;

  // Main data query
  const dataQuery = `
    SELECT 
      wm.*,
      fc.name as category_name,
      fc.price as category_price,
      (
        SELECT COUNT(*)
        FROM weekly_menu_items wmi
        WHERE wmi.menu_id = wm.id
      ) as item_count,
      ARRAY(
        SELECT json_build_object(
          'id', wmi.id,
          'food_item_id', fi.id,
          'food_item_name', fi.name,
          'food_item_description', fi.description
        )
        FROM weekly_menu_items wmi
        JOIN food_items fi ON wmi.food_item_id = fi.id
        WHERE wmi.menu_id = wm.id
      ) as items
    FROM weekly_menus wm
    JOIN food_categories fc ON wm.category_id = fc.id
    ${whereClause}
    ORDER BY wm.day_of_week, wm.effective_date DESC
    LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
  `;

  try {
    // Get total count
    const countResult = await pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);

    // Get data
    const dataParams = [...queryParams, limit, offset];
    const { rows } = await pool.query(dataQuery, dataParams);

    return {
      menus: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    throw error;
  }
};
const getWeeklyMenuById = async (id) => {
  const query = `
    SELECT 
      wm.*,
      fc.name as category_name,
      fc.price as category_price,
      ARRAY(
        SELECT json_build_object(
          'id', fi.id,
          'name', fi.name,
          'description', fi.description
        )
        FROM weekly_menu_items wmi
        JOIN food_items fi ON wmi.food_item_id = fi.id
        WHERE wmi.menu_id = wm.id
      ) as items
    FROM weekly_menus wm
    JOIN food_categories fc ON wm.category_id = fc.id
    WHERE wm.id = $1;
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

// Student Food Schedule
const createStudentFoodSchedule = async ({
  student_id,
  date,
  breakfast_menu_id,
  lunch_menu_id,
  snacks_menu_id,
  status = "pending",
  enddate
}) => {
  // First, check if there's any overlapping schedule
  const checkQuery = `
    SELECT * FROM student_food_schedules 
    WHERE student_id = $1 
    AND (
      -- Case 1: New schedule starts during an existing schedule
      ($2 BETWEEN start_date AND end_date)
      OR
      -- Case 2: New schedule ends during an existing schedule  
      ($3 BETWEEN start_date AND end_date)
      OR
      -- Case 3: New schedule completely contains an existing schedule
      (start_date BETWEEN $2 AND $3 AND end_date BETWEEN $2 AND $3)
    )
    AND (start_date != $2 OR end_date != $3) -- Exclude exact matches
  `;
  
  const checkResult = await pool.query(checkQuery, [
    student_id, 
    date, 
    enddate
  ]);

  // If overlapping schedules found (excluding exact matches), throw error
  if (checkResult.rows.length > 0) {
    throw new Error('Schedule conflict: Date range overlaps with existing schedule');
  }

  const query = `
    INSERT INTO student_food_schedules 
    (student_id, start_date, breakfast_menu_id, lunch_menu_id, snacks_menu_id, status, end_date)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (student_id, start_date) 
    DO UPDATE SET
      breakfast_menu_id = CASE 
        WHEN $3 IS NOT NULL THEN $3 
        ELSE student_food_schedules.breakfast_menu_id 
      END,
      lunch_menu_id = CASE 
        WHEN $4 IS NOT NULL THEN $4 
        ELSE student_food_schedules.lunch_menu_id 
      END,
      snacks_menu_id = CASE 
        WHEN $5 IS NOT NULL THEN $5 
        ELSE student_food_schedules.snacks_menu_id 
      END,
      status = $6,
      end_date = $7
    RETURNING *;
  `;
  
  const { rows } = await pool.query(query, [
    student_id,
    date,
    breakfast_menu_id,
    lunch_menu_id,
    snacks_menu_id,
    status,
    enddate
  ]);
  return rows[0];
};

const getStudentFoodSchedule = async (student_id, date) => {
  const query = `
    SELECT 
      sfs.id,
      sfs.student_id,
      to_char(sfs.start_date, 'YYYY-MM-DD') as start_date,
      sfs.breakfast_menu_id,
      sfs.lunch_menu_id,
      sfs.snacks_menu_id,
      sfs.status,
      to_char(sfs.created_at, 'YYYY-MM-DD') as created_at,
      to_char(sfs.updated_at, 'YYYY-MM-DD') as updated_at,
      to_char(sfs.end_date, 'YYYY-MM-DD') as end_date,
           wm_breakfast.day_of_week as breakfast_day,
           fc_breakfast.name as breakfast_name, 
           fc_breakfast.price as breakfast_price,
           wm_lunch.day_of_week as lunch_day,
           fc_lunch.name as lunch_name, 
           fc_lunch.price as lunch_price,
           wm_snacks.day_of_week as snacks_day,
           fc_snacks.name as snacks_name, 
           fc_snacks.price as snacks_price,
           (
             SELECT ARRAY(
               SELECT json_build_object(
                 'id', fi.id,
                 'name', fi.name,
                 'description', fi.description
               )
               FROM weekly_menu_items wmi
               JOIN food_items fi ON wmi.food_item_id = fi.id
               WHERE wmi.menu_id = sfs.breakfast_menu_id
             )
           ) as breakfast_items,
           (
             SELECT ARRAY(
               SELECT json_build_object(
                 'id', fi.id,
                 'name', fi.name,
                 'description', fi.description
               )
               FROM weekly_menu_items wmi
               JOIN food_items fi ON wmi.food_item_id = fi.id
               WHERE wmi.menu_id = sfs.lunch_menu_id
             )
           ) as lunch_items,
           (
             SELECT ARRAY(
               SELECT json_build_object(
                 'id', fi.id,
                 'name', fi.name,
                 'description', fi.description
               )
               FROM weekly_menu_items wmi
               JOIN food_items fi ON wmi.food_item_id = fi.id
               WHERE wmi.menu_id = sfs.snacks_menu_id
             )
           ) as snacks_items
    FROM student_food_schedules sfs
    LEFT JOIN weekly_menus wm_breakfast ON sfs.breakfast_menu_id = wm_breakfast.id
    LEFT JOIN food_categories fc_breakfast ON wm_breakfast.category_id = fc_breakfast.id
    LEFT JOIN weekly_menus wm_lunch ON sfs.lunch_menu_id = wm_lunch.id
    LEFT JOIN food_categories fc_lunch ON wm_lunch.category_id = fc_lunch.id
    LEFT JOIN weekly_menus wm_snacks ON sfs.snacks_menu_id = wm_snacks.id
    LEFT JOIN food_categories fc_snacks ON wm_snacks.category_id = fc_snacks.id
    WHERE sfs.student_id = $1 AND $2::DATE BETWEEN sfs.start_date::DATE AND sfs.end_date::DATE;
  `;
  const { rows } = await pool.query(query, [student_id, date]);
  return rows[0];
};

const updateStudentFoodSchedule = async (id, { breakfast_menu_id, lunch_menu_id, snacks_menu_id, status, end_date }) => {
  const query = `
    UPDATE student_food_schedules 
    SET 
      breakfast_menu_id = $1,
      lunch_menu_id = $2,
      snacks_menu_id = $3,
      status = $4,
      end_date = $5,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $6
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [
    breakfast_menu_id,
    lunch_menu_id,
    snacks_menu_id,
    status,
    end_date,
    id
  ]);
  return rows[0];
};

const deleteStudentFoodSchedule = async (id) => {
  const query = `
    DELETE FROM student_food_schedules 
    WHERE id = $1
    RETURNING *;
  `;
  const { rows } =await pool.query(query, [id]);
  return rows[0];
};
// Food Timings
const getFoodTimings = async () => {
  const { rows } = await pool.query("SELECT * FROM food_timings ORDER BY start_time");
  return rows;
};

const getAllStudentFoodSchedules = async (filters = {}) => {
  const {
    page = 1,
    limit = 10,
    student_id,
    date,
    status,
    start_date,
    end_date
  } = filters;

  const offset = (page - 1) * limit;
  
  let whereConditions = [];
  let queryParams = [];
  let paramCount = 0;

  if (student_id) {
    paramCount++;
    whereConditions.push(`sfs.student_id = $${paramCount}`);
    queryParams.push(student_id);
  }

  if (date) {
    paramCount++;
    whereConditions.push(`sfs.start_date = $${paramCount}`);
    queryParams.push(date);
  }

  if (status) {
    paramCount++;
    whereConditions.push(`sfs.status = $${paramCount}`);
    queryParams.push(status);
  }

  if (start_date && end_date) {
    paramCount++;
    whereConditions.push(`sfs.start_date BETWEEN $${paramCount} AND $${paramCount + 1}`);
    queryParams.push(start_date, end_date);
    paramCount++;
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  // Count query for pagination
  const countQuery = `
    SELECT COUNT(*) 
    FROM student_food_schedules sfs
    ${whereClause}
  `;

  // Main data query
  const dataQuery = `
    SELECT 
      sfs.*,
      s.full_name as student_name,
      wm_breakfast.day_of_week as breakfast_day,
      fc_breakfast.name as breakfast_category_name,
      fc_breakfast.price as breakfast_price,
      wm_lunch.day_of_week as lunch_day,
      fc_lunch.name as lunch_category_name,
      fc_lunch.price as lunch_price,
      wm_snacks.day_of_week as snacks_day,
      fc_snacks.name as snacks_category_name,
      fc_snacks.price as snacks_price,
      (
        SELECT ARRAY(
          SELECT json_build_object(
            'id', fi.id,
            'name', fi.name,
            'description', fi.description
          )
          FROM weekly_menu_items wmi
          JOIN food_items fi ON wmi.food_item_id = fi.id
          WHERE wmi.menu_id = sfs.breakfast_menu_id
        )
      ) as breakfast_items,
      (
        SELECT ARRAY(
          SELECT json_build_object(
            'id', fi.id,
            'name', fi.name,
            'description', fi.description
          )
          FROM weekly_menu_items wmi
          JOIN food_items fi ON wmi.food_item_id = fi.id
          WHERE wmi.menu_id = sfs.lunch_menu_id
        )
      ) as lunch_items,
      (
        SELECT ARRAY(
          SELECT json_build_object(
            'id', fi.id,
            'name', fi.name,
            'description', fi.description
          )
          FROM weekly_menu_items wmi
          JOIN food_items fi ON wmi.food_item_id = fi.id
          WHERE wmi.menu_id = sfs.snacks_menu_id
        )
      ) as snacks_items
    FROM student_food_schedules sfs
    LEFT JOIN students s ON sfs.student_id = s.id
    LEFT JOIN weekly_menus wm_breakfast ON sfs.breakfast_menu_id = wm_breakfast.id
    LEFT JOIN food_categories fc_breakfast ON wm_breakfast.category_id = fc_breakfast.id
    LEFT JOIN weekly_menus wm_lunch ON sfs.lunch_menu_id = wm_lunch.id
    LEFT JOIN food_categories fc_lunch ON wm_lunch.category_id = fc_lunch.id
    LEFT JOIN weekly_menus wm_snacks ON sfs.snacks_menu_id = wm_snacks.id
    LEFT JOIN food_categories fc_snacks ON wm_snacks.category_id = fc_snacks.id
    ${whereClause}
    ORDER BY sfs.start_date DESC, s.full_name ASC
    LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
  `;

  try {
    // Get total count
    const countResult = await pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);

    // Get data
    const dataParams = [...queryParams, limit, offset];
    const { rows } = await pool.query(dataQuery, dataParams);

    return {
      schedules: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    throw error;
  }
};

// Get all food items with category information
const getAllFoodItems = async (filters = {}) => {
  const {
    page = 1,
    limit = 10,
    category_id,
    search
  } = filters;

  const offset = (page - 1) * limit;
  
  let whereConditions = [];
  let queryParams = [];
  let paramCount = 0;

  if (category_id) {
    paramCount++;
    whereConditions.push(`fi.category_id = $${paramCount}`);
    queryParams.push(category_id);
  }

  if (search) {
    paramCount++;
    whereConditions.push(`(fi.name ILIKE $${paramCount} OR fi.description ILIKE $${paramCount})`);
    queryParams.push(`%${search}%`);
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  // Count query for pagination
  const countQuery = `
    SELECT COUNT(*) 
    FROM food_items fi
    ${whereClause}
  `;

  // Main data query
  const dataQuery = `
    SELECT 
      fi.*,
      fc.name as category_name,
      fc.price as category_price
    FROM food_items fi
    LEFT JOIN food_categories fc ON fi.category_id = fc.id
    ${whereClause}
    ORDER BY fc.name, fi.name
    LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
  `;

  try {
    // Get total count
    const countResult = await pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);

    // Get data
    const dataParams = [...queryParams, limit, offset];
    const { rows } = await pool.query(dataQuery, dataParams);

    return {
      items: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    throw error;
  }
};


export {
  createFoodCategory,
  getFoodCategories,
  updateFoodCategory,
  deleteFoodCategory,
  updateFoodItem,
  deleteFoodItem,
  createFoodItem,
  getFoodItemsByCategory,
  getAllFoodItems, // Add this
  createWeeklyMenu,
  addMenuItemToWeeklyMenu,
  getWeeklyMenuByDay,
  getFullWeeklyMenu,
  updateWeeklyMenu,
  deleteWeeklyMenu,
  removeMenuItemFromWeeklyMenu,
  getWeeklyMenuById,
  getAllWeeklyMenus,
  createStudentFoodSchedule,
  getStudentFoodSchedule,
  updateStudentFoodSchedule,
  deleteStudentFoodSchedule,
  getAllStudentFoodSchedules, // Add this
  getFoodTimings,

};