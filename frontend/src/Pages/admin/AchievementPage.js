import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AchievementList from './achievements/AchievementList.js';

const AchievementPage = () => {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary text-primary-content py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Achievements</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Recognize and celebrate outstanding accomplishments within our community
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 -mt-8">
        <div className="tabs tabs-boxed bg-base-100 shadow-md mb-8">
          <button 
            className={`tab ${activeTab === 'all' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Achievements
          </button>
          <button 
            className={`tab ${activeTab === 'mine' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('mine')}
          >
            My Achievements
          </button>
          <button 
            className={`tab ${activeTab === 'pending' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Approval
          </button>
        </div>

        <AchievementList />
      </div>
    </div>
  );
};

export default AchievementPage;