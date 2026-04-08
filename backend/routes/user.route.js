/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - fullname
 *         - username
 *         - email
 *         - password
 *         - usertype
 *         - phone_number
 *       properties:
 *         fullname:
 *           type: string
 *           description: The user's full name
 *         username:
 *           type: string
 *           description: Unique username for login
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         phone_number:
 *           type: string
 *           description: User's phone number (unique)
 *         password:
 *           type: string
 *           format: password
 *           minLength: 6
 *           description: Hashed password
 *         usertype:
 *           type: string
 *           enum: ['Staff Admin','Class Admin','Student','Teacher','Librarian','Food Admin']
 *           description: Role of the user
 *         profileImg:
 *           type: string
 *           description: URL to profile image
 *     UserEdit:
 *       type: object
 *       properties:
 *         fullname:
 *           type: string
 *           description: The user's full name
 *         username:
 *           type: string
 *           description: Unique username for login
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         phone_number:
 *           type: string
 *           description: User's phone number (unique)
 *         password:
 *           type: string
 *           format: password
 *           minLength: 6
 *           description: New password (optional)
 *         usertype:
 *           type: string
 *           enum: ['Staff Admin','Class Admin','Student','Teacher','Librarian','Food Admin']
 *           description: Role of the user
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
import express from "express"
import protectRoute from "../middleware/protectRoute.js";

import { getProfile,UserList,UserAdd,UserEdit,UserDelete,getProfileById } from "../controllers/user.controllers.js";


const router = express.Router();
/**
 * @swagger
 * /api/users/profile/{username}:
 *   get:
 *     summary: Get user profile by username
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: The username of the user
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get("/profile/:username", protectRoute, getProfile);

/**
 * @swagger
 * /api/users/profileById/{id}:
 *   get:
 *     summary: Get user profile by ID
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get("/profileById/:id", protectRoute, getProfileById);
/**
 * @swagger
 * /api/users/userList:
 *   get:
 *     summary: Get list of all users (Staff Admin only)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       403:
 *         description: Forbidden, user is not a Staff Admin
 *       500:
 *         description: Internal server error
 */
router.get("/userList", protectRoute, UserList)
/**
 * @swagger
 * /api/users/users:
 *   post:
 *     summary: Create a new user (Staff Admin only)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input (e.g., validation errors)
 *       409:
 *         description: Username or email already exists
 *       403:
 *         description: Forbidden, user is not authorized
 *       500:
 *         description: Internal server error
 */
router.post("/users", protectRoute, UserAdd)
/**
 * @swagger
 * /api/users/users/{id}:
 *   put:
 *     summary: Update an existing user by ID (Staff Admin only)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserEdit'
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: User not found
 *       409:
 *         description: Email already exists
 *       403:
 *         description: Forbidden, user is not authorized
 *       500:
 *         description: Internal server error
 */
router.put("/users/:id", protectRoute, UserEdit)
/**
 * @swagger
 * /api/users/users/{id}:
 *   delete:
 *     summary: Delete a user by ID (Staff Admin only)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       403:
 *         description: Forbidden, user is not authorized
 *       500:
 *         description: Internal server error
 */
router.delete("/users/:id", protectRoute, UserDelete)

export default router;