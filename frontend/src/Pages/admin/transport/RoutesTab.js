// transport/RoutesTab.js (Updated with Route Stops Management)
import React, { useState, useEffect } from "react";

const RoutesTab = ({ routes, onCreateRoute, onUpdateRoute, onDeleteRoute, onRefresh }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStopsModal, setShowStopsModal] = useState(false);
  const [showAddStopModal, setShowAddStopModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [routeStops, setRouteStops] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_point: '',
    end_point: ''
  });
  const [stopFormData, setStopFormData] = useState({
    stop_name: '',
    stop_order: '',
    arrival_time: '',
    latitude: '',
    longitude: ''
  });

  useEffect(() => {
    if (selectedRoute) {
      fetchRouteStops(selectedRoute.id);
    }
  }, [selectedRoute]);

  const fetchRouteStops = async (routeId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/transport/routes/${routeId}/stops`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setRouteStops(data);
      }
    } catch (error) {
      console.error('Failed to fetch route stops:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = editingRoute 
      ? await onUpdateRoute(editingRoute.id, formData)
      : await onCreateRoute(formData);
    
    if (success) {
      setShowCreateModal(false);
      setEditingRoute(null);
      setFormData({
        name: '',
        description: '',
        start_point: '',
        end_point: ''
      });
    }
  };

  const handleAddStop = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/transport/routes/stops`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          route_id: selectedRoute.id,
          ...stopFormData
        })
      });

      if (response.ok) {
        setShowAddStopModal(false);
        setStopFormData({
          stop_name: '',
          stop_order: '',
          arrival_time: '',
          latitude: '',
          longitude: ''
        });
        fetchRouteStops(selectedRoute.id);
      }
    } catch (error) {
      console.error('Failed to add route stop:', error);
    }
  };

  const handleEdit = (route) => {
    setEditingRoute(route);
    setFormData({
      name: route.name,
      description: route.description || '',
      start_point: route.start_point,
      end_point: route.end_point
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (routeId) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      await onDeleteRoute(routeId);
    }
  };

  const handleViewStops = (route) => {
    setSelectedRoute(route);
    setShowStopsModal(true);
  };

  const handleDeleteStop = async (stopId) => {
    if (window.confirm('Are you sure you want to delete this stop?')) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/transport/route-stops/${stopId}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        if (response.ok) {
          fetchRouteStops(selectedRoute.id);
        }
      } catch (error) {
        console.error('Failed to delete route stop:', error);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Routes Management</h2>
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
            Add New Route
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Route Name</th>
              <th>Start Point</th>
              <th>End Point</th>
              <th>Stops</th>
              <th>Assigned Bus</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((route) => (
              <tr key={route.id}>
                <td className="font-semibold">{route.name}</td>
                <td>{route.start_point}</td>
                <td>{route.end_point}</td>
                <td>{route.stop_count || 0}</td>
                <td>{route.bus_number || 'Not Assigned'}</td>
                <td>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleViewStops(route)}
                      className="btn btn-sm btn-outline btn-info"
                    >
                      Stops
                    </button>
                    <button 
                      onClick={() => handleEdit(route)}
                      className="btn btn-sm btn-outline btn-primary"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(route.id)}
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

      {/* Create/Edit Route Modal */}
      {showCreateModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              {editingRoute ? 'Edit Route' : 'Add New Route'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text">Route Name *</span>
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
                    <span className="label-text">Description</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered w-full"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Start Point *</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={formData.start_point}
                    onChange={(e) => setFormData({...formData, start_point: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">End Point *</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={formData.end_point}
                    onChange={(e) => setFormData({...formData, end_point: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="modal-action">
                <button type="submit" className="btn btn-primary">
                  {editingRoute ? 'Update Route' : 'Create Route'}
                </button>
                <button 
                  type="button" 
                  className="btn"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingRoute(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Route Stops Modal */}
      {showStopsModal && selectedRoute && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <h3 className="font-bold text-lg mb-4">
              Route Stops: {selectedRoute.name}
            </h3>
            
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-600">
                {routeStops.length} stops
              </span>
              <button 
                onClick={() => setShowAddStopModal(true)}
                className="btn btn-sm btn-primary"
              >
                Add Stop
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Stop Name</th>
                    <th>Arrival Time</th>
                    <th>Coordinates</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {routeStops.map((stop) => (
                    <tr key={stop.id}>
                      <td>{stop.stop_order}</td>
                      <td className="font-semibold">{stop.stop_name}</td>
                      <td>{stop.arrival_time}</td>
                      <td className="text-xs">
                        {stop.latitude && stop.longitude ? 
                          `${stop.latitude}, ${stop.longitude}` : 'Not set'
                        }
                      </td>
                      <td>
                        <button 
                          onClick={() => handleDeleteStop(stop.id)}
                          className="btn btn-xs btn-outline btn-error"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="modal-action">
              <button 
                type="button" 
                className="btn"
                onClick={() => {
                  setShowStopsModal(false);
                  setSelectedRoute(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Stop Modal */}
      {showAddStopModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              Add Stop to {selectedRoute?.name}
            </h3>
            <form onSubmit={handleAddStop}>
              <div className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text">Stop Name *</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={stopFormData.stop_name}
                    onChange={(e) => setStopFormData({...stopFormData, stop_name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Stop Order *</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered w-full"
                    value={stopFormData.stop_order}
                    onChange={(e) => setStopFormData({...stopFormData, stop_order: parseInt(e.target.value)})}
                    required
                    min="1"
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Arrival Time *</span>
                  </label>
                  <input
                    type="time"
                    className="input input-bordered w-full"
                    value={stopFormData.arrival_time}
                    onChange={(e) => setStopFormData({...stopFormData, arrival_time: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">
                      <span className="label-text">Latitude</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      className="input input-bordered w-full"
                      value={stopFormData.latitude}
                      onChange={(e) => setStopFormData({...stopFormData, latitude: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">Longitude</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      className="input input-bordered w-full"
                      value={stopFormData.longitude}
                      onChange={(e) => setStopFormData({...stopFormData, longitude: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-action">
                <button type="submit" className="btn btn-primary">
                  Add Stop
                </button>
                <button 
                  type="button" 
                  className="btn"
                  onClick={() => setShowAddStopModal(false)}
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

export default RoutesTab;