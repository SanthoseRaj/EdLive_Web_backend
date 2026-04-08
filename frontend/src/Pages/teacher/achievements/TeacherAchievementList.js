// src/Pages/teacher/achievements/TeacherAchievementList.js
import { useState, useEffect } from 'react';
import TeacherAchievementCard from './TeacherAchievementCard.js';
import CreateAchievementModal from './CreateAchievementModal.js';

const TeacherAchievementList = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [lastViewedItems, setLastViewedItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all achievements
        const achievementsResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/api/achievements/visible?classId=1`,
          { method: 'GET', credentials: 'include' }
        );
        
        if (!achievementsResponse.ok) throw new Error('Failed to fetch achievements');
        const achievementsData = await achievementsResponse.json();
        setAchievements(Array.isArray(achievementsData) ? achievementsData : []);

        // Fetch students for the teacher's classes
        const studentsResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/api/staff/staff/students/list`,
          { method: 'GET', credentials: 'include' }
        );
        
        if (studentsResponse.ok) {
          const studentsData = await studentsResponse.json();
          setStudents(Array.isArray(studentsData) ? studentsData : []);
        }

        // Fetch classes taught by the teacher
        const classesResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/api/staff/staff/teacher/class`,
          { method: 'GET', credentials: 'include' }
        );
        
        if (classesResponse.ok) {
          const classesData = await classesResponse.json();
          setClasses(Array.isArray(classesData) ? classesData : []);
        }

        // Fetch last viewed achievements
        const lastViewedResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/api/dashboard/last-viewed?item_type=achievements`,
          { method: 'GET', credentials: 'include' }
        );
        
        if (lastViewedResponse.ok) {
          const lastViewedData = await lastViewedResponse.json();
          setLastViewedItems(Array.isArray(lastViewedData.data) ? lastViewedData.data : []);
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Check if an achievement has been viewed
  const isAchievementViewed = (achievementId) => {
    return lastViewedItems.some(item => item.item_id === achievementId);
  };

  // Mark item as viewed
  const markAsViewed = async (itemId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/dashboard/viewed`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            item_type: "achievements",
            item_id: itemId
          })
        }
      );

      if (response.ok) {
        // Update the last viewed items state
        setLastViewedItems(prev => [...prev, { item_id: itemId }]);
      }
    } catch (error) {
      console.error('Failed to mark item as viewed:', error);
    }
  };

  const handleCreateSuccess = (newAchievement) => {
    setAchievements([...achievements, newAchievement]);
    setShowCreateModal(false);
  };

  const handleApprove = async (id) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/achievements/${id}/approve`,
        { method: 'PATCH', credentials: 'include' }
      );
      
      if (!response.ok) throw new Error('Failed to approve achievement');
      const updatedAchievement = await response.json();
      
      setAchievements(achievements.map(ach => 
        ach.id === id ? updatedAchievement.achievement : ach
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReject = async (id) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/achievements/${id}/reject`,
        { method: 'PATCH', credentials: 'include' }
      );
      
      if (!response.ok) throw new Error('Failed to reject achievement');
      const updatedAchievement = await response.json();
      
      setAchievements(achievements.map(ach => 
        ach.id === id ? updatedAchievement.achievement : ach
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleViewAchievement = async (achievement) => {
    // Mark as viewed if it hasn't been viewed yet
    if (!isAchievementViewed(achievement.id)) {
      await markAsViewed(achievement.id);
    }
    
    setSelectedAchievement(achievement);
    setShowViewModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <strong>Error:</strong> {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      {/* Header with title and Add button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Student Achievements</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Add Achievement
        </button>
      </div>

      {/* Legend for border colors */}
      <div className="flex items-center gap-4 mb-4 text-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 border-2 border-blue-500 mr-2 rounded"></div>
          <span>New (Unviewed)</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 border-2 border-gray-300 mr-2 rounded"></div>
          <span>Viewed</span>
        </div>
      </div>

      {/* Achievements grid */}
      {achievements.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p className="text-lg">No achievements found</p>
          <p className="mt-2">Click "Add Achievement" to create your first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement) => {
            const isViewed = isAchievementViewed(achievement.id);
            return (
              <div 
                key={achievement.id} 
                className={`${isViewed ? "" : "font-bold"} ${
                  isViewed 
                    ? "border-gray-300" 
                    : "border-blue-500 border-2"
                } rounded-lg transition-all duration-300 cursor-pointer`}
                onClick={() => handleViewAchievement(achievement)}
              >
                <TeacherAchievementCard
                  achievement={achievement}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  activeTab="all"
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Create Achievement Modal */}
      {showCreateModal && (
        <CreateAchievementModal 
          onClose={() => setShowCreateModal(false)}
          onCreateSuccess={handleCreateSuccess}
          students={students}
          classes={classes}
        />
      )}

      {/* View Achievement Modal */}
      {showViewModal && selectedAchievement && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-2xl text-gray-800">{selectedAchievement.title}</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Achievement Image */}
              {selectedAchievement.evidence_url && (
                <div className="flex justify-center">
                  <img 
                    src={selectedAchievement.evidence_url} 
                    alt={selectedAchievement.title}
                    className="rounded-lg max-h-80 object-cover"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">
                    <span className="label-text font-semibold">Student</span>
                  </label>
                  <p className="text-gray-700">{selectedAchievement.full_name || 'Unknown Student'}</p>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-semibold">Class</span>
                  </label>
                  <p className="text-gray-700">{selectedAchievement.class_id || 'N/A'}</p>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-semibold">Achievement Date</span>
                  </label>
                  <p className="text-gray-700">{formatDate(selectedAchievement.achievement_date)}</p>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-semibold">Category</span>
                  </label>
                  <span className={`badge ${
                    selectedAchievement.category === 'academic' ? 'badge-primary' :
                    selectedAchievement.category === 'sports' ? 'badge-success' :
                    selectedAchievement.category === 'arts' ? 'badge-secondary' :
                    'badge-neutral'
                  }  p-2`}>
                    {selectedAchievement.category}
                  </span>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-semibold">Status</span>
                  </label>
                  <span className={`badge ${
                    selectedAchievement.approved ? 'badge-success' : 'badge-error'
                  }  p-2`}>
                    {selectedAchievement.approved ? 'APPROVED' : 'PENDING'}
                  </span>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-semibold">Awarded By</span>
                  </label>
                  <p className="text-gray-700">{selectedAchievement.awarded_by || 'N/A'}</p>
                </div>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-semibold">Description</span>
                </label>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedAchievement.description}</p>
                </div>
              </div>
            </div>

            <div className="modal-action">
              <button
                type="button"
                onClick={() => setShowViewModal(false)}
                className="btn btn-ghost"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAchievementList;