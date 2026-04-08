import React from 'react';

const PTAMeetingsTab = ({ meetings, classes, onEditMeeting, onDeleteMeeting, onAnnounceMeeting, onCreateMeeting }) => {
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
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Upcoming Meetings</h3>
        <button
          onClick={onCreateMeeting}
          className="btn btn-primary"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Meeting
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {meetings.map((meeting) => (
          <div key={meeting.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm text-gray-500">
                {formatDate(meeting.date)} at {formatTime(meeting.time)}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => onAnnounceMeeting(meeting)}
                  className="btn btn-sm btn-primary"
                >
                  Announce
                </button>
                <button
                  onClick={() => onEditMeeting(meeting)}
                  className="btn btn-sm btn-ghost"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => onDeleteMeeting(meeting.id)}
                  className="btn btn-sm btn-ghost text-error"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-2">{meeting.title}</h3>
            <p className="text-gray-600 mb-4 line-clamp-2">{meeting.description}</p>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">For classes:</span>
                <span className="text-sm text-gray-600">{getClassNames(meeting.class_ids)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Sections:</span>
                <span className="text-sm text-gray-600">
                  {meeting.include_all_sections ? 'All divisions' : 'Selected divisions'}
                </span>
              </div>
            </div>
          </div>
        ))}

        {meetings.length === 0 && (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">No upcoming meetings. Create your first meeting!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PTAMeetingsTab;