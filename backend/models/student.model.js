import pool from "../db/connectDB-pg.js";
const createStudent=async (userId,{studentId,classId,admissionNo,fullName})=>{
    const{rows}=await pool.query(
        'insert into students(user_id,student_id,class_id,admission_no,full_name) values ($1,$2,$3,$4,$5) RETURNING *',
        [userId,studentId,classId,admissionNo,fullName]
    );
    return rows[0];
};

const getAllStudents = async (classId) => {
    let query = 'SELECT * FROM students';
    const params = [];
    
    if (classId) {
        query += ' WHERE class_id = $1';
        params.push(classId);
    }
    
    query += ' ORDER BY full_name ASC';
    
    const { rows } = await pool.query(query, params);
    return rows;
};
const updateStudentImage = async (studentId, { imagePath }) => {
    const { rows } = await pool.query(
        `update students
            SET profile_img=$1
            where id=$2
            RETURNING *`,
        [imagePath, studentId]
    );
    return rows[0];
}
const updateStudent = async (studentId, updates) => {
    const query = `
            UPDATE students
            SET ${Object.keys(updates).map((k, i) => `${k} = $${i + 1}`)}
            WHERE id = $${Object.keys(updates).length + 1}
            RETURNING *
        `;
    const result = await pool.query(query, [...Object.values(updates), studentId]);
    return result.rows[0];
}
const CheckStudent = async (studentId) => {
    const { rows } = await pool.query(
        'select * from students where id=$1',
        [studentId]
    );
    return rows[0];
}

const getStudentBasicInfo = async (studentId) => {
    const {rows} = await pool.query(
        'SELECT * FROM student_basic_info WHERE student_id = $1',
        [studentId]
    );
    return rows[0];
};

const updateStudentBasicInfo = async (studentId, updates) => {
    const checkQuery = 'SELECT student_id FROM student_basic_info WHERE student_id = $1';
    const checkResult = await pool.query(checkQuery, [studentId]);

    let result;
    if (checkResult.rows.length === 0) {
        const createQuery = `
            INSERT INTO student_basic_info 
            (student_id, ${Object.keys(updates).join(', ')}) 
            VALUES ($1, ${Object.keys(updates).map((_, i) => `$${i + 2}`).join(', ')}) 
            RETURNING *
        `;
        result = await pool.query(createQuery, [studentId, ...Object.values(updates)]);
    } else {
        const query = `
            UPDATE student_basic_info
            SET ${Object.keys(updates).map((k, i) => `${k} = $${i + 1}`)}
            WHERE student_id = $${Object.keys(updates).length + 1}
            RETURNING *
        `;
        result = await pool.query(query, [...Object.values(updates), studentId]);
    }
    return result.rows[0];
};
const getStudentDetail = async (studentId) => {
    try {
        // Get student base info
        const studentQuery = 'SELECT * FROM students WHERE id = $1';
        const studentResult = await pool.query(studentQuery, [studentId]);
        
        if (studentResult.rows.length === 0) {
            return null;
        }

        const student = studentResult.rows[0];

        // Get all related information
        const [
            basicInfoResult,
            performanceResult,
            healthResult,
            schoolInfoResult,
            parentInfoResult,
            casteReligionResult
        ] = await Promise.all([
            pool.query('SELECT * FROM student_basic_info WHERE student_id = $1', [studentId]),
            pool.query('SELECT * FROM student_performance WHERE student_id = $1', [studentId]),
            pool.query('SELECT * FROM student_health WHERE student_id = $1', [studentId]),
            pool.query('SELECT * FROM student_school_info WHERE student_id = $1', [studentId]),
            pool.query('SELECT * FROM student_parent_info WHERE student_id = $1', [studentId]),
            pool.query('SELECT * FROM student_caste_religion WHERE student_id = $1', [studentId])
        ]);

        // Combine all data
        return {
            ...student,
            basic_info: basicInfoResult.rows[0] || {},
            performance: performanceResult.rows[0] || {},
            health: healthResult.rows[0] || {},
            school: schoolInfoResult.rows[0] || {},
            parent: parentInfoResult.rows[0] || {},
            caste: casteReligionResult.rows[0] || {}
        };
    } catch (error) {
        console.error('Error fetching complete student:', error);
        throw error;
    }
};
const updateStudentPerformance = async (studentId, updates) => {
    return updateSection('student_performance', studentId, updates);
};

const updateStudentHealth = async (studentId, updates) => {
    return updateSection('student_health', studentId, updates);
};

const updateStudentSchoolInfo = async (studentId, updates) => {
    return updateSection('student_school_info', studentId, updates);
};

const updateStudentParentInfo = async (studentId, updates) => {
    return updateSection('student_parent_info', studentId, updates);
};

