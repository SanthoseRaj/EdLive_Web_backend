import React from 'react';

const BatchUpdateModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Changes",
  message = "Are you sure you want to save all changes?",
  confirmText = "Save All Changes",
  cancelText = "Cancel",
  loading = false 
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="py-4">{message}</p>
        
        <div className="modal-action">
          <button 
            onClick={onClose}
            className="btn btn-ghost"
            disabled={loading}
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Saving...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
      
      {/* Backdrop */}
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};

export default BatchUpdateModal;