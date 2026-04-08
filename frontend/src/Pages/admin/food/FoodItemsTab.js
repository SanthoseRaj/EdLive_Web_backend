// FoodItemsTab.js
import React, { useState, useEffect } from "react";
import FoodItemModal from "./FoodItemModal.js";

const FoodItemsTab = ({ items, categories, onCreateItem, onUpdateItem, onDeleteItem, onRefresh }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAllFoodItems = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/food/items`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setAllItems(data);
        } else if (data && Array.isArray(data.items)) {
          setAllItems(data.items);
        } else {
          setAllItems([]);
        }
      } else {
        setAllItems([]);
      }
    } catch (error) {
      console.error('Failed to fetch food items:', error);
      setAllItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllFoodItems();
  }, []);

  const safeItems = Array.isArray(items) ? items : allItems;

  const filteredItems = selectedCategory 
    ? safeItems.filter(item => item.category_id === parseInt(selectedCategory))
    : safeItems;

  const handleCreateItem = async (itemData) => {
    const success = await onCreateItem(itemData);
    if (success) {
      setShowCreateModal(false);
      fetchAllFoodItems();
    }
    return success;
  };

  const handleUpdateItem = async (itemData) => {
    const success = await onUpdateItem(editingItem.id, itemData);
    if (success) {
      setEditingItem(null);
      fetchAllFoodItems();
    }
    return success;
  };

  const handleDeleteItem = async (itemId) => {
    const success = await onDeleteItem(itemId);
    if (success) {
      setDeletingItem(null);
      fetchAllFoodItems();
    }
    return success;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Food Items</h3>
        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="select select-bordered"
          >
            <option value="">All Categories</option>
            {Array.isArray(categories) && categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            Create Item
          </button>
          <button
            onClick={fetchAllFoodItems}
            className="btn btn-outline"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.isArray(filteredItems) && filteredItems.map(item => {
          const category = Array.isArray(categories) 
            ? categories.find(cat => cat.id === item.category_id)
            : null;
          
          return (
            <div key={item.id} className="card bg-white shadow">
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <h4 className="card-title">{item.name}</h4>
                  <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-sm">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                      </svg>
                    </div>
                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-32">
                      <li><button onClick={() => setEditingItem(item)}>Edit</button></li>
                      <li><button onClick={() => setDeletingItem(item)} className="text-error">Delete</button></li>
                    </ul>
                  </div>
                </div>
                
                {item.description && (
                  <p className="text-gray-600">{item.description}</p>
                )}
                <div className="card-actions justify-between items-center mt-4">
                  {category && (
                    <div className="badge badge-outline  p-2">
                      {category.name}
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    ID: {item.id}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {(!Array.isArray(filteredItems) || filteredItems.length === 0) && (
          <div className="col-span-full text-center py-8">
            <div className="text-gray-500">
              {selectedCategory ? 'No food items found in this category' : 'No food items found'}
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary mt-4"
            >
              Create First Item
            </button>
          </div>
        )}
      </div>

      {showCreateModal && (
        <FoodItemModal
          categories={categories}
          onSubmit={handleCreateItem}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {editingItem && (
        <FoodItemModal
          categories={categories}
          item={editingItem}
          onSubmit={handleUpdateItem}
          onClose={() => setEditingItem(null)}
        />
      )}

      {deletingItem && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Delete Food Item</h3>
            <p className="py-4">
              Are you sure you want to delete "{deletingItem.name}"? 
              This action cannot be undone.
            </p>
            <div className="modal-action">
              <button 
                onClick={() => setDeletingItem(null)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDeleteItem(deletingItem.id)}
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

export default FoodItemsTab;