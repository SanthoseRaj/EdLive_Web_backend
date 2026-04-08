import React from 'react';
import { createPortal } from 'react-dom';

const PTAAnnounceModal = ({ announceData, classes, onSubmit, onClose, onUpdateAnnounceData }) => {
  const toggleClassSelection = (classId) => {
    onUpdateAnnounceData(prev => ({
      ...prev,
      class_ids: prev.class_ids.includes(classId)
        ? prev.class_ids.filter(id => id !== classId)
        : [...prev.class_ids, classId]
    }));
  };

  const toggleChannelSelection = (channel) => {
    onUpdateAnnounceData(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onSubmit(announceData);
    if (success) {
      onClose();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex justify-center items-start bg-black/40">
      <div className="mt-8 w-full max-w-2xl bg-base-100 rounded-xl shadow-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-indigo-700">Announce Meeting</h3>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text font-medium">Select classes</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto bg-gray-50 p-2 rounded border">
                {classes.map((classItem) => (
                  <label key={classItem.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={announceData.class_ids.includes(classItem.id)}
                      onChange={() => toggleClassSelection(classItem.id)}
                      className="checkbox checkbox-sm checkbox-primary"
                    />
                    <span className="text-sm">{classItem.class_name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium">Division</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={announceData.include_all_sections}
                    onChange={() => onUpdateAnnounceData({ ...announceData, include_all_sections: true })}
                    className="radio radio-sm radio-primary"
                  />
                  <span>All</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!announceData.include_all_sections}
                    onChange={() => onUpdateAnnounceData({ ...announceData, include_all_sections: false })}
                    className="radio radio-sm radio-primary"
                  />
                  <span>Selected Only</span>
                </label>
              </div>
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium">Channels</span>
              </label>
              <div className="flex gap-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={announceData.channels.includes('sms')}
                    onChange={() => toggleChannelSelection('sms')}
                    className="checkbox checkbox-sm checkbox-primary"
                  />
                  <span>SMS</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={announceData.channels.includes('whatsapp')}
                    onChange={() => toggleChannelSelection('whatsapp')}
                    className="checkbox checkbox-sm checkbox-primary"
                  />
                  <span>WhatsApp</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={announceData.channels.includes('email')}
                    onChange={() => toggleChannelSelection('email')}
                    className="checkbox checkbox-sm checkbox-primary"
                  />
                  <span>Email</span>
                </label>
              </div>
            </div>
          </div>

          <div className="modal-action">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary bg-indigo-600 border-none hover:bg-indigo-700"
            >
              Send Announcement
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default PTAAnnounceModal;