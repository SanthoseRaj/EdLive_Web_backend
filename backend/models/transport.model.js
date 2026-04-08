import pool from "../db/connectDB-pg.js";

const createBus = async ({ bus_number, registration_number, capacity, year_of_manufacture }) => {
  const query = `
    INSERT INTO transport_buses 
    (bus_number, registration_number, capacity, year_of_manufacture)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [bus_number, registration_number, capacity, year_of_manufacture];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

// Update bus
const updateBus = async (bus_id, { bus_number, registration_number, capacity, year_of_manufacture }) => {
  const query = `
    UPDATE transport_buses 
    SET bus_number = $1, registration_number = $2, capacity = $3, year_of_manufacture = $4
    WHERE id = $5
    RETURNING *;
  `;
  const values = [bus_number, registration_number, capacity, year_of_manufacture, bus_id];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

// Delete bus
const deleteBus = async (bus_id) => {
  const query = 'DELETE FROM transport_buses WHERE id = $1 RETURNING *;';
  const { rows } = await pool.query(query, [bus_id]);
  return rows[0];
};

const createRoute = async ({ name, description, start_point, end_point }) => {
  const query = `
    INSERT INTO bus_routes 
    (name, description, start_point, end_point)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [name, description, start_point, end_point];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

// Update route
const updateRoute = async (route_id, { name, description, start_point, end_point }) => {
  const query = `
    UPDATE bus_routes 
    SET name = $1, description = $2, start_point = $3, end_point = $4
    WHERE id = $5
    RETURNING *;
  `;
  const values = [name, description, start_point, end_point, route_id];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

// Delete route
const deleteRoute = async (route_id) => {
  const query = 'DELETE FROM bus_routes WHERE id = $1 RETURNING *;';
  const { rows } = await pool.query(query, [route_id]);
  return rows[0];
};

const addRouteStop = async ({ route_id, stop_name, stop_order, arrival_time, latitude, longitude }) => {
  const query = `
    INSERT INTO bus_route_stops 
    (route_id, stop_name, stop_order, arrival_time, latitude, longitude)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  const values = [route_id, stop_name, stop_order, arrival_time, latitude, longitude];
  const { rows } = await pool.query(query, values);
  return rows[0];
};
// Get route stops
const getRouteStops = async (route_id) => {
  const query = `
    SELECT *
    FROM bus_route_stops
    WHERE route_id = $1
    ORDER BY stop_order;
  `;
  const { rows } = await pool.query(query, [route_id]);
  return rows;
};

// Update route stop
const updateRouteStop = async (stop_id, { stop_name, stop_order, arrival_time, latitude, longitude }) => {
  const query = `
    UPDATE bus_route_stops 
    SET stop_name = $1, stop_order = $2, arrival_time = $3, latitude = $4, longitude = $5
    WHERE id = $6
    RETURNING *;
  `;
  const values = [stop_name, stop_order, arrival_time, latitude, longitude, stop_id];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

// Delete route stop
const deleteRouteStop = async (stop_id) => {
  const query = 'DELETE FROM bus_route_stops WHERE id = $1 RETURNING *;';
  const { rows } = await pool.query(query, [stop_id]);
  return rows[0];
};
const createDriver = async ({ user_id, name, contact_number, license_number, license_expiry }) => {
  const query = `
    INSERT INTO bus_drivers 
    (user_id, name, contact_number, license_number, license_expiry)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const values = [user_id, name, contact_number, license_number, license_expiry];
  const { rows } = await pool.query(query, values);
  return rows[0];
};
// Get all drivers
const getAllDrivers = async () => {
  const query = `
    SELECT 
      d.*,
      u.email as user_email
    FROM bus_drivers d
    LEFT JOIN users u ON d.user_id = u.id
    ORDER BY d.name;
  `;
  const { rows } = await pool.query(query);
  return rows;
};

// Get driver by ID
const getDriverById = async (driver_id) => {
  const query = `
    SELECT 
      d.*,
      u.email as user_email
    FROM bus_drivers d
    LEFT JOIN users u ON d.user_id = u.id
    WHERE d.id = $1;
  `;
  const { rows } = await pool.query(query, [driver_id]);
  return rows[0];
};

// Update driver
const updateDriver = async (driver_id, { name, contact_number, license_number, license_expiry }) => {
  const query = `
    UPDATE bus_drivers 
    SET name = $1, contact_number = $2, license_number = $3, license_expiry = $4
    WHERE id = $5
    RETURNING *;
  `;
  const values = [name, contact_number, license_number, license_expiry, driver_id];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

// Delete driver
const deleteDriver = async (driver_id) => {
  const query = 'DELETE FROM bus_drivers WHERE id = $1 RETURNING *;';
  const { rows } = await pool.query(query, [driver_id]);
  return rows[0];
};
const assignBus = async ({ bus_id, route_id, driver_id, academic_year, is_active }) => {
  const query = `
    INSERT INTO bus_assignments 
    (bus_id, route_id, driver_id, academic_year, is_active)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const values = [bus_id, route_id, driver_id, academic_year, is_active];
  const { rows } = await pool.query(query, values);
  return rows[0];
};
// Get all assignments
const getAllAssignments = async () => {
  const query = `
    SELECT 
      a.*,
      b.bus_number,
      r.name as route_name,
      d.name as driver_name
    FROM bus_assignments a
    LEFT JOIN transport_buses b ON a.bus_id = b.id
    LEFT JOIN bus_routes r ON a.route_id = r.id
    LEFT JOIN bus_drivers d ON a.driver_id = d.id
    ORDER BY a.academic_year DESC, a.id;
  `;
  const { rows } = await pool.query(query);
  return rows;
};

// Get assignment by ID
const getAssignmentById = async (assignment_id) => {
  const query = `
    SELECT 
      a.*,
      b.bus_number,
      b.registration_number,
      r.name as route_name,
      r.start_point,
      r.end_point,
      d.name as driver_name,
      d.contact_number as driver_contact
    FROM bus_assignments a
    LEFT JOIN transport_buses b ON a.bus_id = b.id
    LEFT JOIN bus_routes r ON a.route_id = r.id
    LEFT JOIN bus_drivers d ON a.driver_id = d.id
    WHERE a.id = $1;
  `;
  const { rows } = await pool.query(query, [assignment_id]);
  return rows[0];
};

// Update assignment
const updateAssignment = async (assignment_id, { bus_id, route_id, driver_id, academic_year, is_active }) => {
  const query = `
    UPDATE bus_assignments 
    SET bus_id = $1, route_id = $2, driver_id = $3, academic_year = $4, is_active = $5
    WHERE id = $6
    RETURNING *;
  `;
  const values = [bus_id, route_id, driver_id, academic_year, is_active, assignment_id];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

// Delete assignment
const deleteAssignment = async (assignment_id) => {
  const query = 'DELETE FROM bus_assignments WHERE id = $1 RETURNING *;';
  const { rows } = await pool.query(query, [assignment_id]);
  return rows[0];
};

const assignStudentTransport = async ({ student_id, assignment_id, stop_id, academic_year }) => {
  const query = `
    INSERT INTO student_transport 
    (student_id, assignment_id, stop_id, academic_year)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [student_id, assignment_id, stop_id, academic_year];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const assignStaffTransport = async ({ staff_id, assignment_id, stop_id, academic_year }) => {
  const query = `
    INSERT INTO staff_transport 
    (staff_id, assignment_id, stop_id, academic_year)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [staff_id, assignment_id, stop_id, academic_year];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const getBusDetails = async (bus_id) => {
  const query = `
    SELECT 
      b.id,
      b.bus_number,
      b.registration_number,
      b.capacity,
      b.year_of_manufacture,
      a.academic_year,
      r.name as route_name,
      d.name as driver_name,
      d.contact_number as driver_contact,
      (SELECT name FROM transport_managers ORDER BY id LIMIT 1) as manager_name,
      (SELECT contact_number FROM transport_managers ORDER BY id LIMIT 1) as manager_contact
    FROM transport_buses b
    LEFT JOIN bus_assignments a ON b.id = a.bus_id AND a.is_active = true
    LEFT JOIN bus_routes r ON a.route_id = r.id
    LEFT JOIN bus_drivers d ON a.driver_id = d.id
    WHERE b.id = $1;
  `;
  const { rows } = await pool.query(query, [bus_id]);
  return rows[0];
};

const getRouteDetails = async (route_id) => {
  const query = `
    SELECT 
      r.id,
      r.name,
      r.description,
      r.start_point,
      r.end_point,
      json_agg(
        json_build_object(
          'id', s.id,
          'stop_name', s.stop_name,
          'arrival_time', to_char(s.arrival_time, 'HH12:MI AM'),
          'latitude', s.latitude,
          'longitude', s.longitude
        ) ORDER BY s.stop_order
      ) as stops
    FROM bus_routes r
    LEFT JOIN bus_route_stops s ON r.id = s.route_id
    WHERE r.id = $1
    GROUP BY r.id;
  `;
  const { rows } = await pool.query(query, [route_id]);
  return rows[0];
};

const getStudentTransportDetails = async (student_id, academic_year) => {
  const query = `
    SELECT 
      st.id,
      b.bus_number,
      r.name as route_name,
      s.stop_name,
      to_char(s.arrival_time, 'HH12:MI AM') as arrival_time,
      d.name as driver_name,
      d.contact_number as driver_contact,
      (SELECT name FROM transport_managers ORDER BY id LIMIT 1) as manager_name,
      (SELECT contact_number FROM transport_managers ORDER BY id LIMIT 1) as manager_contact
    FROM student_transport st
    JOIN bus_assignments a ON st.assignment_id = a.id
    JOIN transport_buses b ON a.bus_id = b.id
    LEFT JOIN bus_routes r ON a.route_id = r.id
    LEFT JOIN bus_route_stops s ON st.stop_id = s.id
    LEFT JOIN bus_drivers d ON a.driver_id = d.id
    WHERE st.student_id = $1 AND st.academic_year = $2;
  `;
  const { rows } = await pool.query(query, [student_id, academic_year]);
  return rows[0];
};
const getAllStudentTransportDetails = async (academic_year) => {
  const query = `
    SELECT 
      st.id,
      sts.id student_id,
	  sts.full_name,
      b.bus_number,
      r.name as route_name,
      s.stop_name,
      to_char(s.arrival_time, 'HH12:MI AM') as arrival_time,
      d.name as driver_name,
      d.contact_number as driver_contact,
      (SELECT name FROM transport_managers ORDER BY id LIMIT 1) as manager_name,
      (SELECT contact_number FROM transport_managers ORDER BY id LIMIT 1) as manager_contact
    FROM student_transport st
    JOIN bus_assignments a ON st.assignment_id = a.id
    JOIN transport_buses b ON a.bus_id = b.id
	JOIN students sts on st.student_id=sts.id
    LEFT JOIN bus_routes r ON a.route_id = r.id
    LEFT JOIN bus_route_stops s ON st.stop_id = s.id
    LEFT JOIN bus_drivers d ON a.driver_id = d.id
    WHERE  st.academic_year = $1
  `;
  const { rows } = await pool.query(query, [ academic_year]);
  return rows;
}
const getStaffTransportDetails = async (staff_id, academic_year) => {
  const query = `
    SELECT 
      st.id,
      b.bus_number,
      r.name as route_name,
      s.stop_name,
      to_char(s.arrival_time, 'HH12:MI AM') as arrival_time,
      d.name as driver_name,
      d.contact_number as driver_contact,
      (SELECT name FROM transport_managers ORDER BY id LIMIT 1) as manager_name,
      (SELECT contact_number FROM transport_managers ORDER BY id LIMIT 1) as manager_contact
    FROM staff_transport st
    JOIN bus_assignments a ON st.assignment_id = a.id
    JOIN transport_buses b ON a.bus_id = b.id
    LEFT JOIN bus_routes r ON a.route_id = r.id
    LEFT JOIN bus_route_stops s ON st.stop_id = s.id
    LEFT JOIN bus_drivers d ON a.driver_id = d.id
    WHERE st.staff_id = $1 AND st.academic_year = $2;
  `;
  const { rows } = await pool.query(query, [staff_id, academic_year]);
  return rows[0];
};

const getAllStaffTransportDetails = async ( academic_year) => {
  const query = `
    SELECT 
      st.id,
	  sts.id staff_id,
	  sts.full_name staff_name,
      b.bus_number,
      r.name as route_name,
      s.stop_name,
      to_char(s.arrival_time, 'HH12:MI AM') as arrival_time,
      d.name as driver_name,
      d.contact_number as driver_contact,
      (SELECT name FROM transport_managers ORDER BY id LIMIT 1) as manager_name,
      (SELECT contact_number FROM transport_managers ORDER BY id LIMIT 1) as manager_contact
    FROM staff_transport st
    JOIN bus_assignments a ON st.assignment_id = a.id
    JOIN transport_buses b ON a.bus_id = b.id
	JOIN staff sts on st.staff_id=sts.id
    LEFT JOIN bus_routes r ON a.route_id = r.id
    LEFT JOIN bus_route_stops s ON st.stop_id = s.id
    LEFT JOIN bus_drivers d ON a.driver_id = d.id
    WHERE  st.academic_year = $1;
  `;
  const { rows } = await pool.query(query, [ academic_year]);
  return rows;
};

const getAllBuses = async () => {
  const query = `
    SELECT 
      b.id,
      b.bus_number,
      b.registration_number,
      b.capacity,
      a.academic_year,
      r.name as route_name,
      d.name as driver_name
    FROM transport_buses b
    LEFT JOIN bus_assignments a ON b.id = a.bus_id AND a.is_active = true
    LEFT JOIN bus_routes r ON a.route_id = r.id
    LEFT JOIN bus_drivers d ON a.driver_id = d.id
    ORDER BY b.bus_number;
  `;
  const { rows } = await pool.query(query);
  return rows;
};

const getAllRoutes = async () => {
  const query = `
    SELECT 
      r.id,
      r.name,
      r.start_point,
      r.end_point,
      COUNT(s.id) as stop_count,
      b.bus_number
    FROM bus_routes r
    LEFT JOIN bus_route_stops s ON r.id = s.route_id
    LEFT JOIN bus_assignments a ON r.id = a.route_id AND a.is_active = true
    LEFT JOIN transport_buses b ON a.bus_id = b.id
    GROUP BY r.id, b.bus_number
    ORDER BY r.name;
  `;
  const { rows } = await pool.query(query);
  return rows;
};

export {
  createBus,
  createRoute,
  addRouteStop,
  createDriver,
  assignBus,
  assignStudentTransport,
  assignStaffTransport,
  getBusDetails,
  getRouteDetails,
  getStudentTransportDetails,
  getStaffTransportDetails,
  getAllBuses,
  getAllRoutes,
  getAllDrivers,
  getDriverById,
  updateDriver,
  deleteDriver,
  getAllAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  updateBus,
  deleteBus,
  updateRoute,
  deleteRoute,
  getRouteStops,
  updateRouteStop,
  deleteRouteStop,
  getAllStudentTransportDetails,
  getAllStaffTransportDetails
};