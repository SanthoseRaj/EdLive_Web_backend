import { useState } from 'react';

const TeacherAchievementCard = ({ achievement, onApprove, onReject, activeTab }) => {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleApprove = async () => {
    setIsApproving(true);
    await onApprove(achievement.id);
    setIsApproving(false);
  };

  const handleReject = async () => {
    setIsRejecting(true);
    await onReject(achievement.id);
    setIsRejecting(false);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // Check if image is available
  const hasImage = achievement.evidence_url && !imageError;

  return (
    <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
      <figure className="px-4 pt-4">
        {hasImage ? (
          <img 
            src={achievement.evidence_url} 
            alt={achievement.title} 
            className="rounded-xl h-48 w-full object-cover"
            onError={handleImageError}
          />
        ) : (
          <div className="rounded-xl h-48 w-full bg-gray-200 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <span className="text-sm">No Image</span>
            </div>
          </div>
        )}
      </figure>
      <div className="card-body">
        <h2 className="card-title">{achievement.title}</h2>
        <p className="text-gray-600">{achievement.description}</p>
        
        <div className="flex flex-wrap items-center mt-3 text-sm text-gray-500 gap-2">
          <span><strong>Student:</strong> {achievement.full_name || 'Unknown Student'}</span>
          <span><strong>Class:</strong> {achievement.class_id || 'N/A'}</span>
          <span><strong>Date:</strong> {new Date(achievement.achievement_date).toLocaleDateString()}</span>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          <div className={`badge ${
            achievement.category === 'academic' ? 'badge-primary' :
            achievement.category === 'sports' ? 'badge-success' :
            achievement.category === 'arts' ? 'badge-secondary' :
            'badge-neutral'
          }  p-2`}>
            {achievement.category}
          </div>
          
          {activeTab !== 'pending' && (
            <div className={`badge ${
              achievement.approved ? 'badge-success' : 'badge-error'
            }  p-2`}>
              {achievement.approved ? 'APPROVED' : 'PENDING'}
            </div>
          )}
        </div>

        <div className="card-actions justify-end mt-4">
          {activeTab === 'pending' && (
            <>
              <button
                onClick={handleApprove}
                disabled={isApproving || isRejecting}
                className={`btn btn-sm btn-success ${isApproving ? 'loading' : ''}`}
              >
                {isApproving ? 'Approving...' : 'Approve'}
              </button>
              <button
                onClick={handleReject}
                disabled={isApproving || isRejecting}
                className={`btn btn-sm btn-error ${isRejecting ? 'loading' : ''}`}
              >
                {isRejecting ? 'Rejecting...' : 'Reject'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherAchievementCard;