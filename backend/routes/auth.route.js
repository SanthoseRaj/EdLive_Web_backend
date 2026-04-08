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
 *     
 */
import express from "express"
import { signup, login, logout, getMe, getMenu } from "../controllers/auth.controllers.js";
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