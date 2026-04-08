// FoodMenuTab.js
import React, { useState } from "react";
import WeeklyMenuModal from "./WeeklyMenuModal.js";

const FoodMenuTab = ({ weeklyMenu, categories, foodItems, onCreateMenu, onUpdateMenu, onDeleteMenu, onRefresh }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [deletingMenu, setDeletingMenu] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  const days = [
    { id: 0, name: "Sunday" },
    { id: 1, name: "Monday" },
    { id: 2, name: "Tuesday" },
    { id: 3, name: "Wednesday" },
    { id: 4, name: "Thursday" },
    { id: 5, name: "Friday" },
    { id: 6, name: "Saturday" }
  ];

  const mealTypes = [
    { key: "breakfast", name: "Breakfast", color: "bg-orange-50" },
    { key: "lunch", name: "Lunch", color: "bg-blue-50" },
    { key: "snacks", name: "Snacks", color: "bg-green-50" }
  ];

  const handleCreateMenu = async (menuData) => {
    const success = await onCreateMenu(menuData);
    if (success) {
      setShowCreateModal(false);
      setSelectedDay(null);
    }
    return success;
  };

  const handleUpdateMenu = async (menuData) => {
    const success = await onUpdateMenu(editingMenu.items[0].id, menuData);
    if (success) {
      setEditingMenu(null);
      setSelectedDay(null);
    }
    return success;
  };

  const handleDeleteMenu = async (menuId) => {
    const success = await onDeleteMenu(menuId);
    if (success) {
      setDeletingMenu(null);
    }
    return success;
  };

  const getMenuForDayAndMeal = (dayId, mealType) => {
    return weeklyMenu[dayId]?.[mealType];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Weekly Food Menu</h3>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedDay(null);
              setShowCreateModal(true);
            }}
            className="btn btn-primary"
          >
            Create Menu
          </button>
          <button
            onClick={onRefresh}
            className="btn btn-outline"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {days.map(day => (
          <div key={day.id} className="card bg-white shadow-lg">
            <div className="card-body">
              <div className="flex justify-between items-center mb-4">
                <h4 className="card-title text-lg font-bold">
                  {day.name}
                </h4>
                <button
                  onClick={() => {
                    setSelectedDay(day.id);
                    setShowCreateModal(true);
                  }}
                  className="btn btn-sm btn-outline"
                >
                  Add Menu
                </button>
              </div>
              
              <div className="space-y-4">
                {mealTypes.map(mealType => {
                  const menu = getMenuForDayAndMeal(day.id, mealType.key);
                  
                  return (
                    <div
                      key={mealType.key}
                      className={`p-4 rounded-lg border ${mealType.color} relative`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-semibold flex items-center">
                          <span className="w-3 h-3 rounded-full bg-current mr-2"></span>
                          {mealType.name}
                          {menu?.price && (
                            <span className="ml-2 text-sm font-medium">
                              ₹{menu.price}
                            </span>
                          )}
                        </h5>
                        {menu && (
                          <div className="dropdown dropdown-end">
                            <div tabIndex={0} role="button" className="btn btn-ghost btn-xs">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                              </svg>
                            </div>
                            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-32">
                              <li>
                                <button onClick={() => {
                                  setEditingMenu({
                                    ...menu, // Spread the existing menu object to preserve all properties
                                    day_of_week: day.id,
                                    meal_type: mealType.key
                                  });
                                  setSelectedDay(day.id);
                                }}>
                                  Edit
                                </button>
                              </li>
                              <li>
                                <button onClick={() => setDeletingMenu(menu)} className="text-error">
                                  Delete
                                </button>
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>
                      
                      {menu ? (
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-gray-600">
                            {categories.find(cat => cat.id === menu.category_id)?.name}
                          </div>
                          {menu.items?.map((item, index) => (
                            <div key={index} className="text-sm">
                              <div className="font-medium">{item.name}</div>
                              {item.description && (
                                <div className="text-gray-600 text-xs">
                                  {item.description}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 italic">
                          No menu scheduled
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {Object.keys(weeklyMenu).length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-500">No weekly menu available</div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary mt-4"
          >
            Create Weekly Menu
          </button>
        </div>
      )}

      {(showCreateModal || editingMenu) && (
        <WeeklyMenuModal
          menu={editingMenu}
          categories={categories}
          foodItems={foodItems}
          selectedDay={selectedDay}
          onSubmit={editingMenu ? handleUpdateMenu : handleCreateMenu}
          onClose={() => {
            setShowCreateModal(false);
            setEditingMenu(null);
            setSelectedDay(null);
          }}
        />
      )}

      {deletingMenu && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Delete Menu</h3>
            <p className="py-4">
              Are you sure you want to delete this menu? This action cannot be undone.
            </p>
            <div className="modal-action">
              <button 
                onClick={() => setDeletingMenu(null)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDeleteMenu(deletingMenu.id)}
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

export default FoodMenuTab;