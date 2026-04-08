import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PTAMeetingsTab from "../teacher/pta/PTAMeetingsTab.js";
import PTAHistoryTab from "../teacher/pta/PTAHistoryTab.js";
import PTAPeopleTab from "../teacher/pta/PTAPeopleTab.js";
import PTACreateModal from "../teacher/pta/PTACreateModal.js";
import PTAAnnounceModal from "../teacher/pta/PTAAnnounceModal.js";

const AdminPTAPage = () => {
  const [activeTab, setActiveTab] = useState("next-meeting");
  const [meetings, setMeetings] = useState([]);
  const [historyMeetings, setHistoryMeetings] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(true);
  
  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  
  // Selection States
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [editingMeeting, setEditingMeeting] = useState(null);
  
  // Announcement State
  const [announceData, setAnnounceData] = useState({
    meetingId: "",
    class_ids: [],
    include_all_sections: true,
    channels: ["sms", "whatsapp", "email"]
  });

  const navigate = useNavigate();

  // --- Effects ---

  useEffect(() => {
    fetchUpcomingMeetings();
    fetchClasses();
  }, []);

  useEffect(() => {
    if (activeTab === "history") {
      fetchHistoryMeetings();
    } else if (activeTab === "people") {
      fetchPTAMembers();
    }
  }, [activeTab]);

  // --- API Calls ---

  const fetchUpcomingMeetings = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/pta/meetings/upcoming`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setMeetings(data);
      }
    } catch (error) {
      console.error('Failed to fetch meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoryMeetings = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/pta/meetings/history`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setHistoryMeetings(data);
      }
    } catch (error) {
      console.error('Failed to fetch meeting history:', error);
    }
  };

  const fetchPTAMembers = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/pta/members`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      }
    } catch (error) {
      console.error('Failed to fetch PTA members:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/master/classes`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    } finally {
      setClassesLoading(false);
    }
  };

  // --- Handlers ---

  const handleCreateMeeting = async (formData) => {
    try {
      const url = editingMeeting 
        ? `${process.env.REACT_APP_API_URL}/api/pta/meetings/${editingMeeting.id}` // Ensure this route exists in backend if using PUT
        : `${process.env.REACT_APP_API_URL}/api/pta/meetings`;
      
      const method = editingMeeting ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowCreateModal(false);
        setEditingMeeting(null);
        fetchUpcomingMeetings();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to save meeting:', error);
      return false;
    }
  };

  const handleAnnounceMeeting = async (announceData) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/pta/announce`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(announceData)
      });

      if (response.ok) {
        setShowAnnounceModal(false);
        alert("Announcement sent successfully.");
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to announce meeting:', error);
      return false;
    }
  };

  const handleDeleteMeeting = async (id) => {
    if (window.confirm('Are you sure you want to delete this meeting?')) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/pta/meetings/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        
        if (response.ok) {
          fetchUpcomingMeetings();
          return true;
        } else {
          console.error("Delete failed");
          return false;
        }
      } catch (error) {
        console.error('Failed to delete meeting:', error);
        return false;
      }
    }
  };

  const handleEditMeeting = (meeting) => {
    setEditingMeeting(meeting);
    setShowCreateModal(true);
  };

  const handleAnnounceMeetingClick = (meeting) => {
    setAnnounceData({
      meetingId: meeting.id,
      class_ids: meeting.class_ids || [],
      include_all_sections: meeting.include_all_sections,
      channels: ["sms", "whatsapp", "email"]
    });
    setShowAnnounceModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setEditingMeeting(null);
  };

  const handleCloseAnnounceModal = () => {
    setShowAnnounceModal(false);
  };

  if (loading || classesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header - Indigo/Purple Theme */}
      <div className="bg-indigo-700 text-white py-8 shadow-lg">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-indigo-100 mb-4 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold mb-2">PTA Management</h1>
              <h2 className="text-xl font-medium text-indigo-100">Oversee meetings and announcements</h2>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn btn-secondary shadow-md"
            >
              + New Meeting
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="tabs tabs-boxed bg-white p-2 rounded-xl shadow-sm mb-8 border border-gray-100">
          <button
            className={`tab tab-lg flex-1 ${activeTab === 'next-meeting' ? 'tab-active bg-indigo-100 text-indigo-700' : ''}`}
            onClick={() => setActiveTab('next-meeting')}
          >
            Upcoming Meetings
          </button>
          <button
            className={`tab tab-lg flex-1 ${activeTab === 'history' ? 'tab-active bg-indigo-100 text-indigo-700' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            Meeting History
          </button>
          <button
            className={`tab tab-lg flex-1 ${activeTab === 'people' ? 'tab-active bg-indigo-100 text-indigo-700' : ''}`}
            onClick={() => setActiveTab('people')}
          >
            PTA Members
          </button>
        </div>

        {/* Content based on active tab */}
        <div className="bg-white rounded-lg shadow-sm min-h-[400px]">
            {activeTab === 'next-meeting' && (
            <PTAMeetingsTab
                meetings={meetings}
                classes={classes}
                onEditMeeting={handleEditMeeting}
                onDeleteMeeting={handleDeleteMeeting}
                onAnnounceMeeting={handleAnnounceMeetingClick}
                onCreateMeeting={() => setShowCreateModal(true)}
                isAdmin={true} 
            />
            )}

            {activeTab === 'history' && (
            <PTAHistoryTab
                meetings={historyMeetings}
                classes={classes}
                onEditMeeting={handleEditMeeting}
            />
            )}

            {activeTab === 'people' && (
            <PTAPeopleTab members={members} />
            )}
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <PTACreateModal
          meeting={editingMeeting}
          classes={classes}
          onSubmit={handleCreateMeeting}
          onClose={handleCloseCreateModal}
        />
      )}

      {showAnnounceModal && (
        <PTAAnnounceModal
          announceData={announceData}
          classes={classes}
          onSubmit={handleAnnounceMeeting}
          onClose={handleCloseAnnounceModal}
          onUpdateAnnounceData={setAnnounceData}
        />
      )}
    </div>
  );
};

export default AdminPTAPage;