import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";

const AdminEventsHolidaysPage = () => {
  const navigate = useNavigate();

  // --- State ---
  const [viewMode, setViewMode] = useState("month"); // 'month' or 'year'
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Data State
  // Structure: { "January": [...events], "February": [...events] }
  const [eventsByMonth, setEventsByMonth] = useState({}); 
  const [loading, setLoading] = useState(false);

  // Filters
  const [showHolidays, setShowHolidays] = useState(true);
  const [showEvents, setShowEvents] = useState(true);

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    is_holiday: true,
    holiday_type: "Holiday", // Enum: Holiday, Event
    is_recurring: false
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // --- Effects ---

  useEffect(() => {
    fetchData();
  }, [currentDate, viewMode]);

  // --- API Calls ---

  const fetchData = async () => {
    setLoading(true);
    setEventsByMonth({}); // Clear previous data

    try {
      const year = currentDate.getFullYear();
      let newEventsData = {};

      if (viewMode === 'month') {
        // Fetch single month
        const monthIndex = currentDate.getMonth() + 1; // 1-12
        const data = await fetchEventsForMonth(year, monthIndex);
        newEventsData[months[monthIndex - 1]] = data;
      } else {
        // Fetch all months for the year (Parallel requests)
        const promises = months.map((_, index) => 
          fetchEventsForMonth(year, index + 1)
        );
        const results = await Promise.all(promises);
        
        results.forEach((data, index) => {
          if (data && data.length > 0) {
            newEventsData[months[index]] = data;
          }
        });
      }

      setEventsByMonth(newEventsData);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventsForMonth = async (year, month) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/events-holidays/${year}/${month}`,
        { method: 'GET', credentials: 'include' }
      );
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error(`Failed to fetch for ${year}-${month}`, error);
      return [];
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        // Ensure end_date is set (default to start_date if empty)
        end_date: formData.end_date || formData.start_date,
        // Determine type based on boolean if needed, or rely on select
        holiday_type: formData.is_holiday ? "Holiday" : "Event"
      };

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/events-holidays`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setShowCreateModal(false);
        resetForm();
        fetchData(); // Refresh data
        alert("Event created successfully");
      } else {
        const err = await response.json();
        alert(`Error: ${err.error}`);
      }
    } catch (error) {
      console.error("Create failed:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/events-holidays/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        fetchData();
      } else {
        alert("Failed to delete event");
      }
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  // --- Helpers ---

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      start_date: "",
      end_date: "",
      is_holiday: true,
      holiday_type: "Holiday",
      is_recurring: false
    });
  };

  const changeDate = (increment) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + increment);
    } else {
      newDate.setFullYear(newDate.getFullYear() + increment);
    }
    setCurrentDate(newDate);
  };

  const getDayAndWeekday = (dateString) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' }) // Mon, Tue
    };
  };

  // --- Render ---

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-indigo-700 text-white py-8 shadow-lg">
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
              <h1 className="text-3xl font-bold mb-2">Events & Holidays</h1>
              <h2 className="text-xl font-medium text-indigo-100">Manage school calendar</h2>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn btn-secondary shadow-md bg-white text-indigo-700 border-none hover:bg-gray-100"
            >
              + Add New
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 min-h-[600px]">
          
          {/* Controls: View Mode & Date Nav */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('month')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'month' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Month View
              </button>
              <button
                onClick={() => setViewMode('year')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'year' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Year View
              </button>
            </div>

            {/* Date Navigator */}
            <div className="flex items-center gap-4">
              <button onClick={() => changeDate(-1)} className="btn btn-circle btn-sm btn-ghost">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <h2 className="text-2xl font-bold text-gray-800 min-w-[160px] text-center">
                {viewMode === 'month' 
                  ? currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                  : currentDate.getFullYear()
                }
              </h2>
              <button onClick={() => changeDate(1)} className="btn btn-circle btn-sm btn-ghost">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>

          {/* Filters (Legend) */}
          <div className="flex justify-center gap-8 mb-8 pb-4 border-b border-gray-100">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={showHolidays} 
                onChange={(e) => setShowHolidays(e.target.checked)}
                className="checkbox checkbox-sm checkbox-error" 
              />
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-gray-700 font-medium">Holiday</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={showEvents} 
                onChange={(e) => setShowEvents(e.target.checked)}
                className="checkbox checkbox-sm checkbox-warning" 
              />
              <div className="w-3 h-3 rounded bg-orange-400"></div>
              <span className="text-gray-700 font-medium">Event</span>
            </label>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-20">
              <div className="loading loading-spinner loading-lg text-indigo-600"></div>
            </div>
          )}

          {/* Events List */}
          {!loading && (
            <div className="space-y-10">
              {months.filter(m => eventsByMonth[m]).map((monthName) => {
                // Filter events inside this month based on checkboxes
                const monthEvents = eventsByMonth[monthName].filter(e => {
                  if (e.is_holiday && !showHolidays) return false;
                  if (!e.is_holiday && !showEvents) return false;
                  return true;
                });

                if (monthEvents.length === 0) return null;

                return (
                  <div key={monthName} className="animate-fade-in">
                    <h3 className="text-lg font-bold text-indigo-900 mb-4 border-l-4 border-indigo-500 pl-3">
                      {monthName}
                    </h3>
                    
                    <div className="flex flex-wrap gap-6">
                      {monthEvents.map((event) => {
                        const { day, weekday } = getDayAndWeekday(event.date);
                        const isHoliday = event.is_holiday;
                        
                        return (
                          <div key={event.id} className="group relative flex flex-col items-center w-20">
                            {/* Delete Button (Hover) */}
                            <button
                              onClick={() => handleDelete(event.id)}
                              className="absolute -top-2 -right-2 z-10 bg-white rounded-full shadow-md p-1 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:bg-red-50"
                              title="Delete Event"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>

                            {/* Date Bubble */}
                            <div 
                              className={`
                                w-14 h-14 flex flex-col items-center justify-center text-white mb-2 shadow-md transition-transform hover:scale-105
                                ${isHoliday ? 'rounded-full bg-red-500' : 'rounded-xl bg-orange-400'}
                              `}
                            >
                              <span className="text-lg font-bold leading-none">{day}</span>
                              <span className="text-[10px] uppercase font-medium">{weekday}</span>
                            </div>

                            {/* Label */}
                            <p className="text-xs text-center font-medium text-gray-700 leading-tight w-full break-words">
                              {event.title}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {Object.keys(eventsByMonth).length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <p>No events found for this period.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ===== CREATE MODAL (Portal) ===== */}
      {showCreateModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex justify-center items-start bg-black/40">
          <div className="mt-8 w-full max-w-lg bg-base-100 rounded-xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-indigo-700">Add Event or Holiday</h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="btn btn-sm btn-circle btn-ghost"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateSubmit}>
              <div className="space-y-4">
                {/* Type Selection */}
                <div className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="type"
                      checked={formData.is_holiday}
                      onChange={() => setFormData({...formData, is_holiday: true, holiday_type: 'Holiday'})}
                      className="radio radio-error radio-sm" 
                    />
                    <span className="font-medium text-gray-700">Holiday</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="type"
                      checked={!formData.is_holiday}
                      onChange={() => setFormData({...formData, is_holiday: false, holiday_type: 'Event'})}
                      className="radio radio-warning radio-sm" 
                    />
                    <span className="font-medium text-gray-700">Event</span>
                  </label>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">Title</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input input-bordered w-full focus:input-primary"
                    placeholder="e.g. Independence Day"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">
                      <span className="label-text font-medium">Start Date</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="input input-bordered w-full focus:input-primary"
                    />
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text font-medium">End Date</span>
                    </label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="input input-bordered w-full focus:input-primary"
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">Description</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="textarea textarea-bordered w-full focus:textarea-primary"
                    placeholder="Optional details..."
                    rows="2"
                  />
                </div>
              </div>

              <div className="modal-action mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary bg-indigo-600 border-none hover:bg-indigo-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AdminEventsHolidaysPage;