import { useEffect, useRef } from 'react';

const EditableField = ({ 
  label, 
  value, 
  type = 'text', 
  options = [], 
  editing, 
  onEdit, 
  inputValue, 
  setInputValue, 
  handleUpdate, 
  cancelEdit 
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      if (type === 'date') {
        inputRef.current.showPicker();
      }
      if (type === 'text') {
        inputRef.current.select();
      }
      if (type === 'textarea') {
        // Move cursor to end of text
        const length = inputRef.current.value.length;
        inputRef.current.setSelectionRange(length, length);
      }
    }
  }, [editing, type]);

  const handleBlur = () => {
    // Safely compare values, handling null/undefined cases
    const currentValue = value === null || value === undefined ? '' : value.toString();
    const newValue = inputValue === null || inputValue === undefined ? '' : inputValue.toString();
    
    if (newValue !== currentValue) {
      handleUpdate(newValue);
    } else {
      cancelEdit();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      cancelEdit();
      return;
    }

    // Special handling for textareas
    if (type === 'textarea') {
      if (e.key === 'Enter' && e.ctrlKey) {
        // Ctrl+Enter to submit
        handleBlur();
        return;
      }
      // Allow default Enter behavior (new line)
      return;
    }

    // For non-textarea fields
    if (e.key === 'Tab' && editing) {
      e.preventDefault();
      handleBlur();
    }
    if (e.key === 'Enter' && editing) {
      handleBlur();
    }
  };

  const renderTextWithNewlines = (text) => {
    if (!text) return <span className="text-gray-400">Click to add</span>;    
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div className="form-control w-full">
      {label && (
        <label className="label py-1">
          <span className="label-text font-medium">{label}</span>
        </label>
      )}
      <div className="w-full">
        {editing ? (
          type === 'select' ? (          
            <select
              ref={inputRef}
              value={inputValue || ''}
              onChange={(e) => setInputValue(e.target.value)}
              className="select select-bordered select-sm w-full"
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
            >
              {options.map((option) => (
                <option
                  key={option.value || option} 
                  value={option.value || option}
                >
                  {option.label || option}
                </option>
              ))}
            </select>
          ) : type === 'textarea' ? (
            <textarea
              ref={inputRef}
              value={inputValue || ''}
              onChange={(e) => setInputValue(e.target.value)}
              className="textarea textarea-bordered w-full text-sm"
              rows={3}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              placeholder="Press Enter for new line, Ctrl+Enter to save"
            />
          ) : type === 'checkbox' ? (
            <div className="flex items-center gap-2 pl-1">
              <label className="label cursor-pointer gap-2">
                <span className="label-text">No</span>
                <input
                  ref={inputRef}
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={inputValue || false}
                  onChange={(e) => setInputValue(e.target.checked)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleBlur}
                />
                <span className="label-text">Yes</span>
              </label>
            </div>
          ) : (        
            <input
              ref={inputRef}
              type={type}
              value={inputValue || ''}
              onChange={(e) => setInputValue(e.target.value)}
              className="input input-bordered input-sm w-full"
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              min={type === 'date' ? '1950-01-01' : undefined}
              max={type === 'date' ? new Date().toISOString().split('T')[0] : undefined}
            />
          )
        ) : (
          <div 
            className="cursor-pointer hover:bg-base-200 p-2 rounded w-full min-h-[2.5rem] flex items-center pl-1"
            onClick={onEdit}
          >
            {type === 'checkbox' ? (
              <span className={value ? "text-primary font-medium" : "text-gray-600"}>
                {value ? 'Yes' : 'No'}
              </span>
            ) : type === 'textarea' ? (
              <div className="whitespace-pre-line">
                {renderTextWithNewlines(value)}
              </div>
            ) : (
              <span className={value ? "" : "text-gray-400"}>
                {value || 'Click to add'}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditableField;