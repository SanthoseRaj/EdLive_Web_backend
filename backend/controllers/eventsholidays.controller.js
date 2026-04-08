import * as eventsHolidays from "../models/eventsholidays.model.js";

export const createEventHoliday = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      created_by: req.user.id
    };
    const eventHoliday = await eventsHolidays.createEventHoliday(payload);
    res.status(201).json(eventHoliday);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getEventsHolidaysByMonth = async (req, res) => {
  try {
    const { year, month } = req.params;
    const events = await eventsHolidays.getEventsHolidaysByMonth(year, month);
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const approveEventHoliday = async (req, res) => {
  try {
    const eventHoliday = await eventsHolidays.approveEventHoliday(
      req.params.id,
      req.user.id
    );
    res.json(eventHoliday);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteEventHoliday = async (req, res) => {
  try {
    const eventHoliday = await eventsHolidays.deleteEventHoliday(req.params.id);
    if (!eventHoliday) {
      return res.status(404).json({ error: 'Event/Holiday not found' });
    }
    res.json({ message: 'Event/Holiday deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};