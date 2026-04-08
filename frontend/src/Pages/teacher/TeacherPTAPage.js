import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PTAMeetingsTab from "./pta/PTAMeetingsTab.js";
import PTAHistoryTab from "./pta/PTAHistoryTab.js";
import PTAPeopleTab from "./pta/PTAPeopleTab.js";
import PTACreateModal from "./pta/PTACreateModal.js";
import PTAAnnounceModal from "./pta/PTAAnnounceModal.js";

const TeacherPTAPage = () => {
  const [activeTab, setActiveTab] = useState("next-meeting");
  const [meetings, setMeetings] = useState([]);
  const [historyMeetings, setHistoryMeetings] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [announceData, setAnnounceData] = useState({
    meetingId: "",
    class_ids: [],
    include_all_sections: true,
    channels: ["sms", "whatsapp", "email"]
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchUpcomingMeetings();
    fetchClasses();
    if (activeTab === "history") {
      fetchHistoryMeetings();
    } else if (activeTab === "people") {
      fetchPTAMembers();
    }
  }, [activeTab]);

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

  const handleCreateMeeting = async (formData) => {
    try {
      const url = editingMeeting 
        ? `${process.env.REACT_APP_API_URL}/api/pta/meetings/${editingMeeting.id}`
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
        }
        return false;
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
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white py-8">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-white mb-4 hover:text-blue-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-3xl font-bold mb-2">PTA</h1>
          <h2 className="text-2xl font-semibold">Announce a meeting</h2>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <div className="tabs tabs-boxed bg-white p-1 rounded-lg mb-6">
          <button
            className={`tab tab-lg ${activeTab === 'next-meeting' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('next-meeting')}
          >
            Next Meeting
          </button>
          <button
            className={`tab tab-lg ${activeTab === 'history' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
          <button
            className={`tab tab-lg ${activeTab === 'people' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('people')}
          >
            People
          </button>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'next-meeting' && (
          <PTAMeetingsTab
            meetings={meetings}
            classes={classes}
            onEditMeeting={handleEditMeeting}
            onDeleteMeeting={handleDeleteMeeting}
            onAnnounceMeeting={handleAnnounceMeetingClick}
            onCreateMeeting={() => setShowCreateModal(true)}
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

export default TeacherPTAPage;