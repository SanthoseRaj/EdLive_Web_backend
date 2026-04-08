import * as pta from "../models/pta.model.js";
import * as commonCommunication from "../models/common.model.js"
import commonUtil from "../utils/commonUtils.js";

export const createMeeting = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      created_by: req.user.id
    };
    const meeting = await pta.createMeeting(payload);
    res.status(201).json(meeting);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getUpcomingMeetings = async (req, res) => {
  try {
    const meetings = await pta.getUpcomingMeetings();
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMeetingHistory = async (req, res) => {
  try {
    const meetings = await pta.getMeetingHistory();
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPTAMembers = async (req, res) => {
  try {
    const members = await pta.getPTAMembers();
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const announceMeeting = async (req, res) => {
  try {

    if (!req.is('application/json')) {
      return res.status(400).json({ error: 'Content-Type must be application/json' });
    }
    const { meetingId, class_ids, include_all_sections, channels } = req.body;

    // Validate required fields
    if (!meetingId || !channels) {
      return res.status(400).json({ error: 'meetingId and channels are required' });
    }
    
    // Get recipients based on class_ids and sections
    const recipientsResult  = await commonCommunication.getParentCommunication({
            ids:class_ids,
            communicationtype:"classes"
          });
          // Extract the rows array from the query result
    const recipients = recipientsResult.rows || [];
          
    // Prepare message
    const meeting = await pta.getMeetingDetails(meetingId);
    const message = `PTA Meeting Announcement\nDate: ${meeting.date}\nTime: ${meeting.time}\nFor: ${meeting.classes.join(', ')}\n${meeting.description}`;
    
    // Send announcements
    const results = await Promise.all(
      recipients.map(recipient => {
        // Ensure recipient has required fields
        if (!recipient.student_id) {
          console.warn('Recipient missing student_id:', recipient);
          return {
            status: 'failed',
            error: 'Recipient missing student_id',
            recipient
          };
        }

        return commonUtil.sendViaChannels({
          recipientId: recipient.student_id,
          recipientName: recipient.guardian_name || recipient.father_name || recipient.mother_name || 'Parent/Guardian',
          phone: recipient.guardian_contact || recipient.father_contact || recipient.mother_contact,
          email: recipient.guardian_email || recipient.father_email || recipient.mother_email,
          message_text: message,
          is_appreciation: false,
          channels,
          updateStatusFn: pta.updateAnnouncementStatus,
          communicationId: null
        });
      })
    );
    
    res.json({ success: true, results });
  } catch (error) {
     console.error('Error in announceMeeting:', error);
    if (error instanceof SyntaxError) {
      res.status(400).json({ error: 'Invalid JSON in request body' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};