import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import {
  createBus,
  createRoute,
  addRouteStop,
  createDriver,
  assignBus,
  assignStudentTransport,
  assignStaffTransport,
  getBusDetails,
  getRouteDetails,
  getStudentTransport,
  getStaffTransport,
  listBuses,
  listRoutes,
  listDrivers,
  getDriverDetails,
  updateDriver,
  deleteDriver,
  listAssignments,
  getAssignmentDetails,
  updateAssignment,
  deleteAssignment,
  updateBus,
  deleteBus,
  updateRoute,
  deleteRoute,
  getRouteStops,
  updateRouteStop,
  deleteRouteStop,
  getAllStudentTransport,
  getAllStaffTransport
} from "../controllers/transport.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Transport
 *   description: School transport management
 */

/**
 * @swagger
 * /api/transport/buses:
 *   post:
 *     summary: Create a new bus
 *     tags: [Transport]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BusCreate'
 *     responses:
 *       201:
 *         description: Bus created successfully
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 */
router.post('/buses', protectRoute, createBus);

/**
 * @swagger
 * /api/transport/routes:
 *   post:
 *     summary: Create a new route
 *     tags: [Transport]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RouteCreate'
 *     responses:
 *       201:
 *         description: Route created successfully
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 */
router.post('/routes', protectRoute, createRoute);

/**
 * @swagger
 * /api/transport/routes/stops:
 *   post:
 *     summary: Add a stop to a route
 *     tags: [Transport]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RouteStopCreate'
 *     responses:
 *       201:
 *         description: Stop added successfully
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 */
router.post('/routes/stops', protectRoute, addRouteStop);

/**
 * @swagger
 * /api/transport/drivers:
 *   post:
 *     summary: Create a new driver
 *     tags: [Transport]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DriverCreate'
 *     responses:
 *       201:
 *         description: Driver created successfully
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 */
router.post('/drivers', protectRoute, createDriver);

/**
 * @swagger
 * /api/transport/assignments:
 *   post:
 *     summary: Assign a bus to a route with a driver
 *     tags: [Transport]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BusAssignmentCreate'
 *     responses:
 *       201:
 *         description: Assignment created successfully
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 */
router.post('/assignments', protectRoute, assignBus);

/**
 * @swagger
 * /api/transport/assignments/students:
 *   post:
 *     summary: Assign a student to a bus stop
 *     tags: [Transport]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StudentTransportCreate'
 *     responses:
 *       201:
 *         description: Student assigned successfully
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 */
router.post('/assignments/students', protectRoute, assignStudentTransport);

/**
 * @swagger
 * /api/transport/assignments/staff:
 *   post:
 *     summary: Assign a staff to a bus stop
 *     tags: [Transport]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StaffTransportCreate'
 *     responses:
 *       201:
 *         description: Staff assigned successfully
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 */
router.post('/assignments/staff', protectRoute, assignStaffTransport);

/**
 * @swagger
 * /api/transport/buses/{bus_id}:
 *   get:
 *     summary: Get bus details
 *     tags: [Transport]
 *     parameters:
 *       - in: path
 *         name: bus_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Bus details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusDetails'
 *       404:
 *         description: Bus not found
 */
router.get('/buses/:bus_id', getBusDetails);

/**
 * @swagger
 * /api/transport/routes/{route_id}:
 *   get:
 *     summary: Get route details
 *     tags: [Transport]
 *     parameters:
 *       - in: path
 *         name: route_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Route details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RouteDetails'
 *       404:
 *         description: Route not found
 */
router.get('/routes/:route_id', getRouteDetails);

/**
 * @swagger
 * /api/transport/students/{student_id}/{academic_year}:
 *   get:
 *     summary: Get student transport details
 *     tags: [Transport]
 *     parameters:
 *       - in: path
 *         name: student_id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: academic_year
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student transport details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentTransportDetails'
 *       404:
 *         description: Transport details not found
 */
router.get('/students/:student_id/:academic_year', getStudentTransport);

/**
 * @swagger
 * /api/transport/staff/{staff_id}/{academic_year}:
 *   get:
 *     summary: Get staff transport details
 *     tags: [Transport]
 *     parameters:
 *       - in: path
 *         name: staff_id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: academic_year
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Staff transport details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StaffTransportDetails'
 *       404:
 *         description: Transport details not found
 */
router.get('/staff/:staff_id/:academic_year', getStaffTransport);

/**
 * @swagger
 * /api/transport/buses:
 *   get:
 *     summary: List all buses
 *     tags: [Transport]
 *     responses:
 *       200:
 *         description: List of buses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BusList'
 */
router.get('/buses', listBuses);

/**
 * @swagger
 * /api/transport/routes:
 *   get:
 *     summary: List all routes
 *     tags: [Transport]
 *     responses:
 *       200:
 *         description: List of routes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RouteList'
 */
router.get('/routes', listRoutes);


router.get('/student-transports/:academic_year', getAllStudentTransport);
router.get('/staff-transports/:academic_year', getAllStaffTransport);

// Driver routes
router.get('/drivers', protectRoute, listDrivers);
router.get('/drivers/:driver_id', protectRoute, getDriverDetails);
router.put('/drivers/:driver_id', protectRoute, updateDriver);
router.delete('/drivers/:driver_id', protectRoute, deleteDriver);

