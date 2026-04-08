import * as syllabusModel from "../models/syllabus.model.js";

export const createSyllabus = async (req, res) => {
  try {
    const { class_id, subject_id, term, academic_year } = req.body;
    const syllabus = await syllabusModel.createSyllabus({
      class_id,
      subject_id,
      term,
      academic_year,
      created_by: req.user.id
    });
    res.status(201).json(syllabus);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const addSyllabusItem = async (req, res) => {
  try {
    const { syllabus_id, title, description, sequence } = req.body;
    const item = await syllabusModel.addSyllabusItem({
      syllabus_id,
      title,
      description,
      sequence
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getSyllabus = async (req, res) => {
  try {
    const { class_id, subject_id, academic_year } = req.params;
    const syllabus = await syllabusModel.getSyllabusByClassSubject(
      class_id,
      subject_id,
      academic_year
    );
    res.json(syllabus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSubjects = async (req, res) => {
  try {
    const { class_id } = req.params;
    const subjects = await syllabusModel.getClassSubjects(class_id);
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, sequence } = req.body;
    const item = await syllabusModel.updateSyllabusItem(id, {
      title,
      description,
      sequence
    });
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await syllabusModel.deleteSyllabusItem(id);
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};