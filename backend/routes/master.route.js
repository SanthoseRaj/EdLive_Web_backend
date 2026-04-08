import express from "express"
import { 
    getPeriods,
    getClasses,
    getsubjects,
    getAllStaff,
    getAllStudents,
    getAllClasses,
    getClassById,
    createClass,
    updateClass,
    deleteClass,
    getAllSubjects,
    getSubjectsById,
    createSubjects,
    updateSubjects,
    deleteSubjects,
    getAllPeriods,
    getPeriodsById,
    createPeriods,
    updatePeriods,
    deletePeriods,
    getSubjectTeacherAllocations,
 } from "../controllers/master.controllers.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Master Data
 *     description: API for managing master data (classes, subjects, periods)
 */

/**
 * @swagger
 * /api/master/periods:
 *   get:
 *     summary: Get all periods (basic)
 *     tags: [Master Data/Period]
 *     responses:
 *       200:
 *         description: List of periods
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 */
router.get('/periods', getPeriods);

/**
 * @swagger
 * /api/master/classes:
 *   get:
 *     summary: Get all classes (basic)
 *     tags: [Master Data/classes]
 *     responses:
 *       200:
 *         description: List of classes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 */
router.get('/classes', getClasses);

/**
 * @swagger
 * /api/master/subjects:
 *   get:
 *     summary: Get all subjects (basic)
 *     tags: [Master Data/Subjects]
 *     responses:
 *       200:
 *         description: List of subjects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 */
router.get('/subjects', getsubjects);
router.get('/staff',protectRoute, getAllStaff);
router.get('/students',protectRoute, getAllStudents);

/**
 * @swagger
 * /api/master/classes:
 *   get:
 *     summary: Get all classes (detailed)
 *     tags: [Master Data/classes]
 *     responses:
 *       200:
 *         description: List of all classes with details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Class'
 */
router.get('/classes', getAllClasses);

/**
 * @swagger
 * /api/master/classes/{id}:
 *   get:
 *     summary: Get a class by ID
 *     tags: [Master Data/classes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Class ID
 *     responses:
 *       200:
 *         description: Class data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Class'
 *       404:
 *         description: Class not found
 */
router.get('/classes/:id', getClassById);

/**
 * @swagger
 * /api/master/classes:
 *   post:
 *     summary: Create a new class
 *     tags: [Master Data/classes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Class'
 *     responses:
 *       201:
 *         description: Class created successfully
 *       400:
 *         description: Invalid input
 */
router.post('/classes', createClass);

/**
 * @swagger
 * /api/master/classes/{id}:
 *   put:
 *     summary: Update a class
 *     tags: [Master Data/classes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Class ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Class'
 *     responses:
 *       200:
 *         description: Class updated successfully
 *       404:
 *         description: Class not found
 *       400:
 *         description: Invalid input
 */
router.put('/classes/:id', updateClass);

/**
 * @swagger
 * /api/master/classes/{id}:
 *   delete:
 *     summary: Delete a class
 *     tags: [Master Data/classes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Class ID
 *     responses:
 *       200:
 *         description: Class deleted successfully
 *       404:
 *         description: Class not found
 */
router.delete('/classes/:id', deleteClass);

/**
 * @swagger
 * /api/master/SubjectsMaster:
 *   get:
 *     summary: Get all subjects (detailed)
 *     tags: [Master Data/Subjects]
 *     responses:
 *       200:
 *         description: List of all subjects with details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Subject'
 */
router.get('/SubjectsMaster', getAllSubjects);

/**
 * @swagger
 * /api/master/Subjects/{id}:
 *   get:
 *     summary: Get a subject by ID
 *     tags: [Master Data/Subjects]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Subject ID
 *     responses:
 *       200:
 *         description: Subject data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subject'
 *       404:
 *         description: Subject not found
 */
router.get('/Subjects/:id', getSubjectsById);

/**
 * @swagger
 * /api/master/Subjects:
 *   post:
 *     summary: Create a new subject
 *     tags: [Master Data/Subjects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Subject'
 *     responses:
 *       201:
 *         description: Subject created successfully
 *       400:
 *         description: Invalid input
 */
