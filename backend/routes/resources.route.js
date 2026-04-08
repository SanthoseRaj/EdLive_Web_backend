import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import {
  resourceCreate,
  resourceGetAll,
  resourceGetById,
  resourceUpdate,
  resourceDelete,
  getTeacherClasses,
  getSubjects,
  getTeacherSubjects
} from "../controllers/resources.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Resources
 *   description: Educational resources management
 */

/**
 * @swagger
 * /api/resources:
 *   post:
 *     summary: Create a new educational resource
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Maths Formulas"
 *               description:
 *                 type: string
 *                 example: "Important formulas for algebra and geometry"
 *               webLinks:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["https://example.com/maths-formulas", "https://example.com/algebra-guide"]
 *               classId:
 *                 type: integer
 *                 example: 10
 *               subjectId:
 *                 type: integer
 *                 example: 5
 *             required:
 *               - title
 *               - classId
 *     responses:
 *       201:
 *         description: Resource created successfully
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 */
router.post('/', protectRoute, resourceCreate);

/**
 * @swagger
 * /api/resources:
 *   get:
 *     summary: Get all resources with optional filtering
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: classId
 *         schema:
 *           type: integer
 *         description: Filter by class ID
 *       - in: query
 *         name: subjectId
 *         schema:
 *           type: integer
 *         description: Filter by subject ID
 *     responses:
 *       200:
 *         description: List of resources
 *       401:
 *         description: Unauthorized
 */
router.get('/', protectRoute, resourceGetAll);

/**
 * @swagger
 * /api/resources/classes:
 *   get:
 *     summary: Get classes for the current teacher
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of classes
 *       403:
 *         description: Only teachers can access classes
 *       401:
 *         description: Unauthorized
 */
router.get('/classes', protectRoute, getTeacherClasses);

/**
 * @swagger
 * /api/resources/subjects:
 *   get:
 *     summary: Get all available subjects (optionally filtered by class)
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: classId
 *         schema:
 *           type: integer
 *         description: Filter subjects by class/grade level
 *     responses:
 *       200:
 *         description: List of subjects
 *       401:
 *         description: Unauthorized
 */
router.get('/subjects', protectRoute, getSubjects);

/**
 * @swagger
 * /api/resources/teacher/subjects:
 *   get:
 *     summary: Get subjects assigned to the current teacher
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of teacher's subjects
 *       403:
 *         description: Only teachers can access assigned subjects
 *       401:
 *         description: Unauthorized
 */
router.get('/teacher/subjects', protectRoute, getTeacherSubjects);

/**
 * @swagger
 * /api/resources/{id}:
 *   get:
 *     summary: Get a specific resource by ID
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Resource ID
 *     responses:
 *       200:
 *         description: Resource details
 *       404:
 *         description: Resource not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', protectRoute, resourceGetById);

/**
 * @swagger
 * /api/resources/{id}:
 *   put:
 *     summary: Update a resource
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Resource ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               webLinks:
 *                 type: array
 *                 items:
 *                   type: string
 *               classId:
 *                 type: integer
 *               subjectId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Resource updated successfully
 *       403:
 *         description: Not authorized to update this resource
 *       404:
 *         description: Resource not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:id', protectRoute, resourceUpdate);

/**
 * @swagger
 * /api/resources/{id}:
 *   delete:
 *     summary: Delete a resource
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Resource ID
 *     responses:
 *       200:
 *         description: Resource deleted successfully
 *       403:
 *         description: Not authorized to delete this resource
 *       404:
 *         description: Resource not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', protectRoute, resourceDelete);

export default router;