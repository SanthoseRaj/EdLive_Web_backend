import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import {
  createFoodCategory,
  getFoodCategories,
  updateFoodCategory,
  deleteFoodCategory,
  createFoodItem,
  getFoodItemsByCategory,
  updateFoodItem,
  deleteFoodItem,
  getAllFoodItems, // Add this
  createWeeklyMenu,
  addMenuItemToWeeklyMenu,
  getMenuByDay,
  getFullWeeklyMenu,
  updateWeeklyMenu,
  deleteWeeklyMenu,
  removeMenuItemFromWeeklyMenu,
  getWeeklyMenuById,
  createStudentFoodSchedule,
  getStudentFoodSchedule,
  updateStudentFoodSchedule,
  deleteStudentFoodSchedule,
  getAllStudentFoodSchedules, // Add this
  getFoodTimings
} from "../controllers/food.controller.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     FoodCategory:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: integer
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 * 
 *     FoodItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         category_id:
 *           type: integer
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 * 
 *     WeeklyMenu:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         category_id:
 *           type: integer
 *         day_of_week:
 *           type: integer
 *           description: 0=Sunday, 1=Monday, etc.
 *         effective_date:
 *           type: string
 *           format: date
 *         is_active:
 *           type: boolean
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 * 
 *     MenuItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         menu_id:
 *           type: integer
 *         food_item_id:
 *           type: integer
 *         created_at:
 *           type: string
 *           format: date-time
 * 
 *     StudentFoodSchedule:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         student_id:
 *           type: integer
 *         date:
 *           type: string
 *           format: date
 *         end_date:
 *           type: string
 *           format: date
 *         breakfast_menu_id:
 *           type: integer
 *         lunch_menu_id:
 *           type: integer
 *         snacks_menu_id:
 *           type: integer
 *         status:
 *           type: string
 *           enum: [pending, confirmed, cancelled]
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 * 
 *     FoodTiming:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         meal_type:
 *           type: string
 *           enum: [breakfast, lunch, snacks]
 *         start_time:
 *           type: string
 *           format: time
 *         end_time:
 *           type: string
 *           format: time
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 * 
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * tags:
 *   name: Food Management
 *   description: Student food management system with weekly menus
 */

// Food Categories
/**
 * @swagger
 * /api/food/categories:
 *   post:
 *     summary: Create a new food category
 *     tags: [Food Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Breakfast
 *               description:
 *                 type: string
 *                 example: Morning meal
 *               price:
 *                 type: integer
 *                 example: 500
 *             required:
 *               - name
 *               - price
 *     responses:
 *       201:
 *         description: Food category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FoodCategory'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/categories", protectRoute, createFoodCategory);

/**
 * @swagger
 * /api/food/categories:
 *   get:
 *     summary: Get all food categories
 *     tags: [Food Management]
 *     responses:
 *       200:
 *         description: List of all food categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FoodCategory'
 *       500:
 *         description: Internal server error
 */
router.get("/categories", getFoodCategories);


/**
 * @swagger
 * /api/food/categories/{id}:
 *   put:
 *     summary: Update a food category
 *     tags: [Food Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the category to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Updated Breakfast
 *               description:
 *                 type: string
 *                 example: Updated morning meal description
 *               price:
 *                 type: integer
 *                 example: 600
 *     responses:
 *       200:
 *         description: Food category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FoodCategory'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
router.put("/categories/:id", protectRoute, updateFoodCategory);

/**
 * @swagger
 * /api/food/categories/{id}:
 *   delete:
 *     summary: Delete a food category
 *     tags: [Food Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the category to delete
 *     responses:
 *       200:
 *         description: Food category deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
router.delete("/categories/:id", protectRoute, deleteFoodCategory);

// Food Items
/**
 * @swagger
 * /api/food/items:
 *   post:
 *     summary: Create a new food item
 *     tags: [Food Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category_id:
 *                 type: integer
 *                 example: 1
 *               name:
 *                 type: string
 *                 example: Dosa
 *               description:
 *                 type: string
 *                 example: Dosa with chutney and sambar
 *             required:
 *               - category_id
 *               - name
 *     responses:
 *       201:
 *         description: Food item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FoodItem'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/items", protectRoute, createFoodItem);

/**
 * @swagger
 * /api/food/items:
 *   get:
 *     summary: Get all food items with filtering and pagination
 *     tags: [Food Management]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: integer
 *         description: Filter by category ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in food item names and descriptions
 *     responses:
 *       200:
 *         description: List of food items with pagination info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       category_id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       category_name:
 *                         type: string
 *                       category_price:
 *                         type: integer
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       500:
 *         description: Internal server error
 */
router.get("/items", getAllFoodItems);

