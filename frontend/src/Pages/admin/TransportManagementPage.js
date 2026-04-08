// TransportManagementPage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BusesTab from "./transport/BusesTab.js";
import RoutesTab from "./transport/RoutesTab.js";
import DriversTab from "./transport/DriversTab.js";
import AssignmentsTab from "./transport/AssignmentsTab.js";
import StudentTransportTab from "./transport/StudentTransportTab.js";
import StaffTransportTab from "./transport/StaffTransportTab.js";

const TransportManagementPage = () => {
  const [activeTab, setActiveTab] = useState("buses");
  const [loading, setLoading] = useState(true);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [studentTransports, setStudentTransports] = useState([]);
  const [staffTransports, setStaffTransports] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    
    if (activeTab === "buses") {
      fetchBuses();
    } else if (activeTab === "routes") {
      fetchRoutes();
    } else if (activeTab === "drivers") {
      fetchDrivers();
    } else if (activeTab === "assignments") {
      fetchAssignments();
    } else if (activeTab === "students") {
      fetchStudentTransports();
    } else if (activeTab === "staff") {
      fetchStaffTransports();
    }
  }, [activeTab]);

  const fetchBuses = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/transport/buses`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setBuses(data);
      }
    } catch (error) {
      console.error('Failed to fetch buses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoutes = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/transport/routes`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setRoutes(data);
      }
    } catch (error) {
      console.error('Failed to fetch routes:', error);
    } finally {
      setLoading(false);
    }
  };

  // In TransportManagementPage.js - fix the fetchDrivers function
