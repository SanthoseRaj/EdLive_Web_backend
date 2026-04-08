import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";

const AdminTodoPage = () => {
  const [todos, setTodos] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classesLoading, setClassesLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [editingTodo, setEditingTodo] = useState(null);
  const [lastViewedItems, setLastViewedItems] = useState([]);
  
  // Form data state
  const [formData, setFormData] = useState({
    date: "",
    title: "",
    description: "",
    classid: ""
  });
  
  const navigate = useNavigate();

  // Initial Data Fetch
  useEffect(() => {
    fetchTodos();
    fetchClasses();
    fetchLastViewedItems();
  }, []);

  // --- API Calls ---

  const fetchTodos = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/todos`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setTodos(data);
      }
    } catch (error) {
      console.error('Failed to fetch admin todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      // Admins typically have access to all master classes
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/master/classes`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    } finally {
      setClassesLoading(false);
    }
  };

  const fetchLastViewedItems = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/dashboard/last-viewed?item_type=todo`,
        { method: 'GET', credentials: 'include' }
      );
      
      if (response.ok) {
        const data = await response.json();
        setLastViewedItems(Array.isArray(data.data) ? data.data : []);
      }
    } catch (error) {
      console.error('Failed to fetch last viewed items:', error);
    }
  };

  const markAsViewed = async (itemId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/dashboard/viewed`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            item_type: "todo",
            item_id: itemId
          })
        }
      );

      if (response.ok) {
        setLastViewedItems(prev => [...prev, { item_id: itemId }]);
      }
    } catch (error) {
      console.error('Failed to mark item as viewed:', error);
    }
  };

  // --- Handlers ---

  const isTodoViewed = (todoId) => {
    return lastViewedItems.some(item => item.item_id === todoId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const todoData = {
      date: formData.date,
      title: formData.title,
      description: formData.description,
      classid: formData.classid || null,
    };

    try {
      const url = editingTodo 
        ? `${process.env.REACT_APP_API_URL}/api/todos/${editingTodo.id}`
        : `${process.env.REACT_APP_API_URL}/api/todos`;
      
      const method = editingTodo ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(todoData)
      });

      if (response.ok) {
        setShowCreateModal(false);
        setEditingTodo(null);
        setFormData({ date: "", title: "", description: "", classid: "" });
        fetchTodos();
      } else {
        const err = await response.json();
        alert(`Error: ${err.error || 'Failed to save todo'}`);
      }
    } catch (error) {
      console.error('Failed to save todo:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this admin task?')) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/todos/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        
        if (response.ok) {
          fetchTodos();
        }
      } catch (error) {
        console.error('Failed to delete todo:', error);
      }
    }
  };

  const handleEdit = (todo) => {
    setEditingTodo(todo);
    setFormData({
      date: formatDateForInput(todo.date),
      title: todo.title,
      description: todo.description,
      classid: todo.class_id || ""
    });
    // Ensure view modal is closed if we are switching to edit from view
    setShowViewModal(false); 
    setShowCreateModal(true);
  };

  const handleViewTodo = async (todo) => {
    if (!isTodoViewed(todo.id)) {
      await markAsViewed(todo.id);
    }
    setSelectedTodo(todo);
    setShowViewModal(true);
  };

  // --- Helpers ---

  const getClassName = (classId) => {
    if (!classId) return "General Task";
    const classObj = classes.find(c => c.id === classId);
    return classObj ? classObj.class_name : `Class ${classId}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const timezoneOffset = date.getTimezoneOffset() * 60000;
      const localDate = new Date(date.getTime() - timezoneOffset);
      return localDate.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading || classesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-indigo-700 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">Admin Task Management</h1>
          <p className="text-lg max-w-2xl mx-auto opacity-90">
            Organize administrative tasks and class reminders
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Controls */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary bg-indigo-600 hover:bg-indigo-700 border-none"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Admin Task
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 border-2 border-indigo-500 mr-2 rounded"></div>
            <span>New (Unviewed)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 border-2 border-gray-300 mr-2 rounded"></div>
            <span>Viewed</span>
          </div>
        </div>

        {/* Todo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {todos.map((todo) => {
            const isViewed = isTodoViewed(todo.id);
            return (
              <div 
                key={todo.id} 
                className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer ${
                  isViewed 
                    ? "border-gray-300" 
                    : "border-indigo-500 border-2 font-bold"
                }`}
                onClick={() => handleViewTodo(todo)}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm text-gray-500 font-medium">
                    {formatDate(todo.date)}
                  </span>
                  <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleEdit(todo)}
                      className="btn btn-sm btn-ghost hover:bg-indigo-50 text-indigo-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(todo.id)}
                      className="btn btn-sm btn-ghost text-error hover:bg-red-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-2">{todo.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{todo.description}</p>

                <div className="flex items-center justify-between">
                  <span className={`badge ${todo.completed ? 'badge-success' : 'badge-warning'} gap-1  p-2`}>
                    {todo.completed ? 'Done' : 'Pending'}
                  </span>
                  <span className="text-xs font-semibold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-full">
                    {getClassName(todo.class_id)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {todos.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-300 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">No admin tasks found.</p>
          </div>
        )}
      </div>

      {/* ===== VIEW DETAILS MODAL (Portal) ===== */}
      {showViewModal && selectedTodo && createPortal(
        <div className="fixed inset-0 z-[9999] flex justify-center items-start bg-black/40">
          <div className="mt-8 w-full max-w-2xl bg-base-100 rounded-xl shadow-2xl p-6 border-t-4 border-indigo-600">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-2xl text-gray-800">{selectedTodo.title}</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label text-xs uppercase text-gray-500 font-bold">Due Date</label>
                  <p className="text-gray-800 font-medium">{formatDate(selectedTodo.date)}</p>
                </div>

                <div>
                  <label className="label text-xs uppercase text-gray-500 font-bold">Status</label>
                  <span className={`badge ${selectedTodo.completed ? 'badge-success' : 'badge-warning'}  p-2`}>
                    {selectedTodo.completed ? 'Completed' : 'Pending'}
                  </span>
                </div>

                <div>
                  <label className="label text-xs uppercase text-gray-500 font-bold">Target Class</label>
                  <p className="text-indigo-600 font-medium">{getClassName(selectedTodo.class_id)}</p>
                </div>

                <div>
                  <label className="label text-xs uppercase text-gray-500 font-bold">Created On</label>
                  <p className="text-gray-600 text-sm">
                    {formatDateTime(selectedTodo.created_at)}
                  </p>
                </div>
              </div>

              <div>
                <label className="label text-xs uppercase text-gray-500 font-bold">Description</label>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 max-h-60 overflow-y-auto">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {selectedTodo.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="modal-action">
              <button
                type="button"
                onClick={() => setShowViewModal(false)}
                className="btn btn-ghost"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowViewModal(false);
                  handleEdit(selectedTodo);
                }}
                className="btn btn-primary bg-indigo-600 border-none hover:bg-indigo-700"
              >
                Edit Task
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ===== CREATE/EDIT MODAL (Portal) ===== */}
      {showCreateModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex justify-center items-start bg-black/40">
          <div className="mt-8 w-full max-w-lg bg-base-100 rounded-xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-indigo-700">
                {editingTodo ? 'Edit Admin Task' : 'Create New Admin Task'}
              </h3>
              <button
                 onClick={() => {
                  setShowCreateModal(false);
                  setEditingTodo(null);
                  setFormData({ date: "", title: "", description: "", classid: "" });
                }}
                className="btn btn-sm btn-circle btn-ghost"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text font-medium">Due Date</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="input input-bordered w-full focus:input-primary"
                  />
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
                    placeholder="E.g., Staff Meeting"
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">Description</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="textarea textarea-bordered w-full h-24 focus:textarea-primary"
                    placeholder="Enter detailed description..."
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">Assign to Class (Optional)</span>
                  </label>
                  <select
                    value={formData.classid}
                    onChange={(e) => setFormData({ ...formData, classid: e.target.value })}
                    className="select select-bordered w-full focus:select-primary"
                  >
                    <option value="">General Task (No specific class)</option>
                    {classes.map((classItem) => (
                      <option key={classItem.id} value={classItem.id}>
                        {classItem.class_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingTodo(null);
                    setFormData({ date: "", title: "", description: "", classid: "" });
                  }}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary bg-indigo-600 border-none hover:bg-indigo-700"
                >
                  {editingTodo ? 'Update Task' : 'Create Task'}
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

export default AdminTodoPage;