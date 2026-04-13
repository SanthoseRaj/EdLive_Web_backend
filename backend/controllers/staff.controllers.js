import * as staffModel from "../models/staff.model.js";

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

export const staffCreate = async (req, res) => {
  try {
    const { gender, phone, position, staffId, userId, fullName, classId } = req.body;
    const profileImage = req.file ? `/content/uploads/${userId}/profile-images/${req.file.filename}` : null;

    const staff = await staffModel.createStaff({
      staffId, position, gender, phone, profileImage, userId, fullName, classId
    });
    
    res.status(201).json(staff);
  } catch (error) {
    console.error('Error in staffCreate Controller:', error);
    
    if (error.code === '23505') {
      res.status(409).json({ error: "Staff ID already exists" });
    } else if (error.code === '23503') {
      res.status(400).json({ error: "Invalid user ID" });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

export const staffList = async (req, res) => {
  try {
    const { _staffid } = req.params;
    let staffData;

    if (_staffid) {
      const staffId = parseInt(_staffid);
      if (isNaN(staffId)) {
        return res.status(400).json({ error: 'Invalid staff ID format' });
      }
      staffData = await staffModel.getStaffById(staffId);
      if (!staffData) {
        return res.status(404).json({ error: 'Staff not found' });
      }
    } else {
      staffData = await staffModel.getAllStaff();
    }

    res.json(staffData);
  } catch (error) {
    console.error(`Error in get Staff List Controller: ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const staffUpdate = async (req, res) => {
  try {
    const { _staffid } = req.params;
    const updates = req.body;

    if (Object.prototype.hasOwnProperty.call(updates, "user_id")) {
      if (updates.user_id === "" || updates.user_id === "null" || updates.user_id === null) {
        updates.user_id = null;
      } else {
        updates.user_id = Number(updates.user_id);
      }
    }
    
    if (req.file) {
      updates.profileImage = req.file.path;
    }

    const staff = await staffModel.updateStaff(_staffid, updates);
    if (!staff) return res.status(404).send({ error: 'Staff not found' });
    
    res.send(staff);
  } catch (error) {
    console.error(`Error in get Staff Update Controller: ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const staffDelete = async (req, res) => {
  try {
    const { _staffid } = req.params;
    const staff = await staffModel.deleteStaff(_staffid);
    
    if (!staff) return res.status(404).send({ error: 'Staff not found' });
    res.send({ message: 'Staff deleted successfully' });
  } catch (error) {
    console.error(`Error in get Staff Delete Controller: ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getStaffBasicInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await staffModel.getBasicInfo(id);
    
    if (!staff) {
      return res.status(404).json({ error: 'Staff not found' });
    }
    
    res.json(staff);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateStaffBasicInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const staff = await staffModel.updateBasicInfo(id, updates);
    
    res.json(staff);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateStaffImage = async (req, res) => {
  try {
    const { id } = req.params;
    const imagePath = `/content/uploads/${id}/profile-images/${req.file.filename}`;
    
    const staff = await staffModel.updateStaffImage(id, imagePath);
    res.json({ profileImage: staff.profile_image });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Image upload failed' });
  }
};

export const getPersonalInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const personalInfo = await staffModel.getPersonalInfo(id);
    res.json(personalInfo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updatePersonalInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const personalInfo = await staffModel.updatePersonalInfo(id, updates);
    
    res.json(personalInfo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Update failed' });
  }
};

export const getServiceInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const serviceInfo = await staffModel.getServiceInfo(id);
    res.json(serviceInfo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateServiceInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const serviceInfo = await staffModel.updateServiceInfo(id, updates);
    
    res.json(serviceInfo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Update failed' });
  }
};

export const updateServiceDocs = async (req, res) => {
  try {
    const { id } = req.params;
    const docsPath = `/content/uploads/${id}/documents/pf/${req.file.filename}`;
    
    const serviceInfo = await staffModel.updateServiceDocs(id, docsPath);
    res.json(serviceInfo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'PF Document upload failed' });
  }
};

export const getEducation = async (req, res) => {
  try {
    const { id } = req.params;
    const education = await staffModel.getEducation(id);
    res.json(education);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateEducation = async (req, res) => {
  try {
    const { id, eduId } = req.params;
    
    const certificate = req.file ? `/content/uploads/${id}/certificates/${req.file.filename}` : '';
    const {degree, university, year} = req.body;
    const education = await staffModel.updateEducation(id, eduId, {degree, university, year, certificate});
    
    res.json(education);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Update failed' });
  }
};

export const addEducation = async (req, res) => {
  try {
    const { id } = req.params;
    const { degree, university, year } = req.body;
    const certificate = req.file ? `/content/uploads/${id}/certificates/${req.file.filename}` : '';
    
    const education = await staffModel.addEducation(id, { degree, university, year, certificate });
    res.status(201).json(education);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add education' });
  }
};

export const deleteEducation = async (req, res) => {
  try {
    const { id, eduId } = req.params;
    await staffModel.deleteEducation(id, eduId);
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete education' });
  }
};

export const getFamily = async (req, res) => {
  try {
    const { id } = req.params;
    const family = await staffModel.getFamily(id);
    res.json(family);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch family members' });
  }
};

export const addFamilyMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, relation, contact } = req.body;
    const familyMember = await staffModel.addFamilyMember(id, { name, relation, contact });
    
    res.status(201).json(familyMember);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add family member' });
  }
};

export const updateFamilyMember = async (req, res) => {
  try {
    const { id, familyId } = req.params;
    const updates = req.body;
    const familyMember = await staffModel.updateFamilyMember(id, familyId, updates);
    
    res.json(familyMember);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update family member' });
  }
};

export const deleteFamilyMember = async (req, res) => {
  try {
    const { id, familyId } = req.params;
    await staffModel.deleteFamilyMember(id, familyId);
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete family member' });
  }
};

export const getClassResponsibilities = async (req, res) => {
  try {
    const { id } = req.params;
    const responsibilities = await staffModel.getClassResponsibilities(id);
    res.json(responsibilities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch class responsibilities' });
  }
};

export const updateClassResponsibilities = async (req, res) => {
  try {
    const { id, classId } = req.params;
    const updates = req.body;
    const responsibility = await staffModel.updateClassResponsibilities(id, classId, updates);
    
    res.json(responsibility);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update class responsibility' });
  }
};

export const getDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const documents = await staffModel.getDocuments(id);
    res.json(documents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
};

export const uploadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { document_type } = req.body;
    const document_path = `/content/uploads/${id}/certificates/${req.file.filename}`;
    
    const document = await staffModel.uploadDocument(id, { document_type, document_path });
    res.status(201).json(document);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Document upload failed' });
  }
};

export const deleteDocumnet = async (req, res) => {
  try {
    const { id, doc_id } = req.params;
    await staffModel.deleteDocument(id, doc_id);
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add documents' });
  }
}
export const updateDocument = async (req, res) => {
  try {
    const { id,doc_id } = req.params;
    const { document_type } = req.body;
    const document_path = `/content/uploads/${id}/certificates/${req.file.filename}`;
    const documents = await staffModel.updateDocumnet(id, doc_id, { document_type, document_path });
    res.json(documents);
  }catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Update failed' });
  }
}

export const getTimeTable = async (req, res) => {
  try {
    const { id, academicYear } = req.params;
    const year = academicYear || getCurrentAcademicYear();
    const timetable = await staffModel.getTimeTable(id, year);
    res.json(timetable);
  } catch (error) {
    console.error('Error fetching timetable grid:', error);
    res.status(500).json({ error: 'Failed to fetch timetable data' });
  }
};

export const getTeacherTimeTable = async (req, res) => {
  try {
    const { academicYear } = req.params;
    const year = academicYear || getCurrentAcademicYear();
    const timetable = await staffModel.getTeacherTimeTable(req.user.id, year);
    res.json(timetable);
  } catch (error) {
    console.error('Error fetching timetable grid:', error);
    res.status(500).json({ error: 'Failed to fetch timetable data' });
  }
};

export const getClassTimeTable = async (req, res) => {
  try {
    const { classIds, academicYear } = req.query;
    const year = academicYear || getCurrentAcademicYear();
    const class_ids = classIds.split(",").map(id => parseInt(id.trim()));
    const timetable = await staffModel.getClassTimeTable(class_ids, year);
    res.json(timetable);
    } catch (error) {
    console.error('Error fetching timetable grid:', error);
    res.status(500).json({ error: 'Failed to fetch timetable data' });
  }
}

export const updateTimeTable = async (req, res) => {
  try {
    const { id, classid } = req.params;
    const updates = req.body;
    const timetable = await staffModel.updateTimeTable(id, classid, updates);
    
    res.json({
      success: true,
      data: timetable
    });
  } catch (error) {
    console.error('Update error:', error);
    
    if (error.code === '23505') {
      res.status(409).json({ error: 'Class already has a scheduled period at this time' });
    } else if (error.code === '23503') {
      res.status(400).json({ error: 'Invalid reference data' });
    } else if (error.code === '23514') {
      res.status(400).json({ error: 'Invalid timetable data' });
    } else {
      res.status(500).json({ error: 'Timetable update failed' });
    }
  }
};

export const addTimeTable = async (req, res) => {
  try {
    const { id } = req.params;
    //const updates = req.body;
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([key, value]) =>
        value !== "" &&
        value !== null &&
        value !== undefined &&
        !(Array.isArray(value) && value.length === 0)
      )
    );
    const timetable = await staffModel.addTimeTable(id, updates);
    
    res.status(201).json({
      success: true,
      message: 'New timetable created',
      data: timetable
    });
  } catch (error) {
    console.error('Insert error:', error);
    
    if (error.code === '23505') {
      res.status(409).json({ error: 'Timetable conflict - duplicate entry' });
    } else if (error.code === '23503') {
      res.status(400).json({ error: 'Invalid reference data' });
    } else if (error.code === '23514') {
      res.status(400).json({ error: 'Invalid timetable data' });
    } else {
      res.status(500).json({ error: 'Timetable creation failed' });
    }
  }
};

export const deleteTimeTable = async (req, res) => {
  try {
    const { id, classid } = req.params;
    await staffModel.deleteTimeTable(id, classid);
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'TimeTable Delete failed' });
  }
};

export const addExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const { organization, from_date, to_date, designation } = req.body;
    const document = req.file ? `/content/uploads/${id}/documents/experience/${req.file.filename}` : '';
    
    const experience = await staffModel.addExperience(id, {
      organization, from_date, to_date, designation, document
    });
    
    res.status(201).json(experience);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add experience' });
  }
};

export const deleteExperience = async (req, res) => {
  try {
    const { id, exp_id } = req.params;
    const experience = await staffModel.deleteExperience(id, exp_id);
    res.json(experience);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Experience delete failed' });
  }
};

export const updateExperienceDocument = async (req, res) => {
  try {
    const { id, exp_id } = req.params;
    const document_path = `/content/uploads/${id}/documents/experience/${req.file.filename}`;
    
    const experience = await staffModel.updateExperienceDocument(exp_id, document_path);
    res.json(experience);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Experience Document upload failed' });
  }
};

export const updateExperience = async (req, res) => {
  try {
    const { id, exp_id } = req.params;
    const updates = req.body;
    const experience = await staffModel.updateExperience(id, exp_id, updates);
    
    res.json(experience);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Update failed' });
  }
};

export const getstudents = async (req, res) => {
  try {
    const { id, usertype } = req.user;
    const students = await staffModel.getStudents(id, usertype);
    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Student Listing failed' });
  }
};

export const getClassAssigned = async (req, res) => {
  try {
    const { id } = req.user;
    const classes = await staffModel.getClassAssigned(id);
    res.json(classes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch class responsibilities' });
  }
};

// Add to staff.controllers.js
export const batchUpdateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Update basic info
    const basicUpdates = {};
    if (updates.staff_id_no !== undefined) basicUpdates.staff_id_no = updates.staff_id_no;
    if (updates.gender !== undefined) basicUpdates.gender = updates.gender;
    if (updates.phone !== undefined) basicUpdates.phone = updates.phone;
    if (updates.current_address !== undefined) basicUpdates.current_address = updates.current_address;
    if (updates.permanent_address !== undefined) basicUpdates.permanent_address = updates.permanent_address;
    if (updates.full_name !== undefined) basicUpdates.full_name = updates.full_name;
    if (updates.alt_phone !== undefined) basicUpdates.alt_phone = updates.alt_phone;
    if (updates.degree !== undefined) basicUpdates.degree = updates.degree;
    
    if (Object.keys(basicUpdates).length > 0) {
      await staffModel.updateBasicInfo(id, basicUpdates);
    }

    // Update personal info
    const personalUpdates = {};
    if (updates.dob !== undefined) personalUpdates.dob = updates.dob;
    if (updates.age !== undefined) personalUpdates.age = updates.age;
    if (updates.blood_group !== undefined) personalUpdates.blood_group = updates.blood_group;
    if (updates.bankaccno !== undefined) personalUpdates.bankaccno = updates.bankaccno;
    if (updates.panno !== undefined) personalUpdates.panno = updates.panno;
    if (updates.aadhaar !== undefined) personalUpdates.aadhaar = updates.aadhaar;
    
    if (Object.keys(personalUpdates).length > 0) {
      await staffModel.updatePersonalInfo(id, personalUpdates);
    }

    // Handle service info updates (nested object format)
    await handleNestedServiceUpdates(id, updates);

    // Handle education updates with delete functionality
    await handleObjectArrayUpdates(id, updates, 'education', async (staffId, items) => {
      const existingEducation = await staffModel.getEducation(staffId);
      console.log('Existing:'+existingEducation)
      const existingMap = new Map();
      
      // Map existing education by ID
      existingEducation.forEach(edu => {
        if (edu.id) existingMap.set(edu.id.toString(), edu);
      });

      // Process updated items
      for (const item of items) {
        if (item.id && item.id.startsWith('temp-')) {
          // New education record
          await staffModel.addEducation(staffId, {
            degree: item.degree,
            university: item.university,
            year: item.year,
            certificate: item.certificate || item.edu_docs
          });
        } else if (item.id && existingMap.has(item.id.toString())) {
          // Update existing education record
          await staffModel.updateEducation(staffId, item.id, {
            degree: item.degree,
            university: item.university,
            year: item.year,
            certificate: item.certificate || item.edu_docs
          });
          existingMap.delete(item.id.toString());
        } else if (!item.id) {
          // New education record without ID
          await staffModel.addEducation(staffId, {
            degree: item.degree,
            university: item.university,
            year: item.year,
            certificate: item.certificate || item.edu_docs
          });
        }
      }

      // // Delete remaining records that weren't in the updated array
      // for (const [id] of existingMap) {
      //   console.log('Existing:'+existingMap +':' + id)
      //   await staffModel.deleteEducation(staffId, id);
      // }
    });

    // Handle experience updates with delete functionality
    await handleObjectArrayUpdates(id, updates, 'experience', async (staffId, items) => {
      const existingExperience = await staffModel.getExperienceByStaffId(staffId);
      const existingMap = new Map();
      
      existingExperience.forEach(exp => {
        if (exp.id) existingMap.set(exp.id.toString(), exp);
      });

      // Process updated items
      for (const item of items) {
        if (item.id && item.id.startsWith('temp-')) {
          // New experience record
          await staffModel.addExperience(staffId, {
            organization: item.organization,
            designation: item.designation,
            from_date: item.from_date,
            to_date: item.to_date,
            exp_docs: item.exp_docs
          });
        } else if (item.id && existingMap.has(item.id.toString())) {
          // Update existing experience record
          await staffModel.updateExperience(staffId, item.id, {
            organization: item.organization,
            designation: item.designation,
            from_date: item.from_date,
            to_date: item.to_date,
            exp_docs: item.exp_docs
          });
          existingMap.delete(item.id.toString());
        } else if (!item.id) {
          // New experience record without ID
          await staffModel.addExperience(staffId, {
            organization: item.organization,
            designation: item.designation,
            from_date: item.from_date,
            to_date: item.to_date,
            exp_docs: item.exp_docs
          });
        }
      }

      // // Delete remaining records that weren't in the updated array
      // for (const [id] of existingMap) {
      //   await staffModel.deleteExperience(staffId, id);
      // }
    });

    // Handle family updates with delete functionality
    await handleObjectArrayUpdates(id, updates, 'family', async (staffId, items) => {
      const existingFamily = await staffModel.getFamily(staffId);
      const existingMap = new Map();
      
      existingFamily.forEach(member => {
        if (member.id) existingMap.set(member.id.toString(), member);
      });

      // Process updated items
      for (const item of items) {
        if (item.id && item.id.startsWith('temp-')) {
          // New family member
          await staffModel.addFamilyMember(staffId, {
            name: item.name,
            relationship: item.relationship,
            phone: item.phone,
            occupation: item.occupation
          });
        } else if (item.id && existingMap.has(item.id.toString())) {
          // Update existing family member
          await staffModel.updateFamilyMember(staffId, item.id, {
            name: item.name,
            relationship: item.relationship,
            phone: item.phone,
            occupation: item.occupation
          });
          existingMap.delete(item.id.toString());
        } else if (!item.id) {
          // New family member without ID
          await staffModel.addFamilyMember(staffId, {
            name: item.name,
            relationship: item.relationship,
            phone: item.phone,
            occupation: item.occupation
          });
        }
      }

      // // Delete remaining records that weren't in the updated array
      // for (const [id] of existingMap) {
      //   await staffModel.deleteFamilyMember(staffId, id);
      // }
    });

    // Handle class responsibilities updates with delete functionality
    await handleObjectArrayUpdates(id, updates, 'classResponsibilities', async (staffId, items) => {
      const existingResponsibilities = await staffModel.getTimeTable(staffId,"2023-2024");
      const existingMap = new Map();
      
      existingResponsibilities.forEach(resp => {
        if (resp.id) existingMap.set(resp.id.toString(), resp);
      });

      // Process updated items
      for (const item of items) {
        if (item.id && item.id.startsWith('temp-')) {
          // New class responsibility
          await staffModel.addTimeTable(staffId, {
            class_id: item.class_id,
            subject_id: item.subject_id,
            monday: item.monday,
            tuesday: item.tuesday,
            wednesday: item.wednesday,
            thursday: item.thursday,
            friday: item.friday,
            saturday: item.saturday
          });
        } else if (item.id && existingMap.has(item.id.toString())) {
          // Update existing class responsibility
          await staffModel.updateTimeTable(staffId, item.id, {
            class_id: item.class_id,
            subject_id: item.subject_id,
            monday: item.monday,
            tuesday: item.tuesday,
            wednesday: item.wednesday,
            thursday: item.thursday,
            friday: item.friday,
            saturday: item.saturday
          });
          existingMap.delete(item.id.toString());
        } else if (!item.id) {
          // New class responsibility without ID
          await staffModel.addTimeTable(staffId, {
            class_id: item.class_id,
            subject_id: item.subject_id,
            monday: item.monday,
            tuesday: item.tuesday,
            wednesday: item.wednesday,
            thursday: item.thursday,
            friday: item.friday,
            saturday: item.saturday
          });
        }
      }

      // // Delete remaining records that weren't in the updated array
      // for (const [id] of existingMap) {
      //   await staffModel.deleteClassResponsibility(staffId, id);
      // }
    });

    // Fetch updated staff data
    const updatedStaff = await staffModel.getStaffById(id);
    res.json(updatedStaff);
  } catch (error) {
    res.status(500).json({ error: 'Batch update failed', details: error.message });
  }
};

// Helper function to handle object with array indices format (like education[1], experience[1])
const handleObjectArrayUpdates = async (staffId, updates, arrayName, updateCallback) => {
  const deletionKey = `${arrayName}[0].deleted`;
  
  if (updates[deletionKey] && Array.isArray(updates[deletionKey])) {
    // Handle deletions first
    for (const deletedItem of updates[deletionKey]) {
      if (deletedItem.id && deletedItem.__deleted) {
        console.log(`Deleting ${arrayName} with id:`, deletedItem.id);
        // Use the appropriate delete method based on arrayName
        switch (arrayName) {
          case 'education':
            await staffModel.deleteEducation(staffId, deletedItem.id);
            break;
          case 'experience':
            await staffModel.deleteExperience(staffId, deletedItem.id);
            break;
          case 'family':
            await staffModel.deleteFamilyMember(staffId, deletedItem.id);
            break;
          case 'classResponsibilities':
            await staffModel.deleteTimeTable(staffId, deletedItem.id);
            break;
        }
      }
    }
  }
  const arrayItems = [];
  
  // Extract all items with pattern like education[0], education[1], etc.
  const pattern = new RegExp(`^${arrayName}\\[(\\d+)\\]$`);
  
  for (const key in updates) {
    const match = key.match(pattern);
    if (match && typeof updates[key] === 'object') {
      const index = parseInt(match[1]);
      const item = updates[key];
      arrayItems.push({ index, item });
    }
  }
  
  // Sort by index to maintain order and extract just the items
  arrayItems.sort((a, b) => a.index - b.index);
  const items = arrayItems.map(({ item }) => item);
  
  // Only process if there are items
  if (items.length > 0) {
    await updateCallback(staffId, items);
  }
};

// Helper function to handle nested service updates
const handleNestedServiceUpdates = async (staffId, updates) => {
  const serviceUpdates = {};
  
  // Check for service.0.field pattern
  for (const key in updates) {
    if (key.startsWith('service.0.')) {
      const field = key.replace('service.0.', '');
      serviceUpdates[field] = updates[key];
    }
  }
  
  // Also check direct service object
  if (updates.service && typeof updates.service === 'object') {
    if (updates.service[0]) {
      Object.assign(serviceUpdates, updates.service[0]);
    }
  }
  
  if (Object.keys(serviceUpdates).length > 0) {
    await staffModel.updateServiceInfo(staffId, serviceUpdates);
  }
};

export const getStaffTimetableById = async (req, res) => {
  try {
    const { _staffid } = req.params;
    let StaffTimetable;

    if (_staffid) {
      const staffId = parseInt(_staffid);
      if (isNaN(staffId)) {
        return res.status(400).json({ error: 'Invalid staff ID format' });
      }
      StaffTimetable = await staffModel.getStaffTimetableById(staffId);
      if (!StaffTimetable) {
        return res.status(404).json({ error: 'Staff not found' });
      }
    } 

    res.json(StaffTimetable);
  } catch (error) {
    console.error(`Error in get Staff TimeTable Controller: ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const saveOrUpdateStaffTimeTable = async (req, res) => {
  try {
    const {
      timetable_id,
      staff_id,
      class_id,
      subject_id,
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
      saturday,
      academic_year,
      isDelete
    } = req.body;

    // 🔴 DELETE
    if (isDelete && timetable_id) {
      const deleted = await staffModel.deleteStaffTimeTable(timetable_id);
      return res.json({ message: "Deleted successfully", deleted });
    }

    const updates = {
      class_id,
      subject_id,
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
      saturday,
      academic_year
    };

    // 🟢 INSERT (timetable_id === "temp")
    if (!timetable_id || timetable_id === "temp") {
      const created = await staffModel.addStaffTimeTable(staff_id, updates);
      return res.status(201).json(created);
    }

    // 🔵 UPDATE
    const updated = await staffModel.updateStaffTimeTable(
      timetable_id,
      updates
    );

    res.json(updated);

  } catch (error) {
    console.error("Timetable save error:", error);
    res.status(500).json({ error: "Failed to process timetable" });
  }
};
