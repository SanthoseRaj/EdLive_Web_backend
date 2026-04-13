import pool from "../db/connectDB-pg.js";
import fs from 'fs';
import path from 'path';

// Staff CRUD Operations
const createStaff = async ({ staffId, position, gender, phone, profileImage, userId, fullName, classId }) => {
  const query = `
    INSERT INTO staff 
      (staff_id, position, gender, phone, profile_image, user_id, full_name, class_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
  `;
  
  const { rows } = await pool.query(query, [staffId, position, gender, phone, profileImage, userId, fullName, classId]);
  return rows[0];
};

const getStaffById = async (staffId) => {
  const query = `
    SELECT 
      s.*, s.staff_id as staff_id_no,
      u.username, u.email, u.usertype,
      pi.*, si.*,
      edu.id as edu_id, edu.degree, edu.university, edu.year, edu.certificate,
      fam.id as fam_id, fam.name as family_name, fam.relation, fam.contact as family_contact, cr.timetable_id,
      cr.class_id as class_id, cr.subject_id subject, cr.monday, cr.tuesday, cr.wednesday, cr.thursday, cr.friday, cr.saturday,
      exs.id exp_id, exs.organization, exs.designation, exs.from_date exp_from_date, exs.to_date exp_to_date, exs.document_path exp_doc_path, 
      doc.id as doc_id, doc.document_path,doc.document_type, current_address, permanent_address, addresses_same
    FROM staff s
    LEFT JOIN users u ON s.user_id = u.id
    LEFT JOIN staff_personal_info pi ON s.id = pi.staff_id
    LEFT JOIN staff_service_info si ON s.id = si.staff_id
    LEFT JOIN staff_education edu ON s.id = edu.staff_id
    LEFT JOIN staff_family fam ON s.id = fam.staff_id
    LEFT JOIN timetable cr ON s.id = cr.staff_id
    LEFT JOIN staff_documents doc ON s.id = doc.staff_id
    LEFT JOIN staff_experiences exs ON exs.staff_id = s.id
    WHERE s.id = $1
  `;
  
  const { rows } = await pool.query(query, [staffId]);
  
  if (rows.length === 0) return null;
  
  return formatStaffData(rows)[0];
};

const getAllStaff = async () => {
  const query = `
    SELECT 
      s.*, s.staff_id as staff_id_no,
      u.username, u.email, u.usertype,
      pi.*, si.*,
      edu.id as edu_id, edu.degree, edu.university, edu.year, edu.certificate,
      fam.id as fam_id, fam.name as family_name, fam.relation, fam.contact as family_contact,
      cr.id as class_id, cr.class_name, cr.subject,
      doc.id as doc_id, doc.document_path,doc.document_type
    FROM staff s
    LEFT JOIN users u ON s.user_id = u.id
    LEFT JOIN staff_personal_info pi ON s.id = pi.staff_id
    LEFT JOIN staff_service_info si ON s.id = si.staff_id
    LEFT JOIN staff_education edu ON s.id = edu.staff_id
    LEFT JOIN staff_family fam ON s.id = fam.staff_id
    LEFT JOIN staff_class_responsibilities cr ON s.id = cr.staff_id
    LEFT JOIN staff_documents doc ON s.id = doc.staff_id
    ORDER BY s.id
  `;
  
  const { rows } = await pool.query(query);
  return formatStaffData(rows);
};

