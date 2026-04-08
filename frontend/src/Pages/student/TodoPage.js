import React, { useState, useEffect } from "react";

const StudentTodoPage = () => {
  const [todos, setTodos] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classesLoading, setClassesLoading] = useState(true);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [lastViewedItems, setLastViewedItems] = useState([]);

  useEffect(() => {
    fetchTodos();
    fetchClasses();
    fetchLastViewedItems();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/todos/student/`+localStorage.getItem("childId"), {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setTodos(data);
      }
    } catch (error) {
      console.error('Failed to fetch todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
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
        `${process.env.REACT_APP_API_URL}/api/dashboard/last-viewed?item_type=todo&studentId=`+localStorage.getItem("childId"),
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

  // Mark item as viewed
  const markAsViewed = async (itemId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/dashboard/viewed?studentId=`+localStorage.getItem("childId"),
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
        // Update the last viewed items state
        setLastViewedItems(prev => [...prev, { item_id: itemId }]);
      }
    } catch (error) {
      console.error('Failed to mark item as viewed:', error);
    }
  };

  // Check if a todo has been viewed
  const isTodoViewed = (todoId) => {
    return lastViewedItems.some(item => item.item_id === todoId);
  };

  const handleViewTodo = async (todo) => {
    // Mark as viewed if it hasn't been viewed yet
    if (!isTodoViewed(todo.id)) {
      await markAsViewed(todo.id);
    }
    
    setSelectedTodo(todo);
    setShowViewModal(true);
  };

  const getClassName = (classId) => {
    if (!classId) return "All Classes";
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
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">My To-Do List</h1>
          <p className="text-lg max-w-2xl mx-auto">
            View your tasks and reminders
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Legend for border colors */}
        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 border-2 border-blue-500 mr-2 rounded"></div>
            <span>New (Unviewed)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 border-2 border-gray-300 mr-2 rounded"></div>
            <span>Viewed</span>
          </div>
        </div>

        {/* Todo List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {todos.map((todo) => {
            const isViewed = isTodoViewed(todo.id);
            return (
              <div 
                key={todo.id} 
                className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer ${
                  isViewed 
                    ? "border-gray-300" 
                    : "border-blue-500 border-2 font-bold"
                }`}
                onClick={() => handleViewTodo(todo)}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm text-gray-500">{formatDate(todo.date)}</span>
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-2">{todo.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{todo.description}</p>

                <div className="flex items-center justify-between">
                  <span className={`badge ${todo.completed ? 'badge-success' : 'badge-warning'}  p-2`}>
                    {todo.completed ? 'Completed' : 'Pending'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {getClassName(todo.class_id)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {todos.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">No todos assigned yet.</p>
          </div>
        )}
      </div>

      {/* View Todo Modal */}
      {showViewModal && selectedTodo && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
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
                  <label className="label">
                    <span className="label-text font-semibold">Date</span>
                  </label>
                  <p className="text-gray-700">{formatDate(selectedTodo.date)}</p>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-semibold">Status</span>
                  </label>
                  <span className={`badge ${selectedTodo.completed ? 'badge-success' : 'badge-warning'} text-sm  p-2`}>
                    {selectedTodo.completed ? 'Completed' : 'Pending'}
                  </span>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-semibold">Class</span>
                  </label>
                  <p className="text-gray-700">{getClassName(selectedTodo.class_id)}</p>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-semibold">Created</span>
                  </label>
                  <p className="text-gray-700 text-sm">
                    {formatDateTime(selectedTodo.created_at)}
                  </p>
                </div>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-semibold">Description</span>
                </label>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedTodo.description}</p>
                </div>
              </div>

              {selectedTodo.updated_at && selectedTodo.updated_at !== selectedTodo.created_at && (
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    Last updated: {formatDateTime(selectedTodo.updated_at)}
                  </p>
                </div>
              )}
            </div>

            <div className="modal-action">
              <button
                type="button"
                onClick={() => setShowViewModal(false)}
                className="btn btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentTodoPage;