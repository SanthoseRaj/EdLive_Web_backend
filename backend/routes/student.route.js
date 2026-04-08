import express from "express"
import protectRoute from "../middleware/protectRoute.js";
import {
    createStudent,
    getStudents,
    updateStudentImage,
    getStudent,
    updateStudent,
    getStudentBasicInfo,
    updateStudentBasicInfo,
    updateStudentPerformance,
    updateStudentHealth,
    updateStudentSchoolInfo,
    updateStudentParentInfo,
    updateStudentCasteReligion,
    getStudentTimeTable,
    getChildList,
    getChildListById,
    getTeacherList,
    getStudentsByClass,
    getTeacherSiblingList
} from "../controllers/student.controller.js"
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Students
 *     description: Student management
 *   - name: Students/Profile
 *     description: Student profile operations
 *   - name: Students/Performance
 *     description: Student performance records
 *   - name: Students/Health
 *     description: Student health information
 *   - name: Students/School
 *     description: Student school information
 *   - name: Students/Parents
 *     description: Student parent/guardian information
 *   - name: Students/Caste
 *     description: Student caste/religion information
 *   - name: Students/Timetable
 *     description: Student timetable information
 */

/**
 * @swagger
 * /api/student/students/{id}:
 *   post:
 *     tags: [Students]
 *     summary: Create a new student
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               studentId:
 *                 type: string
 *               admissionNo:
 *                 type: string
 *               fullName:
 *                 type: string
 *               classId:
 *                 type: integer
 *               StudentprofileImage:
 *                 type: string
 *                 format: binary
 *             required:
 *               - studentId
 *               - admissionNo
 *               - fullName
 *               - classId
 *     responses:
 *       201:
 *         description: Student created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/students/:_id', protectRoute, upload.single('StudentprofileImage'), createStudent);

/**
 * @swagger
 * /api/student/students:
 *   get:
 *     tags: [Students]
 *     summary: Get all students or filter by class ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: classId
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filter students by Class ID
 *     responses:
 *       200:
 *         description: List of students retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/students', protectRoute, getStudents);

/**
 * @swagger
 * /api/student/students/{id}:
 *   get:
 *     tags: [Students]
 *     summary: Get student details
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Student details retrieved successfully
 *       404:
 *         description: Student not found
 *       500:
 *         description: Server error
 */
router.get('/students/:_id', protectRoute, getStudent);
router.patch('/students/:id', protectRoute, updateStudent);

/**
 * @swagger
 * /api/student/students/{id}/image:
 *   patch:
 *     tags: [Students/Profile]
 *     summary: Update student profile image
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               StudentprofileImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image updated successfully
 *       404:
 *         description: Student not found
 *       500:
 *         description: Image upload failed
 */
router.patch('/students/:id/image', protectRoute, upload.single('StudentprofileImage'), updateStudentImage);

/**
 * @swagger
 * /api/student/students/{id}/basic:
 *   get:
 *     tags: [Students/Profile]
 *     summary: Get student basic information
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Student basic information
 *       404:
 *         description: Student not found
 *       500:
 *         description: Server error
 */
router.get('/students/:id/basic', protectRoute, getStudentBasicInfo);

/**
 * @swagger
 * /api/student/students/{id}/basic:
 *   patch:
 *     tags: [Students/Profile]
 *     summary: Update student basic information
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               gender:
 *                 type: string
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *               blood_group:
 *                 type: string
 *               contact_number:
 *                 type: string
 *     responses:
 *       200:
 *         description: Basic information updated
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Update failed
 */
router.patch('/students/:id/basic', protectRoute, updateStudentBasicInfo);

/**
 * @swagger
 * /api/student/students/{id}/performance:
 *   patch:
 *     tags: [Students/Performance]
 *     summary: Update student performance information
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               attendance:
 *                 type: object
 *               grades:
 *                 type: object
 *               remarks:
 *                 type: string
 *     responses:
 *       200:
 *         description: Performance information updated
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Update failed
 */
router.patch('/students/:id/performance', protectRoute, updateStudentPerformance);

/**
 * @swagger
 * /api/student/students/{id}/health:
 *   patch:
 *     tags: [Students/Health]
 *     summary: Update student health information
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               height:
 *                 type: number
 *               weight:
 *                 type: number
 *               medical_conditions:
 *                 type: array
 *                 items:
 *                   type: string
 *               allergies:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Health information updated
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Update failed
 */
router.patch('/students/:id/health', protectRoute, updateStudentHealth);

/**
 * @swagger
 * /api/student/students/{id}/school:
 *   patch:
 *     tags: [Students/School]
 *     summary: Update student school information
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               admission_date:
 *                 type: string
 *                 format: date
 *               current_class:
 *                 type: string
 *               section:
 *                 type: string
 *               roll_number:
 *                 type: string
 *     responses:
 *       200:
 *         description: School information updated
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Update failed
 */
router.patch('/students/:id/school', protectRoute, updateStudentSchoolInfo);

/**
 * @swagger
 * /api/student/students/{id}/parent:
 *   patch:
 *     tags: [Students/Parents]
 *     summary: Update student parent/guardian information
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               father_name:
 *                 type: string
 *               father_contact:
 *                 type: string
 *               mother_name:
 *                 type: string
 *               mother_contact:
 *                 type: string
 *               guardian_name:
 *                 type: string
 *               guardian_contact:
 *                 type: string
 *     responses:
 *       200:
 *         description: Parent information updated
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Update failed
 */
