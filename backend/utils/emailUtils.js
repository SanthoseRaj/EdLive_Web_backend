// utils/emailUtils.js
import nodemailer from 'nodemailer';

/**
 * Sends an email through Gmail
 * @param {Object} params
 * @param {string} params.to - Recipient email address
 * @param {string} params.subject - Email subject
 * @param {string} params.htmlContent - Email content in HTML format
 * @param {string} [params.textContent] - Plain text alternative (optional)
 * @returns {Object} Returns an object with status, messageId, and service info
 */
async function sendGmail({ to, subject, htmlContent, textContent }) {
  const gmailUser = process.env.GMAIL_USERNAME || 'school@example.com';
  const gmailFrom = process.env.GMAIL_FROM || `School App <${gmailUser}>`;
  const service = 'Gmail';

  // Create plain text fallback if not provided
  const plainText = textContent || htmlContent.replace(/<[^>]*>/g, '');

  try {
    const transporter = nodemailer.createTransport({
      service: service,
      auth: {
        user: gmailUser,
        pass: process.env.GMAIL_PASSWORD || 'your-app-password'
      },
  tls: {
    rejectUnauthorized: false // Only for testing, remove in production
  }
    });

    const mailOptions = {
      from: gmailFrom,
      to: to,
      subject: subject,
      text: plainText,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      status: 'success',
      messageId: info.messageId,
      service: service,
      accepted: info.accepted,
      rejected: info.rejected
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message,
      service: service,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
  }
}

export default sendGmail;