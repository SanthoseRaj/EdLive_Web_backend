import * as transportModel from "../models/transport.model.js";

export const createBus = async (req, res) => {
  try {
    const { bus_number, registration_number, capacity, year_of_manufacture } = req.body;
    const bus = await transportModel.createBus({
      bus_number,
      registration_number,
      capacity,
      year_of_manufacture
    });
    res.status(201).json(bus);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const createRoute = async (req, res) => {
  try {
    const { name, description, start_point, end_point } = req.body;
    const route = await transportModel.createRoute({
      name,
      description,
      start_point,
      end_point
    });
    res.status(201).json(route);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const addRouteStop = async (req, res) => {
  try {
    const { route_id, stop_name, stop_order, arrival_time, latitude, longitude } = req.body;
    const stop = await transportModel.addRouteStop({
      route_id,
      stop_name,
      stop_order,
      arrival_time,
      latitude,
      longitude
    });
    res.status(201).json(stop);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const createDriver = async (req, res) => {
  try {
    const { user_id, name, contact_number, license_number, license_expiry } = req.body;
    const driver = await transportModel.createDriver({
      user_id,
      name,
      contact_number,
      license_number,
      license_expiry
    });
    res.status(201).json(driver);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const assignBus = async (req, res) => {
  try {
    const { bus_id, route_id, driver_id, academic_year, is_active } = req.body;
    const assignment = await transportModel.assignBus({
      bus_id,
      route_id,
      driver_id,
      academic_year,
      is_active: is_active !== false
    });
    res.status(201).json(assignment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const assignStudentTransport = async (req, res) => {
  try {
    const { student_id, assignment_id, stop_id, academic_year } = req.body;
    const assignment = await transportModel.assignStudentTransport({
      student_id,
      assignment_id,
      stop_id,
      academic_year
    });
    res.status(201).json(assignment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const assignStaffTransport = async (req, res) => {
  try {
    const { staff_id, assignment_id, stop_id, academic_year } = req.body;
    const assignment = await transportModel.assignStaffTransport({
      staff_id,
      assignment_id,
      stop_id,
      academic_year
    });
    res.status(201).json(assignment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getBusDetails = async (req, res) => {
  try {
    const { bus_id } = req.params;
    const bus = await transportModel.getBusDetails(bus_id);
    if (!bus) {
      return res.status(404).json({ error: 'Bus not found' });
    }
    res.json(bus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getRouteDetails = async (req, res) => {
  try {
    const { route_id } = req.params;
    const route = await transportModel.getRouteDetails(route_id);
    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }
    res.json(route);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getStudentTransport = async (req, res) => {
  try {
    const { student_id, academic_year } = req.params;
    const transport = await transportModel.getStudentTransportDetails(student_id, academic_year);
    if (!transport) {
      return res.status(404).json({ error: 'Transport details not found' });
    }
    res.json(transport);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllStudentTransport = async (req, res) => {
  try {
    const {  academic_year } = req.params;
    const transport = await transportModel.getAllStudentTransportDetails( academic_year);
    if (!transport) {
      return res.status(404).json({ error: 'Transport details not found' });
    }
    res.json(transport);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getStaffTransport = async (req, res) => {
  try {
    const { staff_id, academic_year } = req.params;
    const transport = await transportModel.getStaffTransportDetails(staff_id, academic_year);
    if (!transport) {
      return res.status(404).json({ error: 'Transport details not found' });
    }
    res.json(transport);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllStaffTransport = async (req, res) => {
  try {
    const {  academic_year } = req.params;
    const transport = await transportModel.getAllStaffTransportDetails( academic_year);
    if (!transport) {
      return res.status(404).json({ error: 'Transport details not found' });
    }
    res.json(transport);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const listBuses = async (req, res) => {
  try {
    const buses = await transportModel.getAllBuses();
    res.json(buses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const listRoutes = async (req, res) => {
  try {
    const routes = await transportModel.getAllRoutes();
    res.json(routes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Get all drivers
export const listDrivers = async (req, res) => {
  try {
    const drivers = await transportModel.getAllDrivers();
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get driver details
export const getDriverDetails = async (req, res) => {
  try {
    const { driver_id } = req.params;
    const driver = await transportModel.getDriverById(driver_id);
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    res.json(driver);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update driver
export const updateDriver = async (req, res) => {
  try {
    const { driver_id } = req.params;
    const { name, contact_number, license_number, license_expiry } = req.body;
    const driver = await transportModel.updateDriver(driver_id, {
      name,
      contact_number,
      license_number,
      license_expiry
    });
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    res.json(driver);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete driver
export const deleteDriver = async (req, res) => {
  try {
    const { driver_id } = req.params;
    const driver = await transportModel.deleteDriver(driver_id);
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    res.json({ message: 'Driver deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all assignments
export const listAssignments = async (req, res) => {
  try {
    const assignments = await transportModel.getAllAssignments();
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get assignment details
export const getAssignmentDetails = async (req, res) => {
  try {
    const { assignment_id } = req.params;
    const assignment = await transportModel.getAssignmentById(assignment_id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update assignment
export const updateAssignment = async (req, res) => {
  try {
    const { assignment_id } = req.params;
    const { bus_id, route_id, driver_id, academic_year, is_active } = req.body;
    const assignment = await transportModel.updateAssignment(assignment_id, {
      bus_id,
      route_id,
      driver_id,
      academic_year,
      is_active: is_active !== false
    });
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    res.json(assignment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete assignment
export const deleteAssignment = async (req, res) => {
  try {
    const { assignment_id } = req.params;
    const assignment = await transportModel.deleteAssignment(assignment_id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update bus
export const updateBus = async (req, res) => {
  try {
    const { bus_id } = req.params;
    const { bus_number, registration_number, capacity, year_of_manufacture } = req.body;
    const bus = await transportModel.updateBus(bus_id, {
      bus_number,
      registration_number,
      capacity,
      year_of_manufacture
    });
    if (!bus) {
      return res.status(404).json({ error: 'Bus not found' });
    }
    res.json(bus);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete bus
export const deleteBus = async (req, res) => {
  try {
    const { bus_id } = req.params;
    const bus = await transportModel.deleteBus(bus_id);
    if (!bus) {
      return res.status(404).json({ error: 'Bus not found' });
    }
    res.json({ message: 'Bus deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update route
export const updateRoute = async (req, res) => {
  try {
    const { route_id } = req.params;
    const { name, description, start_point, end_point } = req.body;
    const route = await transportModel.updateRoute(route_id, {
      name,
      description,
      start_point,
      end_point
    });
    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }
    res.json(route);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete route
export const deleteRoute = async (req, res) => {
  try {
    const { route_id } = req.params;
    const route = await transportModel.deleteRoute(route_id);
    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }
    res.json({ message: 'Route deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get route stops
export const getRouteStops = async (req, res) => {
  try {
    const { route_id } = req.params;
    const stops = await transportModel.getRouteStops(route_id);
    res.json(stops);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update route stop
export const updateRouteStop = async (req, res) => {
  try {
    const { stop_id } = req.params;
    const { stop_name, stop_order, arrival_time, latitude, longitude } = req.body;
    const stop = await transportModel.updateRouteStop(stop_id, {
      stop_name,
      stop_order,
      arrival_time,
      latitude,
      longitude
    });
    if (!stop) {
      return res.status(404).json({ error: 'Route stop not found' });
    }
    res.json(stop);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete route stop
export const deleteRouteStop = async (req, res) => {
  try {
    const { stop_id } = req.params;
    const stop = await transportModel.deleteRouteStop(stop_id);
    if (!stop) {
      return res.status(404).json({ error: 'Route stop not found' });
    }
    res.json({ message: 'Route stop deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};