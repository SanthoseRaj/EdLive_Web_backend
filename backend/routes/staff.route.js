import express from 'express';
import { 
  staffCreate,
  staffList,
  staffUpdate,
  staffDelete,
  getStaffBasicInfo,
  updateStaffBasicInfo,
  updateStaffImage,
  getPersonalInfo,
  updatePersonalInfo,
  getServiceInfo,
  updateServiceInfo,
  updateServiceDocs,
  getEducation,
  addEducation,
  updateEducation,
  deleteEducation,
  getFamily,
  addFamilyMember,
  updateFamilyMember,
  deleteFamilyMember,
  getClassResponsibilities,
  updateClassResponsibilities,
  getDocuments,
  uploadDocument,
  deleteDocumnet,
  updateDocument,
  getTimeTable,
  getTeacherTimeTable,
  getClassTimeTable,
  updateTimeTable,
  addTimeTable,
  deleteTimeTable,
  addExperience,
  deleteExperience,
  updateExperienceDocument,
  updateExperience,
  getstudents,
  getClassAssigned,
  batchUpdateStaff,
  getStaffTimetableById,
  saveOrUpdateStaffTimeTable
   
} from '../controllers/staff.controllers.js';

import {  
  getTeachersByClass,
  getAvailableTeachers
} from "../controllers/payment.controller.js";

import protectRoute from '../middleware/protectRoute.js';
import upload from '../middleware/uploadMiddleware.js'; // adjust path as needed


/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Education:
 *       type: object
 *       properties:
 *         degree:
 *           type: string
 *           example: "Bachelor of Science"
 *         university:
 *           type: string
 *           example: "State University"
 *         year:
 *           type: number
 *           example: 2015
 *         certificate:
 *           type: string
 *           example: "certificate.pdf"
 *       required:
 *         - degree
 *         - university
 *         - year
 * 
 *     FamilyMember:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Jane Doe"
 *         relation:
 *           type: string
 *           example: "Spouse"
 *         contact:
 *           type: string
 *           example: "+1234567890"
 * 
 *     Staff:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         fullName:
 *           type: string
 *           example: "John Doe"
 *         staffId:
 *           type: string
 *           example: "STF-001"
 *         position:
 *           type: string
 *           example: "Teacher"
 *         gender:
 *           type: string
 *           enum: [Male, Female]
 *         profileImage:
 *           type: string
 *           example: "uploads/profile-images/12345.jpg"
 *         contact:
 *           type: object
 *           properties:
 *             phone:
 *               type: string
 *               example: "+1234567890"
 *             altphone:
 *               type: string
 *               example: "+0987654321"
 *         personalInfo:
 *           type: object
 *           properties:
 *             dob:
 *               type: string
 *               format: date
 *             age:
 *               type: number
 *             bloodGroup:
 *               type: string
 *             religion:
 *               type: string
 *             caste:
 *               type: string
 *         education:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Education'
 *         family:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/FamilyMember'
 *         serviceInfo:
 *           type: object
 *           properties:
 *             joiningDate:
 *               type: string
 *               format: date
 *             leaves:
 *               type: object
 *               properties:
 *                 total:
 *                   type: number
 *                 used:
 *                   type: number
 *             pfNumber:
 *               type: string
 *         classResponsibilities:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               className:
 *                 type: string
 *               subject:
 *                 type: string
 *               clients:
 *                 type: object
 *         documents:
 *           type: array
 *           items:
 *             type: string
 *       required:
 *         - fullName
 *         - staffId
 *         - position
 *         - gender
 *         - contact
 */
/**
 * @swagger
 * tags:
 *   - name: Staff
 *     description: Staff management
 *   - name: Staff/Profile
 *     description: Staff profile operations
 *   - name: Staff/Education
 *     description: Staff education records
 *   - name: Staff/Family
 *     description: Staff family members
 *   - name: Staff/Classes
 *     description: Staff class responsibilities
 *   - name: Staff/Documents
 *     description: Staff documents
 *   - name: Staff/Service
 *     description: Staff service info
 *   - name: Staff/Experience
 *     description: Staff experience info
 *   - name: Timetable
 *     description: Staff timetable

 * x-tagGroups:
 *   - name: Staff Data Management
 *     tags:
 *       - Staff
 *       - Staff/Profile
 *       - Staff/Education
 *       - Staff/Family
 *       - Staff/Classes
 *       - Staff/Documents
 *       - Staff/Service
 *       - Staff/Experience
 *       - Timetable
 */

