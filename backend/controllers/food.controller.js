import * as foodModel from "../models/food.model.js";

// Food Categories
export const createFoodCategory = async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const category = await foodModel.createFoodCategory({ name, description, price });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getFoodCategories = async (req, res) => {
  try {
    const categories = await foodModel.getFoodCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const updateFoodCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price } = req.body;
    const category = await foodModel.updateFoodCategory(id, { name, description, price });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteFoodCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await foodModel.deleteFoodCategory(id);
    res.json({ message: "Food category deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Food Items
export const createFoodItem = async (req, res) => {
  try {
    const { category_id, name, description } = req.body;
    const item = await foodModel.createFoodItem({ category_id, name, description });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getFoodItemsByCategory = async (req, res) => {
  try {
    const { category_id } = req.params;
    const items = await foodModel.getFoodItemsByCategory(category_id);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const updateFoodItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, name, description } = req.body;
    const item = await foodModel.updateFoodItem(id, { category_id, name, description });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteFoodItem = async (req, res) => {
  try {
    const { id } = req.params;
    await foodModel.deleteFoodItem(id);
    res.json({ message: "Food item deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Weekly Menus
export const createWeeklyMenu = async (req, res) => {
  try {
    const { category_id, day_of_week, effective_date } = req.body;
    const menu = await foodModel.createWeeklyMenu({ category_id, day_of_week, effective_date });
    res.status(201).json(menu);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addMenuItemToWeeklyMenu = async (req, res) => {
  try {
    const { menu_id, food_item_id } = req.body;
    const menuItem = await foodModel.addMenuItemToWeeklyMenu({ menu_id, food_item_id });
    res.status(201).json(menuItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMenuByDay = async (req, res) => {
  try {
    const { day_of_week } = req.params;
    const { date } = req.query;
    
    const menu = await foodModel.getWeeklyMenuByDay(
      parseInt(day_of_week),
      date ? new Date(date) : new Date()
    );
    
    if (!menu) {
      return res.status(404).json({ message: "No menu found for this day" });
    }
    
    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getFullWeeklyMenu = async (req, res) => {
  try {
    const { date } = req.query;
    const menus = await foodModel.getFullWeeklyMenu(date ? new Date(date) : new Date());
    
    // Organize by day of week
    const weeklyMenu = {};
    for (let i = 0; i < 7; i++) {
      weeklyMenu[i] = {
        breakfast: null,
        lunch: null,
        snacks: null
      };
    }
    
    menus.forEach(menu => {
      const day = menu.day_of_week;
      const category = menu.category_name.toLowerCase();
      weeklyMenu[day][category] = {
        id: menu.id,
        price: menu.category_price,
        items: menu.items
      };
    });
    
    res.json(weeklyMenu);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const updateWeeklyMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, day_of_week, effective_date, is_active } = req.body;
    
    const menu = await foodModel.updateWeeklyMenu(id, {
      category_id,
      day_of_week,
      effective_date,
      is_active
    });
    
    if (!menu) {
      return res.status(404).json({ message: "Weekly menu not found" });
    }
    
    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteWeeklyMenu = async (req, res) => {
  try {
    const { id } = req.params;
    await foodModel.deleteWeeklyMenu(id);
    res.json({ message: "Weekly menu deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const removeMenuItemFromWeeklyMenu = async (req, res) => {
  try {
    const { id } = req.params;
    await foodModel.removeMenuItemFromWeeklyMenu(id);
    res.json({ message: "Menu item removed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllWeeklyMenus = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      day_of_week,
      category_id,
      is_active
    } = req.query;

    const filters = {
      page: parseInt(page),
      limit: parseInt(limit),
      day_of_week: day_of_week ? parseInt(day_of_week) : undefined,
      category_id,
      is_active: is_active !== undefined ? is_active === 'true' : undefined
    };

    const result = await foodModel.getAllWeeklyMenus(filters);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const getWeeklyMenuById = async (req, res) => {
  try {
    const { id } = req.params;
    const menu = await foodModel.getWeeklyMenuById(id);
    
    if (!menu) {
      return res.status(404).json({ message: "Weekly menu not found" });
    }
    
    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Student Food Schedule
export const createStudentFoodSchedule = async (req, res) => {
  try {
    const { student_id,breakfast_menu_id,lunch_menu_id,snacks_menu_id, date,end_date } = req.body;
    
    // Get current day of week (0-6)
    const scheduleDate = new Date(date);
    const scheduleEndDate = end_date === null ? scheduleDate : new Date(end_date);

    // const dayOfWeek = scheduleDate.getDay();
    
    // // Get current menus for this day
    // const breakfastMenu = await foodModel.getWeeklyMenuByDay(dayOfWeek, scheduleDate, 1); // 1 = breakfast category
    // const lunchMenu = await foodModel.getWeeklyMenuByDay(dayOfWeek, scheduleDate, 2); // 2 = lunch category
    // const snacksMenu = await foodModel.getWeeklyMenuByDay(dayOfWeek, scheduleDate, 3); // 3 = snacks category
    
    // if (!breakfastMenu || !lunchMenu || !snacksMenu) {
    //   return res.status(400).json({ message: "No menu defined for this date" });
    // }
    
    const schedule = await foodModel.createStudentFoodSchedule({
      student_id,
      date: scheduleDate,
      breakfast_menu_id: breakfast_menu_id,
      lunch_menu_id: lunch_menu_id,
      snacks_menu_id: snacks_menu_id,
      status: "confirmed",
      enddate: scheduleEndDate
    });
    
    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getStudentFoodSchedule = async (req, res) => {
  try {
    const { student_id, date } = req.params;
    const schedule = await foodModel.getStudentFoodSchedule(student_id, date);
    
    if (!schedule) {
      return res.status(404).json({ message: "No food schedule found for this date" });
    }
    
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateStudentFoodSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { breakfast_menu_id, lunch_menu_id, snacks_menu_id, status, end_date } = req.body;
    
    const schedule = await foodModel.updateStudentFoodSchedule(id, {
      breakfast_menu_id: breakfast_menu_id || null,
      lunch_menu_id: lunch_menu_id || null,
      snacks_menu_id: snacks_menu_id || null,
      status: status || "confirmed",
      end_date: end_date ? new Date(end_date) : null
    });
    
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteStudentFoodSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    await foodModel.deleteStudentFoodSchedule(id);
    res.json({ message: "Food schedule deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Food Timings
export const getFoodTimings = async (req, res) => {
  try {
    const timings = await foodModel.getFoodTimings();
    res.json(timings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all student food schedules
export const getAllStudentFoodSchedules = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      student_id,
      date,
      status,
      start_date,
      end_date
    } = req.query;

    const filters = {
      page: parseInt(page),
      limit: parseInt(limit),
      student_id,
      date,
      status,
      start_date,
      end_date
    };

    const result = await foodModel.getAllStudentFoodSchedules(filters);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all food items
export const getAllFoodItems = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category_id,
      search
    } = req.query;

    const filters = {
      page: parseInt(page),
      limit: parseInt(limit),
      category_id,
      search
    };

    const result = await foodModel.getAllFoodItems(filters);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};