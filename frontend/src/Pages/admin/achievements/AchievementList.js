import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AchievementCard from './AchievementCard';
import CreateAchievementModal from './CreateAchievementModal';

const AchievementList = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userRole, setUserRole] = useState('admin'); // This would come from auth context
  const [students, setStudents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [classes, setClasses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const navigate = useNavigate();  
  const effectRan = useRef(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (effectRan.current) return;
      effectRan.current = true;
      try {
        // Fetch achievements
        const achievementsResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/achievements/visible`, {
          method: 'GET',
          credentials: 'include'
        });
        
        if (!achievementsResponse.ok) throw new Error('Failed to fetch achievements');
        const achievementsData = await achievementsResponse.json();
        setAchievements(Array.isArray(achievementsData) ? achievementsData : []);

        // Fetch students
        const studentsResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/staff/staff/students/list`, {
          method: 'GET',
          credentials: 'include'
        });
        if (studentsResponse.ok) {
          const studentsData = await studentsResponse.json();
          setStudents(Array.isArray(studentsData) ? studentsData : []);
        }

        // Fetch categories
        // const categoriesResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/achievements/categories`, {
        //   method: 'GET',
        //   credentials: 'include'
        // });
        // if (categoriesResponse.ok) {
        //   const categoriesData = await categoriesResponse.json();
        //   setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        // }

        // Fetch classes
        const classesResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/master/classes`, {
          method: 'GET',
          credentials: 'include'
        });
        if (classesResponse.ok) {
          const classesData = await classesResponse.json();
          setClasses(Array.isArray(classesData) ? classesData : []);
        }

        // Fetch academic years
        // const yearsResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/academic-years`, {
        //   method: 'GET',
        //   credentials: 'include'
        // });
        // if (yearsResponse.ok) {
        //   const yearsData = await yearsResponse.json();
        //   setAcademicYears(Array.isArray(yearsData) ? yearsData : []);
        // }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleCreateSuccess = (newAchievement) => {
    setAchievements([...achievements, newAchievement]);
    setShowCreateModal(false);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/achievements/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to delete achievement');
      setAchievements(achievements.filter(ach => ach.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.message);
    }
  };

  const handleApprove = async (id) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/achievements/${id}/approve`, {
        method: 'PATCH',
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to approve achievement');
      const updatedAchievement = await response.json();
      setAchievements(achievements.map(ach => 
        ach.id === id ? updatedAchievement.achievement : ach
      ));
    } catch (err) {
      console.error('Approve error:', err);
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error shadow-lg max-w-2xl mx-auto mt-8">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Error display */}
      {error && (
        <div className="alert alert-error mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Error: {error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-primary">Achievements</h1>
            {userRole === 'admin' && (
              <button 
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary"
              >
                Create Achievement
              </button>
            )}
          </div>

          {/* Achievements grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map(achievement => (
              <AchievementCard 
                key={achievement.id}
                achievement={achievement}
                onDelete={handleDelete}
                onApprove={handleApprove}
                userRole={userRole}
              />
            ))}
          </div>

          {achievements.length === 0 && !loading && (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-gray-500">No achievements found</h2>
              <p className="text-gray-400 mt-2">Create a new achievement to get started</p>
            </div>
          )}
        </>
      )}

      {showCreateModal && (
        <CreateAchievementModal 
          onClose={() => setShowCreateModal(false)}
          onCreateSuccess={handleCreateSuccess}
          students={students}
          categories={categories}
          classes={classes}
          academicYears={academicYears}
        />
      )}
    </div>
  );
};

export default AchievementList;