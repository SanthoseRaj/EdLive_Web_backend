import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import {
    achievementCreate,
    achievementFindVisible,
    achievementApprove,
    achievementDelete
} from "../controllers/achivement.controller.js"
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Achievements
 *   description: Achievement management and visibility
 */

/**
 * @swagger
 * /api/achievements:
 *   post:
 *     summary: Create a new achievement
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               studentId:
 *                 type: integer
 *                 example: 1
 *               title:
 *                 type: string
 *                 example: "Math Olympiad Winner"
 *               description:
 *                 type: string
 *                 example: "Won first place in regional math competition"
 *               categoryId:
 *                 type: integer
 *                 example: 2
 *               achievementDate:
 *                 type: string
 *                 format: date
 *                 example: "2023-12-15"
 *               awardedBy:
 *                 type: string
 *                 example: "Principal Smith"
 *               achievementFileUpload:
 *                 type: string
 *                 format: binary
 *               isVisible:
 *                 type: string
 *                 enum: [private, class, school, public]
 *                 example: "school"
 *               classId:
 *                 type: integer
 *                 example: 5
 *               academicYearId:
 *                 type: integer
 *                 example: 2024
 *             required:
 *               - studentId
 *               - title
 *               - description
 *               - categoryId
 *               - achievementDate
 *     responses:
 *       201:
 *         description: Achievement created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Achievement'
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/', protectRoute,upload.single("achievementFileUpload"), achievementCreate);

/**
 * @swagger
 * /api/achievements/visible:
 *   get:
 *     summary: Get visible achievements based on user role
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: string
 *         required: false
 *         description: Student ID (required when user is a student)
 *     responses:
 *       200:
 *         description: List of visible achievements
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Achievement'
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Class ID required for teacher/student
 *       500:
 *         description: Internal server error
 */
router.get('/visible', protectRoute, achievementFindVisible);

/**
 * @swagger
 * /api/achievements/{id}/approve:
 *   patch:
 *     summary: Approve an achievement (Admin only)
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Achievement ID
 *     responses:
 *       200:
 *         description: Achievement approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Achievement'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: Achievement not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:id/approve', protectRoute, achievementApprove);

/**
 * @swagger
 * /api/achievements/{id}:
 *   delete:
 *     summary: Delete an achievement
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Achievement ID
 *     responses:
 *       200:
 *         description: Achievement deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Achievement deleted successfully"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Achievement not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', protectRoute, achievementDelete);

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Achievement:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         student_id:
 *           type: integer
 *           example: 123
 *         title:
 *           type: string
 *           example: "Math Olympiad Winner"
 *         description:
 *           type: string
 *           example: "Won first place in regional math competition"
 *         category:
 *           type: integer
 *           example: 2
 *         achievement_date:
 *           type: string
 *           format: date
 *           example: "2023-12-15"
 *         awarded_by:
 *           type: string
 *           example: "Principal Smith"
 *         evidence_url:
 *           type: string
 *           example: "/uploads/achievements/math-olympiad.jpg"
 *         visibility:
 *           type: string
 *           enum: [private, class, school, public]
 *           example: "school"
 *         class_id:
 *           type: integer
 *           example: 5
 *         academic_year:
 *           type: integer
 *           example: 2024
 *         approved:
 *           type: boolean
 *           example: false
 *         approved_by:
 *           type: integer
 *           nullable: true
 *           example: 456
 *         approved_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2023-12-16T10:30:00Z"
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2023-12-15T14:22:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: "2023-12-15T14:22:00Z"
 *         full_name:
 *           type: string
 *           example: "John Doe"
 */