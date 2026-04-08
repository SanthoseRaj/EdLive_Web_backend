import * as parentCommunications from "../models/messages.model.js";
import * as commonCommunication from "../models/common.model.js"
//import sendWhatsAppMessage from "../utils/whatsappUtils.js";
//import sendGmail from "../utils/emailUtils.js";
import commonUtil from "../utils/commonUtils.js";
//import pool from "../db/connectDB-pg.js";

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

// const sendViaChannels = async ({
//   recipientId,
//   recipientName,
//   phone,
//   email,
//   message_text,
//   is_appreciation,
//   channels,
//   updateStatusFn,
//   communicationId
// }) => {
//   const results = {};

//   if (channels.includes('whatsapp') && phone) {
//     try {
//       const whatsappResult = await sendWhatsAppMessage({
//         to: phone,
//         message: message_text
//       });
//       await updateStatusFn(
//         communicationId,
//         'whatsapp',
//         whatsappResult.status === 'success' ? 'sent' : 'failed'
//       );
//       results.whatsapp = whatsappResult;
//     } catch (error) {
//       results.whatsapp = { status: 'failed', error: error.message };
//       await updateStatusFn(
//         communicationId,
//         'whatsapp',
//         'failed'
//       );
//     }
//   }

//   if (channels.includes('email') && email) {
//     try {
//       const emailResult = await sendGmail({
//         to: email,
//         subject: is_appreciation ? 'Appreciation Message from School' : 'Message from School',
//         htmlContent: `<p>${message_text.replace(/\n/g, '<br>')}</p>`
//       });
//       await updateStatusFn(
//         communicationId,
//         'email',
//         emailResult.status === 'success' ? 'sent' : 'failed'
//       );
//       results.email = emailResult;
//     } catch (error) {
//       results.email = { status: 'failed', error: error.message };
//       await updateStatusFn(
//         communicationId,
//         'email',
//         'failed'
//       );
//     }
//   }

//   return {
//     recipient_id: recipientId,
//     recipient_name: recipientName,
//     channels: results
//   };
// };

/**
 * Sends a communication to parent/guardian
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */

export const sendParentCommunication = async (req, res) => {
  try {
    const { student_id, message_text, is_appreciation, is_meeting_request, meeting_date, channels } = req.body;
    
    // Create communication record
    const message_type = is_appreciation ? 'appreciation' : 
                       (is_meeting_request ? 'meeting_request' : 'general');
    
    const communication = await parentCommunications.createParentCommunication({
      student_id,
      sender_id: req.user.id,
      message_type,
      message_text,
      is_appreciation,
      is_meeting_request,
      meeting_date
    });

    // Get parent/guardian contact info
    // const parentInfoQuery = `
    //   SELECT 
    //     father_name, father_contact, father_email,
    //     mother_name, mother_contact, mother_email,
    //     guardian_name, guardian_contact, guardian_email
    //   FROM student_parent_info
    //   WHERE student_id = $1;
    // `;
    const { rows: [parentInfo] } = await commonCommunication.getParentCommunication({
        ids:student_id,
        communicationtype:"students"
      });

    // Determine recipient (prefer guardian if available)
    const recipient = {
      name: parentInfo.guardian_name || parentInfo.father_name || parentInfo.mother_name,
      phone: parentInfo.guardian_contact || parentInfo.father_contact || parentInfo.mother_contact,
      email: parentInfo.guardian_email || parentInfo.father_email || parentInfo.mother_email
    };



    // Send via selected channels
    const results = {};
    
     const result = await commonUtil.sendViaChannels({
      recipientId: student_id,
      recipientName: recipient.name,
      phone: recipient.phone,
      email: recipient.email,
      message_text,
      is_appreciation,
      channels,
      updateStatusFn: parentCommunications.updateCommunicationStatus,
      communicationId: communication.id
    });

    // SMS would be similar to WhatsApp implementation

    res.status(201).json({
      communication,
      result
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/**
 * Sends a communication to all students in one or more classes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const sendClassCommunication = async (req, res) => {
  try {
    const { class_ids, message_text, is_appreciation, is_meeting_request, meeting_date, channels } = req.body;
    
    const results = [];
const message_type = is_appreciation ? 'appreciation' : 
                       (is_meeting_request ? 'meeting_request' : 'general');
    
      // Get all students in the class
      // const studentsQuery = `
      //   SELECT s.id student_id,
      //     father_name, father_contact, father_email,
      //     mother_name, mother_contact, mother_email,
      //     guardian_name, guardian_contact, guardian_email
      // FROM students s 
      // left JOIN student_parent_info a ON s.id = a.student_id
      // WHERE class_id =ANY($1::int[]);
      // `;
      const { rows: students } = await commonCommunication.getParentCommunication({
        ids:class_ids,
        communicationtype:"classes"
      });
    
    // Create class communication record for each class
    //const message_type = is_appreciation ? 'appreciation' : 'general';
    
    
    for (const student of students) {
      const classCommunication = await parentCommunications.createParentCommunication({
        student_id:student.student_id,
        sender_id: req.user.id,
        message_type,
        message_text,
        is_appreciation,
      is_meeting_request,
      meeting_date
      });

    const recipient = {
          name: student.guardian_name || student.father_name || student.mother_name,
          phone: student.guardian_contact || student.father_contact || student.mother_contact,
          email: student.guardian_email || student.father_email || student.mother_email
        };
      // Send to each student using common function
      const classResults = {
        student_id:student.student_id,
        communication_id: classCommunication.id,
        student_results: []
      };

      //for (const student of students) {
        const studentResult = await commonUtil.sendViaChannels({
          recipientId: student.student_id,
          recipientName: recipient.name,
          phone: recipient.phone,
          email: recipient.email,
          message_text,
          is_appreciation,
          channels,
          updateStatusFn:  parentCommunications.updateCommunicationStatus,
          communicationId: classCommunication.id
        });

        classResults.student_results.push(studentResult);
      //}

      results.push(classResults);
    }

    res.status(201).json({
      results
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Gets all communications for a student
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getStudentCommunications = async (req, res) => {
  try {
    const { student_id } = req.params;
    const communications = await parentCommunications.getCommunicationsByStudent(student_id);
    res.json(communications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Gets all communications for a student
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getCommunicationsBySender = async (req, res) => {
  try {
    const  sender_id  = req.user.id;
    const communications = await parentCommunications.getCommunicationsBySender(sender_id);
    res.json(communications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};