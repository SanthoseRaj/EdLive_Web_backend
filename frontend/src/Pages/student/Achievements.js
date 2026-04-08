import React, { useState, useEffect } from "react";

const StudentAchievementPage = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [lastViewedItems, setLastViewedItems] = useState([]);

  useEffect(() => {
    fetchAchievements();
    fetchLastViewedItems();
  }, []);

  const fetchAchievements = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/achievements/visible?classId=` + localStorage.getItem("classId") +`&studentId=`+ localStorage.getItem("childId"),
        { method: 'GET', credentials: 'include' }
      );
      
      if (response.ok) {
        const data = await response.json();
        setAchievements(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLastViewedItems = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/dashboard/last-viewed?item_type=achievements&studentId=` + localStorage.getItem("childId"),
        { method: 'GET', credentials: 'include' }
      );
      
      if (response.ok) {
        const data = await response.json();
        setLastViewedItems(Array.isArray(data.data) ? data.data : []);
      }
    } catch (error) {
      console.error('Failed to fetch last viewed items:', error);
    }
  };

  // Mark item as viewed
  const markAsViewed = async (itemId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/dashboard/viewed?studentId=` + localStorage.getItem("childId"),
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

  // Check if an achievement has been viewed
  const isAchievementViewed = (achievementId) => {
    return lastViewedItems.some(item => item.item_id === achievementId);
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

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
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
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">My Achievements</h1>
          <p className="text-lg max-w-2xl mx-auto">
            View your accomplishments and achievements
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement) => {
            const isViewed = isAchievementViewed(achievement.id);
            const hasImage = achievement.evidence_url;
            
            return (
              <div 
                key={achievement.id} 
                className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer ${
                  isViewed 
                    ? "border-gray-300" 
                    : "border-blue-500 border-2 font-bold"
                }`}
                onClick={() => handleViewAchievement(achievement)}
              >
                {/* Achievement Image */}
                <div className="h-48 overflow-hidden rounded-t-lg">
                  {hasImage ? (
                    <img 
                      src={achievement.evidence_url} 
                      alt={achievement.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <span className="text-sm">No Image</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Achievement Content */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{achievement.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{achievement.description}</p>

                  <div className="flex flex-wrap items-center text-sm text-gray-500 gap-2 mb-3">
                    <span><strong>Date:</strong> {formatDate(achievement.achievement_date)}</span>
                    <span><strong>Class:</strong> {achievement.class_id || 'N/A'}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <div className={`badge ${
                      achievement.category === 'academic' ? 'badge-primary' :
                      achievement.category === 'sports' ? 'badge-success' :
                      achievement.category === 'arts' ? 'badge-secondary' :
                      'badge-neutral'
                    }  p-2`}>
                      {achievement.category}
                    </div>
                    
                    <div className={`badge ${
                      achievement.approved ? 'badge-success' : 'badge-warning'
                    }  p-2`}>
                      {achievement.approved ? 'APPROVED' : 'PENDING'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {achievements.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <p className="text-gray-500 text-lg">No achievements yet.</p>
          </div>
        )}
      </div>

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
                    selectedAchievement.approved ? 'badge-success' : 'badge-warning'
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

                <div>
                  <label className="label">
                    <span className="label-text font-semibold">Created</span>
                  </label>
                  <p className="text-gray-700 text-sm">
                    {formatDateTime(selectedAchievement.created_at)}
                  </p>
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

              {selectedAchievement.updated_at && selectedAchievement.updated_at !== selectedAchievement.created_at && (
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    Last updated: {formatDateTime(selectedAchievement.updated_at)}
                  </p>
                </div>
              )}
            </div>

            <div className="modal-action">
              <button
                type="button"
                onClick={() => setShowViewModal(false)}
                className="btn btn-primary"
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

export default StudentAchievementPage;