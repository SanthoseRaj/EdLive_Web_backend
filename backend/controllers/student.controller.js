import * as student from "../models/student.model.js";

const getCurrentAcademicYear = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  // Academic year starts in June
  if (month >= 6) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
};

export const createStudent=async(req,res)=>{
    try{
        const{studentId,admissionNo ,userId,fullName,classId}=req.body;
        const profileImage = req.file ? `/content/uploads/${userId}/profile-images/${req.file.filename}` : null;
        const newStudent=await student.createStudent(userId,{studentId,classId,admissionNo,fullName,profileImage});
        res.status(201).json(newStudent);
    }catch (error) {
      res.status(400).json({ error: error.message });
    }
}

export const getStudents = async (req, res) => {
    try {
        const { classId } = req.query;
        const result = await student.getAllStudents(classId);
        res.json(result);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: 'Failed to fetch students' });
    }
};

export const updateStudentImage = async (req, res) => {
  try {
    const { id } = req.params;
    const getStudent = await student.CheckStudent(id);
    if (!getStudent) {
      return res.status(404).json({ error: 'Student not found' });
    }
    const currentImagePath = getStudent.profile_img;
    // 2. Delete the existing image file if it exists
      if (currentImagePath) {
        try {
          const fullPath = path.join(process.cwd(), currentImagePath);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        } catch (err) {
          console.error('Error deleting old image:', err);
          // Continue with upload even if deletion fails
        }
    }
    const imagePath = `/content/uploads/student/${id}/profile-images/${req.file.filename}`;
    const updateStudentImage = await student.updateStudentImage(id, { imagePath });
    res.json({ profileImage: updateStudentImage.profile_img });
  }catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Image upload failed' });
  }
}
export const updateStudent = async (req, res) => {
    try {
        const {id} = req.params;
        const updates = req.body;
        
        const updatedInfo = await student.updateStudent(id, updates);
        res.json(updatedInfo);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Update failed'});
    }
}
export const getStudent = async (req, res) => {
    try {
        const { _id } = req.params;
        const studentData = await student.getStudentDetail(_id); // Use the new function
        
        if (!studentData) {
            return res.status(404).json({ error: 'Student not found' });
        }
        
        res.json(studentData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};
export const getStudentBasicInfo = async (req, res) => {
    try {
        const {id} = req.params;
        const basicInfo = await student.getStudentBasicInfo(id);
        
        if (!basicInfo) {
            return res.status(404).json({error: 'Student basic info not found'});
        }
        
        res.json(basicInfo);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Server error'});
    }
};

export const updateStudentBasicInfo = async (req, res) => {
    try {
        const {id} = req.params;
        const updates = req.body;
        
        const updatedInfo = await student.updateStudentBasicInfo(id, updates);
        res.json(updatedInfo);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Update failed'});
    }
};
// Update controllers for each section
export const updateStudentPerformance = async (req, res) => {
    await updateSection('performance', req, res);
};

export const updateStudentHealth= async (req, res) => {
    await updateSection('health', req, res);
};

export const updateStudentSchoolInfo = async (req, res) => {
    await updateSection('school_info', req, res);
};

export const updateStudentParentInfo = async (req, res) => {
    await updateSection('parent_info', req, res);
};

export const updateStudentCasteReligion = async (req, res) => {
    await updateSection('caste_religion', req, res);
};

// Generic section update handler
const updateSection = async (section, req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        let updatedSection;
        switch (section) {
            case 'performance':
                updatedSection = await student.updateStudentPerformance(id, updates);
                break;
            case 'health':
                updatedSection = await student.updateStudentHealth(id, updates);
                break;
            case 'school_info':
                updatedSection = await student.updateStudentSchoolInfo(id, updates);
                break;
            case 'parent_info':
                updatedSection = await student.updateStudentParentInfo(id, updates);
                break;
            case 'caste_religion':
                updatedSection = await student.updateStudentCasteReligion(id, updates);
                break;
            default:
                return res.status(400).json({ error: 'Invalid section' });
        }
        
        res.json(updatedSection);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Update failed' });
    }
};

export const getStudentTimeTable = async (req, res) => {
  try {
      const { id, academicYear  } = req.params;
      const year = academicYear || getCurrentAcademicYear();
      
      const userId = req.user.id;
    // const { id } = await pool.query('SELECT id FROM staff WHERE user_id = $1', [req.user.id]);
    // if (!Number.isInteger(Number(id))) {
    //   return res.status(400).json({ error: 'Entity ID must be an integer' });
    // }
      const result = await student.getStudentTimeTable(id, year);
    res.json(result);
  } catch (error) {
    console.error('Error fetching timetable grid:', error);
    res.status(500).json({ error: 'Failed to fetch timetable data' });
  }
}
export const getChildList = async (req, res) => {
    try{
    const userId = req.user.id;
        const result = await student.getChildList(userId); 
        if (!result || result.length === 0) {
            return res.status(404).json({ 
                error: 'No children found for this user',
                details: `User ID: ${userId}`
            });
        }
        res.json(result);
    } catch (error) {
        console.error('Error Fetching Child List', error);
        res.status(500).json({ error: 'Error Fetching Child List' });
        }
}
export const getChildListById = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserType = req.user.usertype;
    
    // Check if user is authorized (Staff Admin, Class Admin, or the parent themselves)
    if (!['Staff Admin', 'Class Admin'].includes(currentUserType) ) {
      return res.status(403).json({ error: "Not authorized to view this parent's children" });
    }
        const result = await student.getChildList(id); 
        if (!result || result.length === 0) {
            return res.status(404).json({ 
                error: 'No children found for this user',
                details: `User ID: ${userId}`
            });
        }
        res.json(result);
    } catch (error) {
        console.error('Error Fetching Child List', error);
        res.status(500).json({ error: 'Error Fetching Child List' });
        }
}
export const getTeacherList=async(req,res)=>{
    try{
        const { id } = req.params;
        const result=await student.getTeacherList(id);
    if (!result || result.length === 0) {
            return res.status(404).json({ 
                error: 'No Teacher found for this Student',
                details: `Student ID: ${id}`
            });
        }
        res.json(result);
    } catch (error) {
        console.error('Error Fetching Teacher List', error);
        res.status(500).json({ error: 'Error Fetching Teacher List' });
        }
}
export const getStudentsByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const result = await student.getStudentsByClass(classId);
    if (!result || result.length === 0) {
      return res.status(404).json({ error: 'No students found for this class' });
    }
    res.json(result);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};
export const getTeacherSiblingList = async (req, res) => {
  try {
    const userId = req.user.id;           // logged-in user
    const { studentId } = req.params;     // student to exclude

    const result = await student.getTeacherAndSiblingList(
      userId,
      studentId
    );

    if (!result || result.length === 0) {
      return res.status(404).json({
        error: "No Teacher or Sibling found"
      });
    }

    res.json(result);
  } catch (error) {
    console.error("Error fetching teacher/sibling list:", error);
    res.status(500).json({
      error: "Failed to fetch teacher and sibling list"
    });
  }
};
