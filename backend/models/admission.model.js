import { pool } from "../db/connectDB-pg.js";

const AdmissionModel = {
  create: async (data) => {
    const query = `
      INSERT INTO admissions (
        application_no, academic_year, applied_date, 
        first_name, middle_name, last_name, gender, dob, 
        class_required, syllabus, 
        email, phone_number, address, city, nationality, religion, category,
        family_info, prev_school_info, health_info, photos, documents, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
      RETURNING *`;

    const values = [
      data.applicationNo,
      data.academicYear || '2025 - 26',
      data.appliedOn || new Date(),
      data.firstName,
      data.middleName,
      data.lastName,
      data.gender,
      data.dob,
      data.classRequired,
      data.syllabusPrimary || data.syllabus,
      data.father?.email || data.mother?.email, // Fallback for contact
      data.father?.phone || data.mother?.phone,
      data.address || `${data.door || ''}, ${data.street || ''}`,
      data.city,
      data.nationality,
      data.religion,
      data.category,
      JSON.stringify({
        father: data.father,
        mother: data.mother,
        guardian: data.guardian,
        sibling: { name: data.siblingName, id: data.siblingId, studying: data.siblingStudying }
      }),
      JSON.stringify(data.previousSchool),
      JSON.stringify({
        disability: data.disability,
        diseaseStatus: data.diseaseStatus,
        immunization: data.immunization
      }),
      JSON.stringify(data.photos),
      JSON.stringify(data.docs),
      data.status || 'New'
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  findAll: async (statusFilter) => {
    let query = `SELECT * FROM admissions`;
    const values = [];

    if (statusFilter) {
      // Handle special case for 'Rejected' page which often includes 'Not joined'
      if (statusFilter === 'Rejected_Page') {
        query += ` WHERE status IN ('Rejected', 'Not Joined')`;
      } else if (statusFilter === 'New_Page') {
        query += ` WHERE status NOT IN ('Accepted', 'Rejected', 'Not Joined')`;
      } else {
        query += ` WHERE status = $1`;
        values.push(statusFilter);
      }
    }
    
    query += ` ORDER BY created_at DESC`;
    const { rows } = await pool.query(query, values);
    return rows;
  },

  findById: async (id) => {
    // Search by Internal ID or Application No
    const query = `SELECT * FROM admissions WHERE application_no = $1 OR id::text = $1`;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  },

  updateStatus: async (id, status, reason = null) => {
    const query = `
      UPDATE admissions 
      SET status = $1, rejection_reason = $2, updated_at = CURRENT_TIMESTAMP
      WHERE application_no = $3 OR id::text = $3
      RETURNING *`;
    const { rows } = await pool.query(query, [status, reason, id]);
    return rows[0];
  },

  getAnalytics: async () => {
    // Calculates the overview metrics per year
    const query = `
        SELECT 
            academic_year as year,
            COUNT(*)::int as total,
            COUNT(CASE WHEN status = 'Accepted' THEN 1 END)::int as admitted,
            COUNT(CASE WHEN status IN ('Rejected', 'Not Joined') THEN 1 END)::int as rejected,
            -- Calculating hypothetical vacancy (Assuming capacity of 200 for example, or handled by frontend logic)
            GREATEST(200 - COUNT(CASE WHEN status = 'Accepted' THEN 1 END), 0)::int as vacancy
        FROM admissions 
        GROUP BY academic_year 
        ORDER BY academic_year ASC
    `;
    const { rows } = await pool.query(query);
    return rows;
  }
};

export default AdmissionModel;