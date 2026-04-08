// transport/DriversTab.js (Updated with debugging)
import React, { useState } from "react";

const DriversTab = ({ drivers, onCreateDriver, onUpdateDriver, onDeleteDriver, onRefresh }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [formData, setFormData] = useState({
    user_id: '',
    name: '',
    contact_number: '',
    license_number: '',
    license_expiry: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = editingDriver 
      ? await onUpdateDriver(editingDriver.id, formData)
      : await onCreateDriver(formData);
    
    if (success) {
      setShowCreateModal(false);
      setEditingDriver(null);
      setFormData({
        user_id: '',
        name: '',
        contact_number: '',
        license_number: '',
        license_expiry: ''
      });
    }
  };

  const handleEdit = (driver) => {
    setEditingDriver(driver);
    setFormData({
      user_id: driver.user_id || '',
      name: driver.name,
      contact_number: driver.contact_number,
      license_number: driver.license_number,
      license_expiry: driver.license_expiry ? driver.license_expiry.split('T')[0] : ''
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (driverId) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      await onDeleteDriver(driverId);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Drivers Management</h2>
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
            Add New Driver
          </button>
        </div>
      </div>

      {/* Add loading state and empty state */}
      {drivers === undefined || drivers === null ? (
        <div className="text-center py-8">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="mt-4 text-gray-600">Loading drivers...</p>
        </div>
      ) : drivers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No drivers found.</p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary mt-4"
          >
            Add Your First Driver
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact Number</th>
                <th>License Number</th>
                <th>License Expiry</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((driver) => (
                <tr key={driver.id}>
                  <td className="font-semibold">{driver.name}</td>
                  <td>{driver.contact_number}</td>
                  <td>{driver.license_number}</td>
                  <td>
                    {driver.license_expiry ? 
                      new Date(driver.license_expiry).toLocaleDateString() : 
                      'Not set'
                    }
                  </td>
                  <td>
                    <span className={`badge ${
                      driver.license_expiry && new Date(driver.license_expiry) > new Date() ? 
                      'badge-success' : 'badge-error'
                    }  p-2`}>
                      {driver.license_expiry && new Date(driver.license_expiry) > new Date() ? 
                      'Valid' : 'Expired'}
                    </span>
                  </td>
                  <td>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEdit(driver)}
                        className="btn btn-sm btn-outline btn-primary"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(driver.id)}
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
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              {editingDriver ? 'Edit Driver' : 'Add New Driver'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text">User ID (Optional)</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered w-full"
                    value={formData.user_id}
                    onChange={(e) => setFormData({...formData, user_id: e.target.value ? parseInt(e.target.value) : ''})}
                    placeholder="Optional - link to user account"
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Name *</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Contact Number *</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={formData.contact_number}
                    onChange={(e) => setFormData({...formData, contact_number: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">License Number *</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={formData.license_number}
                    onChange={(e) => setFormData({...formData, license_number: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">License Expiry *</span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    value={formData.license_expiry}
                    onChange={(e) => setFormData({...formData, license_expiry: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="modal-action">
                <button type="submit" className="btn btn-primary">
                  {editingDriver ? 'Update Driver' : 'Create Driver'}
                </button>
                <button 
                  type="button" 
                  className="btn"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingDriver(null);
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

export default DriversTab;