/**
 * @swagger
 * /api/food/items/{category_id}:
 *   get:
 *     summary: Get food items by category
 *     tags: [Food Management]
 *     parameters:
 *       - in: path
 *         name: category_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the category
 *     responses:
 *       200:
 *         description: List of food items in the specified category
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FoodItem'
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
router.get("/items/:category_id", getFoodItemsByCategory);


/**
 * @swagger
 * /api/food/items/{id}:
 *   put:
 *     summary: Update a food item
 *     tags: [Food Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the food item to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category_id:
 *                 type: integer
 *                 example: 2
 *               name:
 *                 type: string
 *                 example: Masala Dosa
 *               description:
 *                 type: string
 *                 example: Updated description for masala dosa
 *     responses:
 *       200:
 *         description: Food item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FoodItem'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Food item not found
 *       500:
 *         description: Internal server error
 */
router.put("/items/:id", protectRoute, updateFoodItem);

/**
 * @swagger
 * /api/food/items/{id}:
 *   delete:
 *     summary: Delete a food item
 *     tags: [Food Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the food item to delete
 *     responses:
 *       200:
 *         description: Food item deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Food item not found
 *       500:
 *         description: Internal server error
 */
router.delete("/items/:id", protectRoute, deleteFoodItem);

// Weekly Menus
/**
 * @swagger
 * /api/food/weekly-menu:
 *   post:
 *     summary: Create a new weekly menu entry
 *     tags: [Food Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category_id:
 *                 type: integer
 *                 example: 1
 *               day_of_week:
 *                 type: integer
 *                 example: 1
 *                 description: 0=Sunday, 1=Monday, etc.
 *               effective_date:
 *                 type: string
 *                 format: date
 *                 example: "2023-01-01"
 *             required:
 *               - category_id
 *               - day_of_week
 *               - effective_date
 *     responses:
 *       201:
 *         description: Weekly menu created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WeeklyMenu'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/weekly-menu", protectRoute, createWeeklyMenu);

/**
 * @swagger
 * /api/food/weekly-menu/items:
 *   post:
 *     summary: Add item to weekly menu
 *     tags: [Food Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               menu_id:
 *                 type: integer
 *                 example: 1
 *               food_item_id:
 *                 type: integer
 *                 example: 1
 *             required:
 *               - menu_id
 *               - food_item_id
 *     responses:
 *       201:
 *         description: Menu item added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MenuItem'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/weekly-menu/items", protectRoute, addMenuItemToWeeklyMenu);

/**
 * @swagger
 * /api/food/weekly-menu/{day_of_week}:
 *   get:
 *     summary: Get menu for specific day of week
 *     tags: [Food Management]
 *     parameters:
 *       - in: path
 *         name: day_of_week
 *         schema:
 *           type: integer
 *         required: true
 *         description: 0=Sunday, 1=Monday, etc.
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Date to check for active menu (defaults to today)
 *     responses:
 *       200:
 *         description: Menu for the requested day
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 category_id:
 *                   type: integer
 *                 day_of_week:
 *                   type: integer
 *                 effective_date:
 *                   type: string
 *                   format: date
 *                 category_name:
 *                   type: string
 *                 category_price:
 *                   type: integer
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *       404:
 *         description: Menu not found
 *       500:
 *         description: Internal server error
 */
router.get("/weekly-menu/:day_of_week", getMenuByDay);

/**
 * @swagger
 * /api/food/weekly-menu:
 *   get:
 *     summary: Get full weekly menu
 *     tags: [Food Management]
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Date to check for active menus (defaults to today)
 *     responses:
 *       200:
 *         description: Complete weekly menu organized by day
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties:
 *                 type: object
 *                 properties:
 *                   breakfast:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       price:
 *                         type: integer
 *                       items:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             name:
 *                               type: string
 *                             description:
 *                               type: string
 *                   lunch:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       price:
 *                         type: integer
 *                       items:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             name:
 *                               type: string
 *                             description:
 *                               type: string
 *                   snacks:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       price:
 *                         type: integer
 *                       items:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             name:
 *                               type: string
 *                             description:
 *                               type: string
 *       500:
 *         description: Internal server error
 */
router.get("/weekly-menu", getFullWeeklyMenu);

/**
 * @swagger
 * /api/food/weekly-menu/{id}:
 *   put:
 *     summary: Update a weekly menu entry
 *     tags: [Food Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the weekly menu to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category_id:
 *                 type: integer
 *                 example: 2
 *               day_of_week:
 *                 type: integer
 *                 example: 2
 *               effective_date:
 *                 type: string
 *                 format: date
 *                 example: "2023-01-02"
 *               is_active:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Weekly menu updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WeeklyMenu'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Weekly menu not found
 *       500:
 *         description: Internal server error
 */
router.put("/weekly-menu/:id", protectRoute, updateWeeklyMenu);

/**
 * @swagger
 * /api/food/weekly-menu/{id}:
 *   delete:
 *     summary: Delete a weekly menu entry
 *     tags: [Food Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the weekly menu to delete
 *     responses:
 *       200:
 *         description: Weekly menu deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Weekly menu not found
 *       500:
 *         description: Internal server error
 */
router.delete("/weekly-menu/:id", protectRoute, deleteWeeklyMenu);

