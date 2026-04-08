import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import {
  stickyNoteCreate,
  stickyNoteGetAll,
  stickyNoteGetById,
  stickyNoteUpdate,
  stickyNoteDelete,
  stickyNoteArchive,
  stickyNoteUnarchive
} from "../controllers/stickynotes.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: StickyNotes
 *   description: Sticky Notes management
 */

/**
 * @swagger
 * /api/stickynotes/{id}:
 *   post:
 *     summary: Create a new sticky note
 *     tags: [StickyNotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: false
 *         description: Teacher/ Student ID if User Type is Teacher/ Student
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *                 example: "Remember to submit assignment by Friday"
 *               color:
 *                 type: string
 *                 example: "yellow"
 *               position_x:
 *                 type: integer
 *                 example: 100
 *               position_y:
 *                 type: integer
 *                 example: 50
 *             required:
 *               - notes
 *     responses:
 *       201:
 *         description: Sticky note created successfully
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 */
router.post('/:id', protectRoute, stickyNoteCreate);

/**
 * @swagger
 * /api/stickynotes/{id}:
 *   get:
 *     summary: Get all sticky notes for current user
 *     tags: [StickyNotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: false
 *         description: Teacher/ Student ID if User Type is Teacher/ Student
 *       - in: query
 *         name: user_type
 *         schema:
 *           type: string
 *         description: Filter by user type
 *       - in: query
 *         name: is_archived
 *         schema:
 *           type: boolean
 *         description: Filter by archived status
 *       - in: query
 *         name: all_notes
 *         schema:
 *           type: boolean
 *         description: Get all notes (admin only)
 *     responses:
 *       200:
 *         description: List of sticky notes
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', protectRoute, stickyNoteGetAll);

/**
 * @swagger
 * /api/stickynotes/{id}/{sticky_id}:
 *   get:
 *     summary: Get a specific sticky note by ID
 *     tags: [StickyNotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: false
 *         description: Teacher/ Student ID if User Type is Teacher/ Student
 *       - in: path
 *         name: sticky_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Sticky note ID
 *     responses:
 *       200:
 *         description: Sticky note details
 *       404:
 *         description: Sticky note not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id/:sticky_id', protectRoute, stickyNoteGetById);

/**
 * @swagger
 * /api/stickynotes/{id}/{sticky_id}:
 *   put:
 *     summary: Update a sticky note
 *     tags: [StickyNotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: false
 *         description: Teacher/ Student ID if User Type is Teacher/ Student
 *       - in: path
 *         name: sticky_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Sticky note ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *               color:
 *                 type: string
 *               position_x:
 *                 type: integer
 *               position_y:
 *                 type: integer
 *               is_archived:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Sticky note updated successfully
 *       403:
 *         description: Not authorized to update this note
 *       404:
 *         description: Sticky note not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:id/:sticky_id', protectRoute, stickyNoteUpdate);

/**
 * @swagger
 * /api/stickynotes/{id}/{sticky_id}/archive:
 *   patch:
 *     summary: Archive a sticky note
 *     tags: [StickyNotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: false
 *         description: Teacher/ Student ID if User Type is Teacher/ Student
 *       - in: path
 *         name: sticky_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Sticky note ID
 *     responses:
 *       200:
 *         description: Sticky note archived successfully
 *       403:
 *         description: Not authorized to archive this note
 *       404:
 *         description: Sticky note not found
 *       401:
 *         description: Unauthorized
 */
router.patch('/:id/:sticky_id/archive', protectRoute, stickyNoteArchive);

/**
 * @swagger
 * /api/stickynotes/{id}/{sticky_id}/unarchive:
 *   patch:
 *     summary: Unarchive a sticky note
 *     tags: [StickyNotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: false
 *         description: Teacher/ Student ID if User Type is Teacher/ Student
 *       - in: path
 *         name: sticky_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Sticky note ID
 *     responses:
 *       200:
 *         description: Sticky note unarchived successfully
 *       403:
 *         description: Not authorized to unarchive this note
 *       404:
 *         description: Sticky note not found
 *       401:
 *         description: Unauthorized
 */
router.patch('/:id/:sticky_id/unarchive', protectRoute, stickyNoteUnarchive);

/**
 * @swagger
 * /api/stickynotes/{id}/{sticky_id}:
 *   delete:
 *     summary: Delete a sticky note
 *     tags: [StickyNotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: false
 *         description: Teacher/ Student ID if User Type is Teacher/ Student
 *       - in: path
 *         name: sticky_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Sticky note ID
 *     responses:
 *       200:
 *         description: Sticky note deleted successfully
 *       403:
 *         description: Not authorized to delete this note
 *       404:
 *         description: Sticky note not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id/:sticky_id', protectRoute, stickyNoteDelete);

export default router;