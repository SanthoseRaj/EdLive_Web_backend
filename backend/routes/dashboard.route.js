import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import {
  getDashboardCounts,
  markAsViewed,
  getLastViewed,
  markMultipleAsViewed,
  getDailyNotifications,
  getMessageReplies,
  addMessageReply
} from "../controllers/dashboard.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard counts and view management
 */

/**
 * @swagger
 * /api/dashboard/counts:
 *   get:
 *     summary: Get dashboard counts for notifications, todos, etc.
 *     security:
 *       - BearerAuth: []
 *     tags: [Dashboard]
 *     parameters:
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: string
 *         required: false
 *         description: Student ID (required when user is a student)
 *     responses:
 *       200:
 *         description: Dashboard counts object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notifications:
 *                   type: integer
 *                   example: 5
 *                 todo:
 *                   type: integer
 *                   example: 3
 *                 attendance:
 *                   type: integer
 *                   example: 2
 *                 payments:
 *                   type: integer
 *                   example: 4
 *                 exams:
 *                   type: integer
 *                   example: 1
 *                 messages:
 *                   type: integer
 *                   example: 7
 *                 library:
 *                   type: integer
 *                   example: 0
 *                 cocurricular:
 *                   type: integer
 *                   example: 2
 *                 achievements:
 *                   type: integer
 *                   example: 3
 *                 quick_notes:
 *                   type: integer
 *                   example: 1
 *                 special_care:
 *                   type: integer
 *                   example: 2
 *       400:
 *         description: Bad request - studentId is required for student users
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/counts',protectRoute, getDashboardCounts);

/**
 * @swagger
 * /api/dashboard/viewed:
 *   post:
 *     summary: Mark dashboard item as viewed
 *     security:
 *       - BearerAuth: []
 *     tags: [Dashboard]
 *     parameters:
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: string
 *         required: false
 *         description: Student ID (required when user is a student)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               item_type:
 *                 type: string
 *                 example: "notifications" 
 *               item_id:
 *                 type: integer
 *             required:
 *               - item_type
 *               - item_id
 *     responses:
 *       200:
 *         description: Item marked as viewed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Bad request - item_type is required
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/viewed',protectRoute, markAsViewed);

/**
 * @swagger
 * /api/dashboard/last-viewed:
 *   get:
 *     summary: Get last viewed timestamp for a dashboard item
 *     security:
 *       - BearerAuth: []
 *     tags: [Dashboard]
 *     parameters:
 *       - in: query
 *         name: item_type
 *         schema:
 *           type: string
 *         required: true
 *         description: Type of dashboard item
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: string
 *         required: false
 *         description: Student ID (required when user is a student)
 *     responses:
 *       200:
 *         description: Last viewed timestamp
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 last_viewed:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-12-01T10:30:00.000Z"
 *       400:
 *         description: Bad request - item_type is required
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/last-viewed',protectRoute, getLastViewed);
router.post('/viewed-multiple', protectRoute, markMultipleAsViewed);

/**
 * @swagger
 * /api/dashboard/daily-notifications:
 *   get:
 *     summary: Get daily notifications from all modules
 *     security:
 *       - BearerAuth: []
 *     tags: [Dashboard]
 *     parameters:
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: string
 *         required: false
 *         description: Student ID (required when user is a student)
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Date to get notifications for (YYYY-MM-DD format, defaults to today)
 *     responses:
 *       200:
 *         description: Daily notifications list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 5
 *                 date:
 *                   type: string
 *                   format: date
 *                   example: "2023-12-01"
 *                 notifications:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 123
 *                       module_type:
 *                         type: string
 *                         example: "todo"
 *                       title:
 *                         type: string
 *                         example: "Math Homework"
 *                       content:
 *                         type: string
 *                         example: "Complete exercises 1-10"
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-12-01T10:30:00.000Z"
 *                       type:
 *                         type: string
 *                         example: "Pending todo item"
 *                       has_replies:
 *                         type: boolean
 *                         example: true
 *       400:
 *         description: Bad request - studentId is required for student users
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/daily-notifications', protectRoute, getDailyNotifications);

/**
 * @swagger
 * /api/dashboard/messages/{itemId}/replies:
 *   get:
 *     summary: Get replies for a specific message with hierarchy
 *     security:
 *       - BearerAuth: []
 *     tags: [Dashboard]
 *     parameters:
 *       - in: path
 *         name: itemId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Message ID
 *       - in: query
 *         name: item_type
 *         schema:
 *           type: string
 *         required: true
 *         description: Type of message item
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: string
 *         required: false
 *         description: Student ID (required when user is a student)
 *     responses:
 *       200:
 *         description: Hierarchical replies structure
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 replies:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Reply'
 *       400:
 *         description: Bad request - missing parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/messages/:itemId/replies', protectRoute, getMessageReplies);

/**
 * @swagger
 * /api/dashboard/messages/{itemId}/reply:
 *   post:
 *     summary: Add a reply to a message
 *     security:
 *       - BearerAuth: []
 *     tags: [Dashboard]
 *     parameters:
 *       - in: path
 *         name: itemId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Message ID
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: string
 *         required: false
 *         description: Student ID (required when user is a student)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               item_type:
 *                 type: string
 *                 example: "messages"
 *               message_text:
 *                 type: string
 *                 example: "Thank you for the information"
 *               parent_id:
 *                 type: integer
 *                 required: false
 *                 description: Parent reply ID for nested replies
 *             required:
 *               - item_type
 *               - message_text
 *     responses:
 *       200:
 *         description: Reply added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 reply:
 *                   $ref: '#/components/schemas/Reply'
 *       400:
 *         description: Bad request - missing parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/messages/:itemId/reply', protectRoute, addMessageReply);

/**
 * @swagger
 * components:
 *   schemas:
 *     Reply:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         item_id:
 *           type: integer
 *           example: 123
 *         item_type:
 *           type: string
 *           example: "messages"
 *         sender_id:
 *           type: integer
 *           example: 456
 *         sender_type:
 *           type: string
 *           example: "Teacher"
 *         sender_name:
 *           type: string
 *           example: "John Smith"
 *         message_text:
 *           type: string
 *           example: "I'll check on that"
 *         parent_id:
 *           type: integer
 *           nullable: true
 *           example: null
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2023-12-01T10:30:00.000Z"
 *         depth:
 *           type: integer
 *           example: 1
 *         replies:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Reply'
 */

export default router;