const router = express.Router();

/**
 * @swagger
 * /api/staff/Staff/{_id}:
 *   post:
 *     tags: [Staff]
 *     summary: Create a new staff member
 *     description: Create new staff with profile image upload (max 5MB, images only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: _id
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profileImage:
 *                 type: string
 *                 format: binary
 *               fullName:
 *                 type: string
 *               staffId:
 *                 type: string
 *               position:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [Male, Female]
 *               contact.phone:
 *                 type: string
 *               # Add other fields following the model structure
 *             required:
 *               - fullName
 *               - staffId
 *               - position
 *               - gender
 *               - contact.phone
 *     responses:
 *       201:
 *         description: Staff created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Staff'
 *       400:
 *         description: Invalid input
 *       415:
 *         description: Invalid file type
 *       500:
 *         description: Server error
 */
router.post("/Staff/:_id", protectRoute, upload.single('profileImage'), staffCreate);
/**
 * @swagger
 * /api/staff/staff/students/list:
 *   get:
 *     tags: [Staff/GetStudent]
 *     summary: Update experience details
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Student listed Successfully
 */

router.get('/staff/students/list', protectRoute, getstudents);

/**
 * @swagger
 * /api/staff/staff/teacher/class:
 *   get:
 *     tags: [Staff/GetClasses]
 *     summary: Class Assigned to Staff
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Class Assigned to Staff
 */


router.get('/staff/teacher/class', protectRoute, getClassAssigned);

/**
 * @swagger
 * /api/staff/Staff/{_staffid}:
 *   get:
 *     tags: [Staff]
 *     summary: Get all staff members
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: _staffid
 *         required: true
 *         schema:
 *           type: string
 *         description: Staff ID
 *     responses:
 *       200:
 *         description: List of staff members
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Staff'
 *       500:
 *         description: Server error
 */
router.get("/Staff/:_staffid?", protectRoute, staffList);
/**
 * @swagger
 * /api/staff/Staff/{_staffid}:
 *   put:
 *     tags: [Staff]
 *     summary: Update staff member
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: _staffid
 *         required: true
 *         schema:
 *           type: string
 *         description: Staff ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profileImage:
 *                 type: string
 *                 format: binary
 *               fullName:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [Male, Female]
 *               contact.phone:
 *                 type: string
 *               contact.altphone:
 *                 type: string
 *               personalInfo.dob:
 *                 type: string
 *                 format:  date
 *               personalInfo.age:
 *                 type: string
 *               personalInfo.bloodGroup:
 *                 type: string
 *               personalInfo.religion:
 *                 type: string
 *               personalInfo.caste:
 *                 type: string
 *               education:
 *                 type: array
 *                 items:
 *                     $ref: '#/components/schemas/Education'
 *               family:
 *                 type: array
 *                 items:
 *                     $ref: '#/components/schemas/FamilyMember' 
 *               # Add other updatable fields
 *     responses:
 *       200:
 *         description: Updated staff data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Staff'
 *       404:
 *         description: Staff not found
 *       500:
 *         description: Server error
 * 
 */
router.put("/Staff/:_staffid", protectRoute, upload.single('profileImage'), staffUpdate);
/**
 * @swagger
 * /api/staff/Staff/{_staffid}:
 *   delete:
 *     tags: [Staff]
 *     summary: Delete staff member
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: _staffid
 *         required: true
 *         schema:
 *           type: string
 *         description: Staff ID
 *     responses:
 *       200:
 *         description: Staff deleted successfully
 *       404:
 *         description: Staff not found
 *       500:
 *         description: Server error
 */
router.delete("/Staff/:_staffid", protectRoute, staffDelete);


// Basic Info
/**
 * @swagger
 * /api/staff/staff/{id}/basic:
 *   get:
 *     tags: [Staff/Profile]
 *     summary: Get staff basic information
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Staff ID
 *     responses:
 *       200:
 *         description: Staff basic information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 full_name:
 *                   type: string
 *                 staff_id_no:
 *                   type: string
 *                 gender:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 alt_phone:
 *                   type: string
 *                 email:
 *                   type: string
 *                 profile_image:
 *                   type: string
 *       404:
 *         description: Staff not found
 *       500:
 *         description: Server error
 */
