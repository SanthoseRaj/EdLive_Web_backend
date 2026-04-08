// utils/whatsappUtils.js
import twilio from 'twilio';

/**
 * Sends a WhatsApp message via Twilio API
 * @param {Object} params
 * @param {string} params.to - Recipient phone number in E.164 format
 * @param {string} params.message - The message content
 * @param {string} [params.mediaUrl] - Optional media URL
 * @returns {Object} Returns status object
 */
async function sendWhatsAppMessage({ to, message, mediaUrl }) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID || 'your_account_sid';
  const authToken = process.env.TWILIO_AUTH_TOKEN || 'your_auth_token';
  const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';
  const service = 'Twilio WhatsApp';

  try {
    const client = twilio(accountSid, authToken);

    const messageData = {
      body: message,
      from: whatsappNumber,
      to: `whatsapp:+91${to.replace(/^whatsapp:/, '')}`
    };

    if (mediaUrl) {
      messageData.mediaUrl = [mediaUrl];
    }

    const result = await client.messages.create(messageData);

    return {
      status: 'success',
      messageSid: result.sid,
      service: service,
      timestamp: result.dateCreated,
      to: result.to
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message,
      service: service,
      code: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
  }
}

export default sendWhatsAppMessage;