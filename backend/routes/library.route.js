import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import {
  getBooks,
  searchBooks,
  getBookDetails,
  addBook,
  updateBook,
  addBookCopy,
  getMemberStatus,
  createMember,
  checkoutBook,
  returnBook,
  getMemberCheckouts,
  getOverdueBooks,
  reserveBook,
  fulfillReservation,
  getMemberReservations,
  addFine,
  payFine,
  getMemberFines,
  getAllMembers,
  getAdminDashboardStats,
  getMemberStatusById,
  deactivateMember,
  getActiveCheckouts,
  getAvailableBookCopies
} from "../controllers/library.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Library
 *   description: Library management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         author:
 *           type: string
 *         isbn:
 *           type: string
 *         publisher:
 *           type: string
 *         publication_year:
 *           type: integer
 *         genre:
 *           type: string
 *         quantity:
 *           type: integer
 *         available_quantity:
 *           type: integer
 *         location:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         is_active:
 *           type: boolean
 *     BookInput:
 *       type: object
 *       required:
 *         - title
 *         - author
 *         - quantity
 *       properties:
 *         title:
 *           type: string
 *         author:
 *           type: string
 *         isbn:
 *           type: string
 *         publisher:
 *           type: string
 *         publication_year:
 *           type: integer
 *         genre:
 *           type: string
 *         quantity:
 *           type: integer
 *         location:
 *           type: string
 *     BookWithCopies:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         author:
 *           type: string
 *         isbn:
 *           type: string
 *         publisher:
 *           type: string
 *         publication_year:
 *           type: integer
 *         genre:
 *           type: string
 *         quantity:
 *           type: integer
 *         available_quantity:
 *           type: integer
 *         location:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         is_active:
 *           type: boolean
 *         copies:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/BookCopy'
 *     BookCopyWithBook:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         book_id:
 *           type: integer
 *         barcode:
 *           type: string
 *         status:
 *           type: string
 *         condition:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         book_title:
 *           type: string
 *         author:
 *           type: string
 *         isbn:
 *           type: string
 *     BookCopy:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         book_id:
 *           type: integer
 *         barcode:
 *           type: string
 *         status:
 *           type: string
 *         condition:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     BookCopyInput:
 *       type: object
 *       required:
 *         - book_id
 *         - barcode
 *       properties:
 *         book_id:
 *           type: integer
 *         barcode:
 *           type: string
 *         condition:
 *           type: string
 *     LibraryMember:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         user_id:
 *           type: integer
 *         user_type:
 *           type: string
 *         membership_number:
 *           type: string
 *         membership_start:
 *           type: string
 *           format: date
 *         membership_end:
 *           type: string
 *           format: date
 *         max_books:
 *           type: integer
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         is_active:
 *           type: boolean
 *     MemberStatus:
 *       type: object
 *       properties:
 *         member:
 *           $ref: '#/components/schemas/LibraryMember'
 *         checkouts:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CheckoutWithBook'
 *         reservations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ReservationWithBook'
 *         fines:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Fine'
 *         checkoutCount:
 *           type: integer
 *         reservationCount:
 *           type: integer
 *         fineAmount:
 *           type: number
 *     Checkout:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         book_copy_id:
 *           type: integer
 *         member_id:
 *           type: integer
 *         checkout_date:
 *           type: string
 *           format: date
 *         due_date:
 *           type: string
 *           format: date
 *         return_date:
 *           type: string
 *           format: date
 *         status:
 *           type: string
 *         fine_amount:
 *           type: number
 *         created_by:
 *           type: integer
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     CheckoutInput:
 *       type: object
 *       required:
 *         - book_copy_id
 *         - member_id
 *         - checkout_date
 *         - due_date
 *       properties:
 *         book_copy_id:
 *           type: integer
 *         member_id:
 *           type: integer
 *         checkout_date:
 *           type: string
 *           format: date
 *         due_date:
 *           type: string
 *           format: date
 *     CheckoutWithBook:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         book_copy_id:
 *           type: integer
 *         member_id:
 *           type: integer
 *         checkout_date:
 *           type: string
 *           format: date
 *         due_date:
 *           type: string
 *           format: date
 *         return_date:
 *           type: string
 *           format: date
 *         status:
 *           type: string
 *         fine_amount:
 *           type: number
 *         created_by:
 *           type: integer
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         title:
 *           type: string
 *         author:
 *           type: string
 *         barcode:
 *           type: string
 *     Reservation:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         book_id:
 *           type: integer
 *         member_id:
 *           type: integer
 *         reservation_date:
 *           type: string
 *           format: date
 *         expiry_date:
 *           type: string
 *           format: date
 *         status:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     ReservationInput:
 *       type: object
 *       required:
 *         - book_id
 *         - member_id
 *         - expiry_date
 *       properties:
 *         book_id:
 *           type: integer
 *         member_id:
 *           type: integer
 *         expiry_date:
 *           type: string
 *           format: date
 *     ReservationWithBook:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         book_id:
 *           type: integer
 *         member_id:
 *           type: integer
 *         reservation_date:
 *           type: string
 *           format: date
 *         expiry_date:
 *           type: string
 *           format: date
 *         status:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         title:
 *           type: string
 *         author:
 *           type: string
 *     FulfillReservationInput:
 *       type: object
 *       required:
 *         - book_copy_id
 *         - member_id
 *         - checkout_date
 *         - due_date
 *       properties:
 *         book_copy_id:
 *           type: integer
 *         member_id:
 *           type: integer
 *         checkout_date:
 *           type: string
 *           format: date
 *         due_date:
 *           type: string
 *           format: date
 *     Fine:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         checkout_id:
 *           type: integer
 *         member_id:
 *           type: integer
 *         amount:
 *           type: number
 *         reason:
 *           type: string
 *         status:
 *           type: string
 *         payment_date:
 *           type: string
 *           format: date
 *         payment_reference:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     FineInput:
 *       type: object
 *       required:
 *         - checkout_id
 *         - member_id
 *         - amount
 *         - reason
 *       properties:
 *         checkout_id:
 *           type: integer
 *         member_id:
 *           type: integer
 *         amount:
 *           type: number
 *         reason:
 *           type: string
 *     FineWithBook:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         checkout_id:
 *           type: integer
 *         member_id:
 *           type: integer
 *         amount:
 *           type: number
 *         reason:
 *           type: string
 *         status:
 *           type: string
 *         payment_date:
 *           type: string
 *           format: date
 *         payment_reference:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         title:
 *           type: string
 *         due_date:
 *           type: string
 *           format: date
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

