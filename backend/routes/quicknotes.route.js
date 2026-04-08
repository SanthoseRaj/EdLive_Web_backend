import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import {
  quickNoteCreate,
  quickNoteGetAll,
  quickNoteGetById,
  quickNoteUpdate,
  quickNoteDelete,
  getTeacherClasses,
  getClassStudents,
  getStudentsDetails
} from "../controllers/quicknotes.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: QuickNotes
 *   description: Quick Notes management
 */

/**
 * @swagger
 * /api/quicknotes:
 *   post:
 *     summary: Create a new quick note
 *     tags: [QuickNotes]
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
 *               studentIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *               classId:
 *                 type: integer
 *                 example: 10
 *             required:
 *               - title
 *               - classId
 *     responses:
 *       201:
 *         description: Quick note created successfully
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 */
router.post('/', protectRoute, quickNoteCreate);

/**
 * @swagger
 * /api/quicknotes:
 *   get:
 *     summary: Get all quick notes with optional filtering
 *     tags: [QuickNotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: classId
 *         schema:
 *           type: integer
 *         description: Filter by class ID
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: integer
 *         description: Filter by student ID (returns notes that include this student)
 *     responses:
 *       200:
 *         description: List of quick notes
 *       401:
 *         description: Unauthorized
 */
router.get('/', protectRoute, quickNoteGetAll);

/**
 * @swagger
 * /api/quicknotes/classes:
 *   get:
 *     summary: Get classes for the current teacher
 *     tags: [QuickNotes]
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
 * /api/quicknotes/classes/{classId}/students:
 *   get:
 *     summary: Get students by class ID
 *     tags: [QuickNotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Class ID
 *     responses:
 *       200:
 *         description: List of students
 *       400:
 *         description: Class ID is required
 *       401:
 *         description: Unauthorized
 */
router.get('/classes/:classId/students', protectRoute, getClassStudents);

/**
 * @swagger
 * /api/quicknotes/students/details:
 *   post:
 *     summary: Get student details by IDs
 *     tags: [QuickNotes]
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
 *             required:
 *               - studentIds
 *     responses:
 *       200:
 *         description: List of student details
 *       400:
 *         description: Student IDs array is required
 *       401:
 *         description: Unauthorized
 */
router.post('/students/details', protectRoute, getStudentsDetails);

/**
 * @swagger
 * /api/quicknotes/{id}:
 *   get:
 *     summary: Get a specific quick note by ID
 *     tags: [QuickNotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Quick note ID
 *     responses:
 *       200:
 *         description: Quick note details
 *       404:
 *         description: Quick note not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', protectRoute, quickNoteGetById);

/**
 * @swagger
 * /api/quicknotes/{id}:
 *   put:
 *     summary: Update a quick note
 *     tags: [QuickNotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Quick note ID
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
 *               studentIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Quick note updated successfully
 *       403:
 *         description: Not authorized to update this note
 *       404:
 *         description: Quick note not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:id', protectRoute, quickNoteUpdate);

/**
 * @swagger
 * /api/quicknotes/{id}:
 *   delete:
 *     summary: Delete a quick note
 *     tags: [QuickNotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Quick note ID
 *     responses:
 *       200:
 *         description: Quick note deleted successfully
 *       403:
 *         description: Not authorized to delete this note
 *       404:
 *         description: Quick note not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', protectRoute, quickNoteDelete);

export default router;