import pool from "../db/connectDB-pg.js";
import generateUPIPaymentLink  from "../utils/upiUtils.js"

class FeeType {
  static async findAll() {
    const query = 'SELECT * FROM fee_types WHERE is_active = TRUE';
    const { rows } = await pool.query(query);
    return rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM fee_types WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async create({ name, description, amount }) {
    const query = `
      INSERT INTO fee_types (name, description, amount)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [name, description, amount]);
    return rows[0];
  }

  static async update(id, { name, description, amount }) {
    const query = `
      UPDATE fee_types
      SET
        name = $1,
        description = $2,
        amount = $3,
        updated_at = NOW()
      WHERE id = $4
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [name, description, amount, id]);
    return rows[0];
  }

  static async softDelete(id) {
    const query = `
      UPDATE fee_types
      SET
        is_active = FALSE,
        updated_at = NOW()
      WHERE id = $1
      RETURNING id;
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
}

class FeeAssignment {
  static async findByClasses(class_ids, academic_year) {
    const query = `
      WITH fee_assignments_data AS (
      SELECT 
        fa.*, 
        ft.name as fee_name, 
        ft.amount as base_amount,
        c.class,
        c.section
      FROM fee_assignments fa
      JOIN fee_types ft ON fa.fee_type_id = ft.id
      JOIN classmaster c ON fa.class_id = c.id
      WHERE fa.class_id = ANY($1::int[])
      AND fa.academic_year = $2
    ),
    students_in_class AS (
      SELECT 
        s.id as student_id,
        s.full_name,
        s.admission_no,
        s.class_id
      FROM students s
      WHERE s.class_id = ANY($1::int[])
    ),
    payment_status AS (
      SELECT 
        p.fee_assignment_id,
        p.student_id,
        COUNT(p.id) as payment_count
      FROM payments p
      GROUP BY p.fee_assignment_id, p.student_id
    )
    
    SELECT 
      fad.*,
      (SELECT COUNT(*) FROM students_in_class WHERE class_id = fad.class_id) as total_students,
      (SELECT COUNT(*) FROM students_in_class sic
       LEFT JOIN payment_status ps ON ps.student_id = sic.student_id AND ps.fee_assignment_id = fad.id
       WHERE sic.class_id = fad.class_id AND (ps.payment_count IS NULL OR ps.payment_count = 0)
      ) as pending_count,
      (
        SELECT json_agg(json_build_object(
          'student_id', sic.student_id,
          'full_name', sic.full_name,
          'admission_no', sic.admission_no
        ))
        FROM students_in_class sic
        LEFT JOIN payment_status ps ON ps.student_id = sic.student_id AND ps.fee_assignment_id = fad.id
        WHERE sic.class_id = fad.class_id AND (ps.payment_count IS NULL OR ps.payment_count = 0)
      ) as pending_students
    FROM fee_assignments_data fad
    `;
    const { rows } = await pool.query(query, [class_ids, academic_year]);
    return rows.map(assignment => {
      const { upiLink, transactionId } = generateUPIPaymentLink({
        feeAssignmentId: assignment.id,
        feeName: assignment.fee_name,
        amount: assignment.base_amount
      });
      
      return {
        ...assignment,
        upi_link: upiLink,
        transaction_id: transactionId,
      pending_count: assignment.pending_count || 0,
      pending_students: assignment.pending_students || []
      };
      });
    
  }

  static async create({ fee_type_id, class_id, academic_year, due_date }) {
    const query = `
      INSERT INTO fee_assignments (fee_type_id, class_id, academic_year, due_date)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [fee_type_id, class_id, academic_year, due_date]);
    return rows[0];
  }

  static async update(id, { fee_type_id, due_date, academic_year }) {
    const query = `
      UPDATE fee_assignments
      SET
        fee_type_id = $1,
        due_date = $2,
        academic_year = $3,
        updated_at = NOW()
      WHERE id = $4
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [fee_type_id, due_date, academic_year, id]);
    return rows[0];
  }

  static async delete(id) {
    const query = `
      DELETE FROM fee_assignments
      WHERE id = $1
      RETURNING id;
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async findById(id) {
    const query = `SELECT fa.*, ft.name as fee_name, ft.amount as base_amount
    FROM fee_assignments fa
    JOIN fee_types ft ON fa.fee_type_id = ft.id
    WHERE fa.id = $1`;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

}

class Payment {
  static async findByStudent(student_id) {
    const query = `
       WITH student_data AS (
      SELECT s.id, s.class_id, c.class, c.section
      FROM students s
      LEFT JOIN classmaster c ON s.class_id = c.id
      WHERE s.id = $1
    ),
    paid_fees AS (
      SELECT 
        p.*,
        ft.name as fee_name,
        ft.amount as base_amount,
        fa.due_date,
        fa.academic_year,
        c.class || ' - ' || c.section as class_name,
        'paid' as payment_status,
		 c.class ,c.section
      FROM payments p
      JOIN fee_assignments fa ON p.fee_assignment_id = fa.id
      JOIN fee_types ft ON fa.fee_type_id = ft.id
      LEFT JOIN classmaster c ON fa.class_id = c.id
      WHERE p.student_id = $1
    ),
    all_assignments AS (
      SELECT 
        fa.*,
        ft.name as fee_name,
        ft.amount as base_amount,
        c.class || ' - ' || c.section as class_name,
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM payments p 
            WHERE p.fee_assignment_id = fa.id AND p.student_id = $1
          ) THEN 'paid'
          WHEN fa.due_date < CURRENT_DATE THEN 'overdue'
          ELSE 'pending'
        END as payment_status,
        sd.class,
        sd.section
      FROM fee_assignments fa
      JOIN fee_types ft ON fa.fee_type_id = ft.id
      JOIN student_data sd ON fa.class_id = sd.class_id
      LEFT JOIN classmaster c ON fa.class_id = c.id
      WHERE fa.academic_year = (
        SELECT academic_year 
        FROM fee_assignments 
        WHERE class_id = (SELECT class_id FROM student_data) 
        ORDER BY academic_year DESC 
        LIMIT 1
      )
    )
    
    SELECT * FROM paid_fees
    UNION ALL
    SELECT 
      NULL as id,
      $1 as student_id,
      aa.id as fee_assignment_id,
      aa.base_amount as amount,
      NULL as payment_date,
      NULL as transaction_reference,
      NULL as payment_method,
      'pending' as status,
      NULL as created_by,
      NULL as created_at,
      NULL as updated_at,
      aa.fee_name,
      aa.base_amount,
      aa.due_date,
      aa.academic_year,
      aa.class_name,
      aa.payment_status,
      aa.class,
      aa.section
    FROM all_assignments aa
    WHERE aa.payment_status != 'paid'
    ORDER BY payment_status, due_date
    `;
    const { rows } = await pool.query(query, [student_id]);
    return rows.map(assignment => {
      const { upiLink, transactionId } = generateUPIPaymentLink({
        feeAssignmentId: assignment.fee_assignment_id,
        feeName: assignment.fee_name,
        amount: assignment.base_amount
      });
      return {
        ...assignment,
        upi_link: upiLink,
        transaction_id: transactionId
      };
      });
  }

  static async findDuePayments(student_id) {
    const query = `
      SELECT fa.*, ft.name as fee_name, ft.amount as base_amount,
             sc.class_id, c.class ||' - '||c.section as class_name
      FROM fee_assignments fa
      JOIN fee_types ft ON fa.fee_type_id = ft.id
      JOIN students sc ON (fa.class_id = sc.class_id OR fa.class_id IS NULL)
      LEFT JOIN classmaster c ON sc.class_id = c.id
      WHERE sc.student_id = $1
      AND fa.due_date <= CURRENT_DATE
      AND NOT EXISTS (
        SELECT 1 FROM payments p 
        WHERE p.fee_assignment_id = fa.id 
        AND p.student_id = $1
      )
    `;
    const { rows } = await pool.query(query, [student_id]);
    return rows;
  }

  static async create({
    student_id,
    fee_assignment_id,
    amount,
    payment_date,
    transaction_reference,
    payment_method,
    status,
    created_by
  }) {
    const query = `
      INSERT INTO payments (
        student_id, fee_assignment_id, amount, payment_date,
        transaction_reference, payment_method, status, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const values = [
      student_id, fee_assignment_id, amount, payment_date,
      transaction_reference, payment_method, status, created_by
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }
}

class ClassTeacher{
  // Classes/Teacher

  static async getTeachersByClass(class_ids) {
    const query = `
    SELECT 
    s.id as staff_id,
    s.full_name,
    s.position,
    s.profile_image,
    s.phone,
    u.email,
    cm.class as class_name,
    STRING_AGG(DISTINCT sub.subject_name, ', ') as subject_name,
    STRING_AGG(DISTINCT cm.section, ', ') as section
FROM timetable ta
JOIN staff s ON ta.staff_id = s.id
JOIN users u ON s.user_id = u.id
JOIN subjects sub ON ta.subject_id = sub.subject_id
JOIN classmaster cm ON ta.class_id = cm.id
WHERE ta.class_id = ANY($1::int[])
GROUP BY 
    s.id,
    s.full_name,
    s.position,
    s.profile_image,
    s.phone,
    u.email,
    cm.class
ORDER BY s.full_name, cm.class;;
    `;  
    const { rows } = await pool.query(query, [class_ids]);
    return rows;
  }
  static async getAvailableTeachers() {
    const query = `
    SELECT 
        s.id,
        s.full_name,
        s.position,
        s.profile_image,
        s.phone,
        u.email
      FROM staff s
      JOIN users u ON s.user_id = u.id
      WHERE s.position ILIKE '%teacher%' OR s.position ILIKE '%faculty%'
      ORDER BY s.full_name
    `;
    const { rows } = await pool.query(query);
    return rows;
  }
}

export { FeeType, FeeAssignment, Payment, ClassTeacher };