// #region Books
/**
 * @swagger
 * /api/library/books:
 *   get:
 *     summary: Get all active books
 *     tags: [Library]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of books
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
 *                     $ref: '#/components/schemas/Book'
 */
router.get('/books', protectRoute, getBooks);

/**
 * @swagger
 * /api/library/books/search:
 *   get:
 *     summary: Search books
 *     tags: [Library]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *       - in: query
 *         name: isbn
 *         schema:
 *           type: string
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of matching books
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
 *                     $ref: '#/components/schemas/Book'
 */
router.get('/books/search', protectRoute, searchBooks);

/**
 * @swagger
 * /api/library/books/{id}:
 *   get:
 *     summary: Get book details with copies
 *     tags: [Library]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Book details with copies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/BookWithCopies'
 */
router.get('/books/:id', protectRoute, getBookDetails);

/**
 * @swagger
 * /api/library/books:
 *   post:
 *     summary: Add a new book
 *     tags: [Library]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookInput'
 *     responses:
 *       201:
 *         description: Book added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Book'
 */
router.post('/books', protectRoute, addBook);

/**
 * @swagger
 * /api/library/books/{id}:
 *   put:
 *     summary: Update book details
 *     tags: [Library]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookInput'
 *     responses:
 *       200:
 *         description: Book updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Book'
 */
router.put('/books/:id', protectRoute, updateBook);

/**
 * @swagger
 * /api/library/books/copies:
 *   post:
 *     summary: Add a book copy
 *     tags: [Library]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookCopyInput'
 *     responses:
 *       201:
 *         description: Book copy added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/BookCopy'
 */
router.post('/books/copies', protectRoute, addBookCopy);
// #endregion

// #region Members
/**
 * @swagger
 * /api/library/members/status:
 *   get:
 *     summary: Get library member status (checkouts, reservations, fines)
 *     tags: [Library]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Member status information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/MemberStatus'
 */
router.get('/members/status', protectRoute, getMemberStatus);
// #endregion
/**
 * @swagger
 * /api/library/members/statusbyid:
 *   get:
 *     summary: Get member status by member ID
 *     tags: [Library]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: member_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Member status information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/MemberStatus'
 */
router.get('/members/statusbyid', protectRoute, getMemberStatusById);
/**
 * @swagger
 * /api/library/members/{id}/deactivate:
 *   put:
 *     summary: Deactivate a library member
 *     tags: [Library]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Member deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/LibraryMember'
 */
router.put('/members/:id/deactivate', protectRoute, deactivateMember);
// #region CreateMember
/**
 * @swagger
 * /api/library/members:
 *   post:
 *     summary: Create a new library member
 *     tags: [Library]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - user_type
 *               - membership_number
 *               - membership_start
 *             properties:
 *               user_id:
 *                 type: integer
 *               user_type:
 *                 type: string
 *                 enum: [student, faculty, staff]
 *               membership_number:
 *                 type: string
 *               membership_start:
 *                 type: string
 *                 format: date
 *               membership_end:
 *                 type: string
 *                 format: date
 *               max_books:
 *                 type: integer
 *                 default: 5
 *     responses:
 *       201:
 *         description: Member created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/LibraryMember'
 *       400:
 *         description: Invalid input or duplicate membership number
 *       500:
 *         description: Server error
 */
