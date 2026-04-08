// utils/upiUtils.js

/**
 * Generates a UPI payment link
 * @param {Object} params
 * @param {number} params.feeAssignmentId - The fee assignment ID
 * @param {string} params.feeName - The name of the fee
 * @param {number} params.amount - The amount to pay
 * @returns {Object} Returns an object with upiLink and transactionId
 */
function generateUPIPaymentLink({ feeAssignmentId, feeName, amount }) {
  const upiId = process.env.SCHOOL_UPI_ID || "default@upi";
  const merchantName = process.env.SCHOOL_NAME || "School Name";
  const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
  
  const upiLink = `upi://pay?pa=${upiId}` +
    `&pn=${encodeURIComponent(merchantName)}` +
    `&am=${amount}` +
    `&tn=${encodeURIComponent(`Fee: ${feeName} (ID: ${feeAssignmentId})`)}` +
    `&cu=INR` +
    `&tid=${transactionId}`;

  return {
    upiLink,
    transactionId,
    upiId,
    merchantName
  };
}

export default generateUPIPaymentLink;