router.post('/Subjects', createSubjects);

/**
 * @swagger
 * /api/master/Subjects/{id}:
 *   put:
 *     summary: Update a subject
 *     tags: [Master Data/Subjects]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Subject ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Subject'
 *     responses:
 *       200:
 *         description: Subject updated successfully
 *       404:
 *         description: Subject not found
 *       400:
 *         description: Invalid input
 */
router.put('/Subjects/:id', updateSubjects);

/**
 * @swagger
 * /api/master/Subjects/{id}:
 *   delete:
 *     summary: Delete a subject
 *     tags: [Master Data/Subjects]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Subject ID
 *     responses:
 *       200:
 *         description: Subject deleted successfully
 *       404:
 *         description: Subject not found
 */
router.delete('/Subjects/:id', deleteSubjects);

/**
 * @swagger
 * /api/master/Periods:
 *   get:
 *     summary: Get all periods (detailed)
 *     tags: [Master Data/Period]
 *     responses:
 *       200:
 *         description: List of all periods with details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Period'
 */
router.get('/Periods', getAllPeriods);

/**
 * @swagger
 * /api/master/Periods/{id}:
 *   get:
 *     summary: Get a period by ID
 *     tags: [Master Data/Period]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Period ID
 *     responses:
 *       200:
 *         description: Period data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Period'
 *       404:
 *         description: Period not found
 */
router.get('/Periods/:id', getPeriodsById);

/**
 * @swagger
 * /api/master/Periods:
 *   post:
 *     summary: Create a new period
 *     tags: [Master Data/Period]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Period'
 *     responses:
 *       201:
 *         description: Period created successfully
 *       400:
 *         description: Invalid input
 */
router.post('/Periods', createPeriods);

/**
 * @swagger
 * /api/master/Periods/{id}:
 *   put:
 *     summary: Update a period
 *     tags: [Master Data/Period]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Period ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Period'
 *     responses:
 *       200:
 *         description: Period updated successfully
 *       404:
 *         description: Period not found
 *       400:
 *         description: Invalid input
 */
router.put('/Periods/:id', updatePeriods);

/**
 * @swagger
 * /api/master/Periods/{id}:
 *   delete:
 *     summary: Delete a period
 *     tags: [Master Data/Period]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Period ID
 *     responses:
 *       200:
 *         description: Period deleted successfully
 *       404:
 *         description: Period not found
 */
router.delete('/Periods/:id', deletePeriods);

/**
 * @swagger
 * components:
 *   schemas:
 *     Class:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the class
 *         name:
 *           type: string
 *           description: The name of the class
 *         description:
 *           type: string
 *           description: Description of the class
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the class was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the class was last updated
 *     Subject:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the subject
 *         name:
 *           type: string
 *           description: The name of the subject
 *         code:
 *           type: string
 *           description: Subject code
 *         description:
 *           type: string
 *           description: Description of the subject
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the subject was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the subject was last updated
 *     Period:
 *       type: object
 *       required:
 *         - name
 *         - startTime
 *         - endTime
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the period
 *         name:
 *           type: string
 *           description: The name of the period
 *         startTime:
 *           type: string
 *           format: time
 *           description: Start time of the period
 *         endTime:
 *           type: string
 *           format: time
 *           description: End time of the period
 *         description:
 *           type: string
 *           description: Description of the period
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the period was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the period was last updated
 */


/**
 * @swagger
 * /api/master/allocations:
 *   get:
 *     summary: Get teacher allocations for a specific subject
 *     tags: [Master Data/Allocations]
 *     parameters:
 *       - in: query
 *         name: subject_id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the subject to filter by
 *     responses:
 *       200:
 *         description: List of teachers and their classes for the subject
 *       400:
 *         description: Subject ID is required
 *       500:
 *         description: Internal server error
 */
router.get('/allocations',protectRoute, getSubjectTeacherAllocations);

export default router;