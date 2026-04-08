import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import {
    specialCareCategoryCreate,
  specialCareCategoryFindAll,
  specialCareCategoryFindById,
  specialCareCategoryUpdate,
    specialCareCategoryDelete,
  
  specialCareCreate,
  specialCareFindVisible,
  specialCareUpdate,
  specialCareDelete,
  specialCareAddProgress,
  specialCareGetProgress
} from "../controllers/specialCare.controller.js"

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Special Care
 *   description: Special care management for students
 */

// Category Routes
/**
 * @swagger
 * /api/special-care/categories:
 *   post:
 *     summary: Create a new special care category (Admin only)
 *     tags: [Special Care]
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
 *                 example: "Academic Support"
 *               description:
 *                 type: string
 *                 example: "Remedial classes and academic assistance"
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SpecialCareCategory'
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 *       500:
 *         description: Internal server error
 */
router.post('/categories', protectRoute, specialCareCategoryCreate);

/**
 * @swagger
 * /api/special-care/categories:
 *   get:
 *     summary: Get all special care categories
 *     tags: [Special Care]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SpecialCareCategory'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/categories', protectRoute, specialCareCategoryFindAll);

/**
 * @swagger
 * /api/special-care/categories/{id}:
 *   get:
 *     summary: Get a specific category by ID
 *     tags: [Special Care]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SpecialCareCategory'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
router.get('/categories/:id', protectRoute, specialCareCategoryFindById);

/**
 * @swagger
 * /api/special-care/categories/{id}:
 *   put:
 *     summary: Update a special care category (Admin only)
 *     tags: [Special Care]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Academic Support"
 *               description:
 *                 type: string
 *                 example: "Updated description for academic support"
 *             required:
 *               - name
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SpecialCareCategory'
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
router.put('/categories/:id', protectRoute, specialCareCategoryUpdate);

/**
 * @swagger
 * /api/special-care/categories/{id}:
 *   delete:
 *     summary: Delete a special care category (Admin only)
 *     tags: [Special Care]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Category deleted successfully"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
router.delete('/categories/:id', protectRoute, specialCareCategoryDelete);

/**
 * @swagger
 * /api/special-care:
 *   post:
 *     summary: Create a new special care item
 *     tags: [Special Care]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *               title:
 *                 type: string
 *                 example: "Math Remedial Classes"
 *               description:
 *                 type: string
 *                 example: "Weekly remedial classes for mathematics"
 *               careType:
 *                 type: string
 *                 enum: [academic, emotional, health, inclusive]
 *                 example: "academic"
 *               scheduleDetails:
 *                 type: object
 *                 example: {"days": ["Monday", "Wednesday"], "time": "4-5 PM"}
 *               resources:
 *                 type: object
 *                 example: {"materials": ["workbook.pdf"], "tools": ["calculator"]}
 *               assignedTo:
 *                 type: integer
 *                 example: 5
 *               status:
 *                 type: string
 *                 enum: [active, completed, archived]
 *                 example: "active"
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2023-09-01"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: "2023-12-15"
 *               visibility:
 *                 type: string
 *                 enum: [private, class, school]
 *                 example: "class"
 *             required:
 *               - studentIds
 *               - categoryId
 *               - title
 *               - careType
 *     responses:
 *       201:
 *         description: Special care item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SpecialCareItem'
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/', protectRoute, specialCareCreate);

/**
 * @swagger
 * /api/special-care/visible:
 *   get:
 *     summary: Get visible special care items based on user role
 *     tags: [Special Care]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: classId
 *         schema:
 *           type: integer
 *         description: Class ID (required for teachers)
 *     responses:
 *       200:
 *         description: List of visible special care items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SpecialCareItem'
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Class ID required for teacher
 *       500:
 *         description: Internal server error
 */
router.get('/visible', protectRoute, specialCareFindVisible);

