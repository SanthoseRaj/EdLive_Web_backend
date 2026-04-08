import express from "express";
import protectRoute from "../middleware/protectRoute.js";

import {
    getExamTypes,
    getStudentExams,
    getTeacherExams,
    createExam,
    getExamDetails,
    updateExam,
    createExamResult,
    getStudentResults,
    getExamResults,
    getExamResultDetails,
    updateExamResult,
    deleteExamResult,
    getAdminExamStats

} from "../controllers/exam.controller.js"

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Exams
 *   description: Exam management endpoints
 */

/**
 * @swagger
 * /api/exams/types:
 *   get:
 *     summary: Get all active exam types
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of exam types
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ExamType'
 *       500:
 *         description: Server error
 */

router.get('/types', protectRoute, getExamTypes);

/**
 * @swagger
 * /api/exams/student/{student_id}:
 *   get:
 *     summary: Get exams for student view (grouped by upcoming/past)
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: student_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Exams grouped by upcoming and past
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     upcoming:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Exam'
 *                     past:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Exam'
 *       500:
 *         description: Server error
 */

router.get('/student/:student_id', protectRoute, getStudentExams);

/**
 * @swagger
 * /api/exams/teacher:
 *   get:
 *     summary: Get all exams created by teacher
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of exams
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Exam'
 *       500:
 *         description: Server error
 */

router.get('/teacher', protectRoute, getTeacherExams);

/**
 * @swagger
 * /api/exams/teacher/{class_id}:
 *   get:
 *     summary: Get exams for specific class (teacher view)
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: class_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID
 *     responses:
 *       200:
 *         description: List of exams for the class
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Exam'
 *       500:
 *         description: Server error
 */

router.get('/teacher/:class_id', protectRoute, getTeacherExams);
/**
 * @swagger
 * /api/exams:
 *   post:
 *     summary: Create a new exam
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ExamInput'
 *     responses:
 *       201:
 *         description: Exam created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Exam'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/', protectRoute, createExam);

/**
 * @swagger
 * /api/exams/{id}:
 *   get:
 *     summary: Get exam details by ID
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Exam ID
 *     responses:
 *       200:
 *         description: Exam details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Exam'
 *       404:
 *         description: Exam not found
 *       500:
 *         description: Server error
 */

router.get('/:id', protectRoute, getExamDetails);

/**
 * @swagger
 * /api/exams/{id}:
 *   put:
 *     summary: Update an existing exam
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Exam ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ExamInput'
 *     responses:
 *       200:
 *         description: Exam updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Exam'
 *       403:
 *         description: Not authorized to update this exam
 *       404:
 *         description: Exam not found
 *       500:
 *         description: Server error
 */
router.put('/:id', protectRoute, updateExam);

/**
 * @swagger
 * components:
 *   schemas:
 *     ExamType:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         exam_type:
 *           type: string
 *         description:
 *           type: string
 *         is_active:
 *           type: boolean
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     Exam:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         subject:
 *           type: string
 *         exam_date:
 *           type: string
 *           format: date-time
 *         class_id:
 *           type: string
 *         description:
 *           type: string
 *         exam_type_id:
 *           type: integer
 *         exam_type:
 *           type: string
 *         created_by:
 *           type: integer
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     ExamInput:
 *       type: object
 *       required:
 *         - title
 *         - subject
 *         - exam_date
 *         - class_id
 *         - exam_type_id
 *       properties:
 *         title:
 *           type: string
 *         subject:
 *           type: string
 *         exam_date:
 *           type: string
 *           format: date-time
 *         class_id:
 *           type: string
 *         description:
 *           type: string
 *         exam_type_id:
 *           type: integer
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
/**
 * @swagger
 * /api/exams/results:
 *   post:
 *     summary: Create exam result
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - exam_id
 *               - student_id
 *               - marks
 *               - percentage
 *               - grade
 *             properties:
 *               exam_id:
 *                 type: integer
 *               student_id:
 *                 type: integer
 *               marks:
 *                 type: integer
 *               percentage:
 *                 type: number
 *               grade:
 *                 type: string
 *               term:
 *                 type: string
 *               is_final:
 *                 type: boolean
 *               class_rank:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Exam result created successfully
 *       500:
 *         description: Server error
 */