router.get('/Staff/:id/basic', protectRoute, getStaffBasicInfo);
/**
 * @swagger
 * /api/staff/staff/{id}/basic:
 *   patch:
 *     tags: [Staff/Profile]
 *     summary: Update staff basic information
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Staff ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               path:
 *                 type: string
 *                 description: Field path to update (e.g., "phone", "alt_phone")
 *               value:
 *                 type: string
 *                 description: New value for the field
 *     responses:
 *       200:
 *         description: Updated staff information
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Staff not found
 *       500:
 *         description: Server error
 */
router.patch('/Staff/:id/basic', protectRoute, updateStaffBasicInfo);
/**
 * @swagger
 * /api/staff/staff/{id}/image:
 *   patch:
 *     tags: [Staff/Profile]
 *     summary: Update staff profile image
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Staff ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profileImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profileImage:
 *                   type: string
 *                   description: Path to the uploaded image
 *       400:
 *         description: Invalid file
 *       415:
 *         description: Invalid file type (only images allowed)
 *       500:
 *         description: Image upload failed
 */
router.patch('/Staff/:id/image',protectRoute, upload.single('profileImage'), updateStaffImage);
// Personal Info
/**
 * @swagger
 * /api/staff/staff/{id}/personal:
 *   get:
 *     tags: [Staff/Profile]
 *     summary: Get staff personal information
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Staff ID
 *     responses:
 *       200:
 *         description: Staff personal information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dob:
 *                   type: string
 *                   format: date
 *                 age:
 *                   type: integer
 *                 blood_group:
 *                   type: string
 *                 bankAccNo:
 *                   type: string
 *                 panNo:
 *                   type: string
 *                 aadhaar:
 *                   type: string
 *       404:
 *         description: Staff not found
 *       500:
 *         description: Server error
 */
router.get('/Staff/:id/personal', getPersonalInfo);
/**
 * @swagger
 * /api/staff/staff/{id}/personal:
 *   patch:
 *     tags: [Staff/Profile]
 *     summary: Update staff personal information
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Staff ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dob:
 *                 type: string
 *                 format: date
 *               age:
 *                 type: integer
 *               blood_group:
 *                 type: string
 *               bankAccNo:
 *                 type: string
 *               panNo:
 *                 type: string
 *               aadhaar:
 *                 type: string
 *     responses:
 *       200:
 *         description: Personal information updated
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Staff not found
 *       500:
 *         description: Server error
 */
router.patch('/Staff/:id/personal', updatePersonalInfo);
// Service Info
/**
 * @swagger
 * /api/staff/staff/{id}/service:
 *   get:
 *     tags: [Staff/Service]
 *     summary: Get staff service information
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Service information retrieved
 *       404:
 *         description: Staff not found
 *       500:
 *         description: Server error
 */

router.get('/Staff/:id/service', getServiceInfo);
/**
 * @swagger
 * /api/staff/staff/{id}/service:
 *   patch:
 *     tags: [Staff/Service]
 *     summary: Update staff service information
 *     security:
 *       - BearerAuth: []
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
 *               joiningDate:
 *                 type: string
 *                 format: date
 *               pfNumber:
 *                 type: string
 *               leaves:
 *                 type: object
 *                 properties:
 *                   total:
 *                     type: integer
 *                   used:
 *                     type: integer
 *     responses:
 *       200:
 *         description: Service info updated
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Staff not found
 *       500:
 *         description: Server error
 */

router.patch('/Staff/:id/service', updateServiceInfo);
/**
 * @swagger
 * /api/staff/staff/{id}/service/docs:
 *   patch:
 *     tags: [Staff/Service]
 *     summary: Upload PF document for service info
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               pf_doc:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Document uploaded successfully
 *       400:
 *         description: Invalid file
 *       500:
 *         description: Upload failed
 */

router.patch('/Staff/:id/service/docs',protectRoute, upload.single('pf_doc'), updateServiceDocs);

// Education
/**
 * @swagger
 * /api/staff/staff/{id}/education:
 *   get:
 *     tags: [Staff/Education]
 *     summary: Get staff education records
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Staff ID
 *     responses:
 *       200:
 *         description: List of education records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   degree:
 *                     type: string
 *                   university:
 *                     type: string
 *                   year:
 *                     type: integer
 *                   certificate:
 *                     type: string
 *       404:
 *         description: Staff not found
 *       500:
 *         description: Server error
 */
