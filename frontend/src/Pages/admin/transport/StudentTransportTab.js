// transport/StudentTransportTab.js
import React, { useState, useEffect } from "react";

const StudentTransportTab = ({ studentTransports, assignments, onAssignStudent, onRefresh }) => {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [studentList, setStudentList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    assignment_id: '',
    pickup_stop: '',
    dropoff_stop: '',
    fee_amount: '',
    is_active: true
  });

  // Fetch student list from API
  useEffect(() => {
    if (showAssignModal) {
      fetchStudentList();
    }
  }, [showAssignModal]);

  const fetchStudentList = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/master/students`, {
        credentials:'include'
      });
      const data = await response.json();
      
      // Filter out students who are already assigned to transport
      const assignedStudentIds = new Set(studentTransports.map(transport => transport.student_id));
      const availableStudents = data.filter(student => !assignedStudentIds.has(student.id));
      
      setStudentList(availableStudents);
    } catch (error) {
      console.error('Error fetching student list:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onAssignStudent(formData);
    
    if (success) {
      setShowAssignModal(false);
      setFormData({
        student_id: '',
        assignment_id: '',
        pickup_stop: '',
        dropoff_stop: '',
        fee_amount: '',
        is_active: true
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Student Transport Assignments</h2>
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
            Assign Student
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Student Name</th>
              <th>Bus</th>
              <th>Route</th>
              <th>Pickup Stop</th>
              <th>Dropoff Stop</th>
              <th>Fee</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {studentTransports.map((transport) => (
              <tr key={transport.id}>
                <td className="font-semibold">{transport.student_id}</td>
                <td>{transport.student_name}</td>
                <td>{transport.bus_number}</td>
                <td>{transport.route_name}</td>
                <td>{transport.pickup_stop}</td>
                <td>{transport.dropoff_stop}</td>
                <td>${transport.fee_amount}</td>
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
            <h3 className="font-bold text-lg mb-4">Assign Student to Transport</h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text">Select Student</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={formData.student_id}
                    onChange={(e) => setFormData({...formData, student_id: parseInt(e.target.value)})}
                    required
                    disabled={loading}
                  >
                    <option value="">Select Student</option>
                    {studentList.length > 0 ? (
                      studentList.map(student => (
                        <option key={student.id} value={student.id}>
                          {student.full_name} (ID: {student.id})
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        {loading ? 'Loading...' : 'No available students to assign'}
                      </option>
                    )}
                  </select>
                  {loading && <span className="loading loading-spinner loading-xs ml-2"></span>}
                  {!loading && studentList.length === 0 && (
                    <p className="text-sm text-warning mt-1">All students are already assigned to transport.</p>
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
                  >
                    <option value="">Select Assignment</option>
                    {assignments.map(assignment => (
                      <option key={assignment.id} value={assignment.id}>
                        {assignment.bus_number} - {assignment.route_name}
                      </option>
                    ))}
                  </select>
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
                <div>
                  <label className="label">
                    <span className="label-text">Fee Amount</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="input input-bordered w-full"
                    value={formData.fee_amount}
                    onChange={(e) => setFormData({...formData, fee_amount: parseFloat(e.target.value)})}
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
                  disabled={studentList.length === 0}
                >
                  Assign Student
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

export default StudentTransportTab;