const fetchDrivers = async () => {
  try {
    console.log('Fetching drivers from:', `${process.env.REACT_APP_API_URL}/api/transport/drivers`);
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/transport/drivers`, {
      method: 'GET',
      credentials: 'include'
    });
    
    console.log('Drivers response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      setDrivers(data || []);
    } else {
      setDrivers([]); // Set empty array on error
    }
  } catch (error) {
    setDrivers([]); // Set empty array on error
  } finally {
    setLoading(false); // This was missing!
  }
};

  const fetchAssignments = async () => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/transport/assignments`, {
      method: 'GET',
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Assignments data received:', data); // Debug log
      setAssignments(data);
    } else {
      console.error('Failed to fetch assignments. Status:', response.status);
      setAssignments([]);
    }
  } catch (error) {
    console.error('Failed to fetch assignments:', error);
    setAssignments([]);
  } finally {
    setLoading(false); // This was missing!
  }
};

  const fetchStudentTransports = async () => {
  try {
    console.log('Fetching student transports...');
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/transport/student-transports/2025-2026`, {
      method: 'GET',
      credentials: 'include'
    });
    
    console.log('Student transports response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Student transports raw data received:', data);
      
      // Handle different response formats
      let transports = [];
      
      if (Array.isArray(data)) {
        // If it's an array, use it directly
        transports = data.map(item => ({
          id: item.id,
          student_id: item.student_id,
          student_name: item.full_name || item.student_name,
          bus_number: item.bus_number,
          route_name: item.route_name,
          pickup_stop: item.stop_name || item.pickup_stop,
          dropoff_stop: item.stop_name || item.dropoff_stop, // Adjust as needed
          fee_amount: item.fee_amount || 0,
          is_active: true // Default to true if not provided
        }));
      } else if (data && typeof data === 'object') {
        // If it's a single object, wrap it in an array
        transports = [{
          id: data.id,
          student_id: data.student_id || 0, // You might need to get student_id from somewhere
          student_name: data.full_name,
          bus_number: data.bus_number,
          route_name: data.route_name,
          pickup_stop: data.stop_name,
          dropoff_stop: data.stop_name, // Adjust as needed
          fee_amount: data.fee_amount || 0,
          is_active: true
        }];
      }
      
      console.log('Processed student transports:', transports);
      setStudentTransports(transports);
      
    } else {
      console.error('Failed to fetch student transports. Status:', response.status);
      setStudentTransports([]);
    }
  } catch (error) {
    console.error('Failed to fetch student transports:', error);
    setStudentTransports([]);
  } finally {
    setLoading(false);
  }
};

  const fetchStaffTransports = async () => {
  try {
    console.log('Fetching staff transports...');
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/transport/staff-transports/2025-2026`, {
      method: 'GET',
      credentials: 'include'
    });
    
    console.log('Staff transports response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Staff transports raw data received:', data);
      
      // Handle different response formats
      let transports = [];
      
      if (Array.isArray(data)) {
        // If it's an array, transform each item
        transports = data.map(item => ({
          id: item.id,
          staff_id: item.staff_id || 0, // You might need to get staff_id from somewhere
          staff_name: item.full_name || item.staff_name,
          bus_number: item.bus_number,
          route_name: item.route_name,
          pickup_stop: item.stop_name || item.pickup_stop,
          dropoff_stop: item.stop_name || item.dropoff_stop, // Adjust as needed
          is_active: true // Default to true if not provided
        }));
      } else if (data && typeof data === 'object') {
        // If it's a single object, wrap it in an array
        transports = [{
          id: data.id,
          staff_id: data.staff_id || 0,
          staff_name: data.full_name,
          bus_number: data.bus_number,
          route_name: data.route_name,
          pickup_stop: data.stop_name,
          dropoff_stop: data.stop_name, // Adjust as needed
          is_active: true
        }];
      }
      
      console.log('Processed staff transports:', transports);
      setStaffTransports(transports);
      
    } else {
      console.error('Failed to fetch staff transports. Status:', response.status);
      setStaffTransports([]);
    }
  } catch (error) {
    console.error('Failed to fetch staff transports:', error);
    setStaffTransports([]);
  } finally {
    setLoading(false);
  }
};

  // Bus CRUD operations
  const handleCreateBus = async (busData) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/transport/buses`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(busData)
      });

      if (response.ok) {
        fetchBuses();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to create bus:', error);
      return false;
    }
  };

  const handleUpdateBus = async (busId, busData) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/transport/buses/${busId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(busData)
      });

      if (response.ok) {
        fetchBuses();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update bus:', error);
      return false;
    }
  };

  const handleDeleteBus = async (busId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/transport/buses/${busId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        fetchBuses();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to delete bus:', error);
      return false;
    }
  };

  // Route CRUD operations
  const handleCreateRoute = async (routeData) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/transport/routes`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(routeData)
      });

      if (response.ok) {
        fetchRoutes();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to create route:', error);
      return false;
    }
  };

  const handleUpdateRoute = async (routeId, routeData) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/transport/routes/${routeId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(routeData)
      });

      if (response.ok) {
        fetchRoutes();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update route:', error);
      return false;
    }
  };

  const handleDeleteRoute = async (routeId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/transport/routes/${routeId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        fetchRoutes();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to delete route:', error);
      return false;
    }
  };

  // Driver CRUD operations
  const handleCreateDriver = async (driverData) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/transport/drivers`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(driverData)
      });

      if (response.ok) {
        fetchDrivers();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to create driver:', error);
      return false;
    }
  };
const handleUpdateDriver = async (driverId, driverData) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/transport/drivers/${driverId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(driverData)
      });

      if (response.ok) {
        fetchDrivers();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update driver:', error);
      return false;
    }
  };

  const handleDeleteDriver = async (driverId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/transport/drivers/${driverId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        fetchDrivers();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to delete driver:', error);
      return false;
    }
  };

  // Assignment CRUD operations
  const handleCreateAssignment = async (assignmentData) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/transport/assignments`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(assignmentData)
      });

      if (response.ok) {
        fetchAssignments();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to create assignment:', error);
      return false;
    }
  };

  const handleUpdateAssignment = async (assignmentId, assignmentData) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/transport/assignments/${assignmentId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(assignmentData)
      });

      if (response.ok) {
        fetchAssignments();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update assignment:', error);
      return false;
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/transport/assignments/${assignmentId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        fetchAssignments();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to delete assignment:', error);
      return false;
    }
  };

  // Student Transport operations
  const handleAssignStudentTransport = async (studentTransportData) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/transport/assignments/students`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(studentTransportData)
      });

      if (response.ok) {
        fetchStudentTransports();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to assign student transport:', error);
      return false;
    }
  };

  // Staff Transport operations
  const handleAssignStaffTransport = async (staffTransportData) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/transport/assignments/staff`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(staffTransportData)
      });

      if (response.ok) {
        fetchStaffTransports();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to assign staff transport:', error);
      return false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white py-8">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-indigo-100 mb-4 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <div className="flex justify-between items-end">
            <div>
          <h1 className="text-3xl font-bold mb-2">Transport Management</h1>
          <h2 className="text-2xl font-semibold">Manage buses, routes, and transport assignments</h2>
            </div>
          </div>
          </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <div className="tabs tabs-boxed bg-white p-1 rounded-lg mb-6 flex overflow-x-auto">
          <button
            className={`tab tab-lg whitespace-nowrap ${activeTab === 'buses' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('buses')}
          >
            Buses
          </button>
          <button
            className={`tab tab-lg whitespace-nowrap ${activeTab === 'routes' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('routes')}
          >
            Routes
          </button>
          <button
            className={`tab tab-lg whitespace-nowrap ${activeTab === 'drivers' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('drivers')}
          >
            Drivers
          </button>
          <button
            className={`tab tab-lg whitespace-nowrap ${activeTab === 'assignments' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('assignments')}
          >
            Assignments
          </button>
          <button
            className={`tab tab-lg whitespace-nowrap ${activeTab === 'students' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            Student Transport
          </button>
          <button
            className={`tab tab-lg whitespace-nowrap ${activeTab === 'staff' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('staff')}
          >
            Staff Transport
          </button>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'buses' && (
          <BusesTab
            buses={buses}
            onCreateBus={handleCreateBus}
            onUpdateBus={handleUpdateBus}
            onDeleteBus={handleDeleteBus}
            onRefresh={fetchBuses}
          />
        )}

        {activeTab === 'routes' && (
          <RoutesTab
            routes={routes}
            onCreateRoute={handleCreateRoute}
            onUpdateRoute={handleUpdateRoute}
            onDeleteRoute={handleDeleteRoute}
            onRefresh={fetchRoutes}
          />
        )}

        {activeTab === 'drivers' && (
          <DriversTab
            drivers={drivers}
            onCreateDriver={handleCreateDriver}
            onUpdateDriver={handleUpdateDriver}
            onDeleteDriver={handleDeleteDriver}
            onRefresh={fetchDrivers}
          />
        )}

        {activeTab === 'assignments' && (
          <AssignmentsTab
            assignments={assignments}
            buses={buses}
            routes={routes}
            drivers={drivers}
            onCreateAssignment={handleCreateAssignment}
            onUpdateAssignment={handleUpdateAssignment}
            onDeleteAssignment={handleDeleteAssignment}
            onRefresh={fetchAssignments}
          />
        )}

        {activeTab === 'students' && (
          <StudentTransportTab
            studentTransports={studentTransports}
            assignments={assignments}
            onAssignStudent={handleAssignStudentTransport}
            onRefresh={fetchStudentTransports}
          />
        )}

        {activeTab === 'staff' && (
          <StaffTransportTab
            staffTransports={staffTransports}
            assignments={assignments}
            onAssignStaff={handleAssignStaffTransport}
            onRefresh={fetchStaffTransports}
          />
        )}
      </div>
    </div>
  );
};

export default TransportManagementPage;