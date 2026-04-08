import { Exam, ExamType, ExamResult } from '../models/exam.model.js';

export const getExamTypes = async (req, res) => {
  try {
    const examTypes = await ExamType.findAll();
    res.json({
      success: true,
      data: examTypes
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update createExam to use exam_type_id instead of exam_type
export const createExam = async (req, res) => {
  try {
    const { title, subject, exam_date, class_id, description, exam_type_id } = req.body;
    const created_by = req.user.id;
    
    const exam = await Exam.create({
      title,
      subject,
      exam_date,
      class_id,
      description,
      exam_type_id,
      created_by
    });
    
    res.status(201).json({
      success: true,
      data: exam
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getStudentExams = async (req, res) => {
  try {
    const { student_id } = req.params;
    const class_id=await Exam.findClassesByStudent(student_id)
    const upcomingExams = await Exam.findUpcomingByClass(class_id);
    const pastExams = await Exam.findPastByClass(class_id);
    
    res.json({
      success: true,
      data: {
        upcoming: upcomingExams,
        past: pastExams
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getTeacherExams = async (req, res) => {
  try {
    const { class_id } = req.params;
    const teacher_id = req.user.id; // Assuming user ID is available from auth middleware
    
    let exams;
    if (class_id) {
      exams = await Exam.findByClass(class_id);
    } else {
      exams = await Exam.findByTeacher(teacher_id);
    }
    
    res.json({
      success: true,
      data: exams
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getExamDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const exam = await Exam.findById(id);
    
    if (!exam) {
      return res.status(404).json({ success: false, error: 'Exam not found' });
    }
    
    res.json({
      success: true,
      data: exam
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
export const updateExam = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subject, exam_date, class_id, description, exam_type_id } = req.body;
    
    // Check if exam exists
    const existingExam = await Exam.findById(id);
    if (!existingExam) {
      return res.status(404).json({ success: false, error: 'Exam not found' });
    }
    
    // Check if user is the creator of the exam
    if (existingExam.created_by !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this exam' });
    }
    
    const updatedExam = await Exam.update(id, {
      title,
      subject,
      exam_date,
      class_id,
      description,
      exam_type_id
    });
    
    res.json({
      success: true,
      data: updatedExam
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
export const createExamResult = async (req, res) => {
  try {
    const {
      exam_id,
      student_id,
      marks,
      percentage,
      grade,
      term,
      is_final,
      class_rank
    } = req.body;

    const exam = await Exam.findById(exam_id);
    if (!exam) {
      return res.status(404).json({ success: false, error: 'Exam not found' });
    }
    
    const result = await ExamResult.create({
      exam_id,
      student_id,
      marks,
      percentage,
      grade,
      term,
      is_final,
      class_rank
    });
    
    res.status(201).json({
      success: true,
      data: {
        ...result,
        subject: exam.subject  // Include subject from exam in response
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getStudentResults = async (req, res) => {
  try {
    const { student_id } = req.params;
    
    const examResults = await ExamResult.findByStudent(student_id);
    const termResults = await ExamResult.getStudentTermResults(student_id);
    
    res.json({
      success: true,
      data: {
        examResults,
        termResults
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getExamResults = async (req, res) => {
  try {
    const { exam_id } = req.params;
    
    const results = await ExamResult.findByExam(exam_id);
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
export const getExamResultDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await ExamResult.findById(id);
    
    if (!result) {
      return res.status(404).json({ success: false, error: 'Exam result not found' });
    }
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateExamResult = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      exam_id,
      student_id,
      marks,
      percentage,
      grade,
      term,
      is_final,
      class_rank
    } = req.body;

    // Check if result exists
    const existingResult = await ExamResult.findById(id);
    if (!existingResult) {
      return res.status(404).json({ success: false, error: 'Exam result not found' });
    }

    // Verify exam exists
    const exam = await Exam.findById(exam_id);
    if (!exam) {
      return res.status(404).json({ success: false, error: 'Exam not found' });
    }

    const updatedResult = await ExamResult.update(id, {
      exam_id,
      student_id,
      marks,
      percentage,
      grade,
      term,
      is_final,
      class_rank
    });
    
    res.json({
      success: true,
      data: {
        ...updatedResult,
        subject: exam.subject
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteExamResult = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await ExamResult.findById(id);
    if (!result) {
      return res.status(404).json({ success: false, error: 'Exam result not found' });
    }
    
    await ExamResult.delete(id);
    
    res.json({
      success: true,
      message: 'Exam result deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAdminExamStats = async (req, res) => {
  try {
    const { classId, className, startDate, endDate } = req.query;
    
    // Pass object to model
    const stats = await ExamResult.getAdminStats({ 
      classId, 
      className, 
      startDate, 
      endDate 
    });
    
    res.json({
      success: true,
      data: {
        average_percentage: parseFloat(stats.average_percentage || 0).toFixed(2),
        total_exams_evaluated: parseInt(stats.total_records || 0)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};