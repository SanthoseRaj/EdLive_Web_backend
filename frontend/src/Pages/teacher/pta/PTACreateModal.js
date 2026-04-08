import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const PTACreateModal = ({ meeting, classes, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    class_ids: [],
    include_all_sections: true
  });

  useEffect(() => {
    if (meeting) {
      setFormData({
        title: meeting.title || "",
        description: meeting.description || "",
        date: formatDateForInput(meeting.date) || "",
        time: meeting.time || "",
        class_ids: meeting.class_ids || [],
        include_all_sections: meeting.include_all_sections !== undefined ? meeting.include_all_sections : true
      });
    }
  }, [meeting]);

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    // Handle potential timezone issues or simplified string formats
    try {
      const date = new Date(dateString);
      const timezoneOffset = date.getTimezoneOffset() * 60000;
      const localDate = new Date(date.getTime() - timezoneOffset);
      return localDate.toISOString().split('T')[0];
    } catch (e) {
      return '';
    }
  };

  const toggleClassSelection = (classId) => {
    setFormData(prev => ({
      ...prev,
      class_ids: prev.class_ids.includes(classId)
        ? prev.class_ids.filter(id => id !== classId)
        : [...prev.class_ids, classId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onSubmit(formData);
    if (success) {
      onClose();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex justify-center items-start bg-black/40">
      <div className="mt-8 w-full max-w-2xl bg-base-100 rounded-xl shadow-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-indigo-700">
            {meeting ? 'Edit Meeting' : 'Create New Meeting'}
          </h3>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">
                  <span className="label-text font-medium">Date</span>
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
                  <span className="label-text font-medium">Time</span>
                </label>
                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="input input-bordered w-full focus:input-primary"
                />
              </div>
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium">Subject or title</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input input-bordered w-full focus:input-primary"
                placeholder="Lesson name, topic etc..."
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium">Description</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="textarea textarea-bordered w-full focus:textarea-primary"
                rows="3"
                placeholder="Meeting description..."
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium">Select classes</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto bg-gray-50 p-2 rounded border">
                {classes.map((classItem) => (
                  <label key={classItem.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.class_ids.includes(classItem.id)}
                      onChange={() => toggleClassSelection(classItem.id)}
                      className="checkbox checkbox-sm checkbox-primary"
                    />
                    <span className="text-sm">{classItem.class_name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium">Division</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.include_all_sections}
                    onChange={() => setFormData({ ...formData, include_all_sections: true })}
                    className="radio radio-sm radio-primary"
                  />
                  <span>All</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!formData.include_all_sections}
                    onChange={() => setFormData({ ...formData, include_all_sections: false })}
                    className="radio radio-sm radio-primary"
                  />
                  <span>Selected Only</span>
                </label>
              </div>
            </div>
          </div>

          <div className="modal-action">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary bg-indigo-600 border-none hover:bg-indigo-700"
            >
              {meeting ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default PTACreateModal;