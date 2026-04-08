import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import {
  createEventHoliday,
  getEventsHolidaysByMonth,
  approveEventHoliday,
  deleteEventHoliday
} from "../controllers/eventsholidays.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Events & Holidays
 *   description: School events and holidays management
 */

/**
 * @swagger
 * /api/events-holidays:
 *   post:
 *     summary: Create a new event or holiday
 *     tags: [Events & Holidays]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventHolidayCreate'
 *     responses:
 *       201:
 *         description: Event/Holiday created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventHoliday'
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/', protectRoute, createEventHoliday);

/**
 * @swagger
 * /api/events-holidays/{year}/{month}:
 *   get:
 *     summary: Get events and holidays for a specific month
 *     tags: [Events & Holidays]
 *     parameters:
 *       - in: path
 *         name: year
 *         schema:
 *           type: integer
 *         required: true
 *         description: Year (e.g. 2023)
 *       - in: path
 *         name: month
 *         schema:
 *           type: integer
 *         required: true
 *         description: Month (1-12)
 *     responses:
 *       200:
 *         description: List of events and holidays
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/EventHoliday'
 *       500:
 *         description: Internal server error
 */
router.get('/:year/:month', getEventsHolidaysByMonth);

/**
 * @swagger
 * /api/events-holidays/{id}/approve:
 *   patch:
 *     summary: Approve an event/holiday (Admin only)
 *     tags: [Events & Holidays]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Event/Holiday ID
 *     responses:
 *       200:
 *         description: Event/Holiday approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventHoliday'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: Event/Holiday not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:id/approve', protectRoute, approveEventHoliday);

/**
 * @swagger
 * /api/events-holidays/{id}:
 *   delete:
 *     summary: Delete an event or holiday
 *     tags: [Events & Holidays]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Event/Holiday ID
 *     responses:
 *       200:
 *         description: Event/Holiday deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event/Holiday not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', protectRoute, deleteEventHoliday);

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     HolidayType:
 *       type: string
 *       enum: [Holiday, Event]
 *       example: Holiday
 * 
 *     EventHoliday:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: "Independence Day"
 *         description:
 *           type: string
 *           example: "National holiday"
 *         start_date:
 *           type: string
 *           format: date
 *           example: "2025-08-15"
 *         end_date:
 *           type: string
 *           format: date
 *           example: "2025-08-15"
 *         is_holiday:
 *           type: boolean
 *           example: true
 *         holiday_type:
 *           $ref: '#/components/schemas/HolidayType'
 * 
 *     EventHolidayCreate:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: "Independence Day"
 *         description:
 *           type: string
 *           example: "National holiday"
 *         start_date:
 *           type: string
 *           format: date
 *           example: "2025-08-15"
 *         end_date:
 *           type: string
 *           format: date
 *           example: "2025-08-15"
 *         is_holiday:
 *           type: boolean
 *           example: true
 *         holiday_type:
 *           $ref: '#/components/schemas/HolidayType'
 *         is_recurring:
 *           type: boolean
 *           example: false
 *         recurrence_pattern:
 *           type: string
 *           example: "yearly"
 *       required:
 *         - title
 *         - start_date
 *         - is_holiday
 */