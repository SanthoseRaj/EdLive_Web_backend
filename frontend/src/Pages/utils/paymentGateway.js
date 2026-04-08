export const initiateRazorpayPayment = async (amount, currency = 'INR', options = {}) => {
  return new Promise((resolve, reject) => {
    const rzpOptions = {
      key: process.env.REACT_APP_RAZORPAY_KEY_ID,
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      name: "EDLive",
      description: "School Fee Payment",
      image: "https://your-school-logo.png",
      theme: {
        color: "#6C2CA4"
      },
      handler: function(response) {
        resolve(response);
      },
      modal: {
        ondismiss: function() {
          reject(new Error("Payment closed by user"));
        }
      },
      ...options
    };

    const rzp = new window.Razorpay(rzpOptions);
    rzp.open();
  });
};

export const initiateTestUPIPayment = async (upiId, amount, note) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        transactionId: `TXN${Date.now()}`,
        upiId,
        amount,
        note
      });
    }, 1500);
  });
};