// Assignment routes
router.get('/assignments', protectRoute, listAssignments);
router.get('/assignments/:assignment_id', protectRoute, getAssignmentDetails);
router.put('/assignments/:assignment_id', protectRoute, updateAssignment);
router.delete('/assignments/:assignment_id', protectRoute, deleteAssignment);

// Bus update/delete routes
router.put('/buses/:bus_id', protectRoute, updateBus);
router.delete('/buses/:bus_id', protectRoute, deleteBus);

// Route update/delete routes
router.put('/routes/:route_id', protectRoute, updateRoute);
router.delete('/routes/:route_id', protectRoute, deleteRoute);

// Route stops management
router.get('/routes/:route_id/stops', protectRoute, getRouteStops);
router.put('/route-stops/:stop_id', protectRoute, updateRouteStop);
router.delete('/route-stops/:stop_id', protectRoute, deleteRouteStop);

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     BusCreate:
 *       type: object
 *       properties:
 *         bus_number:
 *           type: string
 *         registration_number:
 *           type: string
 *         capacity:
 *           type: integer
 *         year_of_manufacture:
 *           type: integer
 *       required:
 *         - bus_number
 * 
 *     RouteCreate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         start_point:
 *           type: string
 *         end_point:
 *           type: string
 *       required:
 *         - name
 *         - start_point
 *         - end_point
 * 
 *     RouteStopCreate:
 *       type: object
 *       properties:
 *         route_id:
 *           type: integer
 *         stop_name:
 *           type: string
 *         stop_order:
 *           type: integer
 *         arrival_time:
 *           type: string
 *           format: time
 *         latitude:
 *           type: number
 *           format: decimal
 *         longitude:
 *           type: number
 *           format: decimal
 *       required:
 *         - route_id
 *         - stop_name
 *         - stop_order
 *         - arrival_time
 * 
 *     DriverCreate:
 *       type: object
 *       properties:
 *         user_id:
 *           type: integer
 *         name:
 *           type: string
 *         contact_number:
 *           type: string
 *         license_number:
 *           type: string
 *         license_expiry:
 *           type: string
 *           format: date
 *       required:
 *         - name
 *         - contact_number
 *         - license_number
 * 
 *     BusAssignmentCreate:
 *       type: object
 *       properties:
 *         bus_id:
 *           type: integer
 *         route_id:
 *           type: integer
 *         driver_id:
 *           type: integer
 *         academic_year:
 *           type: string
 *         is_active:
 *           type: boolean
 *       required:
 *         - bus_id
 *         - academic_year
 * 
 *     StudentTransportCreate:
 *       type: object
 *       properties:
 *         student_id:
 *           type: integer
 *         assignment_id:
 *           type: integer
 *         stop_id:
 *           type: integer
 *         academic_year:
 *           type: string
 *       required:
 *         - student_id
 *         - assignment_id
 *         - academic_year
 *  
 *     StaffTransportCreate:
 *       type: object
 *       properties:
 *         staff_id:
 *           type: integer
 *         assignment_id:
 *           type: integer
 *         stop_id:
 *           type: integer
 *         academic_year:
 *           type: string
 *       required:
 *         - staff_id
 *         - assignment_id
 *         - academic_year
 * 
 *     BusDetails:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         bus_number:
 *           type: string
 *         registration_number:
 *           type: string
 *         capacity:
 *           type: integer
 *         year_of_manufacture:
 *           type: integer
 *         academic_year:
 *           type: string
 *         route_name:
 *           type: string
 *         driver_name:
 *           type: string
 *         driver_contact:
 *           type: string
 *         manager_name:
 *           type: string
 *         manager_contact:
 *           type: string
 * 
 *     RouteDetails:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         start_point:
 *           type: string
 *         end_point:
 *           type: string
 *         stops:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               stop_name:
 *                 type: string
 *               arrival_time:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 * 
 *     StudentTransportDetails:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         bus_number:
 *           type: string
 *         route_name:
 *           type: string
 *         stop_name:
 *           type: string
 *         arrival_time:
 *           type: string
 *         driver_name:
 *           type: string
 *         driver_contact:
 *           type: string
 *         manager_name:
 *           type: string
 *         manager_contact:
 *           type: string
 * 
 *     StaffTransportDetails:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         bus_number:
 *           type: string
 *         route_name:
 *           type: string
 *         stop_name:
 *           type: string
 *         arrival_time:
 *           type: string
 *         driver_name:
 *           type: string
 *         driver_contact:
 *           type: string
 *         manager_name:
 *           type: string
 *         manager_contact:
 *           type: string
 * 
 *     BusList:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         bus_number:
 *           type: string
 *         registration_number:
 *           type: string
 *         capacity:
 *           type: integer
 *         academic_year:
 *           type: string
 *         route_name:
 *           type: string
 *         driver_name:
 *           type: string
 * 
 *     RouteList:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         start_point:
 *           type: string
 *         end_point:
 *           type: string
 *         stop_count:
 *           type: integer
 *         bus_number:
 *           type: string
 */