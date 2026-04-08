import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import  upload  from "../middleware/uploadMiddleware.js";
import { 
    AdmissionAdd, 
    AdmissionList, 
    AdmissionDetail, 
    AdmissionUpdateStatus,
    AdmissionOverview,
    UploadFile 
} from "../controllers/admission.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admission
 *   description: Admission management and analytics
 */

/**
 * @swagger
 * /api/admission/upload:
 *   post:
 *     summary: Upload a file (Photo or Document)
 *     tags: [Admission]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   example: "/uploads/admission/photo.jpg"
 *       400:
 *         description: Invalid file
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/upload", protectRoute, upload.single('file'), UploadFile);

/**
 * @swagger
 * /api/admission/overview:
 *   get:
 *     summary: Get yearly analytics for Admission Overview Chart
 *     tags: [Admission]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AdmissionOverview'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/overview", protectRoute, AdmissionOverview);

/**
 * @swagger
 * /api/admission:
 *   get:
 *     summary: Get list of admissions (supports filtering)
 *     tags: [Admission]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [New, Accepted, Rejected, Shortlisted, Not joined]
 *         required: false
 *         description: Filter by admission status
 *     responses:
 *       200:
 *         description: List retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Admission'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/", protectRoute, AdmissionList);

/**
 * @swagger
 * /api/admission/{id}:
 *   get:
 *     summary: Get specific admission application details
 *     tags: [Admission]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Admission Application ID
 *     responses:
 *       200:
 *         description: Details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Admission'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Application not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", protectRoute, AdmissionDetail);

/**
 * @swagger
 * /api/admission:
 *   post:
 *     summary: Submit a new admission form
 *     tags: [Admission]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Admission'
 *     responses:
 *       201:
 *         description: Admission created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Admission'
 *       409:
 *         description: Application number already exists
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/", protectRoute, AdmissionAdd);

/**
 * @swagger
 * /api/admission/{id}/status:
 *   put:
 *     summary: Update application status (Accept / Reject / Shortlist / Not Joined)
 *     tags: [Admission]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Admission Application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Accepted, Rejected, Shortlisted, Not joined]
 *                 example: "Accepted"
 *               otherText:
 *                 type: string
 *                 example: "Documents verified"
 *     responses:
 *       200:
 *         description: Status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Admission'
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Application not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id/status", protectRoute, AdmissionUpdateStatus);

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Admission:
 *       type: object
 *       required:
 *         - applicationNo
 *         - firstName
 *         - classRequired
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         applicationNo:
 *           type: string
 *           example: "APP-2026-001"
 *         firstName:
 *           type: string
 *           example: "Rahul"
 *         lastName:
 *           type: string
 *           example: "Kumar"
 *         email:
 *           type: string
 *           example: "rahul@gmail.com"
 *         phone:
 *           type: string
 *           example: "9876543210"
 *         classRequired:
 *           type: string
 *           example: "Grade 1"
 *         status:
 *           type: string
 *           enum: [New, Accepted, Rejected, Shortlisted, Not joined]
 *           example: "New"
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2026-01-22T10:30:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: "2026-01-22T10:30:00Z"
 *
 *     AdmissionOverview:
 *       type: object
 *       properties:
 *         year:
 *           type: string
 *           example: "2026"
 *         total:
 *           type: integer
 *           example: 120
 *         admitted:
 *           type: integer
 *           example: 80
 *         rejected:
 *           type: integer
 *           example: 25
 *         vacancy:
 *           type: integer
 *           example: 15
 */