router.get('/Staff/:id/education', getEducation);
/**
 * @swagger
 * /api/staff/staff/{id}/education:
 *   post:
 *     tags: [Staff/Education]
 *     summary: Add education record
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Staff ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               degree:
 *                 type: string
 *               university:
 *                 type: string
 *               year:
 *                 type: integer
 *               certificate:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Education record added
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Failed to add education
 */
router.post('/Staff/:id/education', upload.single('certificate'), addEducation);
/**
 * @swagger
 * /api/staff/staff/{id}/education/{eduId}:
 *   patch:
 *     tags: [Staff/Education]
 *     summary: Update education record
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Staff ID
 *       - in: path
 *         name: eduId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Education record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               degree:
 *                 type: string
 *               university:
 *                 type: string
 *               year:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Education record updated
 *       404:
 *         description: Record not found
 *       500:
 *         description: Update failed
 */
router.patch('/Staff/:id/education/:eduId',upload.single("certificate"), updateEducation);
/**
 * @swagger
 * /api/staff/staff/{id}/education/{eduId}:
 *   delete:
 *     tags: [Staff/Education]
 *     summary: Delete education record
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Staff ID
 *       - in: path
 *         name: eduId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Education record ID
 *     responses:
 *       204:
 *         description: Record deleted
 *       404:
 *         description: Record not found
 *       500:
 *         description: Failed to delete
 */
router.delete('/Staff/:id/education/:eduId', deleteEducation);

// Family
/**
 * @swagger
 * /api/staff/staff/{id}/family:
 *   get:
 *     tags: [Staff/Family]
 *     summary: Get staff family members
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Staff ID
 *     responses:
 *       200:
 *         description: List of family members
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   relation:
 *                     type: string
 *                   contact:
 *                     type: string
 *       404:
 *         description: Staff not found
 *       500:
 *         description: Server error
 */
router.get('/Staff/:id/family', getFamily);
/**
 * @swagger
 * /api/staff/staff/{id}/family:
 *   post:
 *     tags: [Staff/Family]
 *     summary: Add family member
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Staff ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               relation:
 *                 type: string
 *               contact:
 *                 type: string
 *     responses:
 *       201:
 *         description: Family member added
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Failed to add family member
 */
router.post('/Staff/:id/family', addFamilyMember);
/**
 * @swagger
 * /api/staff/staff/{id}/family/{familyId}:
 *   patch:
 *     tags: [Staff/Family]
 *     summary: Update family member
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Staff ID
 *       - in: path
 *         name: familyId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Family member ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               relation:
 *                 type: string
 *               contact:
 *                 type: string
 *     responses:
 *       200:
 *         description: Family member updated
 *       404:
 *         description: Family member not found
 *       500:
 *         description: Failed to update
 */
router.patch('/Staff/:id/family/:familyId', updateFamilyMember);
/**
 * @swagger
 * /api/staff/staff/{id}/family/{familyId}:
 *   delete:
 *     tags: [Staff/Family]
 *     summary: Delete family member
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Staff ID
 *       - in: path
 *         name: familyId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Family member ID
 *     responses:
 *       204:
 *         description: Family member deleted
 *       404:
 *         description: Family member not found
 *       500:
 *         description: Failed to delete
 */
router.delete('/Staff/:id/family/:familyId', deleteFamilyMember);

// Class Responsibilities
/**
 * @swagger
 * /api/staff/staff/{id}/classes:
 *   get:
 *     tags: [Staff/Classes]
 *     summary: Get class responsibilities of staff
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Class responsibilities retrieved
 *       404:
 *         description: Staff not found
 */

router.get('/Staff/:id/classes', getClassResponsibilities);
/**
 * @swagger
 * /api/staff/staff/{id}/classes/{classId}:
 *   patch:
 *     tags: [Staff/Classes]
 *     summary: Update class responsibility
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: classId
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
 *               className:
 *                 type: string
 *               subject:
 *                 type: string
 *     responses:
 *       200:
 *         description: Class responsibility updated
 *       404:
 *         description: Class or staff not found
 */

router.patch('/Staff/:id/classes/:classId', updateClassResponsibilities);

// Documents
/**
 * @swagger
 * /api/staff/staff/{id}/documents:
 *   get:
 *     tags: [Staff/Documents]
 *     summary: Get staff documents
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Staff ID
 *     responses:
 *       200:
 *         description: List of documents
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   document_type:
 *                     type: string
 *                   document_path:
 *                     type: string
 *       404:
 *         description: Staff not found
 *       500:
 *         description: Server error
 */
