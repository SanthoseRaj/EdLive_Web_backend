import sendWhatsAppMessage from "./whatsappUtils.js";
import sendGmail from "./emailUtils.js";
import sendtextMessage from "./messageUtils.js";


/**
 * Common function to send communication via multiple channels
 * @param {Object} options
 * @param {number} options.recipientId - Student ID
 * @param {string} options.recipientName - Student name
 * @param {string} options.phone - Phone number
 * @param {string} options.email - Email address
 * @param {string} options.message_text - Message content
 * @param {boolean} options.is_appreciation - Is appreciation message
 * @param {Array} options.channels - Channels to send through
 * @param {function} options.updateStatusFn - Function to update status
 * @param {number} options.communicationId - Communication record ID
 * @returns {Object} Results for each channel
 */

const sendViaChannels = async ({
  recipientId,
  recipientName,
  phone,
  email,
  message_text,
  is_appreciation,
  channels,
  updateStatusFn,
  communicationId
}) => {
  const results = {};

  if (channels.includes('whatsapp') && phone) {
    try {
      const whatsappResult = await sendWhatsAppMessage({
        to: phone,
        message: message_text
      });
      await updateStatusFn(
        communicationId,
        'whatsapp',
        whatsappResult.status === 'success' ? 'sent' : 'failed'
      );
      results.whatsapp = whatsappResult;
    } catch (error) {
      results.whatsapp = { status: 'failed', error: error.message };
      await updateStatusFn(
        communicationId,
        'whatsapp',
        'failed'
      );
    }
  }

  if (channels.includes('sms') && phone) {
    try {
      const textResult = await sendtextMessage({
        to: phone,
        message: message_text
      });
      await updateStatusFn(
        communicationId,
        'sms',
        textResult.status === 'success' ? 'sent' : 'failed'
      );
      results.textResult = textResult;
    } catch (error) {
      results.textResult = { status: 'failed', error: error.message };
      await updateStatusFn(
        communicationId,
        'sms',
        'failed'
      );
    }
  }

  if (channels.includes('email') && email) {
    try {
      const emailResult = await sendGmail({
        to: email,
        subject: is_appreciation ? 'Appreciation Message from School' : 'Message from School',
        htmlContent: `<p>${message_text.replace(/\n/g, '<br>')}</p>`
      });
      await updateStatusFn(
        communicationId,
        'email',
        emailResult.status === 'success' ? 'sent' : 'failed'
      );
      results.email = emailResult;
    } catch (error) {
      results.email = { status: 'failed', error: error.message };
      await updateStatusFn(
        communicationId,
        'email',
        'failed'
      );
    }
  }

  return {
    recipient_id: recipientId,
    recipient_name: recipientName,
    channels: results
  };
};
const commonUtil = {
  sendViaChannels
};

export default commonUtil;
