// transport/AssignmentsTab.js (Updated with API fetching for routes and drivers)
import React, { useState, useEffect } from "react";

const AssignmentsTab = ({ assignments, buses, onCreateAssignment, onUpdateAssignment, onDeleteAssignment, onRefresh }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [routesLoading, setRoutesLoading] = useState(false);
  const [driversLoading, setDriversLoading] = useState(false);
  const [formData, setFormData] = useState({
    bus_id: '',
    route_id: '',
    driver_id: '',
    academic_year: new Date().getFullYear().toString(),
    is_active: true
  });

  // Fetch routes and drivers when modal opens
  useEffect(() => {
    if (showCreateModal) {
      fetchRoutes();
      fetchDrivers();
    }
  }, [showCreateModal]);

  const fetchRoutes = async () => {
    setRoutesLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/transport/routes`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setRoutes(data);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
    } finally {
      setRoutesLoading(false);
    }
  };

  const fetchDrivers = async () => {
    setDriversLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/transport/drivers`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setDrivers(data);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
    } finally {
      setDriversLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = editingAssignment 
      ? await onUpdateAssignment(editingAssignment.id, formData)
      : await onCreateAssignment(formData);
    
    if (success) {
      setShowCreateModal(false);
      setEditingAssignment(null);
      setFormData({
        bus_id: '',
        route_id: '',
        driver_id: '',
        academic_year: new Date().getFullYear().toString(),
        is_active: true
      });
    }
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      bus_id: assignment.bus_id,
      route_id: assignment.route_id,
      driver_id: assignment.driver_id,
      academic_year: assignment.academic_year,
      is_active: assignment.is_active
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (assignmentId) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      await onDeleteAssignment(assignmentId);
    }
  };

  // Show loading state for assignments
  if (!assignments) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-center items-center h-32">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Bus Assignments</h2>
        <div className="space-x-2">
          <button 
            onClick={onRefresh}
            className="btn btn-outline btn-primary"
          >
            Refresh
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            New Assignment
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Bus</th>
              <th>Route</th>
              <th>Driver</th>
              <th>Academic Year</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-500">
                  No assignments found.
                </td>
              </tr>
            ) : (
              assignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td className="font-semibold">{assignment.bus_number}</td>
                  <td>{assignment.route_name}</td>
                  <td>{assignment.driver_name}</td>
                  <td>{assignment.academic_year}</td>
                  <td>
                    <span className={`badge ${assignment.is_active ? 'badge-success' : 'badge-error'}  p-2`}>
                      {assignment.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEdit(assignment)}
                        className="btn btn-sm btn-outline btn-primary"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(assignment.id)}
                        className="btn btn-sm btn-outline btn-error"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text">Bus *</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={formData.bus_id}
                    onChange={(e) => setFormData({...formData, bus_id: parseInt(e.target.value)})}
                    required
                  >
                    <option value="">Select Bus</option>
                    {buses.map(bus => (
                      <option key={bus.id} value={bus.id}>
                        {bus.bus_number} - {bus.registration_number}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Route *</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={formData.route_id}
                    onChange={(e) => setFormData({...formData, route_id: parseInt(e.target.value)})}
                    required
                    disabled={routesLoading}
                  >
                    <option value="">Select Route</option>
                    {routes.length > 0 ? (
                      routes.map(route => (
                        <option key={route.id} value={route.id}>
                          {route.name} ({route.start_point} - {route.end_point})
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        {routesLoading ? 'Loading routes...' : 'No routes available'}
                      </option>
                    )}
                  </select>
                  {routesLoading && <span className="loading loading-spinner loading-xs ml-2"></span>}
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Driver *</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={formData.driver_id}
                    onChange={(e) => setFormData({...formData, driver_id: parseInt(e.target.value)})}
                    required
                    disabled={driversLoading}
                  >
                    <option value="">Select Driver</option>
                    {drivers.length > 0 ? (
                      drivers.map(driver => (
                        <option key={driver.id} value={driver.id}>
                          {driver.name} - {driver.license_number}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        {driversLoading ? 'Loading drivers...' : 'No drivers available'}
                      </option>
                    )}
                  </select>
                  {driversLoading && <span className="loading loading-spinner loading-xs ml-2"></span>}
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Academic Year *</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={formData.academic_year}
                    onChange={(e) => setFormData({...formData, academic_year: e.target.value})}
                    required
                    placeholder="e.g., 2024-2025"
                  />
                </div>
                <div className="form-control">
                  <label className="label cursor-pointer justify-start">
                    <input
                      type="checkbox"
                      className="checkbox mr-2"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    />
                    <span className="label-text">Active Assignment</span>
                  </label>
                </div>
              </div>
              <div className="modal-action">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={routes.length === 0 || drivers.length === 0}
                >
                  {editingAssignment ? 'Update Assignment' : 'Create Assignment'}
                </button>
                <button 
                  type="button" 
                  className="btn"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingAssignment(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentsTab;