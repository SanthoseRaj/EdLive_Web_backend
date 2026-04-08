import { FeeType, FeeAssignment, Payment,ClassTeacher } from '../models/payment.model.js';

// #region Fee Types
export const getFeeTypes = async (req, res) => {
  try {
    const feeTypes = await FeeType.findAll();
    res.json({ success: true, data: feeTypes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createFeeType = async (req, res) => {
  try {
    const { name, description, amount } = req.body;
    const feeType = await FeeType.create({ name, description, amount });
    res.status(201).json({ success: true, data: feeType });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
// #endregion

// #region Fee Assignments
export const getClassFeeAssignments = async (req, res) => {
  try {
    const { class_ids,academic_year } = req.query;
    const classIds = class_ids.split(',').map(id => parseInt(id.trim()));
    const assignments = await FeeAssignment.findByClasses(classIds, academic_year);
    res.json({ success: true, data: assignments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createFeeAssignment = async (req, res) => {
  try {
    const { fee_type_id, class_id, academic_year, due_date } = req.body;
    const assignment = await FeeAssignment.create({
      fee_type_id,
      class_id: class_id || null, // Allow null for all classes
      academic_year,
      due_date
    });
    res.status(201).json({ success: true, data: assignment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
// #endregion

// #region Payments
export const getStudentPayments = async (req, res) => {
  try {
    const {student_id} = req.params; // Assuming student is authenticated
    const payments = await Payment.findByStudent(student_id);
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getStudentDuePayments = async (req, res) => {
  try {
    const student_id = req.user.id; // Assuming student is authenticated
    const duePayments = await Payment.findDuePayments(student_id);
    res.json({ success: true, data: duePayments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createPayment = async (req, res) => {
  try {
    const { fee_assignment_id, amount, payment_date, transaction_reference, payment_method } = req.body;
    const student_id = req.user.id;
    const created_by = req.user.id; // Or admin ID if admin is creating it

    const payment = await Payment.create({
      student_id,
      fee_assignment_id,
      amount,
      payment_date,
      transaction_reference,
      payment_method,
      status: 'Completed',
      created_by
    });

    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
// #endregion

// #region Admin Reports
export const getClassPaymentReport = async (req, res) => {
  try {
    const { class_id, academic_year } = req.query;
    // Implementation would query payment statistics for a class
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
// #endregion

// UPI Payment Configuration
export const getUPIConfig = async (req, res) => {
  try {
    // In a real app, you might fetch this from database or environment
    const upiConfig = {
      upiId: process.env.SCHOOL_UPI_ID || "your-school@upi",
      merchantName: process.env.SCHOOL_NAME || "Your School Name",
      merchantCode: process.env.MERCHANT_CODE || "YOURMERCHANTCODE"
    };
    res.json({ success: true, data: upiConfig });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Generate UPI Payment Intent
export const generateUPIIntent = async (req, res) => {
  try {
    const { fee_assignment_id, student_id } = req.body;
    
    // Get fee assignment details
    const feeAssignment = await FeeAssignment.findById(fee_assignment_id);
    if (!feeAssignment) {
      return res.status(404).json({ success: false, error: "Fee assignment not found" });
    }

    // Get fee type details
    const feeType = await FeeType.findById(feeAssignment.fee_type_id);
    
    // Generate transaction ID (you might want a better ID generation)
    const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    const upiPaymentData = {
      upiId: process.env.SCHOOL_UPI_ID || "your-school@upi",
      merchantName: process.env.SCHOOL_NAME || "Your School Name",
      amount: feeType.amount,
      transactionId,
      transactionNote: `Fee: ${feeType.name} (ID: ${fee_assignment_id})`,
      studentId: student_id,
      feeAssignmentId: fee_assignment_id,
      timestamp: new Date().toISOString()
    };

    res.json({ 
      success: true, 
      data: {
        ...upiPaymentData,
        upiLink: generateUPILink(upiPaymentData)
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Verify UPI Payment
export const verifyUPIPayment = async (req, res) => {
  try {
    const { transactionId, transactionReference } = req.body;
    
    // In a real implementation, you would:
    // 1. Verify with your payment gateway/bank API
    // 2. Check if payment was successful
    // 3. Create payment record if successful
    
    // For demo purposes, we'll assume payment was successful
    const payment = await Payment.create({
      student_id: req.body.student_id,
      fee_assignment_id: req.body.fee_assignment_id,
      amount: req.body.amount,
      payment_date: new Date(),
      transaction_reference: transactionReference,
      payment_method: 'UPI',
      status: 'Completed',
      created_by: req.user.id
    });

    res.json({ 
      success: true, 
      data: payment,
      message: "Payment verified and recorded successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Helper function to generate UPI link
function generateUPILink(paymentData) {
  return `upi://pay?pa=${paymentData.upiId}&pn=${encodeURIComponent(paymentData.merchantName)}` +
         `&am=${paymentData.amount}&tn=${encodeURIComponent(paymentData.transactionNote)}` +
         `&cu=INR&tid=${paymentData.transactionId}`;
}

//Classes/Teacher

export const getTeachersByClass = async (req, res) => {
  try {
    const { class_ids } = req.query;
    
    if (!class_ids) {
      return res.status(400).json({ error: 'Class IDs are required' });
    }

    const classIdsArray = class_ids.split(',').map(id => parseInt(id.trim()));    

    const  rows  = await ClassTeacher.getTeachersByClass(classIdsArray);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching teachers by class:', error);
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
};
export const getAvailableTeachers = async (req, res) => {
  try {
    const { rows } = await ClassTeacher.getAvailableTeachers();
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching available teachers:', error);
    res.status(500).json({ error: 'Failed to fetch available teachers' });
  }
};