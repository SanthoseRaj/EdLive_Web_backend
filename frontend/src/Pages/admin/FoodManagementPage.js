// FoodManagementPage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FoodMenuTab from "./food/FoodMenuTab.js";
import FoodScheduleTab from "./food/FoodScheduleTab.js";
import FoodCategoriesTab from "./food/FoodCategoriesTab.js";
import FoodItemsTab from "./food/FoodItemsTab.js";

const FoodManagementPage = () => {
  const [activeTab, setActiveTab] = useState("menu");
  const [loading, setLoading] = useState(true);
  const [weeklyMenu, setWeeklyMenu] = useState({});
  const [foodCategories, setFoodCategories] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [studentSchedules, setStudentSchedules] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (activeTab === "menu") {
      fetchWeeklyMenu();
      fetchFoodItems();
      fetchFoodCategories();
    } else if (activeTab === "categories") {
      fetchFoodCategories();
    } else if (activeTab === "items") {
      fetchFoodItems();
      fetchFoodCategories();
    } else if (activeTab === "schedule") {
      fetchStudentSchedules();
    }
  }, [activeTab]);

  const fetchWeeklyMenu = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/food/weekly-menu`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setWeeklyMenu(data);
      }
    } catch (error) {
      console.error('Failed to fetch weekly menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFoodCategories = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/food/categories`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setFoodCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch food categories:', error);
    }
  };

  const fetchFoodItems = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/food/items`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setFoodItems(data);
        } else if (data && Array.isArray(data.items)) {
          setFoodItems(data.items);
        } else {
          setFoodItems([]);
        }
      } else {
        setFoodItems([]);
      }
    } catch (error) {
      console.error('Failed to fetch food items:', error);
      setFoodItems([]);
    }
  };

  const fetchStudentSchedules = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/food/schedules?date=${today}&limit=50`, 
        {
          method: 'GET',
          credentials: 'include'
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setStudentSchedules(data.schedules || []);
      }
    } catch (error) {
      console.error('Failed to fetch student schedules:', error);
    }
  };

  // Category CRUD operations
  const handleCreateCategory = async (categoryData) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/food/categories`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryData)
      });

      if (response.ok) {
        fetchFoodCategories();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to create category:', error);
      return false;
    }
  };

  const handleUpdateCategory = async (categoryId, categoryData) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/food/categories/${categoryId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryData)
      });

      if (response.ok) {
        fetchFoodCategories();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update category:', error);
      return false;
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/food/categories/${categoryId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        fetchFoodCategories();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to delete category:', error);
      return false;
    }
  };

  // Food Item CRUD operations
  const handleCreateFoodItem = async (itemData) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/food/items`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(itemData)
      });

      if (response.ok) {
        fetchFoodItems();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to create food item:', error);
      return false;
    }
  };

  const handleUpdateFoodItem = async (itemId, itemData) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/food/items/${itemId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(itemData)
      });

      if (response.ok) {
        fetchFoodItems();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update food item:', error);
      return false;
    }
  };

  const handleDeleteFoodItem = async (itemId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/food/items/${itemId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        fetchFoodItems();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to delete food item:', error);
      return false;
    }
  };
// Weekly Menu CRUD operations
const handleCreateWeeklyMenu = async (menuData) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/food/weekly-menu`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(menuData)
    });

    if (response.ok) {
      fetchWeeklyMenu();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to create weekly menu:', error);
    return false;
  }
};

const handleUpdateWeeklyMenu = async (menuId, menuData) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/food/weekly-menu/${menuId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(menuData)
    });

    if (response.ok) {
      fetchWeeklyMenu();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to update weekly menu:', error);
    return false;
  }
};

const handleDeleteWeeklyMenu = async (menuId) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/food/weekly-menu/${menuId}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (response.ok) {
      fetchWeeklyMenu();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to delete weekly menu:', error);
    return false;
  }
};
  // Schedule CRUD operations
  const handleCreateSchedule = async (scheduleData) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/food/schedule`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(scheduleData)
      });

      if (response.ok) {
        fetchStudentSchedules();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to create schedule:', error);
      return false;
    }
  };

  const handleUpdateSchedule = async (scheduleId, scheduleData) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/food/schedules/${scheduleId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(scheduleData)
      });

      if (response.ok) {
        fetchStudentSchedules();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update schedule:', error);
      return false;
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/food/schedules/${scheduleId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        fetchStudentSchedules();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to delete schedule:', error);
      return false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-600 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Food Management</h1>
          <h2 className="text-2xl font-semibold">Manage menus and student food schedules</h2>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <div className="tabs tabs-boxed bg-white p-1 rounded-lg mb-6">
          <button
            className={`tab tab-lg ${activeTab === 'menu' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('menu')}
          >
            Weekly Menu
          </button>
          <button
            className={`tab tab-lg ${activeTab === 'schedule' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            Food Schedule
          </button>
          <button
            className={`tab tab-lg ${activeTab === 'categories' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            Categories
          </button>
          <button
            className={`tab tab-lg ${activeTab === 'items' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('items')}
          >
            Food Items
          </button>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'menu' && (
          <FoodMenuTab
            weeklyMenu={weeklyMenu}
            categories={foodCategories}
            foodItems={foodItems}
            onCreateMenu={handleCreateWeeklyMenu}
            onUpdateMenu={handleUpdateWeeklyMenu}
            onDeleteMenu={handleDeleteWeeklyMenu}
            onRefresh={fetchWeeklyMenu}
          />
        )}

        {activeTab === 'schedule' && (
          <FoodScheduleTab
            schedules={studentSchedules}
            categories={foodCategories}
            onCreateSchedule={handleCreateSchedule}
            onUpdateSchedule={handleUpdateSchedule}
            onDeleteSchedule={handleDeleteSchedule}
            onRefresh={fetchStudentSchedules}
          />
        )}

        {activeTab === 'categories' && (
          <FoodCategoriesTab
            categories={foodCategories}
            onCreateCategory={handleCreateCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
            onRefresh={fetchFoodCategories}
          />
        )}

        {activeTab === 'items' && (
          <FoodItemsTab
            items={foodItems}
            categories={foodCategories}
            onCreateItem={handleCreateFoodItem}
            onUpdateItem={handleUpdateFoodItem}
            onDeleteItem={handleDeleteFoodItem}
            onRefresh={fetchFoodItems}
          />
        )}
      </div>
    </div>
  );
};

export default FoodManagementPage;