import AdmissionModel from "../models/admission.model.js";

// Mappers to convert DB snake_case to Frontend camelCase

const normalizeStatus = (status) => {
  if (!status) return "New";
  return String(status).toLowerCase() === "not joined" ? "Not Joined" : status;
};

const mapToFrontend = (row) => {
  if (!row) return null;
  return {
    id: row.application_no, // Frontend expects string ID
    applicationNo: row.application_no,
    firstName: row.first_name,
    middleName: row.middle_name,
    lastName: row.last_name,
    name: `${row.first_name} ${row.last_name}`,
    gender: row.gender,
    dob: row.dob, // Format might need adjustment depending on frontend requirement
    classRequired: row.class_required,
    classLevel: row.class_required,
    syllabus: row.syllabus,
    appliedOn: row.applied_date,
    applied: row.applied_date,
    status: normalizeStatus(row.status),
    // Flatten JSONB fields back for the form
    ...row.family_info, // spreads father, mother, guardian
    siblingName: row.family_info?.sibling?.name,
    siblingId: row.family_info?.sibling?.id,
    siblingStudying: row.family_info?.sibling?.studying,
    previousSchool: row.prev_school_info,
    ...row.health_info,
    photos: row.photos,
    docs: row.documents,
    // Basic fields
    email: row.email,
    phone: row.phone_number,
    address: row.address,
    city: row.city,
    nationality: row.nationality,
    religion: row.religion,
    category: row.category,
    rejectionReason: row.rejection_reason
  };
};

export const AdmissionAdd = async (req, res) => {
  try {
    // Validations can go here
    const { applicationNo, firstName } = req.body;
    if (!applicationNo || !firstName) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const newAdmission = await AdmissionModel.create(req.body);
    res.status(201).json(mapToFrontend(newAdmission));
  } catch (error) {
    console.log(`Error in Admission Add Controller: ${error}`);
    if (error.code === '23505') {
        return res.status(409).json({ error: "Application Number already exists" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const AdmissionList = async (req, res) => {
  try {
    const { status } = req.query; // e.g. 'Accepted', 'New_Page', etc.
    const rows = await AdmissionModel.findAll(status);
    const formatted = rows.map(mapToFrontend);
    res.status(200).json(formatted);
  } catch (error) {
    console.log(`Error in Admission List Controller: ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const AdmissionDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const row = await AdmissionModel.findById(id);
    if (!row) {
      return res.status(404).json({ error: "Application Not Found" });
    }
    res.status(200).json(mapToFrontend(row));
  } catch (error) {
    console.log(`Error in Admission Detail Controller: ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const AdmissionUpdateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, otherText } = req.body; // otherText used if status is 'Other'
    
    // Logic to handle 'Other' text if it replaces status, based on frontend logic
    const finalStatus = status === 'Other' ? otherText : status;

    const updated = await AdmissionModel.updateStatus(id, finalStatus);
    if (!updated) {
        return res.status(404).json({ error: "Application Not Found" });
    }
    res.status(200).json(mapToFrontend(updated));
  } catch (error) {
    console.log(`Error in Admission Update Status: ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const AdmissionOverview = async (req, res) => {
    try {
        const stats = await AdmissionModel.getAnalytics();
        res.status(200).json(stats);
    } catch (error) {
        console.log(`Error in Admission Overview: ${error}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
// NEW: Upload Handler
export const UploadFile = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    
    // Return the accessible URL path
    // Assuming you serve 'content' statically from root
    const fileUrl = `/content/admissions/${req.file.filename}`;
    
    res.status(200).json({ 
      success: true, 
      url: fileUrl, 
      fileName: req.file.originalname 
    });
  } catch (error) {
    console.log(`Error in File Upload: ${error}`);
    res.status(500).json({ error: "File upload failed" });
  }
};