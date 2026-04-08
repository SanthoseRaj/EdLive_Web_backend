// src/Pages/teacher/achievements/TeacherAchievementPage.js
import TeacherAchievementList from './achievements/TeacherAchievementList.js';

const TeacherAchievementPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">Student Achievements</h1>
          <p className="text-lg max-w-2xl mx-auto">
            Manage and celebrate student accomplishments
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Render the TeacherAchievementList without tabs */}
        <TeacherAchievementList />
        
        {/* Quick Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Pending Review</span>
            </div>
            <div className="text-2xl font-bold text-blue-600 mt-2">12</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Approved This Month</span>
            </div>
            <div className="text-2xl font-bold text-green-600 mt-2">24</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Total Achievements</span>
            </div>
            <div className="text-2xl font-bold text-purple-600 mt-2">156</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherAchievementPage;