import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import {
  createSyllabus,
  addSyllabusItem,
  getSyllabus,
  getSubjects,
  updateItem,
  deleteItem
} from "../controllers/syllabus.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Syllabus
 *   description: Syllabus management
 */

/**
 * @swagger
 * /api/syllabus:
 *   post:
 *     summary: Create a new syllabus
 *     tags: [Syllabus]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SyllabusCreate'
 *     responses:
 *       201:
 *         description: Syllabus created successfully
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 */
router.post('/', protectRoute, createSyllabus);

/**
 * @swagger
 * /api/syllabus/items:
 *   post:
 *     summary: Add an item to syllabus
 *     tags: [Syllabus]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SyllabusItemCreate'
 *     responses:
 *       201:
 *         description: Item added successfully
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 */
router.post('/items', protectRoute, addSyllabusItem);

/**
 * @swagger
 * /api/syllabus/{class_id}/{subject_id}/{academic_year}:
 *   get:
 *     summary: Get syllabus for a class and subject
 *     tags: [Syllabus]
 *     parameters:
 *       - in: path
 *         name: class_id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: subject_id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: academic_year
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Syllabus data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Syllabus'
 *       404:
 *         description: Syllabus not found
 */
router.get('/:class_id/:subject_id/:academic_year', getSyllabus);

/**
 * @swagger
 * /api/syllabus/subjects/{class_id}:
 *   get:
 *     summary: Get subjects for a class
 *     tags: [Syllabus]
 *     parameters:
 *       - in: path
 *         name: class_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of subjects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Subject'
 */
router.get('/subjects/:class_id', getSubjects);

/**
 * @swagger
 * /api/syllabus/items/{id}:
 *   put:
 *     summary: Update a syllabus item
 *     tags: [Syllabus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SyllabusItemUpdate'
 *     responses:
 *       200:
 *         description: Item updated successfully
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 */
router.put('/items/:id', protectRoute, updateItem);

/**
 * @swagger
 * /api/syllabus/items/{id}:
 *   delete:
 *     summary: Delete a syllabus item
 *     tags: [Syllabus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Item deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.delete('/items/:id', protectRoute, deleteItem);

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Syllabus:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         term:
 *           type: string
 *         academic_year:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SyllabusItem'
 * 
 *     SyllabusCreate:
 *       type: object
 *       properties:
 *         class_id:
 *           type: integer
 *         subject_id:
 *           type: integer
 *         term:
 *           type: string
 *         academic_year:
 *           type: string
 *       required:
 *         - class_id
 *         - subject_id
 *         - term
 *         - academic_year
 * 
 *     SyllabusItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         sequence:
 *           type: integer
 * 
 *     SyllabusItemCreate:
 *       type: object
 *       properties:
 *         syllabus_id:
 *           type: integer
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         sequence:
 *           type: integer
 *       required:
 *         - syllabus_id
 *         - title
 *         - sequence
 * 
 *     SyllabusItemUpdate:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         sequence:
 *           type: integer
 * 
 *     Subject:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         code:
 *           type: string
 */