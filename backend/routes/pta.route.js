import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import {
  createMeeting,
  getUpcomingMeetings,
  getMeetingHistory,
  getPTAMembers,
  announceMeeting
} from "../controllers/pta.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: PTA
 *   description: Parent-Teacher Association management
 */

/**
 * @swagger
 * /api/pta/meetings:
 *   post:
 *     summary: Create a new PTA meeting
 *     tags: [PTA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PTAMeetingCreate'
 *     responses:
 *       201:
 *         description: PTA meeting created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PTAMeeting'
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 */
router.post('/meetings', protectRoute, createMeeting);

/**
 * @swagger
 * /api/pta/meetings/upcoming:
 *   get:
 *     summary: Get upcoming PTA meetings
 *     tags: [PTA]
 *     responses:
 *       200:
 *         description: List of upcoming PTA meetings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PTAMeeting'
 */
router.get('/meetings/upcoming', getUpcomingMeetings);

/**
 * @swagger
 * /api/pta/meetings/history:
 *   get:
 *     summary: Get past PTA meetings
 *     tags: [PTA]
 *     responses:
 *       200:
 *         description: List of past PTA meetings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PTAMeeting'
 */
router.get('/meetings/history', getMeetingHistory);

/**
 * @swagger
 * /api/pta/members:
 *   get:
 *     summary: Get PTA members
 *     tags: [PTA]
 *     responses:
 *       200:
 *         description: List of PTA members
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PTAMember'
 */
router.get('/members', getPTAMembers);

/**
 * @swagger
 * /api/pta/announce:
 *   post:
 *     summary: Announce a PTA meeting
 *     tags: [PTA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PTAAnnouncement'
 *     responses:
 *       200:
 *         description: Announcement sent successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.post('/announce', protectRoute, announceMeeting);

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     PTAMeeting:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         date:
 *           type: string
 *           format: date
 *         time:
 *           type: string
 *           format: time
 *         classes:
 *           type: array
 *           items:
 *             type: string
 *         divisions:
 *           type: array
 *           items:
 *             type: string
 *         created_by:
 *           type: integer
 * 
 *     PTAMeetingCreate:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         date:
 *           type: string
 *           format: date
 *         time:
 *           type: string
 *           format: time
 *         class_ids:
 *           type: array
 *           items:
 *             type: integer
 *           description: Array of classmaster.id values
 *         include_all_sections:
 *           type: boolean
 *           description: Whether to include all sections of selected classes
 *       required:
 *         - title
 *         - date
 *         - time
 *         - class_ids
 * 
 *     PTAMember:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         position:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *     PTAAnnouncement:
 *       type: object
 *       properties:
 *         meetingId:
 *           type: integer
 *           example: 1
 *         class_ids:
 *           type: array
 *           items:
 *             type: integer
 *           example: [1, 2, 3]
 *         include_all_sections:
 *           type: boolean
 *           example: true
 *         channels:
 *           type: array
 *           items:
 *             type: string
 *             enum: [sms, whatsapp, email]
 *           example: ["email", "whatsapp"]
 *       required:
 *         - meetingId
 *         - channels
 */