const updateStaff = async (staffId, updates) => {
  const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 1}`).join(', ');
  const values = [...Object.values(updates), staffId];
  
  const query = `
    UPDATE staff 
    SET ${setClause}
    WHERE id = $${values.length}
    RETURNING *
  `;
  
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const deleteStaff = async (staffId) => {
  const query = `
    DELETE FROM staff 
    WHERE id = $1
    RETURNING *
  `;
  
  const { rows } = await pool.query(query, [staffId]);
  return rows[0];
};

// Helper function to format staff data
const formatStaffData = (rows) => {
  if (rows.length === 0) return [];
  
  const staffMap = new Map();
  
  rows.forEach(row => {
    if (!staffMap.has(row.id)) {
      staffMap.set(row.id, {
        ...row,
        education: [],
        family: [],
        classResponsibilities: [],
        service: [],
        experience: [],
        documents: []
      });
    }
    
    const staff = staffMap.get(row.id);
    
    // Education
    if (row.edu_id && !staff.education.find(e => e.id === row.edu_id)) {
      staff.education.push({
        id: row.edu_id,
        degree: row.degree,
        university: row.university,
        year: row.year,
        certificate: row.certificate
      });
    }
    
    // Family
    if (row.fam_id && !staff.family.find(f => f.id === row.fam_id)) {
      staff.family.push({
        id: row.fam_id,
        name: row.family_name,
        relation: row.relation,
        contact: row.family_contact
      });
    }
    
    // Class Responsibilities
    if (row.timetable_id && !staff.classResponsibilities.find(c => c.id === row.timetable_id)) {
      staff.classResponsibilities.push({
        id: row.timetable_id,
        class_name: row.class_id,
        subject: row.subject,
        monday: row.monday,
        tuesday: row.tuesday,
        wednesday: row.wednesday,
        thursday: row.thursday,
        friday: row.friday,
        saturday: row.saturday,
        monday_period_id: row.monday_period_id,
        tuesday_period_id: row.tuesday_period_id,
        wednesday_period_id: row.wednesday_period_id,
        thursday_period_id: row.thursday_period_id,
        friday_period_id: row.friday_period_id,
        saturday_period_id: row.saturday_period_id,
      });
    }
    
    // Service
    if (row.service_id && !staff.service.find(s => s.id === row.service_id)) {
      staff.service.push({
        id: row.service_id,
        joining_date: row.joining_date,
        total_leaves: row.total_leaves,
        used_leaves: row.used_leaves,
        pf_number: row.pf_number,
        pf_doc: row.pf_doc
      });
    }
    
    // Experience
    if (row.exp_id && !staff.experience.find(e => e.id === row.exp_id)) {
      staff.experience.push({
        id: row.exp_id,
        organization: row.organization,
        designation: row.designation,
        from_date: row.exp_from_date,
        to_date: row.exp_to_date,
        exp_docs: row.exp_doc_path
      });
    }
    
    // Documents
    if (row.doc_id && !staff.documents.find(d => d.id === row.doc_id)) {
      staff.documents.push({
        id: row.doc_id,
        document_type: row.document_type,
        document_path: row.document_path
      });
    }
  });
  
  return Array.from(staffMap.values());
};

// Basic Info
const getBasicInfo = async (id) => {
  const { rows } = await pool.query('SELECT * FROM staff WHERE id = $1', [id]);
  return rows[0];
};

const updateBasicInfo = async (id, updates) => {
  const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 1}`).join(', ');
  const values = [...Object.values(updates), id];
  
  const query = `
    UPDATE staff 
    SET ${setClause}
    WHERE id = $${values.length}
    RETURNING *
  `;
  
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const updateStaffImage = async (id, imagePath) => {
  const { rows } = await pool.query(
    `UPDATE staff 
     SET profile_image = $1
     WHERE id = $2
     RETURNING profile_image`,
    [imagePath, id]
  );
  return rows[0];
};

// Personal Info
const getPersonalInfo = async (id) => {
  const { rows } = await pool.query('SELECT * FROM staff_personal_info WHERE staff_id = $1', [id]);
  return rows[0];
};

