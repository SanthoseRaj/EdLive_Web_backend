import * as stickyNotesModel from "../models/stickynotes.model.js";

export const stickyNoteCreate = async (req, res) => {
  try {
    const {
      notes,
      color,
      position_x,
      position_y
    } = req.body;

    // Validate required fields
    if (!notes) {
      return res.status(400).json({ 
        error: "Missing required field: notes" 
      });
    }
    const user_type = req.user.usertype;
    let user_id = req.user.id;
    if(user_type === "Teacher" || user_type === "Student"){
        user_id=req.params.id;
    }
    const stickyNote = await stickyNotesModel.stickyNoteCreate({
      user_id: user_id,
      user_type: user_type,
      notes,
      color: color || 'yellow',
      position_x: position_x || 0,
      position_y: position_y || 0
    });

    res.status(201).json(stickyNote);
  } catch (error) {
    console.error('Sticky note creation error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const stickyNoteGetAll = async (req, res) => {
  try {
    const user_type = req.user.usertype;
    let user_id = req.user.id;
    if(user_type === "Teacher" || user_type === "Student"){
        user_id=req.params.id;
    }
    const filters = {
      user_id: user_id, // Users can only see their own notes
      user_type: req.query.user_type,
      is_archived: req.query.is_archived === 'true'
    };

    // Admins can see all notes if requested
    if (req.user.usertype === 'Staff Admin' && req.query.all_notes === 'true') {
      delete filters.user_id;
    }

    const stickyNotes = await stickyNotesModel.stickyNoteFindAll(filters);
    res.json(stickyNotes);
  } catch (error) {
    console.error('Sticky notes fetch error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const stickyNoteGetById = async (req, res) => {
  try {
    const { id,sticky_id } = req.params;
    const stickyNote = await stickyNotesModel.stickyNoteFindById(sticky_id);
    const user_type = req.user.usertype;
    let user_id = req.user.id;
    if(user_type === "Teacher" || user_type === "Student"){
        user_id=id;
    }
    if (!stickyNote) {
      return res.status(404).json({ error: 'Sticky note not found' });
    }

    // Users can only access their own notes unless admin
    if (stickyNote.user_id !== user_id && user_type !== 'Staff Admin') {
      return res.status(403).json({ error: 'Not authorized to access this note' });
    }

    res.json(stickyNote);
  } catch (error) {
    console.error('Sticky note fetch error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const stickyNoteUpdate = async (req, res) => {
  try {
    
    const { id,sticky_id } = req.params;
    const updates = req.body;

    // Check if user owns the note or is admin
    const existingNote = await stickyNotesModel.stickyNoteFindById(sticky_id);
    const user_type = req.user.usertype;
    let user_id = req.user.id;
    if(user_type === "Teacher" || user_type === "Student"){
        user_id=id;
    }
    if (!existingNote) {
      return res.status(404).json({ error: 'Sticky note not found' });
    }

    if (stickyNote.user_id !== user_id && user_type !== 'Staff Admin') {
      return res.status(403).json({ error: 'Not authorized to update this note' });
    }

    const updatedNote = await stickyNotesModel.stickyNoteUpdate(sticky_id, updates);
    res.json(updatedNote);
  } catch (error) {
    console.error('Sticky note update error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const stickyNoteDelete = async (req, res) => {
  try {
    const { id,sticky_id } = req.params;

    // Check if user owns the note or is admin
    const existingNote = await stickyNotesModel.stickyNoteFindById(sticky_id);
    const user_type = req.user.usertype;
    let user_id = req.user.id;
    if(user_type === "Teacher" || user_type === "Student"){
        user_id=id;
    }
    if (!existingNote) {
      return res.status(404).json({ error: 'Sticky note not found' });
    }

    if (stickyNote.user_id !== user_id && user_type !== 'Staff Admin') {
      return res.status(403).json({ error: 'Not authorized to delete this note' });
    }

    const deletedNote = await stickyNotesModel.stickyNoteDelete(sticky_id);
    res.json({ 
      message: 'Sticky note deleted successfully',
      deletedNote 
    });
  } catch (error) {
    console.error('Sticky note deletion error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const stickyNoteArchive = async (req, res) => {
  try {
    const { id,sticky_id } = req.params;

    // Check if user owns the note or is admin
    const existingNote = await stickyNotesModel.stickyNoteFindById(sticky_id);
    const user_type = req.user.usertype;
    let user_id = req.user.id;
    if(user_type === "Teacher" || user_type === "Student"){
        user_id=id;
    }
    if (!existingNote) {
      return res.status(404).json({ error: 'Sticky note not found' });
    }

    if (stickyNote.user_id !== user_id && user_type !== 'Staff Admin') {
      return res.status(403).json({ error: 'Not authorized to archive this note' });
    }

    const archivedNote = await stickyNotesModel.stickyNoteArchive(sticky_id);
    res.json({ 
      message: 'Sticky note archived successfully',
      archivedNote 
    });
  } catch (error) {
    console.error('Sticky note archive error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const stickyNoteUnarchive = async (req, res) => {
  try {
    const { id,sticky_id } = req.params;

    // Check if user owns the note or is admin
    const existingNote = await stickyNotesModel.stickyNoteFindById(sticky_id);
    const user_type = req.user.usertype;
    let user_id = req.user.id;
    if(user_type === "Teacher" || user_type === "Student"){
        user_id=id;
    }
    if (!existingNote) {
      return res.status(404).json({ error: 'Sticky note not found' });
    }

    if (stickyNote.user_id !== user_id && user_type !== 'Staff Admin') {
      return res.status(403).json({ error: 'Not authorized to unarchive this note' });
    }

    const unarchivedNote = await stickyNotesModel.stickyNoteUnarchive(sticky_id);
    res.json({ 
      message: 'Sticky note unarchived successfully',
      unarchivedNote 
    });
  } catch (error) {
    console.error('Sticky note unarchive error:', error);
    res.status(500).json({ error: error.message });
  }
};