// FoodScheduleListModal.js
import React, { useState } from "react";

const FoodScheduleListModal = ({ schedules, loading, onClose, onRefresh }) => {
  const [filters, setFilters] = useState({
    student_id: "",
    date: "",
    status: "",
    start_date: "",
    end_date: ""
  });

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const applyFilters = () => {
    // This would typically make an API call with filters
    // For now, we'll just refresh with current data
    onRefresh();
  };

  const clearFilters = () => {
    setFilters({
      student_id: "",
      date: "",
      status: "",
      start_date: "",
      end_date: ""
    });
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-6xl">
        <h3 className="font-bold text-lg mb-4">All Student Food Schedules</h3>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Student ID</span>
            </label>
            <input
              type="number"
              name="student_id"
              value={filters.student_id}
              onChange={handleFilterChange}
              className="input input-bordered input-sm"
              placeholder="Student ID"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Date</span>
            </label>
            <input
              type="date"
              name="date"
              value={filters.start_date}
              onChange={handleFilterChange}
              className="input input-bordered input-sm"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Status</span>
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="select select-bordered select-sm"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Date Range</span>
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                name="start_date"
                value={filters.start_date}
                onChange={handleFilterChange}
                className="input input-bordered input-sm flex-1"
                placeholder="From"
              />
              <input
                type="date"
                name="end_date"
                value={filters.end_date}
                onChange={handleFilterChange}
                className="input input-bordered input-sm flex-1"
                placeholder="To"
              />
            </div>
          </div>

          <div className="form-control md:col-span-2 lg:col-span-4">
            <div className="flex gap-2 justify-end">
              <button onClick={clearFilters} className="btn btn-ghost btn-sm">
                Clear
              </button>
              <button onClick={applyFilters} className="btn btn-primary btn-sm">
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Schedules List */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="loading loading-spinner loading-lg"></div>
            </div>
          ) : schedules.length > 0 ? (
            <div className="space-y-4">
              {schedules.map(schedule => (
                <div key={schedule.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">
                        {schedule.student_name || `Student ID: ${schedule.student_id}`}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Date: {new Date(schedule.start_date).toLocaleDateString()}
                      </p>
                      <span className={`badge ${
                        schedule.status === 'confirmed' ? 'badge-success' : 
                        schedule.status === 'pending' ? 'badge-warning' : 'badge-error'
                      }  p-2`}>
                        {schedule.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
                    <div>
                      <strong>Breakfast:</strong><br/>
                      {schedule.breakfast_category_name || 'Not set'}
                    </div>
                    <div>
                      <strong>Lunch:</strong><br/>
                      {schedule.lunch_category_name || 'Not set'}
                    </div>
                    <div>
                      <strong>Snacks:</strong><br/>
                      {schedule.snacks_category_name || 'Not set'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No food schedules found
            </div>
          )}
        </div>

        <div className="modal-action">
          <button onClick={onClose} className="btn btn-ghost">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodScheduleListModal;