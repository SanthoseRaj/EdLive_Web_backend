import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import {
  getFeeTypes,
  createFeeType,
  getClassFeeAssignments,
  createFeeAssignment,
  getStudentPayments,
  getStudentDuePayments,
  createPayment,
  getClassPaymentReport,
  getUPIConfig,
  generateUPIIntent,
  verifyUPIPayment,
} from "../controllers/payment.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment management endpoints
 */

// #region Fee Types
/**
 * @swagger
 * /api/payments/fee-types:
 *   get:
 *     summary: Get all active fee types
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of fee types
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FeeType'
 */
router.get('/fee-types', protectRoute, getFeeTypes);

/**
 * @swagger
 * /api/payments/fee-types:
 *   post:
 *     summary: Create a new fee type
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FeeTypeInput'
 *     responses:
 *       201:
 *         description: Fee type created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/FeeType'
 */
router.post('/fee-types', protectRoute, createFeeType);
// #endregion

// #region Fee Assignments
/**
 * @swagger
 * /api/payments/assignments:
 *   get:
 *     summary: Get fee assignments for multiple classes
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: class_ids
 *         required: true
 *         schema:
 *           type: string
 *         description: Comma-separated list of class IDs
 *       - in: query
 *         name: academic_year
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of fee assignments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FeeAssignment'
 */
router.get('/assignments', protectRoute, getClassFeeAssignments);

/**
 * @swagger
 * /api/payments/assignments:
 *   post:
 *     summary: Create a new fee assignment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FeeAssignmentInput'
 *     responses:
 *       201:
 *         description: Fee assignment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/FeeAssignment'
 */
router.post('/assignments', protectRoute, createFeeAssignment);
// #endregion

// #region Student Payments
/**
 * @swagger
 * /api/payments/student/{student_id}:
 *   get:
 *     summary: Get all payments for a student
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: student_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     responses:
 *       200:
 *         description: List of student payments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Payment'
 */
router.get('/student/:student_id', protectRoute, getStudentPayments);

/**
 * @swagger
 * /api/payments/student/due:
 *   get:
 *     summary: Get due payments for a student
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of due payments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FeeAssignment'
 */
router.get('/student/due', protectRoute, getStudentDuePayments);

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Record a payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentInput'
 *     responses:
 *       201:
 *         description: Payment recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Payment'
 */
router.post('/', protectRoute, createPayment);
// #endregion

// #region Admin Reports
/**
 * @swagger
 * /api/payments/reports/class:
 *   get:
 *     summary: Get payment report for a class
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: class_id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: academic_year
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Class payment report
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ClassPaymentReport'
 */
router.get('/reports/class', protectRoute, getClassPaymentReport);
// #endregion

/**
 * @swagger
 * components:
 *   schemas:
 *     FeeType:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         amount:
 *           type: number
 *           format: float
 *         is_active:
 *           type: boolean
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     FeeTypeInput:
 *       type: object
 *       required:
 *         - name
 *         - amount
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         amount:
 *           type: number
 *           format: float
 *     FeeAssignment:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         fee_type_id:
 *           type: integer
 *         class_id:
 *           type: integer
 *           nullable: true
 *         academic_year:
 *           type: string
 *         due_date:
 *           type: string
 *           format: date
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         fee_name:
 *           type: string
 *         base_amount:
 *           type: number
 *           format: float
 *     FeeAssignmentInput:
 *       type: object
 *       required:
 *         - fee_type_id
 *         - academic_year
 *         - due_date
 *       properties:
 *         fee_type_id:
 *           type: integer
 *         class_id:
 *           type: integer
 *           nullable: true
 *         academic_year:
 *           type: string
 *         due_date:
 *           type: string
 *           format: date
 *     Payment:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         student_id:
 *           type: integer
 *         fee_assignment_id:
 *           type: integer
 *         amount:
 *           type: number
 *           format: float
 *         payment_date:
 *           type: string
 *           format: date
 *         transaction_reference:
 *           type: string
 *         payment_method:
 *           type: string
 *         status:
 *           type: string
 *         created_by:
 *           type: integer
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         fee_name:
 *           type: string
 *         due_date:
 *           type: string
 *           format: date
 *         class_name:
 *           type: string
 *         academic_year:
 *           type: string
 *     PaymentInput:
 *       type: object
 *       required:
 *         - fee_assignment_id
 *         - amount
 *         - payment_date
 *         - payment_method
 *       properties:
 *         fee_assignment_id:
 *           type: integer
 *         amount:
 *           type: number
 *           format: float
 *         payment_date:
 *           type: string
 *           format: date
 *         transaction_reference:
 *           type: string
 *         payment_method:
 *           type: string
 *     ClassPaymentReport:
 *       type: object
 *       properties:
 *         class_id:
 *           type: integer
 *         class_name:
 *           type: string
 *         academic_year:
 *           type: string
 *         total_students:
 *           type: integer
 *         total_paid:
 *           type: number
 *           format: float
 *         total_due:
 *           type: number
 *           format: float
 *         fee_details:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               fee_type_id:
 *                 type: integer
 *               fee_name:
 *                 type: string
 *               total_assigned:
 *                 type: number
 *                 format: float
 *               total_paid:
 *                 type: number
 *                 format: float
 *               total_due:
 *                 type: number
 *                 format: float
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

// Add these new routes to payment.route.js

/**
 * @swagger
 * /api/payments/upi/config:
 *   get:
 *     summary: Get UPI payment configuration
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: UPI configuration details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UPIConfig'
 */
router.get('/upi/config', protectRoute, getUPIConfig);

/**
 * @swagger
 * /api/payments/upi/intent:
 *   post:
 *     summary: Generate UPI payment intent
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fee_assignment_id:
 *                 type: integer
 *               student_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: UPI payment intent generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UPIIntent'
 */
router.post('/upi/intent', protectRoute, generateUPIIntent);

/**
 * @swagger
 * /api/payments/upi/verify:
 *   post:
 *     summary: Verify UPI payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UPIVerifyInput'
 *     responses:
 *       200:
 *         description: Payment verification result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Payment'
 */
router.post('/upi/verify', protectRoute, verifyUPIPayment);

// Add these to your Swagger components section
/**
 * @swagger
 * components:
 *   schemas:
 *     UPIConfig:
 *       type: object
 *       properties:
 *         upiId:
 *           type: string
 *         merchantName:
 *           type: string
 *         merchantCode:
 *           type: string
 *     UPIIntent:
 *       type: object
 *       properties:
 *         upiId:
 *           type: string
 *         merchantName:
 *           type: string
 *         amount:
 *           type: number
 *         transactionId:
 *           type: string
 *         transactionNote:
 *           type: string
 *         studentId:
 *           type: integer
 *         feeAssignmentId:
 *           type: integer
 *         timestamp:
 *           type: string
 *           format: date-time
 *         upiLink:
 *           type: string
 *     UPIVerifyInput:
 *       type: object
 *       required:
 *         - transactionId
 *         - transactionReference
 *         - student_id
 *         - fee_assignment_id
 *         - amount
 *       properties:
 *         transactionId:
 *           type: string
 *         transactionReference:
 *           type: string
 *         student_id:
 *           type: integer
 *         fee_assignment_id:
 *           type: integer
 *         amount:
 *           type: number
 */

export default router;