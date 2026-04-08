import express from "express"
import protectRoute from "../middleware/protectRoute.js";
import { getAllTodos, getTodoById,  createTodo,  updateTodo, deleteTodo,getAllTodosByStudent } from "../controllers/todo.controllers.js"
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Todos
 *   description: To-Do management
 */

/**
 * @swagger
 * /api/todos:
 *   get:
 *     summary: Get all todos for current user
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of todos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Todo'
 */
router.get('/', protectRoute, getAllTodos);

/**
 * @swagger
 * /api/todos/student/{id}:
 *   get:
 *     summary: Get all todos for current Student
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID
 *     responses:
 *       200:
 *         description: List of todos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Todo'
 */
router.get('/student/:id',protectRoute, getAllTodosByStudent);

/**
 * @swagger
 * /api/todos/{id}:
 *   get:
 *     summary: Get a todo by ID
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Todo ID
 *     responses:
 *       200:
 *         description: Todo data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       404:
 *         description: Todo not found
 */
router.get('/:id',protectRoute, getTodoById);

/**
 * @swagger
 * /api/todos:
 *   post:
 *     summary: Create a new todo
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 description: date of ToDos
 *               title:
 *                 type: string
 *                 description: title of the ToDo
 *               description:
 *                 type: string
 *                 description: description of the ToDo
 *               classid:
 *                 type: integer
 *                 description: Class ID of the ToDo
 *               subjectid:
 *                 type: integer
 *                 description: Subject ID of the ToDo
 *               todoFileUpload:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Todo created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       400:
 *         description: Bad request
 */
router.post('/',protectRoute,upload.single("todoFileUpload"), createTodo);

/**
 * @swagger
 * /api/todos/{id}:
 *   put:
 *     summary: Update a todo
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Todo ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 description: date of ToDos
 *               title:
 *                 type: string
 *                 description: title of the ToDo
 *               description:
 *                 type: string
 *                 description: description of the ToDo
 *               classid:
 *                 type: integer
 *                 description: Class ID of the ToDo
 *               subjectid:
 *                 type: integer
 *                 description: Subject ID of the ToDo
 *               todoFileUpload:
 *                 type: string
 *                 format: binary
 *               completed:
 *                 type: boolean
 *                 description: description of the ToDo
 *     responses:
 *       200:
 *         description: Updated todo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Todo not found
 */
router.put('/:id',protectRoute,upload.single("todoFileUpload"), updateTodo);

/**
 * @swagger
 * /api/todos/{id}:
 *   delete:
 *     summary: Delete a todo
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Todo ID
 *     responses:
 *       204:
 *         description: Todo deleted
 *       404:
 *         description: Todo not found
 */
router.delete('/:id', protectRoute, deleteTodo);

export default router;