router.post('/members', protectRoute, createMember);
// #endregion

// #region Get All Members
/**
 * @swagger
 * /api/library/members:
 *   get:
 *     summary: Get all library members
 *     tags: [Library]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all library members
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
 *                     $ref: '#/components/schemas/LibraryMember'
 */
router.get('/members', protectRoute, getAllMembers);
// #endregion
// #region Checkouts
/**
 * @swagger
 * /api/library/checkouts:
 *   post:
 *     summary: Checkout a book
 *     tags: [Library]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckoutInput'
 *     responses:
 *       201:
 *         description: Book checked out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Checkout'
 */
router.post('/checkouts', protectRoute, checkoutBook);

/**
 * @swagger
 * /api/library/checkouts/{id}/return:
 *   post:
 *     summary: Return a book
 *     tags: [Library]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Book returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Checkout'
 */
router.post('/checkouts/:id/return', protectRoute, returnBook);

/**
 * @swagger
 * /api/library/checkouts/member/{member_id}:
 *   get:
 *     summary: Get member's checkouts
 *     tags: [Library]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: member_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of member's checkouts
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
 *                     $ref: '#/components/schemas/CheckoutWithBook'
 */
router.get('/checkouts/member/:member_id', protectRoute, getMemberCheckouts);

/**
 * @swagger
 * /api/library/checkouts/overdue:
 *   get:
 *     summary: Get overdue books
 *     tags: [Library]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of overdue books
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
 *                     $ref: '#/components/schemas/CheckoutWithBook'
 */
router.get('/checkouts/overdue', protectRoute, getOverdueBooks);
// #endregion

// #region Reservations
/**
 * @swagger
 * /api/library/reservations:
 *   post:
 *     summary: Reserve a book
 *     tags: [Library]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReservationInput'
 *     responses:
 *       201:
 *         description: Book reserved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Reservation'
 */
router.post('/reservations', protectRoute, reserveBook);

/**
 * @swagger
 * /api/library/reservations/{id}/fulfill:
 *   post:
 *     summary: Fulfill a reservation (checkout reserved book)
 *     tags: [Library]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FulfillReservationInput'
 *     responses:
 *       201:
 *         description: Reservation fulfilled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Checkout'
 */
router.post('/reservations/:id/fulfill', protectRoute, fulfillReservation);

/**
 * @swagger
 * /api/library/reservations/member/{member_id}:
 *   get:
 *     summary: Get member's reservations
 *     tags: [Library]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: member_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of member's reservations
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
 *                     $ref: '#/components/schemas/ReservationWithBook'
 */
router.get('/reservations/member/:member_id', protectRoute, getMemberReservations);
// #endregion

// #region Fines
/**
 * @swagger
 * /api/library/fines:
 *   post:
 *     summary: Add a fine
 *     tags: [Library]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FineInput'
 *     responses:
 *       201:
 *         description: Fine added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Fine'
 */
router.post('/fines', protectRoute, addFine);

/**
 * @swagger
 * /api/library/fines/{id}/pay:
 *   post:
 *     summary: Pay a fine
 *     tags: [Library]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               payment_reference:
 *                 type: string
 *     responses:
 *       200:
 *         description: Fine paid successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Fine'
 */
router.post('/fines/:id/pay', protectRoute, payFine);

/**
 * @swagger
 * /api/library/fines/member/{member_id}:
 *   get:
 *     summary: Get member's fines
 *     tags: [Library]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: member_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of member's fines
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
 *                     $ref: '#/components/schemas/FineWithBook'
 */
router.get('/fines/member/:member_id', protectRoute, getMemberFines);
// #endregion
// #region Admin Dashboard Stats
/**
 * @swagger
 * /api/library/admin/stats:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Library]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalBooks:
 *                       type: integer
 *                     totalMembers:
 *                       type: integer
 *                     activeCheckouts:
 *                       type: integer
 *                     overdueBooks:
 *                       type: integer
 *                     pendingReservations:
 *                       type: integer
 *                     unpaidFines:
 *                       type: integer
 */
router.get('/admin/stats', protectRoute, getAdminDashboardStats);
// #endregion

/**
 * @swagger
 * /api/library/checkouts/active:
 *   get:
 *     summary: Get all active checkouts
 *     tags: [Library]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active checkouts
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
 *                     $ref: '#/components/schemas/CheckoutWithBook'
 */
router.get('/checkouts/active', protectRoute, getActiveCheckouts);

/**
 * @swagger
 * /api/library/books/copies/available:
 *   get:
 *     summary: Get available book copies
 *     tags: [Library]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available book copies
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
 *                     $ref: '#/components/schemas/BookCopyWithBook'
 */
router.get('/books/copies/available', protectRoute, getAvailableBookCopies);

export default router;