router.patch('/students/:id/parent', protectRoute, updateStudentParentInfo);

/**
 * @swagger
 * /api/student/students/{id}/caste:
 *   patch:
 *     tags: [Students/Caste]
 *     summary: Update student caste/religion information
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               caste:
 *                 type: string
 *               religion:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Caste/religion information updated
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Update failed
 */
router.patch('/students/:id/caste', protectRoute, updateStudentCasteReligion);
/**
 * @swagger
 * /api/student/students/timetable/{id}/{academicYear}:
 *   get:
 *     summary: Get Student timetable for a specific academic year
 * 
 *     security:
 *       - BearerAuth: []
 *     tags: [Students/Timetable]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *       - in: path
 *         name: academicYear
 *         required: true
 *         schema:
 *           type: string
 *           example: "2024-2025"
 *         description: Academic year in format "YYYY-YYYY"
 *       - in: query
 *         name: term
 *         schema:
 *           type: string
 *           enum: [Fall, Spring, Summer, Winter]
 *         description: Optional term filter
 *     responses:
 *       200:
 *         description: Staff timetable retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   day_of_week:
 *                     type: string
 *                     enum: [Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday]
 *                   period_1:
 *                     type: string
 *                     example: "Class: 10A, Subject: Mathematics"
 *                     nullable: true
 *                   period_2:
 *                     type: string
 *                     example: "Class: 9B, Subject: Physics"
 *                     nullable: true
 *                   period_3:
 *                     type: string
 *                     nullable: true
 *                   period_4:
 *                     type: string
 *                     nullable: true
 *                   period_5:
 *                     type: string
 *                     nullable: true
 *                   period_6:
 *                     type: string
 *                     nullable: true
 *                   period_7:
 *                     type: string
 *                     nullable: true
 *                   period_8:
 *                     type: string
 *                     nullable: true
 *       400:
 *         description: Invalid input parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid academic year format"
 *       404:
 *         description: Staff not found or no timetable available
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No timetable found for staff ID 123 in 2023-2024"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to fetch timetable data"
 */
router.get('/students/timetable/:id/:academicYear', protectRoute, getStudentTimeTable);
/**
 * @swagger
 * /api/student/parents/children:
 *   get:
 *     tags: [Students]
 *     summary: Get list of children for the authenticated parent/guardian
 *     security:
 *       - BearerAuth: []
 *     description: Retrieves all student records associated with the authenticated user (typically used by parents to see their children)
 *     responses:
 *       200:
 *         description: List of children retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: Student ID
 *                   student_id:
 *                     type: string
 *                     description: Student identifier
 *                   full_name:
 *                     type: string
 *                     description: Student's full name
 *                   class_id:
 *                     type: integer
 *                     description: ID of the class the student belongs to
 *                   admission_no:
 *                     type: string
 *                     description: Admission number
 *                   profile_img:
 *                     type: string
 *                     nullable: true
 *                     description: URL to student's profile image
 *       404:
 *         description: No children found for this user
 *       500:
 *         description: Server error
 */
router.get('/parents/children', protectRoute, getChildList);


/**
 * @swagger
 * /api/student/parents/{id}/children:
 *   get:
 *     tags: [Students]
 *     summary: Get list of children for the authenticated parent/guardian
 *     security:
 *       - BearerAuth: []
 *     description: Retrieves all student records associated with the authenticated user (typically used by parents to see their children)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     responses:
 *       200:
 *         description: List of children retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: Student ID
 *                   student_id:
 *                     type: string
 *                     description: Student identifier
 *                   full_name:
 *                     type: string
 *                     description: Student's full name
 *                   class_id:
 *                     type: integer
 *                     description: ID of the class the student belongs to
 *                   admission_no:
 *                     type: string
 *                     description: Admission number
 *                   profile_img:
 *                     type: string
 *                     nullable: true
 *                     description: URL to student's profile image
 *       404:
 *         description: No children found for this user
 *       500:
 *         description: Server error
 */
router.get('/parents/:id/children', protectRoute, getChildListById);

/**
 * @swagger
 * /api/student/students/{id}/teachers:
 *   get:
 *     tags: [Students]
 *     summary: Get list of teachers for a specific student
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     responses:
 *       200:
 *         description: List of teachers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: Staff ID
 *                   full_name:
 *                     type: string
 *                     description: Teacher's full name
 *                   staff_id:
 *                     type: string
 *                     description: Staff identifier
 *       404:
 *         description: No teachers found for this student
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No Teacher found for this Student"
 *                 details:
 *                   type: string
 *                   example: "Student ID: 123"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error Fetching Teacher List"
 */
router.get('/students/:id/teachers', protectRoute, getTeacherList);
router.get("/class/:classId", protectRoute, getStudentsByClass);
/**
 * @swagger
 * /api/student/relations/{studentId}:
 *   get:
 *     tags: [Students]
 *     summary: Get teacher and sibling list for logged-in user
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID to exclude from sibling list
 *     responses:
 *       200:
 *         description: List of teachers and siblings
 *       404:
 *         description: No records found
 *       500:
 *         description: Server error
 */
router.get("/relations/:studentId",  protectRoute,  getTeacherSiblingList);

export default router;