const updatePersonalInfo = async (id, updates) => {
  const checkQuery = 'SELECT staff_id FROM staff_personal_info WHERE staff_id = $1';
  const checkResult = await pool.query(checkQuery, [id]);
  
  let result;
  
  if (checkResult.rows.length === 0) {
    const createQuery = `
      INSERT INTO staff_personal_info 
        (staff_id, ${Object.keys(updates).join(', ')})
      VALUES 
        ($1, ${Object.keys(updates).map((_, i) => `$${i + 2}`).join(', ')})
      RETURNING *
    `;
    const createValues = [id, ...Object.values(updates)];
    result = await pool.query(createQuery, createValues);
  } else {
    const query = `
      UPDATE staff_personal_info
      SET ${Object.keys(updates).map((k, i) => `${k} = $${i + 1}`)}
      WHERE staff_id = $${Object.keys(updates).length + 1}
      RETURNING *
    `;
    
    const values = [...Object.values(updates), id];
    result = await pool.query(query, values);
  }
  
  return result.rows[0];
};

// Service Info
const getServiceInfo = async (id) => {
  const { rows } = await pool.query('SELECT * FROM staff_service_info WHERE staff_id = $1', [id]);
  return rows[0];
};

const updateServiceInfo = async (id, updates) => {
  const checkQuery = 'SELECT staff_id FROM staff_service_info WHERE staff_id = $1';
  const checkResult = await pool.query(checkQuery, [id]);
  
  let result;
  
  if (checkResult.rows.length === 0) {
    const createQuery = `
      INSERT INTO staff_service_info 
        (staff_id, ${Object.keys(updates).join(', ')})
      VALUES 
        ($1, ${Object.keys(updates).map((_, i) => `$${i + 2}`).join(', ')})
      RETURNING *
    `;
    const createValues = [id, ...Object.values(updates)];
    result = await pool.query(createQuery, createValues);
  } else {
    const query = `
      UPDATE staff_service_info
      SET ${Object.keys(updates).map((k, i) => `${k} = $${i + 1}`)}
      WHERE staff_id = $${Object.keys(updates).length + 1}
      RETURNING *
    `;
    
    const values = [...Object.values(updates), id];
    result = await pool.query(query, values);
  }
  
  return result.rows[0];
};

const updateServiceDocs = async (id, docsPath) => {
  const { rows } = await pool.query(
    `UPDATE staff_service_info 
     SET pf_doc = $1
     WHERE staff_id = $2
     RETURNING *`,
    [docsPath, id]
  );
  return rows[0];
};

// Education
const getEducation = async (id) => {
  const { rows } = await pool.query(
    'SELECT * FROM staff_education WHERE staff_id = $1 ORDER BY staff_id DESC',
    [id]
  );
  return rows;
};

const updateEducation = async (id, eduId, updates) => {
  const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 1}`).join(', ');
  const values = [...Object.values(updates), eduId, id];
  
  const query = `
    UPDATE staff_education
    SET ${setClause}
    WHERE id = $${values.length - 1} AND staff_id = $${values.length}
    RETURNING *
  `;
  
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const addEducation = async (id, { degree, university, year, certificate }) => {
  const { rows } = await pool.query(
    `INSERT INTO staff_education 
     (staff_id, degree, university, year, certificate)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [id, degree, university, year, certificate]
  );
  return rows[0];
};

const deleteEducation = async (id, eduId) => {
  const { rows } = await pool.query(
    `DELETE FROM staff_education 
     WHERE id = $1 AND staff_id = $2
     RETURNING *`,
    [eduId, id]
  );
  return rows[0];
};

// Family
const getFamily = async (id) => {
  const { rows } = await pool.query(
    'SELECT * FROM staff_family WHERE staff_id = $1 ORDER BY id',
    [id]
  );
  return rows;
};

const addFamilyMember = async (id, { name, relation, contact }) => {
  const { rows } = await pool.query(
    `INSERT INTO staff_family 
     (staff_id, name, relation, contact)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [id, name, relation, contact]
  );
  return rows[0];
};

const updateFamilyMember = async (id, familyId, updates) => {
  const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 1}`).join(', ');
  const values = [...Object.values(updates), familyId, id];
  
  const { rows } = await pool.query(
    `UPDATE staff_family
     SET ${setClause}
     WHERE id = $${values.length - 1} AND staff_id = $${values.length}
     RETURNING *`,
    values
  );
  return rows[0];
};

