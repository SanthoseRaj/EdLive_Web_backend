import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import {
  getCategories,
  getActivities,
  getStudentActivities,
  enrollStudent,
  removeActivity,
  updateActivity,
  getStats,
  createEvent,
  getEvents,
  addParticipants,
  saveAttendance,
  getAttendance
} from "../controllers/coCurricular.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: CoCurricular
 *   description: Co-curricular activities management
 */

/**
 * @swagger
 * /api/co-curricular/categories:
 *   get:
 *     summary: Get all activity categories
 *     tags: [CoCurricular]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of activity categories
 *       401:
 *         description: Unauthorized
 */
router.get('/categories', protectRoute, getCategories);

/**
 * @swagger
 * /api/co-curricular/activities:
 *   get:
 *     summary: Get all activities or filter by category
 *     tags: [CoCurricular]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *         description: Filter activities by category ID
 *     responses:
 *       200:
 *         description: List of activities
 *       401:
 *         description: Unauthorized
 */
router.get('/activities', protectRoute, getActivities);

/**
 * @swagger
 * /api/co-curricular/student-activities:
 *   get:
 *     summary: Get student's enrolled activities
 *     tags: [CoCurricular]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: integer
 *         description: Student ID (for teachers/admins)
 *       - in: query
 *         name: academicYear
 *         schema:
 *           type: string
 *         description: Academic year filter
 *     responses:
 *       200:
 *         description: List of student activities
 *       401:
 *         description: Unauthorized
 */
router.get('/student-activities', protectRoute, getStudentActivities);

/**
 * @swagger
 * /api/co-curricular/enroll:
 *   post:
 *     summary: Enroll student in an activity
 *     tags: [CoCurricular]
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
 *                 example: 123
 *               activityId:
 *                 type: integer
 *                 example: 5
 *               classId:
 *                 type: integer
 *                 example: 10
 *               categoryId:
 *                 type: integer
 *                 example: 1
 *               academicYear:
 *                 type: string
 *                 example: "2025-2026"
 *               remarks:
 *                 type: string
 *                 example: "Goalkeeper position"
 *             required:
 *               - studentId
 *               - activityId
 *               - classId
 *     responses:
 *       201:
 *         description: Student enrolled successfully
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 */
router.post('/enroll', protectRoute, enrollStudent);

/**
 * @swagger
 * /api/co-curricular/activity/{id}:
 *   delete:
 *     summary: Remove student from activity
 *     tags: [CoCurricular]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Student activity enrollment ID
 *     responses:
 *       200:
 *         description: Activity removed successfully
 *       404:
 *         description: Enrollment not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/activity/:id', protectRoute, removeActivity);

/**
 * @swagger
 * /api/co-curricular/activity/{id}:
 *   put:
 *     summary: Update student activity details
 *     tags: [CoCurricular]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Student activity enrollment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoryId:
 *                 type: integer
 *               remarks:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, completed, withdrawn]
 *     responses:
 *       200:
 *         description: Activity updated successfully
 *       404:
 *         description: Enrollment not found
 *       401:
 *         description: Unauthorized
 */
router.put('/activity/:id', protectRoute, updateActivity);

/**
 * @swagger
 * /api/co-curricular/stats:
 *   get:
 *     summary: Get activity enrollment statistics
 *     tags: [CoCurricular]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: classId
 *         schema:
 *           type: integer
 *         description: Filter by class ID
 *       - in: query
 *         name: academicYear
 *         schema:
 *           type: string
 *         description: Academic year filter
 *     responses:
 *       200:
 *         description: Activity enrollment statistics
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', protectRoute, getStats);


/**
 * @swagger
 * /api/co-curricular/events:
 *   post:
 *     summary: Create a new co-curricular event
 *     tags: [CoCurricular]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventName
 *               - startDate
 *               - endDate
 *               - classId
 *             properties:
 *               eventName:
 *                 type: string
 *                 example: "Inter School Sports Meet"
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-01-15"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-01-17"
 *               categoryId:
 *                 type: integer
 *                 example: 1
 *               activityId:
 *                 type: integer
 *                 example: 4
 *               staffId:
 *                 type: integer
 *                 example: 12
 *               classId:
 *                 type: integer
 *                 example: 10
 *               remarks:
 *                 type: string
 *                 example: "Annual sports competition"
 *     responses:
 *       201:
 *         description: Event created successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/events/", protectRoute, createEvent);

/**
 * @swagger
 * /api/co-curricular/events:
 *   get:
 *     summary: Get all co-curricular events
 *     tags: [CoCurricular]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of events
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   event_name:
 *                     type: string
 *                   start_date:
 *                     type: string
 *                   end_date:
 *                     type: string
 *                   category_name:
 *                     type: string
 *                   activity_name:
 *                     type: string
 *       401:
 *         description: Unauthorized
 */
router.get("/events/", protectRoute, getEvents);

/**
 * @swagger
 * /api/co-curricular/events/{eventId}/participants:
 *   post:
 *     summary: Add students as participants to an event
 *     tags: [CoCurricular]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentIds
 *             properties:
 *               studentIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [21, 22, 25]
 *     responses:
 *       200:
 *         description: Participants added successfully
 *       401:
 *         description: Unauthorized
 */

router.post("/events/:eventId/participants", protectRoute, addParticipants);

/**
 * @swagger
 * /api/co-curricular/events/{eventId}/attendance:
 *   post:
 *     summary: Save or update attendance for an event
 *     tags: [CoCurricular]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - records
 *             properties:
 *               records:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     studentId:
 *                       type: integer
 *                       example: 21
 *                     date:
 *                       type: string
 *                       format: date
 *                       example: "2025-01-15"
 *                     status:
 *                       type: string
 *                       enum: [present, absent]
 *     responses:
 *       200:
 *         description: Attendance saved successfully
 *       401:
 *         description: Unauthorized
 */

router.post("/events/:eventId/attendance", protectRoute, saveAttendance);
/**
 * @swagger
 * /api/co-curricular/events/{eventId}/attendance:
 *   get:
 *     summary: Get attendance records for an event
 *     tags: [CoCurricular]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Attendance list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   student_id:
 *                     type: integer
 *                   full_name:
 *                     type: string
 *                   attendance_date:
 *                     type: string
 *                   status:
 *                     type: string
 *       401:
 *         description: Unauthorized
 */
router.get("/events/:eventId/attendance", protectRoute, getAttendance);

export default router;