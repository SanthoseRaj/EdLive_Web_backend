const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-base-100 rounded-lg p-0 w-full max-w-md overflow-hidden">
          <div className="flex justify-between items-center p-6 bg-[rgb(59,55,207)]">
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <button 
              onClick={onClose} 
              className="btn btn-sm btn-ghost text-white hover:bg-white/20"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    );
};
  
export default Modal;