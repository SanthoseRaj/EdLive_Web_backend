import pool from "../db/connectDB-pg.js";

class Book {
  static async findAll() {
    const query = 'SELECT * FROM books WHERE is_active = TRUE';
    const { rows } = await pool.query(query);
    return rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM books WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async create({ title, author, isbn, publisher, publication_year, genre, quantity, location }) {
    const query = `
      INSERT INTO books (title, author, isbn, publisher, publication_year, genre, quantity, available_quantity, location)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $7, $8)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [title, author, isbn, publisher, publication_year, genre, quantity, location]);
    return rows[0];
  }

  static async update(id, updates) {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    
    const query = `
      UPDATE books
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${fields.length + 1}
      RETURNING *;
    `;
    
    const { rows } = await pool.query(query, [...values, id]);
    return rows[0];
  }

  static async search({ title, author, isbn, genre }) {
    let query = 'SELECT * FROM books WHERE is_active = TRUE';
    const conditions = [];
    const params = [];
    
    if (title) {
      conditions.push(`title ILIKE $${params.length + 1}`);
      params.push(`%${title}%`);
    }
    if (author) {
      conditions.push(`author ILIKE $${params.length + 1}`);
      params.push(`%${author}%`);
    }
    if (isbn) {
      conditions.push(`isbn = $${params.length + 1}`);
      params.push(isbn);
    }
    if (genre) {
      conditions.push(`genre = $${params.length + 1}`);
      params.push(genre);
    }
    
    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }
    
    const { rows } = await pool.query(query, params);
    return rows;
  }
}

class BookCopy {
  static async findByBook(bookId) {
    const query = 'SELECT * FROM book_copies WHERE book_id = $1';
    const { rows } = await pool.query(query, [bookId]);
    return rows;
  }
   static async findById(book_copy_id) {
    const query = 'SELECT * FROM book_copies WHERE id = $1';
    const { rows } = await pool.query(query, [book_copy_id]);
    return rows[0];
  }

  static async create({ book_id, barcode, condition }) {
    const query = `
      INSERT INTO book_copies (book_id, barcode, condition)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [book_id, barcode, condition]);
    return rows[0];
  }

