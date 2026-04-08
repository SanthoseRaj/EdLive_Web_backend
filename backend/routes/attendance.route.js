import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import {
    getAttendanceByClass,
    toggleAttendance,
    getMonthlySummary,
    getAttendanceByStudent,
    getMonthlyStudentSummary,
    getAdminAttendance
    
} from "../controllers/attendance.controller.js";

const router = express.Router();


/**
 * @swagger
 * /api/attendance/teacher:
 *   get:
 *     summary: Get attendance by class and date
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: classId
 *         schema:
 *           type: integer
 *         required: true
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *     responses:
 *       200:
 *         description: List of attendance records
 */
router.get('/teacher', protectRoute, getAttendanceByClass);

/**
 * @swagger
 * /api/attendance/student:
 *   get:
 *     summary: Get attendance by student and date
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: integer
 *         required: true
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *     responses:
 *       200:
 *         description: List of attendance records
 */
router.get('/student', protectRoute, getAttendanceByStudent);
/**
 * @swagger
 * /api/attendance/toggle:
 *   post:
 *     summary: Toggle attendance for a student (morning/afternoon)
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentId:
 *                 type: integer
 *               classId:
 *                 type: integer
 *               date:
 *                 type: string
 *                 format: date
 *               session:
 *                 type: string
 *                 enum: [morning, afternoon]
 *               isPresent:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Attendance updated
 */
router.post('/toggle', protectRoute, toggleAttendance);

/**
 * @swagger
 * /api/attendance/monthly:
 *   get:
 *     summary: Get monthly attendance summary per student
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: classId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Attendance summary for students
 */
router.get('/monthly', protectRoute, getMonthlySummary);

/**
 * @swagger
 * /api/attendance/studentMonthly:
 *   get:
 *     summary: Get monthly attendance summary for student
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Attendance summary for students
 */
router.get('/studentMonthly', protectRoute, getMonthlyStudentSummary);

/**
 * @swagger
 * /api/attendance/stats/admin:
 *   get:
 *     summary: Get admin attendance statistics
 *     tags: [Attendance]
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
 *         description: Class Name (e.g. "10") for all sections
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Start date for attendance range
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: End date for attendance range
 *     responses:
 *       200:
 *         description: Attendance statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/stats/admin', protectRoute, getAdminAttendance);


export default router;  