const updateStudentCasteReligion = async (studentId, updates) => {
    return updateSection('student_caste_religion', studentId, updates);
};

// Generic section updater
const updateSection = async (tableName, studentId, updates) => {
    try {
        const checkQuery = `SELECT student_id FROM ${tableName} WHERE student_id = $1`;
        const checkResult = await pool.query(checkQuery, [studentId]);

        let result;
        if (checkResult.rows.length === 0) {
            const createQuery = `
            INSERT INTO ${tableName} 
            (student_id, ${Object.keys(updates).join(', ')}) 
            VALUES ($1, ${Object.keys(updates).map((_, i) => `$${i + 2}`).join(', ')}) 
            RETURNING *
        `;
            result = await pool.query(createQuery, [studentId, ...Object.values(updates)]);
        } else {
            const updateQuery = `
            UPDATE ${tableName}
            SET ${Object.keys(updates).map((k, i) => `${k} = $${i + 1}`)}
            WHERE student_id = $${Object.keys(updates).length + 1}
            RETURNING *
        `;
            result = await pool.query(updateQuery, [...Object.values(updates), studentId]);
        }
        return result.rows[0];
    } catch (error) {
        console.error('Error Insert / Update Studen Detail:', error);
        throw error;
    }
};
const getStudentTimeTable = async (userId, academicYear)=>{
    const result = await pool.query(
      'SELECT * FROM get_timetable_grid($1, $2, $3)',
      ['student', userId, academicYear || null]
    );
    return result.rows;
}
const getChildList = async (userId)=>{
    const result = await pool.query(
      `
        SELECT *
        FROM (
          SELECT
            s.id,
            s.user_id,
            'Student' AS user_type,
            s.student_id AS code,
            s.admission_no,
            s.full_name,
            s.profile_img AS profile_img,
            s.class_id,
            s.created_at,
            s.updated_at,
            CASE
              WHEN cm.id IS NULL THEN NULL
              WHEN cm.section IS NULL OR cm.section = '' THEN cm.class
              ELSE cm.class || ' - ' || cm.section
            END AS classname
          FROM students s
          LEFT JOIN classmaster cm ON s.class_id = cm.id
          WHERE s.user_id = $1

          UNION ALL

          SELECT
            sf.id,
            sf.user_id,
            'Teacher' AS user_type,
            sf.staff_id AS code,
            sf.staff_id AS admission_no,
            sf.full_name,
            sf.profile_image profile_img,
            sf.class_id,
            sf.created_at,
            NULL AS updated_at,
            CASE
              WHEN cm.id IS NULL THEN NULL
              WHEN cm.section IS NULL OR cm.section = '' THEN cm.class
              ELSE cm.class || ' - ' || cm.section
            END AS classname
          FROM staff sf
          LEFT JOIN classmaster cm ON sf.class_id = cm.id
          WHERE sf.user_id = $1
        ) people
        ORDER BY people.full_name ASC
      `,
      [userId]
    );
    return result.rows;
}
const getTeacherList=async(studentId)=>{
    const result=await pool.query(
        `select st.id,st.full_name,st.staff_id ,su.subject_name
            from students ss join  timetable tt 
            on ss.class_id=tt.class_id join staff st 
            on st.id=tt.staff_id  join subjects su 
            on tt.subject_id=su.subject_id
            where ss.id=$1
        `,[studentId]
    )
    return result.rows;
}
const getStudentsByClass = async (classId) => {
  const query = `
    SELECT id, student_id, admission_no, full_name, profile_img
    FROM students
    WHERE class_id = $1
    ORDER BY full_name ASC
  `;
  const { rows } = await pool.query(query, [classId]);
  return rows;
};
const getTeacherAndSiblingList = async (userId, excludeStudentId) => {
  const result = await pool.query(
    `
    SELECT id, full_name, 'Teacher' AS type
    FROM staff
    WHERE user_id in (select user_id from students where id=$1)

    UNION ALL

    SELECT id, full_name, 'Sibling' AS type
    FROM students
    WHERE user_id in (select user_id from students where id=$1)
      AND id <> $1
    `,
    [excludeStudentId]
  );

  return result.rows;
};
export {
    createStudent,
    updateStudentImage,
    CheckStudent,
    updateStudent,
    getStudentBasicInfo,
    updateStudentBasicInfo,
    getStudentDetail,
    updateStudentPerformance,
    updateStudentHealth,
    updateStudentSchoolInfo,
    updateStudentParentInfo,
    updateStudentCasteReligion,
    getStudentTimeTable,
    getChildList,
    getTeacherList,
    getStudentsByClass,
    getTeacherAndSiblingList,
    getAllStudents
}
