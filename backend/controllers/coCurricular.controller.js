import * as coCurricularModel from "../models/coCurricular.model.js";

export const getCategories = async (req, res) => {
  try {
    const categories = await coCurricularModel.getCategories();
    res.json(categories);
  } catch (error) {
    console.error('Categories fetch error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getActivities = async (req, res) => {
  try {
    const { categoryId } = req.query;
    
    let activities;
    if (categoryId) {
      activities = await coCurricularModel.getActivitiesByCategory(categoryId);
    } else {
      activities = await coCurricularModel.getAllActivities();
    }
    
    res.json(activities);
  } catch (error) {
    console.error('Activities fetch error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getStudentActivities = async (req, res) => {
  try {
    const { studentId, academicYear } = req.query;
    const targetStudentId = studentId || req.user.id;
    
    // Students can only view their own activities unless teacher/admin
    if (req.user.usertype === 'student' && studentId && studentId != req.user.id) {
      return res.status(403).json({ error: 'Not authorized to view other student activities' });
    }
    
    const activities = await coCurricularModel.getStudentActivities(targetStudentId, academicYear);
    res.json(activities);
  } catch (error) {
    console.error('Student activities fetch error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const enrollStudent = async (req, res) => {
  try {
    const { studentId, activityId, classId, categoryId, remarks,academicYear } = req.body;
    
    if (!studentId || !activityId || !classId) {
      return res.status(400).json({ 
        error: "Missing required fields: studentId, activityId, classId" 
      });
    }
    
    // Students can only enroll themselves unless teacher/admin
    if (req.user.usertype === 'student' && studentId != req.user.id) {
      return res.status(403).json({ error: 'Not authorized to enroll other students' });
    }
    
    const enrollment = await coCurricularModel.enrollStudent(
      studentId, activityId, classId, categoryId, remarks,academicYear
    );
    
    res.status(201).json(enrollment);
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const removeActivity = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the enrollment to check ownership
    const activities = await coCurricularModel.getStudentActivities(req.user.id);
    const enrollment = activities.find(a => a.id == id);
    
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }
    
    // Students can only remove their own enrollments unless teacher/admin
    if (req.user.usertype === 'student' && enrollment.student_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to remove this enrollment' });
    }
    
    const result = await coCurricularModel.removeStudentActivity(id, enrollment.student_id);
    
    if (!result) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }
    
    res.json({ message: 'Activity removed successfully', deleted: result });
  } catch (error) {
    console.error('Remove activity error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Get the enrollment to check ownership
    const activities = await coCurricularModel.getStudentActivities(req.user.id);
    const enrollment = activities.find(a => a.id == id);
    
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }
    
    // Students can only update their own enrollments unless teacher/admin
    if (req.user.usertype === 'student' && enrollment.student_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this enrollment' });
    }
    
    const updated = await coCurricularModel.updateStudentActivity(id, updates);
    res.json(updated);
  } catch (error) {
    console.error('Update activity error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getStats = async (req, res) => {
  try {
    // Only teachers and admins can view statistics
    if (req.user.usertype === 'student') {
      return res.status(403).json({ error: 'Not authorized to view statistics' });
    }
    
    const { classId, academicYear } = req.query;
    const stats = await coCurricularModel.getEnrollmentStats(classId, academicYear);
    res.json(stats);
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createEvent = async (req, res) => {
  try {
    const event = await coCurricularModel.createEvent(req.body);
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getEvents = async (req, res) => {
  res.json(await coCurricularModel.getEvents());
};

export const addParticipants = async (req, res) => {
  await coCurricularModel.addParticipants(
    req.params.eventId,
    req.body.studentIds
  );
  res.json({ message: "Participants added" });
};

export const saveAttendance = async (req, res) => {
  await coCurricularModel.saveAttendance(
    req.params.eventId,
    req.body.records
  );
  res.json({ message: "Attendance saved" });
};

export const getAttendance = async (req, res) => {
  res.json(await coCurricularModel.getAttendance(req.params.eventId));
};