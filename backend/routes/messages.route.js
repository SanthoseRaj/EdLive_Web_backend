import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import {
  sendParentCommunication,
  sendClassCommunication,
  getStudentCommunications,
  getCommunicationsBySender,
  markCommunicationViewed
} from "../controllers/messages.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Parent Communications
 *   description: Communication with parents/guardians
 */

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Send a message to parent/guardian
 *     tags: [Parent Communications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               student_id:
 *                 type: integer
 *                 description: ID of the student
 *               message_text:
 *                 type: string
 *                 description: The message content
 *               is_appreciation:
 *                 type: boolean
 *                 description: Whether it's an appreciation message
 *               is_meeting_request:
 *                 type: boolean
 *                 description: Whether it's a meeting request
 *               meeting_date:
 *                 type: string
 *                 format: date-time
 *                 description: Date for the meeting (if applicable)
 *               channels:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [whatsapp, sms, email]
 *                 description: Channels to send the message through
 *             required:
 *               - student_id
 *               - message_text
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/', protectRoute, sendParentCommunication);

/**
 * @swagger
 * /api/messages/class:
 *   post:
 *     summary: Send a message to parents of all students in one or more classes
 *     tags: [Parent Communications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               class_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of class IDs or comma-separated string
 *               message_text:
 *                 type: string
 *                 description: The message content
 *               is_appreciation:
 *                 type: boolean
 *                 description: Whether it's an appreciation message
 *               is_meeting_request:
 *                 type: boolean
 *                 description: Whether it's a meeting request
 *               meeting_date:
 *                 type: string
 *                 format: date-time
 *                 description: Date for the meeting (if applicable)
 *               channels:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [whatsapp, sms, email]
 *                 description: Channels to send the message through
 *             required:
 *               - class_ids
 *               - message_text
 *     responses:
 *       201:
 *         description: Messages sent successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/class', protectRoute, sendClassCommunication);

/**
 * @swagger
 * /api/messages/sender:
 *   get:
 *     summary: Get all communications for a sender
 *     tags: [Parent Communications]
 *     responses:
 *       200:
 *         description: List of communications
 *       500:
 *         description: Internal server error
 */
router.get('/sender', protectRoute, getCommunicationsBySender);
router.patch('/:id/viewed', protectRoute, markCommunicationViewed);

/**
 * @swagger
 * /api/messages/{student_id}:
 *   get:
 *     summary: Get all communications for a student
 *     tags: [Parent Communications]
 *     parameters:
 *       - in: path
 *         name: student_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the student
 *     responses:
 *       200:
 *         description: List of communications
 *       500:
 *         description: Internal server error
 */
router.get('/:student_id', protectRoute, getStudentCommunications);

export default router;
