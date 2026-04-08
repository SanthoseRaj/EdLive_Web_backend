import * as resourcesModel from "../models/resources.model.js";
import * as staffModel from "../models/staff.model.js"

export const resourceCreate = async (req, res) => {
  try {
    const {
      title,
      description,
      webLinks,
      classId,
      subjectId
    } = req.body;

    // Validate required fields
    if (!title || !classId) {
      return res.status(400).json({ 
        error: "Missing required fields: title, classId" 
      });
    }

    const resource = await resourcesModel.resourceCreate({
      title,
      description,
      webLinks: Array.isArray(webLinks) ? webLinks : [webLinks].filter(Boolean),
      classId,
      subjectId: subjectId || null,
      createdBy: req.user.id
    });

    res.status(201).json(resource);
  } catch (error) {
    console.error('Resource creation error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const resourceGetAll = async (req, res) => {
  try {
    const filters = {
      classId: req.query.classId,
      subjectId: req.query.subjectId,
      createdBy: req.user.usertype === 'teacher' ? req.user.id : undefined
    };

    const resources = await resourcesModel.resourceFindAll(filters);
    res.json(resources);
  } catch (error) {
    console.error('Resources fetch error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const resourceGetById = async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await resourcesModel.resourceFindById(id);

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    res.json(resource);
  } catch (error) {
    console.error('Resource fetch error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const resourceUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if user owns the resource or is admin
    const existingResource = await resourcesModel.resourceFindById(id);
    if (!existingResource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    if (existingResource.created_by !== req.user.id && req.user.usertype !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this resource' });
    }

    const updatedResource = await resourcesModel.resourceUpdate(id, updates);
    res.json(updatedResource);
  } catch (error) {
    console.error('Resource update error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const resourceDelete = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user owns the resource or is admin
    const existingResource = await resourcesModel.resourceFindById(id);
    if (!existingResource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    if (existingResource.created_by !== req.user.id && req.user.usertype !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this resource' });
    }

    const deletedResource = await resourcesModel.resourceDelete(id);
    res.json({ 
      message: 'Resource deleted successfully',
      deletedResource 
    });
  } catch (error) {
    console.error('Resource deletion error:', error);
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

export const getSubjects = async (req, res) => {
  try {
    const { classId } = req.query;
    const subjects = await resourcesModel.getSubjects(classId);
    res.json(subjects);
  } catch (error) {
    console.error('Subjects fetch error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getTeacherSubjects = async (req, res) => {
  try {
    if (req.user.usertype !== 'Teacher') {
      return res.status(403).json({ error: 'Only teachers can access subjects' });
    }

    const subjects = await resourcesModel.getSubjectsByTeacher(req.user.id);
    res.json(subjects);
  } catch (error) {
    console.error('Teacher subjects fetch error:', error);
    res.status(500).json({ error: error.message });
  }
};