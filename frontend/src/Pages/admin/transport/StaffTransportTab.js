// transport/StaffTransportTab.js
import React, { useState, useEffect } from "react";

const StaffTransportTab = ({ staffTransports, onAssignStaff, onRefresh }) => {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [formData, setFormData] = useState({
    staff_id: '',
    assignment_id: '',
    pickup_stop: '',
    dropoff_stop: '',
    is_active: true
  });

  // Fetch staff list and assignments from API when modal opens
  useEffect(() => {
    if (showAssignModal) {
      fetchStaffList();
      fetchAssignments();
    }
  }, [showAssignModal]);

  const fetchStaffList = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/master/staff`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      // Filter out staff who are already assigned to transport
      const assignedStaffIds = new Set(staffTransports.map(transport => transport.staff_id));
      const availableStaff = data.filter(staff => !assignedStaffIds.has(staff.id));
      
      setStaffList(availableStaff);
    } catch (error) {
      console.error('Error fetching staff list:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    setAssignmentsLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/transport/buses`, {
        credentials: 'include'
      });
      const data = await response.json();
      setAssignments(data);
    } catch (error) {
      console.error('Error fetching transport assignments:', error);
    } finally {
      setAssignmentsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onAssignStaff(formData);
    
    if (success) {
      setShowAssignModal(false);
      setFormData({
        staff_id: '',
        assignment_id: '',
        pickup_stop: '',
        dropoff_stop: '',
        is_active: true
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Staff Transport Assignments</h2>
        <div className="space-x-2">
          <button 
            onClick={onRefresh}
            className="btn btn-outline btn-primary"
          >
            Refresh
          </button>
          <button 
            onClick={() => setShowAssignModal(true)}
            className="btn btn-primary"
          >
            Assign Staff
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Staff ID</th>
              <th>Staff Name</th>
              <th>Bus</th>
              <th>Route</th>
              <th>Pickup Stop</th>
              <th>Dropoff Stop</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staffTransports.map((transport) => (
              <tr key={transport.id}>
                <td className="font-semibold">{transport.staff_id}</td>
                <td>{transport.staff_name}</td>
                <td>{transport.bus_number}</td>
                <td>{transport.route_name}</td>
                <td>{transport.pickup_stop}</td>
                <td>{transport.dropoff_stop}</td>
                <td>
                  <span className={`badge ${transport.is_active ? 'badge-success' : 'badge-error'}  p-2`}>
                    {transport.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button className="btn btn-sm btn-outline btn-primary">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Assign Staff to Transport</h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text">Select Staff</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={formData.staff_id}
                    onChange={(e) => setFormData({...formData, staff_id: parseInt(e.target.value)})}
                    required
                    disabled={loading}
                  >
                    <option value="">Select Staff</option>
                    {staffList.length > 0 ? (
                      staffList.map(staff => (
                        <option key={staff.id} value={staff.id}>
                          {staff.full_name} (ID: {staff.id})
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        {loading ? 'Loading...' : 'No available staff to assign'}
                      </option>
                    )}
                  </select>
                  {loading && <span className="loading loading-spinner loading-xs ml-2"></span>}
                  {!loading && staffList.length === 0 && (
                    <p className="text-sm text-warning mt-1">All staff members are already assigned to transport.</p>
                  )}
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Transport Assignment</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={formData.assignment_id}
                    onChange={(e) => setFormData({...formData, assignment_id: parseInt(e.target.value)})}
                    required
                    disabled={assignmentsLoading}
                  >
                    <option value="">Select Assignment</option>
                    {assignments.length > 0 ? (
                      assignments.map(assignment => (
                        <option key={assignment.id} value={assignment.id}>
                          {assignment.bus_number} - {assignment.route_name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        {assignmentsLoading ? 'Loading assignments...' : 'No transport assignments available'}
                      </option>
                    )}
                  </select>
                  {assignmentsLoading && <span className="loading loading-spinner loading-xs ml-2"></span>}
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Pickup Stop</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={formData.pickup_stop}
                    onChange={(e) => setFormData({...formData, pickup_stop: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Dropoff Stop</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={formData.dropoff_stop}
                    onChange={(e) => setFormData({...formData, dropoff_stop: e.target.value})}
                    required
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
                    <span className="label-text">Active</span>
                  </label>
                </div>
              </div>
              <div className="modal-action">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={staffList.length === 0 || assignments.length === 0}
                >
                  Assign Staff
                </button>
                <button 
                  type="button" 
                  className="btn"
                  onClick={() => setShowAssignModal(false)}
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

export default StaffTransportTab;