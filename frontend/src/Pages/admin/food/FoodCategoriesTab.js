// FoodCategoriesTab.js
import React, { useState } from "react";
import FoodCategoryModal from "./FoodCategoryModal.js";

const FoodCategoriesTab = ({ categories, onCreateCategory, onUpdateCategory, onDeleteCategory, onRefresh }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);

  const handleCreateCategory = async (categoryData) => {
    const success = await onCreateCategory(categoryData);
    if (success) {
      setShowCreateModal(false);
    }
    return success;
  };

  const handleUpdateCategory = async (categoryData) => {
    const success = await onUpdateCategory(editingCategory.id, categoryData);
    if (success) {
      setEditingCategory(null);
    }
    return success;
  };

  const handleDeleteCategory = async (categoryId) => {
    const success = await onDeleteCategory(categoryId);
    if (success) {
      setDeletingCategory(null);
    }
    return success;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Food Categories</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            Create Category
          </button>
          <button
            onClick={onRefresh}
            className="btn btn-outline"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(category => (
          <div key={category.id} className="card bg-white shadow">
            <div className="card-body">
              <div className="flex justify-between items-start">
                <h4 className="card-title">{category.name}</h4>
                <div className="dropdown dropdown-end">
                  <div tabIndex={0} role="button" className="btn btn-ghost btn-sm">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                    </svg>
                  </div>
                  <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-32">
                    <li><button onClick={() => setEditingCategory(category)}>Edit</button></li>
                    <li><button onClick={() => setDeletingCategory(category)} className="text-error">Delete</button></li>
                  </ul>
                </div>
              </div>
              
              {category.description && (
                <p className="text-gray-600">{category.description}</p>
              )}
              <div className="card-actions justify-end mt-4">
                <div className="badge badge-primary badge-lg  p-2">
                  ₹{category.price}
                </div>
              </div>
            </div>
          </div>
        ))}

        {categories.length === 0 && (
          <div className="col-span-full text-center py-8">
            <div className="text-gray-500">No food categories found</div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary mt-4"
            >
              Create First Category
            </button>
          </div>
        )}
      </div>

      {showCreateModal && (
        <FoodCategoryModal
          onSubmit={handleCreateCategory}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {editingCategory && (
        <FoodCategoryModal
          category={editingCategory}
          onSubmit={handleUpdateCategory}
          onClose={() => setEditingCategory(null)}
        />
      )}

      {deletingCategory && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Delete Category</h3>
            <p className="py-4">
              Are you sure you want to delete the category "{deletingCategory.name}"? 
              This action cannot be undone.
            </p>
            <div className="modal-action">
              <button 
                onClick={() => setDeletingCategory(null)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDeleteCategory(deletingCategory.id)}
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

export default FoodCategoriesTab;