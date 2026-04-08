// FoodItemModal.js
import React, { useState, useEffect } from "react";

const FoodItemModal = ({ categories, item, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    category_id: "",
    name: "",
    description: ""
  });

  useEffect(() => {
    if (item) {
      setFormData({
        category_id: item.category_id || "",
        name: item.name || "",
        description: item.description || ""
      });
    }
  }, [item]);

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
        <h3 className="font-bold text-lg mb-4">
          {item ? 'Edit Food Item' : 'Create Food Item'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Category</span>
            </label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="select select-bordered"
              required
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Item Name</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input input-bordered"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="textarea textarea-bordered"
              rows="3"
            />
          </div>

          <div className="modal-action">
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {item ? 'Update' : 'Create'} Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FoodItemModal;