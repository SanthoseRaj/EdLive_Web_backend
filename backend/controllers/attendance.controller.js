import * as AttendanceModel from "../models/attendance.model.js";

export const getAttendanceByClass= async (req, res) => {
    try {
      const { classId, date } = req.query;
      const data = await AttendanceModel.getByClassAndDate(classId, date);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
}
export const getAttendanceByStudent= async (req, res) => {
    try {
      const { studentId, date } = req.query;
      const data = await AttendanceModel.getByStudentAndDate(studentId, date);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
}
 export const toggleAttendance= async (req, res) => {
  try {
    const { studentId, classId, date, session, isPresent } = req.body;
    const markedById = req.user.id; // from auth middleware

    await AttendanceModel.createIfNotExists({ studentId, classId, date });

    const updated = await AttendanceModel.toggleAttendance({
      studentId,
      date,
      session,
      isPresent,
      markedById
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
export const getMonthlySummary = async (req, res) => {
  try {
    const { classId, startDate, endDate } = req.query;

    if (!classId || !startDate || !endDate) {
      return res.status(400).json({ error: "Missing required query parameters." });
    }

    const summary = await AttendanceModel.getMonthlySummary(classId, startDate, endDate);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const getMonthlyStudentSummary = async (req, res) => {
  try {
    const { studentId, startDate, endDate } = req.query;

    if (!studentId || !startDate || !endDate) {
      return res.status(400).json({ error: "Missing required query parameters." });
    }

    const summary = await AttendanceModel.getMonthlyStudentSummary(studentId, startDate, endDate);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAdminAttendance = async (req, res) => {
  try {
    const { classId, className, startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Missing required dates (startDate, endDate)." });
    }

    const stats = await AttendanceModel.getAdminAttendanceStats({ 
      classId, 
      className, 
      startDate, 
      endDate 
    });
    
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};