const deleteFamilyMember = async (id, familyId) => {
  const { rows } = await pool.query(
    `DELETE FROM staff_family 
     WHERE id = $1 AND staff_id = $2
     RETURNING *`,
    [familyId, id]
  );
  return rows[0];
};

// Class Responsibilities
const getClassResponsibilities = async (id) => {
  const { rows } = await pool.query(
    `SELECT * FROM staff_class_responsibilities 
     WHERE staff_id = $1`,
    [id]
  );
  return rows;
};

const updateClassResponsibilities = async (id, classId, updates) => {
  const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 1}`).join(', ');
  const values = [...Object.values(updates), classId, id];
  
  const { rows } = await pool.query(
    `UPDATE staff_class_responsibilities
     SET ${setClause}
     WHERE id = $${values.length - 1} AND staff_id = $${values.length}
     RETURNING *`,
    values
  );
  return rows[0];
};

// Documents
const getDocuments = async (id) => {
  const { rows } = await pool.query(
    `SELECT * FROM staff_documents 
     WHERE staff_id = $1`,
    [id]
  );
  return rows;
};

const uploadDocument = async (id, { document_type, document_path }) => {
  const { rows } = await pool.query(
    `INSERT INTO staff_documents 
     (staff_id, document_type, document_path)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [id, document_type, document_path]
  );
  return rows[0];
};

const deleteDocument = async (id, doc_id) => {
  const { rows } = await pool.query(
    `delete from staff_documents 
    where id=$1
    RETURNING *`,
    [doc_id]
  );
  return rows[0];
}

const updateDocumnet = async (id,doc_id, { document_type, document_path }) => {
  const { rows } = await pool.query(
    `update staff_documents set
    documnet_type=$2,
    document_path=$3,
    staff_id=$4
    where id=$1
    RETURNING *
    `,
    [doc_id, document_type, document_path,id]
  );
  return rows[0];
}

// Timetable
const getTimeTable = async (id, academicYear) => {
  const { rows } = await pool.query(
    'SELECT * FROM get_timetable_grid($1, $2, $3)',
    ['staff', id, academicYear || null]
  );
  return rows;
};

const getTeacherTimeTable = async (userId, academicYear) => {
  const { rows } = await pool.query(
    'SELECT * FROM get_timetable_grid($1, $2, $3)',
    ['staff', userId, academicYear || null]
  );
  return rows;
};