/**
 * @swagger
 * /api/special-care/{id}:
 *   put:
 *     summary: Update a special care item
 *     tags: [Special Care]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Special Care Item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated Math Remedial Classes"
 *               description:
 *                 type: string
 *                 example: "Updated schedule for mathematics classes"
 *               status:
 *                 type: string
 *                 enum: [active, completed, archived]
 *                 example: "completed"
 *     responses:
 *       200:
 *         description: Special care item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SpecialCareItem'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Special care item not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', protectRoute, specialCareUpdate);

/**
 * @swagger
 * /api/special-care/{id}:
 *   delete:
 *     summary: Delete a special care item
 *     tags: [Special Care]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Special Care Item ID
 *     responses:
 *       200:
 *         description: Special care item deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Special care item deleted successfully"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Special care item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', protectRoute, specialCareDelete);

/**
 * @swagger
 * /api/special-care/{id}/progress:
 *   post:
 *     summary: Add progress to a special care item
 *     tags: [Special Care]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Special Care Item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *                 example: "Student showed improvement in algebra concepts"
 *               progressPercentage:
 *                 type: integer
 *                 example: 75
 *               resourcesAdded:
 *                 type: object
 *                 example: {"newMaterials": ["algebra_worksheets.pdf"]}
 *             required:
 *               - notes
 *     responses:
 *       201:
 *         description: Progress added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SpecialCareProgress'
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/:id/progress', protectRoute, specialCareAddProgress);

/**
 * @swagger
 * /api/special-care/{id}/progress:
 *   get:
 *     summary: Get progress for a special care item
 *     tags: [Special Care]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Special Care Item ID
 *     responses:
 *       200:
 *         description: List of progress entries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SpecialCareProgress'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/:id/progress', protectRoute, specialCareGetProgress);

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     SpecialCareItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         student_ids:
 *           type: array
 *           items:
 *             type: integer
 *           example: [123, 124, 125]
 *         student_names:
 *           type: array
 *           items:
 *             type: string
 *           example: ["John Doe", "Jane Smith", "Mike Johnson"]
 *         category_id:
 *           type: integer
 *           example: 2
 *         title:
 *           type: string
 *           example: "Math Remedial Classes"
 *         description:
 *           type: string
 *           example: "Weekly remedial classes for mathematics"
 *         care_type:
 *           type: string
 *           enum: [academic, emotional, health, inclusive]
 *           example: "academic"
 *         schedule_details:
 *           type: object
 *           example: {"days": ["Monday", "Wednesday"], "time": "4-5 PM"}
 *         resources:
 *           type: object
 *           example: {"materials": ["workbook.pdf"], "tools": ["calculator"]}
 *         assigned_to:
 *           type: integer
 *           example: 5
 *         status:
 *           type: string
 *           enum: [active, completed, archived]
 *           example: "active"
 *         start_date:
 *           type: string
 *           format: date
 *           example: "2023-09-01"
 *         end_date:
 *           type: string
 *           format: date
 *           example: "2023-12-15"
 *         visibility:
 *           type: string
 *           enum: [private, class, school]
 *           example: "class"
 *         created_by:
 *           type: integer
 *           example: 456
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2023-09-01T10:30:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: "2023-09-01T10:30:00Z"
 *         student_name:
 *           type: string
 *           example: "John Doe"
 *         category_name:
 *           type: string
 *           example: "Academic Support"
 *         assigned_to_name:
 *           type: string
 *           example: "Jane Smith"
 *     SpecialCareProgress:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         care_item_id:
 *           type: integer
 *           example: 1
 *         notes:
 *           type: string
 *           example: "Student showed improvement in algebra concepts"
 *         progress_percentage:
 *           type: integer
 *           example: 75
 *         resources_added:
 *           type: object
 *           example: {"newMaterials": ["algebra_worksheets.pdf"]}
 *         updated_by:
 *           type: integer
 *           example: 456
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2023-09-15T14:22:00Z"
 *         updated_by_name:
 *           type: string
 *           example: "Jane Smith"
 */