router.get('/Staff/:id/documents', getDocuments);
/**
 * @swagger
 * /api/staff/staff/{id}/documents:
 *   post:
 *     tags: [Staff/Documents]
 *     summary: Upload document
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Staff ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               document_type:
 *                 type: string
 *               exp_doc:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Document uploaded
 *       400:
 *         description: Invalid file
 *       500:
 *         description: Upload failed
 */
router.post('/Staff/:id/documents', upload.single('document_path'), uploadDocument);
router.delete('/Staff/:id/documents/:doc_id', deleteDocumnet);
router.patch('/Staff/:id/documents/:doc_id', upload.single('document_path'), updateDocument);
router.post('/staff/:id/documents_exp', upload.single('exp_doc'), uploadDocument);
/**
 * @swagger
 * /api/staff/staff/{id}/timetable/{academicYear}:
 *   get:
 *     summary: Get staff timetable for a specific academic year
 * 
 *     security:
 *       - BearerAuth: []
 *     tags: [Timetable]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Staff ID
 *       - in: path
 *         name: academicYear
 *         required: true
 *         schema:
 *           type: string
 *           example: "2023-2024"
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
router.get('/Staff/:id/timetable/:academicYear', getTimeTable);
/**
 * @swagger
 * /api/staff/staff/timetable/{academicYear}:
 *   get:
 *     summary: Get staff timetable for a specific academic year
 * 
 *     security:
 *       - BearerAuth: []
 *     tags: [Timetable]
 *     parameters:
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
router.get('/Staff/timetable/:academicYear', protectRoute, getTeacherTimeTable);
router.get('/Staff/classes/timetable',protectRoute, getClassTimeTable);

/**
 * @swagger
 * /api/staff/staff/{id}/classes/{classid}/timetable:
 *   patch:
 *     tags: [Timetable]
 *     summary: Update timetable for specific class
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *       - in: path
 *         name: classid
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               Monday:
 *                 period_1: "Math"
 *                 period_2: "English"
 *     responses:
 *       200:
 *         description: Timetable updated
 *       404:
 *         description: Not found
 */

router.patch('/staff/:id/classes/:classid/timetable', updateTimeTable);
/**
 * @swagger
 * /api/staff/staff/{id}/timetable:
 *   post:
 *     tags: [Timetable]
 *     summary: Add a new timetable entry
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               academicYear: "2023-2024"
 *               timetable:
 *                 Monday:
 *                   period_1: "Math"
 *     responses:
 *       201:
 *         description: Timetable added
 *       400:
 *         description: Invalid data
 */

router.post('/staff/:id/timetable', addTimeTable);
/**
 * @swagger
 * /api/staff/staff/{id}/timetable/{classid}:
 *   delete:
 *     tags: [Timetable]
 *     summary: Delete timetable entry for a class
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *       - in: path
 *         name: classid
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       204:
 *         description: Timetable deleted
 *       404:
 *         description: Timetable not found
 */

router.delete('/staff/:id/timetable/:classid', deleteTimeTable);
/**
 * @swagger
 * /api/staff/staff/{id}/experience:
 *   post:
 *     tags: [Staff/Experience]
 *     summary: Add experience document
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               exp_doc:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Experience added
 */

router.post('/staff/:id/experience', upload.single('exp_doc'), addExperience);
/**
 * @swagger
 * /api/staff/staff/{id}/experience/{exp_id}:
 *   delete:
 *     tags: [Staff/Experience]
 *     summary: Delete experience record
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *       - in: path
 *         name: exp_id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       204:
 *         description: Experience deleted
 */

router.delete('/staff/:id/experience/:exp_id', deleteExperience);
/**
 * @swagger
 * /api/staff/staff/{id}/experience/{exp_id}/document:
 *   patch:
 *     tags: [Staff/Experience]
 *     summary: Update experience document
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *       - in: path
 *         name: exp_id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               exp_doc:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Document updated
 */

router.patch('/staff/:id/experience/:exp_id/document', upload.single('exp_doc'), updateExperienceDocument);
/**
 * @swagger
 * /api/staff/staff/{id}/experience/{exp_id}:
 *   patch:
 *     tags: [Staff/Experience]
 *     summary: Update experience details
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *       - in: path
 *         name: exp_id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               company: "ABC School"
 *               designation: "Lecturer"
 *               duration: "2 years"
 *     responses:
 *       200:
 *         description: Experience updated
 */

