import * as specialCareModel from "../models/specialCare.model.js";

// Category Controller Functions
export const specialCareCategoryCreate = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ 
        error: "Category name is required" 
      });
    }

    // Check if user has admin privileges
    if (req.user.usertype !== 'Staff Admin') {
      return res.status(403).json({ error: "Only admins can create categories" });
    }

    const category = await specialCareModel.specialCareCategoryCreate({
      name,
      description
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Special Care Category creation error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const specialCareCategoryFindAll = async (req, res) => {
  try {
    const categories = await specialCareModel.specialCareCategoryFindAll();
    res.json(categories);
  } catch (error) {
    console.error('Special Care Category fetch error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const specialCareCategoryFindById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await specialCareModel.specialCareCategoryFindById(id);
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    console.error('Special Care Category fetch error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const specialCareCategoryUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Check if user has admin privileges
    if (req.user.usertype !== 'Staff Admin') {
      return res.status(403).json({ error: "Only admins can update categories" });
    }

    if (!name) {
      return res.status(400).json({ 
        error: "Category name is required" 
      });
    }

    const category = await specialCareModel.specialCareCategoryUpdate(id, {
      name,
      description
    });
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Special Care Category update error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const specialCareCategoryDelete = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user has admin privileges
    if (req.user.usertype !== 'Staff Admin') {
      return res.status(403).json({ error: "Only admins can delete categories" });
    }

    const category = await specialCareModel.specialCareCategoryDelete(id);
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json({ 
      message: 'Category deleted successfully',
      deletedCategory: category 
    });
  } catch (error) {
    console.error('Special Care Category deletion error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const specialCareCreate = async (req, res) => {
  try {
    const {
      studentIds, // Changed from studentId to studentIds (array)
      categoryId,
      title,
      description,
      careType,
      scheduleDetails,
      resources,
      assignedTo,
      status,
      startDate,
      endDate,
      visibility
    } = req.body;

    // Validate required fields
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0 || 
        !categoryId || !title || !careType) {
      return res.status(400).json({ 
        error: "Missing required fields: studentIds (array), categoryId, title, careType" 
      });
    }

    const specialCare = await specialCareModel.specialCareCreate({
      studentIds, // Now passing array of student IDs
      categoryId,
      title,
      description,
      careType,
      scheduleDetails,
      resources,
      assignedTo,
      status,
      startDate,
      endDate,
      visibility,
      createdBy: req.user.id
    });

    res.status(201).json(specialCare);
  } catch (error) {
    console.error('Special Care creation error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const specialCareFindVisible = async (req, res) => {
  try {
    const user_type = req.user.usertype;
    const { classId } = req.query;
    const userId = req.user.id;

    // For teachers, classId is required
    if (user_type === "Teacher" && !classId) {
      return res.status(400).json({ 
        error: "Class ID is required for teachers" 
      });
    }

    const specialCareItems = await specialCareModel.specialCareFindVisible(
      userId,
      user_type,
      classId
    );

    res.json(specialCareItems);
  } catch (error) {
    console.error('Special Care fetch error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const specialCareUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.id;
    delete updates.created_by;
    delete updates.created_at;

    const specialCare = await specialCareModel.specialCareUpdate(id, updates);
    
    if (!specialCare) {
      return res.status(404).json({ error: 'Special Care item not found' });
    }

    res.json(specialCare);
  } catch (error) {
    console.error('Special Care update error:', error);
    res.status(500).json({ error: error.message });
  }
}

export const specialCareDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const specialCare = await specialCareModel.specialCareDelete(id);
    
    if (!specialCare) {
      return res.status(404).json({ error: 'Special Care item not found' });
    }
    
    res.json({ 
      message: 'Special Care item deleted successfully',
      deletedItem: specialCare 
    });
  } catch (error) {
    console.error('Special Care deletion error:', error);
    res.status(500).json({ error: error.message });
  }
}

export const specialCareAddProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, progressPercentage, resourcesAdded } = req.body;

    if (!notes) {
      return res.status(400).json({ 
        error: "Notes are required" 
      });
    }

    const progress = await specialCareModel.specialCareAddProgress(
      id, 
      notes, 
      progressPercentage, 
      resourcesAdded, 
      req.user.id
    );

    res.status(201).json(progress);
  } catch (error) {
    console.error('Special Care progress addition error:', error);
    res.status(500).json({ error: error.message });
  }
}

export const specialCareGetProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const progress = await specialCareModel.specialCareGetProgress(id);

    res.json(progress);
  } catch (error) {
    console.error('Special Care progress fetch error:', error);
    res.status(500).json({ error: error.message });
  }
}