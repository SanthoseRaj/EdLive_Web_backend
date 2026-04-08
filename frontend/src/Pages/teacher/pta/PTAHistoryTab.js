import React from 'react';

const PTAHistoryTab = ({ meetings, classes, onEditMeeting }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getClassNames = (classIds) => {
    if (!classIds || classIds.length === 0) return "All Classes";
    return classIds.map(classId => {
      const classObj = classes.find(c => c.id === classId);
      return classObj ? classObj.class_name : `Class ${classId}`;
    }).join(', ');
  };

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Meeting History</h3>
      
      <div className="bg-white rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Title</th>
                <th>Classes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {meetings.map((meeting) => (
                <tr key={meeting.id}>
                  <td>
                    <div className="font-medium">{formatDate(meeting.date)}</div>
                    <div className="text-sm text-gray-500">{formatTime(meeting.time)}</div>
                  </td>
                  <td>
                    <div className="font-medium">{meeting.title}</div>
                    <div className="text-sm text-gray-500 line-clamp-1">{meeting.description}</div>
                  </td>
                  <td>{getClassNames(meeting.class_ids)}</td>
                  <td>
                    <button
                      onClick={() => onEditMeeting(meeting)}
                      className="btn btn-sm btn-ghost mr-2"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {meetings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No meeting history found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PTAHistoryTab;