  static async updateStatus(id, status) {
    const query = `
      UPDATE book_copies
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [status, id]);
    return rows[0];
  }
  static async findAvailable() {
    const query = `
      SELECT 
        bc.*, 
        b.title as book_title, 
        b.author, 
        b.isbn
      FROM book_copies bc
      JOIN books b ON bc.book_id = b.id
      WHERE bc.status = 'Available' AND b.is_active = TRUE
      ORDER BY b.title, bc.barcode;
    `;
    const { rows } = await pool.query(query);
    return rows;
  }
}

class LibraryMember {
  static async findByUser(userId, userType) {
    if (userType === "Teacher") {
        const query = `SELECT 
                    lm.*,
                    s.full_name student_name,
                    s.class_id,
                    st.full_name teacher_name
                FROM library_members lm
                JOIN students s ON lm.user_id = s.id
                JOIN staff st ON s.class_id = st.class_id
                WHERE lm.user_id = $1  and is_active=true`;
        const { rows } = await pool.query(query, [userId]);
        return rows[0];  
    }
    if (userType === "Staff Admin" ||userType === "Librarian") {
        const query = `SELECT 
                    lm.*,
                    s.full_name student_name,
                    s.class_id,
                    st.full_name teacher_name
                FROM library_members lm
                JOIN students s ON lm.user_id = s.id
                JOIN staff st ON s.class_id = st.class_id
                WHERE  lm.user_id = $1 and is_active=true`;
        const { rows } = await pool.query(query);
        return rows[0];  
    }
    if (userType === "Student") {
        const query = `SELECT 
                    lm.*,
                    s.full_name student_name,
                    s.class_id,
                    st.full_name teacher_name
                FROM library_members lm
                JOIN students s ON lm.user_id = s.id
                JOIN staff st ON s.class_id = st.class_id
                WHERE lm.user_id = $1  and is_active=true`;
        const { rows } = await pool.query(query, [userId]);
        return rows[0];  
    }
    // const query = 'SELECT * FROM library_members WHERE user_id = $1 AND user_type = $2 AND is_active = TRUE';
    // const { rows } = await pool.query(query, [userId, userType]);
    // return rows[0];
  }


  static async findByMemberId(userId, userType) {
    if (userType === "Teacher") {
        const query = `SELECT 
                    lm.*,
                    s.full_name student_name,
                    s.class_id,
                    st.full_name teacher_name
                FROM library_members lm
                JOIN students s ON lm.user_id = s.id
                JOIN staff st ON s.class_id = st.class_id
                WHERE lm.id = $1  and is_active=true`;
        const { rows } = await pool.query(query, [userId]);
        return rows[0];  
    }
    if (userType === "Staff Admin" ||userType === "Librarian") {
        const query = `SELECT 
                    lm.*,
                    s.full_name student_name,
                    s.class_id,
                    st.full_name teacher_name
                FROM library_members lm
                JOIN students s ON lm.user_id = s.id
                JOIN staff st ON s.class_id = st.class_id
                WHERE  lm.id = $1 and is_active=true`;
        const { rows } = await pool.query(query, [userId]);
        return rows[0];  
    }
    if (userType === "Student") {
        const query = `SELECT 
                    lm.*,
                    s.full_name student_name,
                    s.class_id,
                    st.full_name teacher_name
                FROM library_members lm
                JOIN students s ON lm.user_id = s.id
                JOIN staff st ON s.class_id = st.class_id
                WHERE lm.id = $1  and is_active=true`;
        const { rows } = await pool.query(query, [userId]);
        return rows[0];  
    }
    // const query = 'SELECT * FROM library_members WHERE user_id = $1 AND user_type = $2 AND is_active = TRUE';
    // const { rows } = await pool.query(query, [userId, userType]);
    // return rows[0];
  }

  static async findByMembershipNumber(membershipNumber) {
    const query = 'SELECT * FROM library_members WHERE membership_number = $1 AND is_active = TRUE';
    const { rows } = await pool.query(query, [membershipNumber]);
    return rows[0];
  }

  static async create({ user_id, user_type, membership_number, membership_start, membership_end, max_books }) {
    const query = `
      INSERT INTO library_members 
        (user_id, user_type, membership_number, membership_start, membership_end, max_books)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [user_id, user_type, membership_number, membership_start, membership_end, max_books]);
    return rows[0];
  }

  static async getCheckoutCount(memberId) {
    const query = `
      SELECT COUNT(*) 
      FROM checkouts 
      WHERE member_id = $1 AND status = 'Checked Out';
    `;
    const { rows } = await pool.query(query, [memberId]);
    return parseInt(rows[0].count);
  }
   static async findAll() {
    const query = `
      SELECT 
	    lm.*,
	    CASE 
	        WHEN lm.user_type = 'student' THEN s.full_name 
	        ELSE u.fullname 
	    END as user_name,
	    u.email as user_email
	FROM library_members lm
	LEFT JOIN users u ON 
	    CASE 
	        WHEN lm.user_type = 'student' THEN u.id = (SELECT user_id FROM students WHERE id = lm.user_id)
	        ELSE u.id = lm.user_id 
	    END
	LEFT JOIN students s ON lm.user_id = s.id AND lm.user_type = 'student'
	WHERE lm.is_active = TRUE
	ORDER BY lm.created_at DESC;
    `;
    const { rows } = await pool.query(query);
    return rows;
  }
  static async findById(id) {
  const query = `
    SELECT 
      lm.*,
      CASE 
        WHEN lm.user_type = 'Student' THEN s.full_name 
        ELSE u.fullname 
      END as user_name,
      u.email as user_email
    FROM library_members lm
    LEFT JOIN users u ON 
      CASE 
        WHEN lm.user_type = 'student' THEN u.id = (SELECT user_id FROM students WHERE id = lm.user_id)
        ELSE u.id = lm.user_id 
      END
    LEFT JOIN students s ON lm.user_id = s.id AND lm.user_type = 'Student'
    WHERE lm.id = $1
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
  }
  static async deActiveMember(id) {
     const query = 'UPDATE library_members SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *';
    const { rows } = await pool.query(query, [id]);
    return rows;
  }
}

class Checkout {
  static async create({ book_copy_id, member_id, checkout_date, due_date, created_by }) {
    const query = `
      INSERT INTO checkouts 
        (book_copy_id, member_id, checkout_date, due_date, created_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [book_copy_id, member_id, checkout_date, due_date, created_by]);
    return rows[0];
  }

  static async findByMember(memberId) {
    const query = `
      SELECT c.*, b.title, b.author, bc.barcode
      FROM checkouts c
      JOIN book_copies bc ON c.book_copy_id = bc.id
      JOIN books b ON bc.book_id = b.id
      WHERE c.member_id = $1
      ORDER BY c.due_date;
    `;
    const { rows } = await pool.query(query, [memberId]);
    return rows;
  }

  static async returnBook(checkoutId, returnDate) {
    const query = `
      UPDATE checkouts
      SET return_date = $1, status = 'Returned', updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [returnDate, checkoutId]);
    return rows[0];
  }

  static async findOverdue() {
    const query = `
      SELECT c.*, b.title, b.author, bc.barcode, m.membership_number
      FROM checkouts c
      JOIN book_copies bc ON c.book_copy_id = bc.id
      JOIN books b ON bc.book_id = b.id
      JOIN library_members m ON c.member_id = m.id
      WHERE c.due_date < CURRENT_DATE AND c.status = 'Checked Out';
    `;
    const { rows } = await pool.query(query);
    return rows;
  }
  static async findActive() {
    const query = `
      SELECT 
        c.*, 
        b.title, 
        b.author, 
        bc.barcode,
        m.membership_number,
        m.user_id,
        CASE 
          WHEN m.user_type = 'Student' THEN s.full_name 
          ELSE u.fullname 
        END as user_name
      FROM checkouts c
      JOIN book_copies bc ON c.book_copy_id = bc.id
      JOIN books b ON bc.book_id = b.id
      JOIN library_members m ON c.member_id = m.id
      LEFT JOIN users u ON 
        CASE 
          WHEN m.user_type = 'student' THEN u.id = (SELECT user_id FROM students WHERE id = m.user_id)
          ELSE u.id = m.user_id 
        END
      LEFT JOIN students s ON m.user_id = s.id AND m.user_type = 'Student'
      WHERE c.status = 'Checked Out' and c.due_date>=current_date
      ORDER BY c.due_date;
    `;
    const { rows } = await pool.query(query);
    return rows;
  }
}

class Reservation {
  static async create({ book_id, member_id, reservation_date, expiry_date }) {
    const query = `
      INSERT INTO reservations 
        (book_id, member_id, reservation_date, expiry_date)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [book_id, member_id, reservation_date, expiry_date]);
    return rows[0];
  }

  static async findByMember(memberId) {
    const query = `
      SELECT r.*, b.title, b.author
      FROM reservations r
      JOIN books b ON r.book_id = b.id
      WHERE r.member_id = $1 AND r.status = 'Pending'
      ORDER BY r.reservation_date;
    `;
    const { rows } = await pool.query(query, [memberId]);
    return rows;
  }

  static async fulfill(reservationId, checkoutId) {
    const query = `
      UPDATE reservations
      SET status = 'Fulfilled', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [reservationId]);
    return rows[0];
  }
}

class Fine {
  static async create({ checkout_id, member_id, amount, reason }) {
    const query = `
      INSERT INTO fines 
        (checkout_id, member_id, amount, reason)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [checkout_id, member_id, amount, reason]);
    return rows[0];
  }

  static async findByMember(memberId) {
    const query = `
      SELECT f.*, b.title, c.due_date
      FROM fines f
      JOIN checkouts c ON f.checkout_id = c.id
      JOIN book_copies bc ON c.book_copy_id = bc.id
      JOIN books b ON bc.book_id = b.id
      WHERE f.member_id = $1 AND f.status = 'Unpaid'
      ORDER BY f.created_at;
    `;
    const { rows } = await pool.query(query, [memberId]);
    return rows;
  }

  static async payFine(fineId, paymentDate, paymentReference) {
    const query = `
      UPDATE fines
      SET status = 'Paid', payment_date = $1, payment_reference = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [paymentDate, paymentReference, fineId]);
    return rows[0];
  }
}
class AdminStats {
  static async getDashboardStats() {
    try {
      // Execute all queries in parallel for better performance
      const [
        totalBooksResult,
        totalMembersResult,
        activeCheckoutsResult,
        overdueBooksResult,
        pendingReservationsResult,
        unpaidFinesResult
      ] = await Promise.all([
        pool.query('SELECT COUNT(*) FROM books WHERE is_active = TRUE'),
        pool.query('SELECT COUNT(*) FROM library_members WHERE is_active = TRUE'),
        pool.query('SELECT COUNT(*) FROM checkouts WHERE status = \'Checked Out\''),
        pool.query('SELECT COUNT(*) FROM checkouts WHERE due_date < CURRENT_DATE AND status = \'Checked Out\''),
        pool.query('SELECT COUNT(*) FROM reservations WHERE status = \'Pending\''),
        pool.query('SELECT COALESCE(SUM(amount), 0) as total_unpaid FROM fines WHERE status = \'Unpaid\'')
      ]);

      return {
        totalBooks: parseInt(totalBooksResult.rows[0].count),
        totalMembers: parseInt(totalMembersResult.rows[0].count),
        activeCheckouts: parseInt(activeCheckoutsResult.rows[0].count),
        overdueBooks: parseInt(overdueBooksResult.rows[0].count),
        pendingReservations: parseInt(pendingReservationsResult.rows[0].count),
        unpaidFines: parseFloat(unpaidFinesResult.rows[0].total_unpaid)
      };
    } catch (error) {
      throw new Error(`Failed to fetch dashboard stats: ${error.message}`);
    }
  }
}
export { Book, BookCopy, LibraryMember, Checkout, Reservation, Fine, AdminStats };