/**
 * @swagger
 * /api/food/weekly-menu/items/{id}:
 *   delete:
 *     summary: Remove item from weekly menu
 *     tags: [Food Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the menu item to remove
 *     responses:
 *       200:
 *         description: Menu item removed successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Menu item not found
 *       500:
 *         description: Internal server error
 */
router.delete("/weekly-menu/items/:id", protectRoute, removeMenuItemFromWeeklyMenu);
router.get("/weekly-menu/id/:id", protectRoute, getWeeklyMenuById);
// Student Food Schedule
/**
 * @swagger
 * /api/food/schedule:
 *   post:
 *     summary: Create/update student food schedule
 *     tags: [Food Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               student_id:
 *                 type: integer
 *                 example: 1
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2023-01-01"
 *               end_date:
 *                 type: string
 *                 format: date
 *                 example: "2023-01-01"
 *               breakfast_menu_id:
 *                 type: integer
 *                 example: 1
 *                 description: Optional - ID of breakfast menu
 *               lunch_menu_id:
 *                 type: integer
 *                 example: 2
 *                 description: Optional - ID of lunch menu
 *               snacks_menu_id:
 *                 type: integer
 *                 example: 3
 *                 description: Optional - ID of snacks menu
 *             required:
 *               - student_id
 *               - date
 *     responses:
 *       201:
 *         description: Food schedule created/updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentFoodSchedule'
 *       400:
 *         description: Invalid input or no menu defined for this date
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/schedule", protectRoute, createStudentFoodSchedule);

/**
 * @swagger
 * /api/food/schedule/{student_id}/{date}:
 *   get:
 *     summary: Get student food schedule for a specific date
 *     tags: [Food Management]
 *     parameters:
 *       - in: path
 *         name: student_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the student
 *       - in: path
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Date to check schedule for
 *     responses:
 *       200:
 *         description: Student food schedule details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentFoodSchedule'
 *       404:
 *         description: Schedule not found
 *       500:
 *         description: Internal server error
 */
router.get("/schedule/:student_id/:date", getStudentFoodSchedule);

/**
 * @swagger
 * /api/food/schedules/{id}:
 *   put:
 *     summary: Update a student food schedule
 *     tags: [Food Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the schedule to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               student_id:
 *                 type: integer
 *                 example: 1
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2023-01-02"
 *               end_date:
 *                 type: string
 *                 format: date
 *                 example: "2023-01-02"
 *               breakfast_menu_id:
 *                 type: integer
 *                 example: 1
 *               lunch_menu_id:
 *                 type: integer
 *                 example: 2
 *               snacks_menu_id:
 *                 type: integer
 *                 example: 3
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, cancelled]
 *                 example: confirmed
 *     responses:
 *       200:
 *         description: Student food schedule updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentFoodSchedule'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Schedule not found
 *       500:
 *         description: Internal server error
 */
router.put("/schedules/:id", protectRoute, updateStudentFoodSchedule);

/**
 * @swagger
 * /api/food/schedules/{id}:
 *   delete:
 *     summary: Delete a student food schedule
 *     tags: [Food Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the schedule to delete
 *     responses:
 *       200:
 *         description: Student food schedule deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Schedule not found
 *       500:
 *         description: Internal server error
 */
router.delete("/schedules/:id", protectRoute, deleteStudentFoodSchedule);

/**
 * @swagger
 * /api/food/schedules:
 *   get:
 *     summary: Get all student food schedules with filtering and pagination
 *     tags: [Food Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: student_id
 *         schema:
 *           type: integer
 *         description: Filter by student ID
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by specific date
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, cancelled]
 *         description: Filter by status
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for date range filter
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for date range filter
 *     responses:
 *       200:
 *         description: List of student food schedules with pagination info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 schedules:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       student_id:
 *                         type: integer
 *                       student_name:
 *                         type: string
 *                       grade:
 *                         type: string
 *                       section:
 *                         type: string
 *                       date:
 *                         type: string
 *                         format: date
 *                       breakfast_menu_id:
 *                         type: integer
 *                       lunch_menu_id:
 *                         type: integer
 *                       snacks_menu_id:
 *                         type: integer
 *                       status:
 *                         type: string
 *                       breakfast_category_name:
 *                         type: string
 *                       lunch_category_name:
 *                         type: string
 *                       snacks_category_name:
 *                         type: string
 *                       breakfast_items:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             name:
 *                               type: string
 *                             description:
 *                               type: string
 *                       lunch_items:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             name:
 *                               type: string
 *                             description:
 *                               type: string
 *                       snacks_items:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             name:
 *                               type: string
 *                             description:
 *                               type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       500:
 *         description: Internal server error
 */
router.get("/schedules", protectRoute, getAllStudentFoodSchedules);

// Food Timings
/**
 * @swagger
 * /api/food/timings:
 *   get:
 *     summary: Get food timings
 *     tags: [Food Management]
 *     responses:
 *       200:
 *         description: List of all food timings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FoodTiming'
 *       500:
 *         description: Internal server error
 */
router.get("/timings", getFoodTimings);

export default router;