import pool from "../db/connectDB-pg.js";
import  * as  masterModel from "../models/master.model.js";


  export const getPeriods=async(req,res)=>{
    try {
      const result = await pool.executeQuery(`SELECT periodid,to_char(timein, 'HH12:MI AM')::text timein,to_char(timeout, 'HH12:MI AM')::text timeout,periodname, EXTRACT(EPOCH FROM (timeout - timein)) / 60 AS duration_minutes FROM periodmaster`);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching periods:', error);
      res.status(500).json({ error: 'Failed to fetch periods' });
    }
}
  export const getClasses=async(req,res)=>{
    try {
      const result = await pool.executeQuery(`SELECT id class_id,class ||' '||section class_name,id,class,section FROM classmaster`);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching Classes:', error);
      res.status(500).json({ error: 'Failed to fetch Classes' });
    }
}
  export const getsubjects=async(req,res)=>{
    try {
      const result = await pool.executeQuery(`SELECT subject_id,subject_code || ' '||subject_name subject_name,subject_name subject_code  from subjects`);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching Subjects:', error);
      res.status(500).json({ error: 'Failed to fetch Subjects' });
    }
}
  
export const getAllStaff = async (req, res) => {
    try {
      const staff = await masterModel.getAllStaff();
      res.status(200).json(staff);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};
  export const getAllStudents = async (req, res) => {
    try {
      const students = await masterModel.getAllStudents();
      res.status(200).json(students);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  // Class Master 

  export const getAllClasses = async (req, res) => {
    try {
      const classes = await masterModel.getAllClasses();
      res.status(200).json(classes);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  export const getClassById = async (req, res) => {
    try {
      const classItem = await masterModel.getClassById(req.params.id);
      if (!classItem) {
        return res.status(404).json({ message: 'Class not found' });
      }
      res.status(200).json(classItem);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  export const createClass = async (req, res) => {
    try {
      const newClass = await masterModel.createClass(req.body);
      res.status(201).json(newClass);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
  export const updateClass = async (req, res) => {
    try {
      const updatedClass = await masterModel.updateClass(req.params.id, req.body);
      if (!updatedClass) {
        return res.status(404).json({ message: 'Class not found' });
      }
      res.status(200).json(updatedClass);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
  export const deleteClass = async (req, res) => {
    try {
      const deletedClass = await masterModel.deleteClass(req.params.id);
      if (!deletedClass) {
        return res.status(404).json({ message: 'Class not found' });
      }
      res.status(200).json({ message: 'Class deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  //Subjects Master

  
  export const getAllSubjects = async (req, res) => {
    try {
      const subjects = await masterModel.getAllSubjects();
      res.status(200).json(subjects);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  export const getSubjectsById = async (req, res) => {
    try {
      const subjectsItem = await masterModel.getSubjectById(req.params.id);
      if (!subjectsItem) {
        return res.status(404).json({ message: 'Subjects not found' });
      }
      res.status(200).json(subjectsItem);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  export const createSubjects = async (req, res) => {
    try {
      const newSubjects = await masterModel.createSubject(req.body);
      res.status(201).json(newSubjects);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
  export const updateSubjects = async (req, res) => {
    try {
      const updatedSubjects = await masterModel.updateSubject(req.params.id, req.body);
      if (!updatedSubjects) {
        return res.status(404).json({ message: 'Subjects not found' });
      }
      res.status(200).json(updatedSubjects);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
  export const deleteSubjects = async (req, res) => {
    try {
      const deletedSubjects = await masterModel.deleteSubject(req.params.id);
      if (!deletedSubjects) {
        return res.status(404).json({ message: 'Subjects not found' });
      }
      res.status(200).json({ message: 'Subjects deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };


  //Periods Master

  export const getAllPeriods = async (req, res) => {
    try {
      const periods = await masterModel.getAllPeriods();
      res.status(200).json(subjects);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  export const getPeriodsById = async (req, res) => {
    try {
      const periodsItem = await masterModel.getPeriodById(req.params.id);
      if (!periodsItem) {
        return res.status(404).json({ message: 'Periods not found' });
      }
      res.status(200).json(periodsItem);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  export const createPeriods = async (req, res) => {
    try {
      const newPeriods = await masterModel.createPeriod(req.body);
      res.status(201).json(newPeriods);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
  export const updatePeriods = async (req, res) => {
    try {
      const updatedPeriods = await masterModel.updatePeriod(req.params.id, req.body);
      if (!updatedPeriods) {
        return res.status(404).json({ message: 'Periods not found' });
      }
      res.status(200).json(updatedPeriods);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
  export const deletePeriods = async (req, res) => {
    try {
      const deletedPeriods = await masterModel.deletePeriod(req.params.id);
      if (!deletedPeriods) {
        return res.status(404).json({ message: 'Periods not found' });
      }
      res.status(200).json({ message: 'Periods deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};
  
export const getSubjectTeacherAllocations = async (req, res) => {
  try {
    const { subject_id } = req.query; // Get filter from URL query params
    
    if (!subject_id) {
      return res.status(400).json({ message: "subject_id is required" });
    }

    const allocations = await masterModel.getSubjectTeacherAllocations(subject_id);
    res.status(200).json(allocations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};