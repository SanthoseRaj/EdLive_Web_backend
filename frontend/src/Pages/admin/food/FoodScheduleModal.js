// FoodScheduleModal.js
import React, { useState } from "react";

const FoodScheduleModal = ({ categories, selectedDate, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    student_id: "",
    breakfast_menu_id: "",
    lunch_menu_id: "",
    snacks_menu_id: "",
    status: "confirmed"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Create Food Schedule</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Student ID</span>
            </label>
            <input
              type="number"
              name="student_id"
              value={formData.student_id}
              onChange={handleChange}
              className="input input-bordered"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Date</span>
            </label>
            <input
              type="date"
              value={selectedDate}
              className="input input-bordered"
              disabled
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Breakfast Menu</span>
            </label>
            <select
              name="breakfast_menu_id"
              value={formData.breakfast_menu_id}
              onChange={handleChange}
              className="select select-bordered"
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
              className="select select-bordered"
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
              className="select select-bordered"
            >
              <option value="">Select Snacks Menu</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name} - ₹{category.price}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-action">
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FoodScheduleModal;