router.post('/results', protectRoute, createExamResult);

/**
 * @swagger
 * /api/exams/results/student/{student_id}:
 *   get:
 *     summary: Get all results for a student
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: student_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Student results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     examResults:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ExamResult'
 *                     termResults:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           term:
 *                             type: string
 *                           total_marks:
 *                             type: integer
 *                           average_percentage:
 *                             type: number
 *                           overall_grade:
 *                             type: string
 *                           class_rank:
 *                             type: integer
 *       500:
 *         description: Server error
 */
router.get('/results/student/:student_id', protectRoute, getStudentResults);
/**
 * @swagger
 * /api/exams/results/{exam_id}:
 *   get:
 *     summary: Get all results for an exam
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: exam_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Exam ID
 *     responses:
 *       200:
 *         description: Exam results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ExamResult'
 *       500:
 *         description: Server error
 */
router.get('/results/:exam_id', protectRoute, getExamResults);

/**
 * @swagger
 * components:
 *   schemas:
 *     ExamResult:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         exam_id:
 *           type: integer
 *         student_id:
 *           type: integer
 *         exam_type_id:
 *           type: integer
 *         subject:
 *           type: string
 *         marks:
 *           type: integer
 *         percentage:
 *           type: number
 *         grade:
 *           type: string
 *         term:
 *           type: string
 *         is_final:
 *           type: boolean
 *         class_rank:
 *           type: integer
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         exam_title:
 *           type: string
 *         exam_date:
 *           type: string
 *           format: date-time
 *         student_name:
 *           type: string
 *         exam_type:
 *           type: string
 */
/**
 * @swagger
 * /api/exams/results/{id}:
 *   get:
 *     summary: Get exam result details by ID
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Exam Result ID
 *     responses:
 *       200:
 *         description: Exam result details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ExamResult'
 *       404:
 *         description: Exam result not found
 *       500:
 *         description: Server error
 */
router.get('/results/single/:id', protectRoute, getExamResultDetails);

/**
 * @swagger
 * /api/exams/results/{id}:
 *   put:
 *     summary: Update an existing exam result
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Exam Result ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - exam_id
 *               - student_id
 *               - marks
 *               - percentage
 *               - grade
 *             properties:
 *               exam_id:
 *                 type: integer
 *               student_id:
 *                 type: integer
 *               marks:
 *                 type: integer
 *               percentage:
 *                 type: number
 *               grade:
 *                 type: string
 *               term:
 *                 type: string
 *               is_final:
 *                 type: boolean
 *               class_rank:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Exam result updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ExamResult'
 *       404:
 *         description: Exam result not found
 *       500:
 *         description: Server error
 */
router.put('/results/:id', protectRoute, updateExamResult);

/**
 * @swagger
 * /api/exams/results/{id}:
 *   delete:
 *     summary: Delete an exam result
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Exam Result ID
 *     responses:
 *       200:
 *         description: Exam result deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Exam result not found
 *       500:
 *         description: Server error
 */
router.delete('/results/:id', protectRoute, deleteExamResult);

/**
 * @swagger
 * /api/exams/stats/admin:
 *   get:
 *     summary: Get admin exam performance (filters optional)
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: classId
 *         schema:
 *           type: integer
 *         required: false
 *         description: Specific Class ID (Class + Section)
 *       - in: query
 *         name: className
 *         schema:
 *           type: string
 *         required: false
 *         description: Class Name (e.g. '10') for all sections
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Start date for exam filter
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: End date for exam filter
 *     responses:
 *       200:
 *         description: Stats retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/stats/admin', protectRoute, getAdminExamStats);
export default router;