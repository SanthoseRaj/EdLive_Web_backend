import * as quickNotesModel from "../models/quicknotes.model.js";
import * as staffModel from "../models/staff.model.js"

export const quickNoteCreate = async (req, res) => {
  try {
    const {
      title,
      description,
      webLinks,
      studentIds,
      classId
    } = req.body;

    // Validate required fields
    if (!title || !classId) {
      return res.status(400).json({ 
        error: "Missing required fields: title, classId" 
      });
    }

    // Convert studentIds to array if it's a single value
    let processedStudentIds = [];
    if (studentIds) {
      processedStudentIds = Array.isArray(studentIds) ? studentIds : [studentIds];
      // Remove any null/undefined values
      processedStudentIds = processedStudentIds.filter(id => id != null);
    }

    const quickNote = await quickNotesModel.quickNoteCreate({
      title,
      description,
      webLinks: Array.isArray(webLinks) ? webLinks : [webLinks].filter(Boolean),
      studentIds: processedStudentIds,
      classId,
      createdBy: req.user.id
    });

    res.status(201).json(quickNote);
  } catch (error) {
    console.error('Quick note creation error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const quickNoteGetAll = async (req, res) => {
  try {
    const filters = {
      classId: req.query.classId,
      studentId: req.query.studentId,
      createdBy: req.user.usertype === 'teacher' ? req.user.id : undefined
    };

    const quickNotes = await quickNotesModel.quickNoteFindAll(filters);
    res.json(quickNotes);
  } catch (error) {
    console.error('Quick notes fetch error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const quickNoteGetById = async (req, res) => {
  try {
    const { id } = req.params;
    const quickNote = await quickNotesModel.quickNoteFindById(id);

    if (!quickNote) {
      return res.status(404).json({ error: 'Quick note not found' });
    }

    res.json(quickNote);
  } catch (error) {
    console.error('Quick note fetch error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const quickNoteUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Process studentIds if provided
    if (updates.studentIds) {
      updates.studentIds = Array.isArray(updates.studentIds) 
        ? updates.studentIds 
        : [updates.studentIds];
      updates.studentIds = updates.studentIds.filter(id => id != null);
    }

    // Check if user owns the note or is admin
    const existingNote = await quickNotesModel.quickNoteFindById(id);
    if (!existingNote) {
      return res.status(404).json({ error: 'Quick note not found' });
    }

    if (existingNote.created_by !== req.user.id && req.user.usertype !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this note' });
    }

    const updatedNote = await quickNotesModel.quickNoteUpdate(id, updates);
    res.json(updatedNote);
  } catch (error) {
    console.error('Quick note update error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const quickNoteDelete = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user owns the note or is admin
    const existingNote = await quickNotesModel.quickNoteFindById(id);
    if (!existingNote) {
      return res.status(404).json({ error: 'Quick note not found' });
    }

    if (existingNote.created_by !== req.user.id && req.user.usertype !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this note' });
    }

    const deletedNote = await quickNotesModel.quickNoteDelete(id);
    res.json({ 
      message: 'Quick note deleted successfully',
      deletedNote 
    });
  } catch (error) {
    console.error('Quick note deletion error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getTeacherClasses = async (req, res) => {
  try {
    if (req.user.usertype !== 'Teacher') {
      return res.status(403).json({ error: 'Only teachers can access classes' });
    }

    const classes = await staffModel.getClassAssigned(req.user.id);
    res.json(classes);
  } catch (error) {
    console.error('Classes fetch error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getClassStudents = async (req, res) => {
  try {
    const { classId } = req.params;

    if (!classId) {
      return res.status(400).json({ error: 'Class ID is required' });
    }

    const students = await quickNotesModel.getStudentsByClass(classId);
    res.json(students);
  } catch (error) {
    console.error('Students fetch error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getStudentsDetails = async (req, res) => {
  try {
    const { studentIds } = req.body;

    if (!studentIds || !Array.isArray(studentIds)) {
      return res.status(400).json({ error: 'Student IDs array is required' });
    }

    const students = await quickNotesModel.getStudentsByIds(studentIds);
    res.json(students);
  } catch (error) {
    console.error('Students details fetch error:', error);
    res.status(500).json({ error: error.message });
  }
};