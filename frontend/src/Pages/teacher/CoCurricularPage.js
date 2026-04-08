import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CoCurricularPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">Co-Curricular Activities</h1>
          <p className="text-lg max-w-2xl mx-auto">
            Manage student participation in co-curricular activities
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <CoCurricularList />
        
        {/* Quick Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Total Activities</span>
            </div>
            <div className="text-2xl font-bold text-blue-600 mt-2">24</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Active Enrollments</span>
            </div>
            <div className="text-2xl font-bold text-green-600 mt-2">156</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Categories</span>
            </div>
            <div className="text-2xl font-bold text-purple-600 mt-2">8</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CoCurricularList = () => {
  const [activeTab, setActiveTab] = useState('manage');
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activities, setActivities] = useState([]);
  const [studentActivities, setStudentActivities] = useState([]);
  const [stats, setStats] = useState([]);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [classesLoading, setClassesLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    classId: '',
    studentId: '',
    activityId: '',
    categoryId: '',
    remarks: '',
    academicYear: '2024-2025'
  });
  
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Fetch initial data
  useEffect(() => {
    fetchCategories();
    fetchActivities();
    fetchClasses();
    fetchStats();
  }, []);

  // Fetch student activities when student is selected
  useEffect(() => {
    if (formData.studentId) {
      fetchStudentActivities(formData.studentId);
    }
  }, [formData.studentId]);

    const fetchCategories = async () => {
  setCategoriesLoading(true);
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/api/co-curricular/categories`,
      { method: 'GET', credentials: 'include' }
    );
    
    if (!response.ok) throw new Error('Failed to fetch categories');
    const data = await response.json();
    setCategories(data || []);
  } catch (error) {
    console.error('Error fetching categories:', error);
    setCategories([]);
  } finally {
    setCategoriesLoading(false);
  }
};

    const fetchActivities = async (categoryId = null) => {
  setActivitiesLoading(true);
  try {
    const url = categoryId 
      ? `${process.env.REACT_APP_API_URL}/api/co-curricular/activities?categoryId=${categoryId}`
      : `${process.env.REACT_APP_API_URL}/api/co-curricular/activities`;
    
    const response = await fetch(url,
      { method: 'GET', credentials: 'include' }
    );
    
    if (!response.ok) throw new Error('Failed to fetch activities');
    const data = await response.json();
    setActivities(data || []);
  } catch (error) {
    console.error('Error fetching activities:', error);
    setActivities([]);
  } finally {
    setActivitiesLoading(false);
  }
};

    const fetchClasses = async () => {
  setClassesLoading(true);
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/api/master/classes`,
      { method: 'GET', credentials: 'include' }
    );
    
    if (!response.ok) throw new Error('Failed to fetch classes');
    const data = await response.json();
    setClasses(data || []);
  } catch (error) {
    console.error('Error fetching classes:', error);
    // Mock data for demonstration
    const mockClasses = [
      { id: 1, class: '10', section: 'A' },
      { id: 2, class: '10', section: 'B' },
      { id: 3, class: '9', section: 'A' },
      { id: 4, class: '9', section: 'B' },
    ];
    setClasses(mockClasses);
  } finally {
    setClassesLoading(false);
  }
};


   const fetchStudents = async (classId) => {
  setStudentsLoading(true);
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/api/students?classId=${classId}`,
      { method: 'GET', credentials: 'include' }
    );
    
    if (!response.ok) throw new Error('Failed to fetch students');
    const data = await response.json();
    setStudents(data || []);
  } catch (error) {
    console.error('Error fetching students:', error);
    // Mock data for demonstration
    const mockStudents = [
      { id: 1, name: 'Student1', classId: 1 },
      { id: 2, name: 'Student2', classId: 1 },
      { id: 3, name: 'Student3', classId: 2 },
      { id: 4, name: 'Student4', classId: 2 },
    ].filter(student => student.classId == classId);
    
    setStudents(mockStudents);
  } finally {
    setStudentsLoading(false);
  }
};

  const fetchStudentActivities = async (studentId) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/api/co-curricular/student-activities?studentId=${studentId}`,
      { method: 'GET', credentials: 'include' }
    );
    
    if (!response.ok) throw new Error('Failed to fetch student activities');
    const data = await response.json();
    setStudentActivities(data || []);
    
    // Find the selected student
    const student = students.find(s => s.id == studentId);
    setSelectedStudent(student);
  } catch (error) {
    console.error('Error fetching student activities:', error);
    setStudentActivities([]);
  }
};

  const fetchStats = async () => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/api/co-curricular/stats`,
      { method: 'GET', credentials: 'include' }
    );
    
    if (!response.ok) throw new Error('Failed to fetch stats');
    const data = await response.json();
    setStats(data || []);
  } catch (error) {
    console.error('Error fetching stats:', error);
    setStats([]);
  }
};

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // If class is selected, fetch students for that class
    if (name === 'classId' && value) {
      fetchStudents(value);
    }
    
    // If category is selected, filter activities
    if (name === 'categoryId') {
      fetchActivities(value || null);
    }
  };

  const handleEnroll = async (e) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/api/co-curricular/enroll`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      }
    );
    
    if (!response.ok) throw new Error('Failed to enroll student');
    
    alert('Student enrolled successfully!');
    setFormData({
      classId: formData.classId,
      studentId: formData.studentId,
      activityId: '',
      categoryId: '',
      remarks: '',
      academicYear: '2024-2025'
    });
    
    // Refresh student activities
    fetchStudentActivities(formData.studentId);
  } catch (error) {
    console.error('Error enrolling student:', error);
    alert('Error enrolling student. Please try again.');
  } finally {
    setLoading(false);
  }
};

  const handleRemoveActivity = async (activityId) => {
  if (!window.confirm('Are you sure you want to remove this activity?')) return;
  
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/api/co-curricular/activity/${activityId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      }
    );
    
    if (!response.ok) throw new Error('Failed to remove activity');
    
    alert('Activity removed successfully!');
    // Refresh student activities
    fetchStudentActivities(formData.studentId);
  } catch (error) {
    console.error('Error removing activity:', error);
    alert('Error removing activity. Please try again.');
  }
};

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      {/* Header with title and Add button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Co-Curricular Activities</h2>
        <button
          onClick={() => setShowEnrollModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Enroll Student
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed mb-6">
        <button 
          className={`tab ${activeTab === 'manage' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('manage')}
        >
          Manage Activities
        </button>
        <button 
          className={`tab ${activeTab === 'stats' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Statistics
        </button>
      </div>

      {/* Manage Activities Tab */}
      {activeTab === 'manage' && (
        <div>
          <form onSubmit={handleEnroll} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Class</span>
              </label>
              <select 
                name="classId" 
                value={formData.classId} 
                onChange={handleInputChange}
                className="select select-bordered"
                required
                disabled={classesLoading}
              >
                <option value="">Select Class</option>
                {classesLoading ? (
                  <option disabled>Loading classes...</option>
                ) : (
                  classes.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.class} {cls.section}
                    </option>
                  ))
                )}
              </select>
              {classesLoading && (
                <div className="text-sm text-gray-500 mt-1">Loading classes...</div>
              )}
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Student Name</span>
              </label>
              <select 
                name="studentId" 
                value={formData.studentId} 
                onChange={handleInputChange}
                className="select select-bordered"
                required
                disabled={!formData.classId || studentsLoading}
              >
                <option value="">Select Student</option>
                {studentsLoading ? (
                  <option disabled>Loading students...</option>
                ) : (
                  students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))
                )}
              </select>
              {studentsLoading && (
                <div className="text-sm text-gray-500 mt-1">Loading students...</div>
              )}
            </div>
            
             <div className="form-control">
              <label className="label">
                <span className="label-text">Category</span>
              </label>
              <select 
                name="categoryId" 
                value={formData.categoryId} 
                onChange={handleInputChange}
                className="select select-bordered"
                disabled={categoriesLoading}
              >
                <option value="">All Categories</option>
                {categoriesLoading ? (
                  <option disabled>Loading categories...</option>
                ) : (
                  categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))
                )}
              </select>
              {categoriesLoading && (
                <div className="text-sm text-gray-500 mt-1">Loading categories...</div>
              )}
            </div>
            
            <div className="form-control">
        <label className="label">
          <span className="label-text">Activity</span>
        </label>
        <select 
          name="activityId" 
          value={formData.activityId} 
          onChange={handleInputChange}
          className="select select-bordered"
          required
          disabled={activitiesLoading} // Disable while loading
        >
          <option value="">Select Activity</option>
          {activitiesLoading ? (
            <option disabled>Loading activities...</option>
          ) : (
            activities.map(activity => (
              <option key={activity.id} value={activity.id}>
                {activity.name}
              </option>
            ))
          )}
        </select>
        {activitiesLoading && (
          <div className="text-sm text-gray-500 mt-1">Loading activities...</div>
        )}
        {!activitiesLoading && activities.length === 0 && (
          <div className="text-sm text-gray-500 mt-1">No activities available</div>
        )}
      </div>
            
            <div className="form-control md:col-span-2">
              <label className="label">
                <span className="label-text">Remarks</span>
              </label>
              <textarea 
                name="remarks" 
                value={formData.remarks} 
                onChange={handleInputChange}
                className="textarea textarea-bordered h-24"
                placeholder="Enter any remarks here..."
              ></textarea>
            </div>
            
            <div className="form-control md:col-span-2">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading || !formData.studentId || !formData.activityId}
              >
                {loading ? 'Adding...' : 'Add Activity'}
              </button>
            </div>
          </form>
          
          {/* Student Activities List */}
          {selectedStudent && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">
                Activities for {selectedStudent.name}
              </h3>
              
              {studentActivities.length === 0 ? (
                <p className="text-gray-500">No activities enrolled yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr>
                        <th>Activity</th>
                        <th>Category</th>
                        <th>Class</th>
                        <th>Remarks</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentActivities.map(activity => (
                        <tr key={activity.id}>
                          <td>{activity.activity_name}</td>
                          <td>{activity.category_name}</td>
                          <td>{activity.class_name}</td>
                          <td>{activity.remarks || '-'}</td>
                          <td>
                            <button 
                              className="btn btn-error btn-xs"
                              onClick={() => handleRemoveActivity(activity.id)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Statistics Tab */}
      {activeTab === 'stats' && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Activity Enrollment Statistics</h3>
          
          {stats.length === 0 ? (
            <p className="text-gray-500">No enrollment data available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Activity</th>
                    <th>Category</th>
                    <th>Class</th>
                    <th>Enrollments</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map(stat => (
                    <tr key={`${stat.activity_name}-${stat.class_name}`}>
                      <td>{stat.activity_name}</td>
                      <td>{stat.category_name}</td>
                      <td>{stat.class_name}</td>
                      <td>{stat.enrollment_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Enroll Student Modal */}
      {showEnrollModal && (
        <EnrollModal 
          onClose={() => setShowEnrollModal(false)}
          onEnrollSuccess={() => {
            setShowEnrollModal(false);
            if (formData.studentId) {
              fetchStudentActivities(formData.studentId);
            }
          }}
          classes={classes}
          categories={categories}
          activities={activities}
        />
      )}
    </div>
  );
};

const EnrollModal = ({ onClose, onEnrollSuccess, classes, categories, activities }) => {
  const [formData, setFormData] = useState({
    classId: '',
    studentId: '',
    activityId: '',
    categoryId: '',
    remarks: '',
    academicYear: '2024-2025'
  });
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

    const fetchStudents = async (classId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/students?classId=${classId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // If class is selected, fetch students for that class
    if (name === 'classId' && value) {
      fetchStudents(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.REACT_APP_API_URL}/api/co-curricular/enroll`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      onEnrollSuccess();
    } catch (error) {
      console.error('Error enrolling student:', error);
      setError('Error enrolling student. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Enroll Student in Activity</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class *
              </label>
              <select
                name="classId"
                value={formData.classId}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a class</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.class} {cls.section}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student *
              </label>
              <select
                name="studentId"
                value={formData.studentId}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={!formData.classId}
              >
                <option value="">Select a student</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Activity *
              </label>
              <select
                name="activityId"
                value={formData.activityId}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select an activity</option>
                {activities.map(activity => (
                  <option key={activity.id} value={activity.id}>
                    {activity.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remarks
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter any remarks here..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Enrolling...' : 'Enroll Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CoCurricularPage;