const getClassTimeTable = async (classIds, academicYear) => {
  const query = `
  SELECT 
    days.day_name,
    p.periodid as period_id,
    p.periodname,
    CONCAT(to_char(p.timein, 'HH12:MI AM')::text, ' - ', to_char(p.timeout, 'HH12:MI AM')::text) as time_slot,
	to_char(p.timein, 'HH12:MI AM')::text timein,
	to_char(p.timeout, 'HH12:MI AM')::text timeout,
	t.class_id,
    t.subject_id,
    s.subject_name,
    t.staff_id,
    st.full_name
FROM public.timetable t
CROSS JOIN LATERAL (
    VALUES 
        ('Monday', t.monday),
        ('Tuesday', t.tuesday),
        ('Wednesday', t.wednesday),
        ('Thursday', t.thursday),
        ('Friday', t.friday),
        ('Saturday', t.saturday),
        ('Sunday', t.sunday)
) AS days(day_name, period_id)
INNER JOIN public.periodmaster p ON days.period_id = p.periodid
LEFT JOIN public.subjects s ON t.subject_id = s.subject_id
LEFT JOIN public.staff st ON t.staff_id = st.id
WHERE t.class_id= ANY($1::int[])
	and t.is_active = True
  AND t.academic_year = $2
  AND days.period_id IS NOT NULL
ORDER BY 
    CASE days.day_name
        WHEN 'Monday' THEN 1
        WHEN 'Tuesday' THEN 2
        WHEN 'Wednesday' THEN 3
        WHEN 'Thursday' THEN 4
        WHEN 'Friday' THEN 5
        WHEN 'Saturday' THEN 6
        WHEN 'Sunday' THEN 7
    END,
    p.periodid;
  `;
  const { rows } = await pool.query(query, [classIds, academicYear]);
  return rows;
}
const updateTimeTable = async (id, classid, updates) => {
  const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 1}`).join(', ');
  
  const query = {
    text: `UPDATE timetable 
           SET ${setClause}
           WHERE timetable_id = $${Object.keys(updates).length + 1}
           RETURNING timetable_id id, class_id as class_name, subject_id subject, monday, tuesday, wednesday, thursday, friday, saturday`,
    values: [...Object.values(updates), classid]
  };
  
  const { rows } = await pool.query(query);
  return rows[0];
};

const addTimeTable = async (id, updates) => {
  const columns = ['staff_id', ...Object.keys(updates)];
  const values = [id, ...Object.values(updates)];
  
  const query = {
    text: `INSERT INTO timetable (${columns.join(', ')})
           VALUES (${columns.map((_, i) => `$${i + 1}`).join(', ')})
           RETURNING timetable_id id, class_id as class_name, subject_id subject, monday, tuesday, wednesday, thursday, friday, saturday`,
    values
  };
  
  const { rows } = await pool.query(query);
  return rows[0];
};

const deleteTimeTable = async (id, classid) => {
  const { rows } = await pool.query(
    `DELETE FROM timetable 
     WHERE timetable_id = $1 AND staff_id = $2
     RETURNING *`,
    [classid, id]
  );
  return rows[0];
};

// Experience
const addExperience = async (id, { organization, from_date, to_date, designation, document }) => {
  const { rows } = await pool.query(
    `INSERT INTO staff_experiences
     (staff_id, organization, from_date, to_date, designation, document_path)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, organization, designation, from_date, to_date, document_path exp_docs`,
    [id, organization, from_date, to_date, designation, document]
  );
  return rows[0];
};

const deleteExperience = async (id, exp_id) => {
  const { rows } = await pool.query(
    `DELETE FROM staff_experiences 
     WHERE id = $1
     RETURNING id, organization, designation, from_date, to_date, document_path exp_docs`,
    [exp_id]
  );
  return rows[0];
};

const updateExperienceDocument = async (exp_id, document_path) => {
  const { rows } = await pool.query(
    `UPDATE staff_experiences 
     SET document_path = $1
     WHERE id = $2
     RETURNING id, organization, designation, from_date, to_date, document_path exp_docs`,
    [document_path, exp_id]
  );
  return rows[0];
};

const updateExperience = async (id, exp_id, updates) => {
  const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 1}`).join(', ');
  const values = [...Object.values(updates), exp_id];
  
  const { rows } = await pool.query(
    `UPDATE staff_experiences
     SET ${setClause}
     WHERE id = $${values.length}
     RETURNING id, organization, designation, from_date, to_date, document_path exp_docs`,
    values
  );
  return rows[0];
};

const getExperienceByStaffId = async (id) => {
  const { rows } = await pool.query(
    `select * FROM staff_experiences 
     WHERE id = $1`,
    [id]
  );
  return rows;
}

// Students
const getStudents = async (id, usertype) => {
  let query;
  let values = [];
  
  if (usertype === 'Staff Admin') {
    query = `SELECT id, full_name AS student_name,admission_no FROM students ORDER BY full_name`;
  } else {
    query = `
      SELECT a.id, a.full_name AS student_name,admission_no
        FROM students a
        JOIN staff b ON a.class_id = b.class_id
        JOIN users c ON c.id = b.user_id
        WHERE c.id = $1
        ORDER BY a.full_name
    `;
    values = [id];
  }
  
  const { rows } = await pool.query(query, values);
  return rows;
};

// Class Assigned
const getClassAssigned = async (id) => {
  const { rows } = await pool.query(
    `select class_id,b.class,b.section,b.class ||' - '|| b.section class_name from staff a,classmaster b where a.class_id=b.id and user_id=$1`,
    [id]
  );
  return rows;
};