router.patch('/staff/:id/experience/:exp_id', updateExperience);

/**
 * @swagger
 * /api/staff/staff/{id}/batch-update:
 *   put:
 *     tags: [Staff]
 *     summary: Batch update staff information
 *     security:
 *       - BearerAuth: []
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
 *               staff_id_no:
 *                 type: string
 *               gender:
 *                 type: string
 *               phone:
 *                 type: string
 *               current_address:
 *                 type: string
 *               permanent_address:
 *                 type: string
 *               education:
 *                 type: array
 *                 items:
 *                   type: object
 *               family:
 *                 type: array
 *                 items:
 *                   type: object
 *               classResponsibilities:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Staff updated successfully
 *       500:
 *         description: Batch update failed
 */
router.put('/staff/:id/batch-update', protectRoute, batchUpdateStaff);

/**
 * @swagger
 * /api/staff/teachers/class:
 *   get:
 *     tags: [Staff/Classes]
 *     summary: Get teachers by class IDs
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: class_ids
 *         required: true
 *         schema:
 *           type: string
 *         description: Comma-separated class IDs
 *     responses:
 *       200:
 *         description: List of teachers for the classes
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
 *                     type: object
 *                     properties:
 *                       assignment_id:
 *                         type: integer
 *                       staff_id:
 *                         type: integer
 *                       full_name:
 *                         type: string
 *                       position:
 *                         type: string
 *                       profile_image:
 *                         type: string
 *                       email:
 *                         type: string
 *                       phone:
 *                         type: string
 *                       subject_name:
 *                         type: string
 *                       class_name:
 *                         type: string
 *                       section:
 *                         type: string
 */
router.get('/teachers/class', protectRoute, getTeachersByClass);
/**
 * @swagger
 * /api/staff/teachers/available:
 *   get:
 *     tags: [Staff/Classes]
 *     summary: Get available teachers for assignment
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of available teachers
 */
router.get('/teachers/available', protectRoute, getAvailableTeachers);

/**
 * @swagger
 * /api/staff/StaffTimeTable/{_staffid}:
 *   get:
 *     tags: [Staff]
 *     summary: Get staff TimeTable
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: _staffid
 *         required: true
 *         schema:
 *           type: string
 *         description: Staff ID
 *     responses:
 *       200:
 *         description: List of staff members
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Staff'
 *       500:
 *         description: Server error
 */
router.get("/StaffTimeTable/:_staffid?", protectRoute, getStaffTimetableById);

/**
 * @swagger
 * /api/staff/SaveStaffTimeTable:
 *   post:
 *     tags: [Timetable]
 *     summary: Add, Update or Delete staff timetable
 *     description: |
 *       This API performs timetable operations based on `timetable_id`.
 *       
 *       • If `timetable_id` = "temp" OR not provided → Creates new timetable  
 *       • If `timetable_id` is a number → Updates existing timetable  
 *       • If `isDelete` = true → Deletes timetable by `timetable_id`
 *
 *     security:
 *       - BearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               timetable_id:
 *                 type: string
 *                 example: "temp"
 *                 description: |
 *                   Use "temp" for creating new timetable.
 *                   Use existing timetable_id for update/delete.
 *
 *               staff_id:
 *                 type: integer
 *                 example: 5
 *
 *               class_id:
 *                 type: integer
 *                 example: 2
 *
 *               subject_id:
 *                 type: integer
 *                 example: 3
 *
 *               monday:
 *                 type: string
 *                 example: "09:00 AM - 10:00 AM"
 *
 *               tuesday:
 *                 type: string
 *                 example: "10:00 AM - 11:00 AM"
 *
 *               wednesday:
 *                 type: string
 *                 example: "11:00 AM - 12:00 PM"
 *
 *               thursday:
 *                 type: string
 *                 example: "12:00 PM - 01:00 PM"
 *
 *               friday:
 *                 type: string
 *                 example: "02:00 PM - 03:00 PM"
 *
 *               saturday:
 *                 type: string
 *                 example: "09:00 AM - 10:00 AM"
 *
 *               isDelete:
 *                 type: boolean
 *                 example: false
 *                 description: Set true to delete timetable
 *
 *     responses:
 *       201:
 *         description: Timetable created successfully
 *       200:
 *         description: Timetable updated or deleted successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/SaveStaffTimeTable', protectRoute, saveOrUpdateStaffTimeTable);

export default router;