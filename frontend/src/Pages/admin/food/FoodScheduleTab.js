// FoodScheduleTab.js
import React, { useState, useEffect } from "react";
import FoodScheduleModal from "./FoodScheduleModal.js";
import FoodScheduleListModal from "./FoodScheduleListModal.js";

const FoodScheduleTab = ({ schedules, categories, onCreateSchedule, onUpdateSchedule, onDeleteSchedule, onRefresh }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [allSchedules, setAllSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateSchedules, setDateSchedules] = useState([]);
  
  // Pagination states for date schedules
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalDateSchedules, setTotalDateSchedules] = useState(0);

  // Fetch schedules when selectedDate changes
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when date changes
    fetchSchedulesForDate();
  }, [selectedDate]);

  const fetchSchedulesForDate = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/food/schedules?date=${selectedDate}&page=${page}&limit=${itemsPerPage}`, 
        {
          method: 'GET',
          credentials: 'include'
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setDateSchedules(data.schedules || []);
        setTotalDateSchedules(data.total || data.schedules?.length || 0);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Failed to fetch schedules for date:', error);
      setDateSchedules([]);
      setTotalDateSchedules(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSchedules = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/food/schedules`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setAllSchedules(data.schedules || []);
      }
    } catch (error) {
      console.error('Failed to fetch all schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = async (scheduleData) => {
    const success = await onCreateSchedule({
      ...scheduleData,
      date: selectedDate
    });
    
    if (success) {
      setShowCreateModal(false);
      fetchSchedulesForDate(currentPage); // Refresh current page
      onRefresh();
    }
    return success;
  };

  const handleUpdateSchedule = async (scheduleId, scheduleData) => {
    const success = await onUpdateSchedule(scheduleId, scheduleData);
    if (success) {
      fetchSchedulesForDate(currentPage); // Refresh current page
      onRefresh();
    }
    return success;
  };

  const handleDeleteSchedule = async (scheduleId) => {
    const success = await onDeleteSchedule(scheduleId);
    if (success) {
      // If we're on a page that might become empty after deletion, go to previous page
      if (dateSchedules.length === 1 && currentPage > 1) {
        fetchSchedulesForDate(currentPage - 1);
      } else {
        fetchSchedulesForDate(currentPage);
      }
      onRefresh();
    }
    return success;
  };

  const handleViewAllSchedules = () => {
    fetchAllSchedules();
    setShowListModal(true);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  // Calculate pagination values
  const totalPages = Math.ceil(totalDateSchedules / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalDateSchedules);

  // Pagination controls component
  const PaginationControls = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-between items-center mt-6">
        <div className="text-sm text-gray-600">
          Showing {startIndex} to {endIndex} of {totalDateSchedules} schedules
        </div>
        <div className="join">
          <button
            className="join-item btn btn-sm"
            onClick={() => fetchSchedulesForDate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            «
          </button>
          {[...Array(totalPages)].map((_, index) => {
            const page = index + 1;
            // Show limited page numbers with ellipsis
            if (
              page === 1 ||
              page === totalPages ||
              (page >= currentPage - 1 && page <= currentPage + 1)
            ) {
              return (
                <button
                  key={page}
                  className={`join-item btn btn-sm ${currentPage === page ? 'btn-active' : ''}`}
                  onClick={() => fetchSchedulesForDate(page)}
                >
                  {page}
                </button>
              );
            } else if (page === currentPage - 2 || page === currentPage + 2) {
              return <span key={page} className="join-item btn btn-sm btn-disabled">...</span>;
            }
            return null;
          })}
          <button
            className="join-item btn btn-sm"
            onClick={() => fetchSchedulesForDate(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            »
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Student Food Schedules</h3>
        <div className="flex gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="input input-bordered"
          />
          <button
            onClick={handleViewAllSchedules}
            className="btn btn-outline"
          >
            View All Schedules
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            Create Schedule
          </button>
          <button
            onClick={() => {
              fetchSchedulesForDate(currentPage);
              onRefresh();
            }}
            className="btn btn-ghost"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center">
          <div className="loading loading-spinner loading-md"></div>
        </div>
      )}

      <div className="grid gap-4">
        {dateSchedules.map(schedule => (
          <ScheduleCard 
            key={schedule.id} 
            schedule={schedule} 
            categories={categories}
            onUpdate={handleUpdateSchedule}
            onDelete={handleDeleteSchedule}
          />
        ))}

        {!loading && dateSchedules.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-500">No food schedules found for {selectedDate}</div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary mt-4"
            >
              Create First Schedule
            </button>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <PaginationControls />

      {showCreateModal && (
        <FoodScheduleModal
          categories={categories}
          selectedDate={selectedDate}
          onSubmit={handleCreateSchedule}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {showListModal && (
        <FoodScheduleListModal
          schedules={allSchedules}
          loading={loading}
          onClose={() => setShowListModal(false)}
          onRefresh={fetchAllSchedules}
        />
      )}
    </div>
  );
};

// Individual schedule card component
const ScheduleCard = ({ schedule, categories, onUpdate, onDelete }) => {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    const success = await onDelete(schedule.id);
    if (success) {
      setDeleting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'badge-success';
      case 'pending': return 'badge-warning';
      case 'cancelled': return 'badge-error';
      default: return 'badge-neutral';
    }
  };
  const formatEditDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date)) return '';
    // Get the local date parts
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Return in YYYY-MM-DD format (HTML date input format)
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="card bg-white shadow">
      <div className="card-body">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-semibold">
              {schedule.student_name || `Student ID: ${schedule.student_id}`}
            </h4>
            {schedule.grade && schedule.section && (
              <p className="text-sm text-gray-600">
                Grade: {schedule.grade} - Section: {schedule.section}
              </p>
            )}
            <p className="text-sm text-gray-600">
              Date: {new Date(schedule.start_date).toLocaleDateString()}
            </p>
            <span className={`badge ${getStatusColor(schedule.status)}  p-2`}>
              {schedule.status}
            </span>
          </div>
          
          <div className="flex gap-2">
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                </svg>
              </div>
              <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-32">
                <li><button onClick={() => setEditing(!editing)}>Edit</button></li>
                <li><button onClick={() => setDeleting(true)} className="text-error">Delete</button></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <MealSection 
            title="Breakfast" 
            category={schedule.breakfast_category_name}
            price={schedule.breakfast_price}
            items={schedule.breakfast_items}
          />
          <MealSection 
            title="Lunch" 
            category={schedule.lunch_category_name}
            price={schedule.lunch_price}
            items={schedule.lunch_items}
          />
          <MealSection 
            title="Snacks" 
            category={schedule.snacks_category_name}
            price={schedule.snacks_price}
            items={schedule.snacks_items}
          />
        </div>

        {editing && (
          <EditScheduleForm 
            schedule={schedule}
            categories={categories}
            onCancel={() => setEditing(false)}
            onSave={onUpdate}
          />
        )}
      </div>

      {deleting && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Delete Schedule</h3>
            <p className="py-4">
              Are you sure you want to delete this food schedule for {schedule.student_name || `Student ID: ${schedule.student_id}`}?
              This action cannot be undone.
            </p>
            <div className="modal-action">
              <button 
                onClick={() => setDeleting(false)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="btn btn-error"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MealSection = ({ title, category, price, items }) => (
  <div className="border rounded-lg p-3">
    <h5 className="font-semibold text-sm mb-2">{title}</h5>
    {category ? (
      <>
        <div className="text-xs font-medium">{category}</div>
        {price && <div className="text-xs text-gray-600">₹{price}</div>}
        {items && items.length > 0 && (
          <div className="mt-2">
            <div className="text-xs font-medium mb-1">Items:</div>
            <div className="space-y-1">
              {items.map((item, index) => (
                <div key={index} className="text-xs">
                  • {item.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    ) : (
      <div className="text-xs text-gray-500 italic">Not scheduled</div>
    )}
  </div>
);

const EditScheduleForm = ({ schedule, categories, onCancel, onSave }) => {
  const [formData, setFormData] = useState({
    breakfast_menu_id: schedule.breakfast_menu_id || "",
    lunch_menu_id: schedule.lunch_menu_id || "",
    snacks_menu_id: schedule.snacks_menu_id || "",
    status: schedule.status
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onSave(schedule.id, formData);
    if (success) {
      onCancel();
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-4 border rounded-lg bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Breakfast Menu</span>
          </label>
          <select
            name="breakfast_menu_id"
            value={formData.breakfast_menu_id}
            onChange={handleChange}
            className="select select-bordered select-sm"
          >
            <option value="">Select Breakfast Menu</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name} - ₹{category.price}
              </option>
            ))}
          </select>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Lunch Menu</span>
          </label>
          <select
            name="lunch_menu_id"
            value={formData.lunch_menu_id}
            onChange={handleChange}
            className="select select-bordered select-sm"
          >
            <option value="">Select Lunch Menu</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name} - ₹{category.price}
              </option>
            ))}
          </select>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Snacks Menu</span>
          </label>
          <select
            name="snacks_menu_id"
            value={formData.snacks_menu_id}
            onChange={handleChange}
            className="select select-bordered select-sm"
          >
            <option value="">Select Snacks Menu</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name} - ₹{category.price}
              </option>
            ))}
          </select>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Status</span>
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="select select-bordered select-sm"
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      
      <div className="flex gap-2 mt-4">
        <button type="submit" className="btn btn-primary btn-sm">
          Save
        </button>
        <button type="button" onClick={onCancel} className="btn btn-ghost btn-sm">
          Cancel
        </button>
      </div>
    </form>
  );
};

export default FoodScheduleTab;