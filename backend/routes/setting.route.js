import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import {
    getDashBoardElements,
    getUserDashBoard,
    updateUserDashBoard
} from "../controllers/setting.controllers.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard Settings
 *   description: User dashboard customization
 */

/**
 * @swagger
 * /api/setting/dashBoardElements:
 *   get:
 *     summary: Get all available dashboard elements
 *     tags: [Dashboard Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all possible dashboard elements
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DashboardElement'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/dashBoardElements', protectRoute, getDashBoardElements);

/**
 * @swagger
 * /api/setting/dashBoardUser:
 *   get:
 *     summary: Get user's current dashboard configuration
 *     tags: [Dashboard Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's dashboard configuration
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserDashboardSetting'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get('/dashBoardUser', protectRoute, getUserDashBoard);

/**
 * @swagger
 * /api/setting/updateDashBoard:
 *   put:
 *     summary: Update user's dashboard configuration
 *     tags: [Dashboard Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 element_key:
 *                   type: string
 *                   description: Unique identifier for the dashboard element
 *                 is_enabled:
 *                   type: boolean
 *                   description: Whether the element is enabled
 *                 position:
 *                   type: integer
 *                   description: Display position in the dashboard
 *               required:
 *                 - element_key
 *                 - is_enabled
 *                 - position
 *     responses:
 *       200:
 *         description: Dashboard configuration updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Dashboard updated successfully"
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.put('/updateDashBoard', protectRoute, updateUserDashBoard);

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     DashboardElement:
 *       type: object
 *       properties:
 *         element_key:
 *           type: string
 *           example: "notifications"
 *         title:
 *           type: string
 *           example: "Notifications"
 *         subtitle:
 *           type: string
 *           example: "Staff meeting on 12th June 2019"
 *         icon_name:
 *           type: string
 *           example: "HiOutlineBell"
 *         default_position:
 *           type: integer
 *           example: 1
 *         is_static:
 *           type: boolean
 *           example: false
 *         route_path:
 *           type: string
 *           example: "/notifications"
 *       required:
 *         - element_key
 *         - title
 *         - icon_name
 *         - default_position
 * 
 *     UserDashboardSetting:
 *       type: object
 *       properties:
 *         element_key:
 *           type: string
 *           example: "notifications"
 *         title:
 *           type: string
 *           example: "Notifications"
 *         subtitle:
 *           type: string
 *           example: "Staff meeting on 12th June 2019"
 *         icon_name:
 *           type: string
 *           example: "HiOutlineBell"
 *         is_enabled:
 *           type: boolean
 *           example: true
 *         position:
 *           type: integer
 *           example: 1
 *         is_static:
 *           type: boolean
 *           example: false
 *         route_path:
 *           type: string
 *           example: "/notifications"
 *       required:
 *         - element_key
 *         - is_enabled
 *         - position
 */