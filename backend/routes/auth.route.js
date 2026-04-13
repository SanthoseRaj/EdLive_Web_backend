/**
 * @swagger
 * components:
 *   schemas:
 *     SignUp:
 *       type: object
 *       required:
 *         - fullname
 *         - username
 *         - email
 *         - password
 *         - usertype
 *       properties:
 *         fullname:
 *           type: string
 *           description: The auto-generated id of the book
 *         username:
 *           type: string
 *           description: User Name to Login into the system
 *         email:
 *           type: string
 *           description: User email to send notification
 *         password:
 *           type: string
 *           description: User Password
 *         usertype:
 *           type: String,
 *           enum: ['Staff Admin','Class Admin','Student','Teacher']
 *           description: User Type
 *     
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     Login:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: User Name to Login into the system
 *         password:
 *           type: string
 *           description: User Password
 *     ForgotPassword:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Registered user email address
 *     ChangePassword:
 *       type: object
 *       required:
 *         - currentPassword
 *         - newPassword
 *       properties:
 *         currentPassword:
 *           type: string
 *           description: Current account password
 *         newPassword:
 *           type: string
 *           description: New password to replace the current password
 */
import express from "express"
import {
  signup,
  login,
  logout,
  getMe,
  getMenu,
  forgotPassword,
  changePassword,
} from "../controllers/auth.controllers.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();
// router.get("/", (req, res) => {
//     res.send("Hello World");
//  })
 /**
 * @swagger
 * tags:
 *   name: School-Management
 *   description: The School managing API
 * /api/auth/signup:
 *   post:
 *     summary: Register to the Portal
 *     tags: [Login Management]
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *            schema:
 *              $ref: '#/components/schemas/SignUp'
 *     responses:
 *       200:
 *         description: Register Successfully
 *         
 *       500:
 *         description: Some server error
 */
router.post("/signup", signup)
/**
 * @swagger
 * tags:
 *   name: School-Management
 *   description: The School managing API
 * /api/auth/login:
 *   post:
 *     summary: Login to the Portal
 *     tags: [Login Management]
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *            schema:
 *              $ref: '#/components/schemas/Login'
 *     responses:
 *       200:
 *         description: Login Successfully
 *         
 *       500:
 *         description: Some server error
 */
router.post("/login", login)
/**
 * @swagger
 * tags:
 *   name: School-Management
 *   description: The School managing API
 * /api/auth/forgot-password:
 *   post:
 *     summary: Send a temporary password to the user's email
 *     tags: [Login Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPassword'
 *     responses:
 *       200:
 *         description: Temporary password sent successfully
 *       400:
 *         description: Valid email is required
 *       404:
 *         description: No user found with this email
 *       500:
 *         description: Failed to reset password
 */
router.post("/forgot-password", forgotPassword)
/**
 * @swagger
 * tags:
 *   name: School-Management
 *   description: The School managing API
 * /api/auth/change-password:
 *   post:
 *     summary: Change password for the authenticated user
 *     tags: [Login Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePassword'
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Invalid password input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to update password
 */
router.post("/change-password", protectRoute, changePassword)
/**
 * @swagger
 * tags:
 *   name: School-Management
 *   description: The School managing API
 * /api/auth/logout:
 *   post:
 *     summary: Logout from the Portal
 *     tags: [Login Management]
 *     responses:
 *       200:
 *         description: Logout Successfully
 *         
 *       500:
 *         description: Some server error
 */
router.post("/logout", logout)

/**
 * @swagger
 * tags:
 *   name: School-Management
 *   description: The School managing API
 * /api/auth/me:
 *   get:
 *     summary: Cookie Check for the user
 *     tags: [Login Management]
 *     responses:
 *       200:
 *         description: Cookie Available
 *         
 *       500:
 *         description: Some server error
 */
router.get("/me", protectRoute, getMe)

router.get("/menu",getMenu);
export default router;