const getStaffTimetableById = async (staffId) => {
  const query = `
    SELECT
      cr.timetable_id AS timetable_id,
      cr.class_id,
      cr.subject_id AS subject,
      cr.monday,
      cr.tuesday,
      cr.wednesday,
      cr.thursday,
      cr.friday,
      cr.saturday
    FROM timetable cr
    WHERE cr.staff_id = $1
    ORDER BY cr.class_id, cr.timetable_id
  `;

  const { rows } = await pool.query(query, [staffId]);

  if (!rows || rows.length === 0) return [];

  return rows.map(row => ({
    id: row.timetable_id,
    class_name: row.class_id,
    subject: row.subject,
    monday: row.monday,
    tuesday: row.tuesday,
    wednesday: row.wednesday,
    thursday: row.thursday,
    friday: row.friday,
    saturday: row.saturday
  }));
};
const getTimeTableByKeys = async (staffId, classId, subjectId) => {
  const { rows } = await pool.query(
    `SELECT * FROM timetable
     WHERE staff_id = $1
       AND class_id = $2
       AND subject_id = $3`,
    [staffId, classId, subjectId]
  );
  return rows[0];
};

const updateStaffTimeTable = async (timetableId, updates) => {
  const setClause = Object.keys(updates)
    .map((key, index) => `${key} = $${index + 1}`)
    .join(', ');

  const query = {
    text: `
      UPDATE timetable
      SET ${setClause}
      WHERE timetable_id = $${Object.keys(updates).length + 1}
      RETURNING timetable_id id,
                class_id as class_name,
                subject_id subject,
                monday, tuesday, wednesday,
                thursday, friday, saturday
    `,
    values: [...Object.values(updates), timetableId]
  };

  const { rows } = await pool.query(query);
  return rows[0];
};

const addStaffTimeTable = async (staffId, updates) => {
  const columns = ['staff_id', ...Object.keys(updates)];
  const values = [staffId, ...Object.values(updates)];

  const query = {
    text: `
      INSERT INTO timetable (${columns.join(', ')})
      VALUES (${columns.map((_, i) => `$${i + 1}`).join(', ')})
      RETURNING timetable_id id,
                class_id as class_name,
                subject_id subject,
                monday, tuesday, wednesday,
                thursday, friday, saturday
    `,
    values
  };

  const { rows } = await pool.query(query);
  return rows[0];
};

const deleteStaffTimeTable = async (timetableId) => {
  const query = {
    text: `
      DELETE FROM timetable
      WHERE timetable_id = $1
      RETURNING timetable_id
    `,
    values: [timetableId]
  };

  const { rows } = await pool.query(query);
  return rows[0];
};


export {
  createStaff,
  getStaffById,
  getAllStaff,
  updateStaff,
  deleteStaff,
  getBasicInfo,
  updateBasicInfo,
  updateStaffImage,
  getPersonalInfo,
  updatePersonalInfo,
  getServiceInfo,
  updateServiceInfo,
  updateServiceDocs,
  getEducation,
  updateEducation,
  addEducation,
  deleteEducation,
  getFamily,
  addFamilyMember,
  updateFamilyMember,
  deleteFamilyMember,
  getClassResponsibilities,
  updateClassResponsibilities,
  getDocuments,
  uploadDocument,
  deleteDocument,
  updateDocumnet,
  getTimeTable,
  getTeacherTimeTable,
  getClassTimeTable,
  updateTimeTable,
  addTimeTable,
  deleteTimeTable,
  addExperience,
  deleteExperience,
  updateExperienceDocument,
  updateExperience,
  getStudents,
  getClassAssigned,
  getExperienceByStaffId,
  getStaffTimetableById,
  getTimeTableByKeys,
  updateStaffTimeTable,
  addStaffTimeTable,
  deleteStaffTimeTable
};