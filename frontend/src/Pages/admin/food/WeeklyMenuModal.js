// WeeklyMenuModal.js
import React, { useState, useEffect } from "react";

const WeeklyMenuModal = ({ menu, categories, foodItems, selectedDay, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    day_of_week: "",
    category_id: "",
    meal_type: "",
    food_items: [],
    effective_date: new Date().toISOString().split('T')[0]
  });

  const [availableItems, setAvailableItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    if (menu) {
      setFormData({
        day_of_week: menu.day_of_week || "",
        category_id: menu.category_id || "",
        meal_type: menu.meal_type || "",
        food_items: menu.items?.map(item => item.id) || [],
        effective_date: new Date().toISOString().split('T')[0]
      });
      setSelectedItems(menu.items || []);
    } else if (selectedDay !== null) {
      setFormData(prev => ({
        ...prev,
        day_of_week: selectedDay
      }));
    }
  }, [menu, selectedDay]);

  useEffect(() => {
    if (formData.category_id) {
      const categoryItems = foodItems.filter(item => 
        item.category_id === parseInt(formData.category_id)
      );
      setAvailableItems(categoryItems);
    } else {
      setAvailableItems([]);
    }
  }, [formData.category_id, foodItems]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      food_items: selectedItems.map(item => item.id)
    };
    onSubmit(submitData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleItemToggle = (item) => {
    const isSelected = selectedItems.some(selected => selected.id === item.id);
    if (isSelected) {
      setSelectedItems(selectedItems.filter(selected => selected.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const removeSelectedItem = (itemId) => {
    setSelectedItems(selectedItems.filter(item => item.id !== itemId));
  };

  const mealTypes = [
    { value: "breakfast", label: "Breakfast" },
    { value: "lunch", label: "Lunch" },
    { value: "snacks", label: "Snacks" }
  ];

  const days = [
    { value: 0, label: "Sunday" },
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" }
  ];

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-4xl">
        <h3 className="font-bold text-lg mb-4">
          {menu ? 'Edit Weekly Menu' : 'Create Weekly Menu'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Day of Week</span>
              </label>
              <select
                name="day_of_week"
                value={formData.day_of_week}
                onChange={handleChange}
                className="select select-bordered"
                required
                disabled={selectedDay !== null}
              >
                <option value="">Select Day</option>
                {days.map(day => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Meal Type</span>
              </label>
              <select
                name="meal_type"
                value={formData.meal_type}
                onChange={handleChange}
                className="select select-bordered"
                required
              >
                <option value="">Select Meal Type</option>
                {mealTypes.map(meal => (
                  <option key={meal.value} value={meal.value}>
                    {meal.label}
                  </option>
                ))}
              </select>
            </div>

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
                    {category.name} - ₹{category.price}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Effective Date</span>
              </label>
              <input
                type="date"
                name="effective_date"
                value={formData.effective_date}
                onChange={handleChange}
                className="input input-bordered"
                required
              />
            </div>
          </div>

          {/* Selected Items */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Selected Food Items</span>
            </label>
            <div className="border rounded-lg p-3 min-h-20">
              {selectedItems.length > 0 ? (
                <div className="space-y-2">
                  {selectedItems.map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        {item.description && (
                          <span className="text-sm text-gray-600 ml-2">- {item.description}</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSelectedItem(item.id)}
                        className="btn btn-xs btn-error"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 italic">No items selected</div>
              )}
            </div>
          </div>

          {/* Available Items */}
          {formData.category_id && (
            <div className="form-control">
              <label className="label">
                <span className="label-text">Available Food Items</span>
              </label>
              <div className="border rounded-lg p-3 max-h-40 overflow-y-auto">
                {availableItems.length > 0 ? (
                  <div className="space-y-2">
                    {availableItems.map(item => (
                      <div key={item.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                        <div>
                          <span className="font-medium">{item.name}</span>
                          {item.description && (
                            <span className="text-sm text-gray-600 ml-2">- {item.description}</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleItemToggle(item)}
                          className={`btn btn-xs ${
                            selectedItems.some(selected => selected.id === item.id) 
                              ? 'btn-error' 
                              : 'btn-primary'
                          }`}
                        >
                          {selectedItems.some(selected => selected.id === item.id) ? 'Remove' : 'Add'}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 italic">No food items available for this category</div>
                )}
              </div>
            </div>
          )}

          <div className="modal-action">
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {menu ? 'Update' : 'Create'} Menu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WeeklyMenuModal;