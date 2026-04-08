// transport/BusesTab.js (Updated)
import React, { useState } from "react";

const BusesTab = ({ buses, onCreateBus, onUpdateBus, onDeleteBus, onRefresh }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [formData, setFormData] = useState({
    bus_number: '',
    registration_number: '',
    capacity: '',
    year_of_manufacture: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = editingBus 
      ? await onUpdateBus(editingBus.id, formData)
      : await onCreateBus(formData);
    
    if (success) {
      setShowCreateModal(false);
      setEditingBus(null);
      setFormData({
        bus_number: '',
        registration_number: '',
        capacity: '',
        year_of_manufacture: ''
      });
    }
  };

  const handleEdit = (bus) => {
    setEditingBus(bus);
    setFormData({
      bus_number: bus.bus_number,
      registration_number: bus.registration_number,
      capacity: bus.capacity,
      year_of_manufacture: bus.year_of_manufacture
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (busId) => {
    if (window.confirm('Are you sure you want to delete this bus?')) {
      await onDeleteBus(busId);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Buses Management</h2>
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
            Add New Bus
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Bus Number</th>
              <th>Registration</th>
              <th>Capacity</th>
              <th>Year</th>
              <th>Route</th>
              <th>Driver</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {buses.map((bus) => (
              <tr key={bus.id}>
                <td className="font-semibold">{bus.bus_number}</td>
                <td>{bus.registration_number}</td>
                <td>{bus.capacity}</td>
                <td>{bus.year_of_manufacture}</td>
                <td>{bus.route_name || 'Not Assigned'}</td>
                <td>{bus.driver_name || 'Not Assigned'}</td>
                <td>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEdit(bus)}
                      className="btn btn-sm btn-outline btn-primary"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(bus.id)}
                      className="btn btn-sm btn-outline btn-error"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              {editingBus ? 'Edit Bus' : 'Add New Bus'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text">Bus Number *</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={formData.bus_number}
                    onChange={(e) => setFormData({...formData, bus_number: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Registration Number *</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={formData.registration_number}
                    onChange={(e) => setFormData({...formData, registration_number: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Capacity *</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered w-full"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                    required
                    min="1"
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Year of Manufacture *</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered w-full"
                    value={formData.year_of_manufacture}
                    onChange={(e) => setFormData({...formData, year_of_manufacture: parseInt(e.target.value)})}
                    required
                    min="2000"
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>
              <div className="modal-action">
                <button type="submit" className="btn btn-primary">
                  {editingBus ? 'Update Bus' : 'Create Bus'}
                </button>
                <button 
                  type="button" 
                  className="btn"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingBus(null);
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

export default BusesTab;