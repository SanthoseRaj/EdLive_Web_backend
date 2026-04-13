import { Book, BookCopy, LibraryMember, Checkout, Reservation, Fine, AdminStats } from '../models/library.model.js';

// #region Books
export const getBooks = async (req, res) => {
  try {
    const books = await Book.findAll();
    res.json({ success: true, data: books });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const searchBooks = async (req, res) => {
  try {
    const { title, author, isbn, genre } = req.query;
    const books = await Book.search({ title, author, isbn, genre });
    res.json({ success: true, data: books });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getBookDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }
    
    const copies = await BookCopy.findByBook(id);
    res.json({ success: true, data: { ...book, copies } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const addBook = async (req, res) => {
  try {
    const { title, author, isbn, publisher, publication_year, genre, quantity, location } = req.body;
    const book = await Book.create({ title, author, isbn, publisher, publication_year, genre, quantity, location });
    res.status(201).json({ success: true, data: book });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const book = await Book.update(id, updates);
    res.json({ success: true, data: book });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const addBookCopy = async (req, res) => {
  try {
    const { book_id, barcode, condition } = req.body;
    const copy = await BookCopy.create({ book_id, barcode, condition });
    res.status(201).json({ success: true, data: copy });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
// #endregion

// #region Members
export const getMemberStatus = async (req, res) => {
  try {
    const { id, usertype } = req.user; // Assuming user is authenticated
    const member = await LibraryMember.findByUser(id, usertype);
    if (!member) {
      return res.status(404).json({ success: false, error: 'Library membership not found' });
    }
    
    const checkouts = await Checkout.findByMember(member.id);
    const reservations = await Reservation.findByMember(member.id);
    const fines = await Fine.findByMember(member.id);
    
    res.json({ 
      success: true, 
      data: { 
        member, 
        checkouts, 
        reservations, 
        fines,
        checkoutCount: checkouts.length,
        reservationCount: reservations.length,
        fineAmount: fines.reduce((sum, fine) => sum + parseFloat(fine.amount), 0)
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
// #endregion
// #region CreateMember
export const createMember = async (req, res) => {
  try {
    const { user_id, user_type, membership_number, membership_start, membership_end, max_books } = req.body;
    
    // Validate required fields
    if (!user_id || !user_type || !membership_number || !membership_start) {
      return res.status(400).json({ 
        success: false, 
        error: 'user_id, user_type, membership_number, and membership_start are required' 
      });
    }

    // Validate user_type
    const validUserTypes = ['Student', 'Teacher', 'Staff Admin','Librarian','Food Admin'];
    if (!validUserTypes.includes(user_type)) {
      return res.status(400).json({ 
        success: false, 
        error: 'user_type must be one of: student, faculty, staff' 
      });
    }

    // Check if membership number already exists
    const existingMember = await LibraryMember.findByMembershipNumber(membership_number);
    if (existingMember) {
      return res.status(400).json({ 
        success: false, 
        error: 'Membership number already exists' 
      });
    }

    // Check if user already has an active membership
    const existingUserMember = await LibraryMember.findByUser(user_id, user_type);
    if (existingUserMember) {
      return res.status(400).json({ 
        success: false, 
        error: 'User already has an active library membership' 
      });
    }

    // Create member
    const member = await LibraryMember.create({
      user_id,
      user_type,
      membership_number,
      membership_start,
      membership_end,
      max_books: max_books || 5
    });

    res.status(201).json({ success: true, data: member });
  } catch (error) {
    if (error.code === '23505') { // PostgreSQL unique violation
      return res.status(400).json({ 
        success: false, 
        error: 'Membership number already exists' 
      });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};
// #endregion CreateMember
export const getAllMembers = async (req, res) => {
  try {
    const members = await LibraryMember.findAll();
    res.json({ success: true, data: members });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
// #region Checkouts
export const checkoutBook = async (req, res) => {
  try {
    const { book_copy_id, member_id, checkout_date, due_date } = req.body;
    const created_by = req.user.id; // Staff ID who processed the checkout
    const user_type = req.user.usertype;
    
    // Check if member exists
    const member = await LibraryMember.findByMemberId(member_id, user_type);
    if (!member) {
      return res.status(400).json({ success: false, error: 'Invalid member ID' });
    }
    
    // Check if member has reached max books limit
    const checkoutCount = await LibraryMember.getCheckoutCount(member.id);
    if (checkoutCount >= member.max_books) {
      return res.status(400).json({ 
        success: false, 
        error: `Member has reached maximum checkout limit of ${member.max_books} books` 
      });
    }
    
    // Check if book copy is available
    const copy = await BookCopy.findById(book_copy_id);
    if (!copy || copy.status !== 'Available') {
      return res.status(400).json({ success: false, error: 'Book copy is not available for checkout' });
    }
    
    // Create checkout record
    const checkout = await Checkout.create({ 
      book_copy_id, 
      member_id: member.id, 
      checkout_date, 
      due_date, 
      created_by 
    });
    
    // Update book copy status
    await BookCopy.updateStatus(book_copy_id, 'Checked Out');
    
    res.status(201).json({ success: true, data: checkout });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const returnBook = async (req, res) => {
  try {
    const { id } = req.params;
    const returnDate = new Date().toISOString().split('T')[0]; // Current date
    
    // Update checkout record
    const checkout = await Checkout.returnBook(id, returnDate);
    if (!checkout) {
      return res.status(404).json({ success: false, error: 'Checkout record not found' });
    }
    
    // Update book copy status
    await BookCopy.updateStatus(checkout.book_copy_id, 'Available');
    
    res.json({ success: true, data: checkout });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getMemberCheckouts = async (req, res) => {
  try {
    const { member_id } = req.params;
    const checkouts = await Checkout.findByMember(member_id);
    res.json({ success: true, data: checkouts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getOverdueBooks = async (req, res) => {
  try {
    const overdueBooks = await Checkout.findOverdue();
    res.json({ success: true, data: overdueBooks });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
// #endregion

// #region Reservations
export const reserveBook = async (req, res) => {
  try {
    const { book_id, member_id, expiry_date } = req.body;
    const reservation_date = new Date().toISOString().split('T')[0]; // Current date
    
    // Check if member exists
    const member = await LibraryMember.findByUser(member_id, req.user.usertype);
    if (!member) {
      return res.status(400).json({ success: false, error: 'Invalid member ID' });
    }
    
    // Check if book exists
    const book = await Book.findById(book_id);
    if (!book) {
      return res.status(400).json({ success: false, error: 'Invalid book ID' });
    }
    
    // Check if book has available copies
    const copies = await BookCopy.findByBook(book_id);
    const availableCopies = copies.filter(copy => copy.status === 'Available');
    if (availableCopies.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Book has available copies - no need to reserve' 
      });
    }
    
    // Create reservation
    const reservation = await Reservation.create({ 
      book_id, 
      member_id: member.id, 
      reservation_date, 
      expiry_date 
    });
    
    res.status(201).json({ success: true, data: reservation });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const fulfillReservation = async (req, res) => {
  try {
    const { reservation_id } = req.params;
    const { book_copy_id, member_id, checkout_date, due_date } = req.body;
    const created_by = req.user.id; // Staff ID who processed the checkout
    
    // Fulfill reservation
    await Reservation.fulfill(reservation_id);
    
    // Create checkout record
    const checkout = await Checkout.create({ 
      book_copy_id, 
      member_id, 
      checkout_date, 
      due_date, 
      created_by 
    });
    
    // Update book copy status
    await BookCopy.updateStatus(book_copy_id, 'Checked Out');
    
    res.status(201).json({ success: true, data: checkout });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getMemberReservations = async (req, res) => {
  try {
    const { member_id } = req.params;
    const reservations = await Reservation.findByMember(member_id);
    res.json({ success: true, data: reservations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
// #endregion

// #region Fines
export const addFine = async (req, res) => {
  try {
    const { checkout_id, member_id, amount, reason } = req.body;
    
    const fine = await Fine.create({ 
      checkout_id, 
      member_id, 
      amount, 
      reason 
    });
    
    // Update checkout status if fine is for lost book
    if (reason === 'Lost') {
      await Checkout.update(checkout_id, { status: 'Lost' });
    }
    
    res.status(201).json({ success: true, data: fine });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const payFine = async (req, res) => {
  try {
    const { fine_id } = req.params;
    const { payment_reference } = req.body;
    const payment_date = new Date().toISOString().split('T')[0]; // Current date
    
    const fine = await Fine.payFine(fine_id, payment_date, payment_reference);
    res.json({ success: true, data: fine });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getMemberFines = async (req, res) => {
  try {
    const { member_id } = req.params;
    const fines = await Fine.findByMember(member_id);
    res.json({ success: true, data: fines });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
// #endregion
export const getAdminDashboardStats = async (req, res) => {
  try {
    const stats = await AdminStats.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getMemberStatusById = async (req, res) => {
  try {
    const { member_id } = req.query;
    
    if (!member_id) {
      return res.status(400).json({ success: false, error: 'Member ID is required' });
    }
    
    const member = await LibraryMember.findById(member_id);
    if (!member) {
      return res.status(404).json({ success: false, error: 'Member not found' });
    }
    
    const checkouts = await Checkout.findByMember(member_id);
    const reservations = await Reservation.findByMember(member_id);
    const fines = await Fine.findByMember(member_id);
    
    res.json({ 
      success: true, 
      data: { 
        member, 
        checkouts, 
        reservations, 
        fines,
        checkoutCount: checkouts.filter(c => c.status === 'Checked Out').length,
        reservationCount: reservations.filter(r => r.status === 'Pending').length,
        fineAmount: fines.filter(f => f.status === 'Unpaid').reduce((sum, fine) => sum + parseFloat(fine.amount), 0)
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
export const deactivateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await LibraryMember.deActiveMember(id);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Member not found' });
    }
    
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
export const activateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await LibraryMember.activateMember(id);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Member not found' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
export const getActiveCheckouts = async (req, res) => {
  try {
    const checkouts = await Checkout.findActive();
    res.json({ success: true, data: checkouts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAvailableBookCopies = async (req, res) => {
  try {
    const copies = await BookCopy.findAvailable();
    res.json({ success: true, data: copies });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
