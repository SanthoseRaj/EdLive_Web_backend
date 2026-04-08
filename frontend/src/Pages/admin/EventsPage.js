import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const AdminCoCurricularPage = () => {
  // We lift stats state here to share with the top cards
  const [stats, setStats] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/co-curricular/stats`,
        { method: 'GET', credentials: 'include' }
      );
      
      if (response.ok) {
        const data = await response.json();
        setStats(data || []);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  
  // Calculate totals for the dashboard cards
  const totalEnrollments = stats.reduce((acc, curr) => acc + parseInt(curr.enrollment_count || 0), 0);
  const uniqueActivities = new Set(stats.map(s => s.activity_name)).size;
  const uniqueCategories = new Set(stats.map(s => s.category_name)).size;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header - Indigo Theme */}
      <div className="bg-indigo-700 text-white py-8 shadow-lg">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">Admin Co-Curricular Management</h1>
          <p className="text-lg max-w-2xl mx-auto opacity-90">
            Oversee and manage student participation in activities
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Quick Stats Section - Dynamic Data */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Active Activities</span>
            </div>
            <div className="text-2xl font-bold text-indigo-600 mt-2">
              {loadingStats ? '...' : uniqueActivities}
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Total Enrollments</span>
            </div>
            <div className="text-2xl font-bold text-emerald-600 mt-2">
              {loadingStats ? '...' : totalEnrollments}
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Categories</span>
            </div>
            <div className="text-2xl font-bold text-purple-600 mt-2">
              {loadingStats ? '...' : uniqueCategories}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <CoCurricularList stats={stats} refreshStats={fetchStats} />
      </div>
    </div>
  );
};

const CoCurricularList = ({ stats, refreshStats }) => {
  const [activeTab, setActiveTab] = useState('manage');
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activities, setActivities] = useState([]);
  const [studentActivities, setStudentActivities] = useState([]);
  
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

  const [showAddActivityModal, setShowAddActivityModal] = useState(false);

  const [showAddEventModal, setShowAddEventModal] = useState(false);



  const AttendanceTab = () => {
  // ✅ Hooks at top level (SAFE)
    const [weekOffset, setWeekOffset] = useState(0);
    
  const [events, setEvents] = useState([]);
const [selectedEvent, setSelectedEvent] = useState(null);

  const demoStudents = [
    { id: 1, full_name: "Ram" },
    { id: 2, full_name: "Sita" },
    { id: 3, full_name: "Arjun" },
    { id: 4, full_name: "Meena" },
    { id: 5, full_name: "Karthik" },
  ];

  const getWeekDates = () => {
    const start = new Date();
    start.setDate(start.getDate() + weekOffset * 7);

    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d.toLocaleDateString("en-GB");
    });
    };
    
    const fetchEvents = async () => {
  try {
    const res = await fetch(
      `${process.env.REACT_APP_API_URL}/api/co-curricular/events`,
      { credentials: "include" }
    );
    if (res.ok) setEvents(await res.json());
  } catch (err) {
    console.error("Failed to fetch events", err);
  }
};

useEffect(() => {
  fetchEvents();
}, []);

  const weekDates = getWeekDates();

  return (
    <div className="space-y-6">

      {/* Class Selection */}
      <div className="bg-gray-50 border rounded-xl p-5 shadow-sm w-full md:w-1/2">
        <select
  className="select select-bordered w-full md:w-1/3 mb-4"
  value={selectedEvent?.id || ""}
  onChange={(e) =>
    setSelectedEvent(events.find(ev => ev.id == e.target.value))
  }
>
  <option value="">Select Event</option>
  {events.map(ev => (
    <option key={ev.id} value={ev.id}>
      {ev.event_name}
    </option>
  ))}
</select>
        <h3 className="font-bold text-gray-700 mb-3">Class Selection</h3>
        <select className="select select-bordered w-full">
          <option>Select Class</option>
          <option>10 A</option>
          <option>10 B</option>
        </select>
      </div>

      {/* Attendance Table */}
      <div className="bg-white border rounded-xl shadow-sm p-5 overflow-x-auto">

        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-gray-700">
            Students Attendance
          </h3>

          <div className="flex gap-2">
            <button
              className="btn btn-sm btn-outline"
              onClick={() => setWeekOffset(w => w - 1)}
            >
              ◀
            </button>
            <button
              className="btn btn-sm btn-outline"
              onClick={() => setWeekOffset(w => w + 1)}
            >
              ▶
            </button>
          </div>
        </div>

        <table className="table table-bordered w-full min-w-[900px]">
        <thead className="bg-indigo-50">
  <tr>
    <th className="text-indigo-900 font-bold border-r border-gray-300">
  Students
</th>

    {weekDates.map((date, idx) => (
      <th
        key={idx}
        className="text-indigo-800 font-semibold text-center"
      >
        {date}
      </th>
    ))}
  </tr>
</thead>


          <tbody>
            {demoStudents.map(student => (
              <tr key={student.id}>
              <td className="font-semibold text-gray-800 border-r border-gray-300">
  {student.full_name}
</td>



                {weekDates.map((_, i) => (
                 <td key={i} className="text-center text-xl">
  {i % 3 === 0 ? (
    <span className="text-green-600" title="Present">✔️</span>
  ) : (
    <span className="text-red-600" title="Absent">❌</span>
  )}
</td>

                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


  // Fetch initial data
  useEffect(() => {
    fetchCategories();
    fetchActivities();
    fetchClasses();
  }, []);

  // Fetch student activities when student is selected
  useEffect(() => {
    if (formData.studentId) {
      fetchStudentActivities(formData.studentId);
    } else {
      setStudentActivities([]);
      setSelectedStudent(null);
    }
  }, [formData.studentId]);

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/co-curricular/categories`,
        { method: 'GET', credentials: 'include' }
      );
      if (response.ok) {
        const data = await response.json();
        setCategories(data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
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
      
      const response = await fetch(url, { method: 'GET', credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setActivities(data || []);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
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
      if (response.ok) {
        const data = await response.json();
        setClasses(data || []);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setClassesLoading(false);
    }
  };

  const fetchStudents = async (classId) => {
    setStudentsLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/student/students?classId=${classId}`,
        { method: 'GET', credentials: 'include' }
      );
      if (response.ok) {
        const data = await response.json();
        setStudents(data || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
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
      if (response.ok) {
        const data = await response.json();
        setStudentActivities(data || []);
        const student = students.find(s => s.id == studentId);
        setSelectedStudent(student);
      }
    } catch (error) {
      console.error('Error fetching student activities:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'classId' && value) {
      fetchStudents(value);
      setFormData(prev => ({ ...prev, studentId: '' })); // Reset student when class changes
    }
    
    if (name === 'categoryId') {
      fetchActivities(value || null);
    }
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/co-curricular/enroll`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        }
      );
      
      if (!response.ok) throw new Error('Failed to enroll student');
      
      alert('Student enrolled successfully!');
      
      // Reset only activity specific fields to allow quick addition of multiple activities
      setFormData(prev => ({
        ...prev,
        activityId: '',
        categoryId: '',
        remarks: ''
      }));
      
      fetchStudentActivities(formData.studentId);
      refreshStats(); // Update global stats
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
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/co-curricular/activity/${activityId}`,
        {
          method: 'DELETE',
          credentials: 'include'
        }
      );
      
      if (!response.ok) throw new Error('Failed to remove activity');
      
      // Refresh student activities
      fetchStudentActivities(formData.studentId);
      refreshStats();
    } catch (error) {
      console.error('Error removing activity:', error);
      alert('Error removing activity. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      {/* Header with title and Add button */}
      <div className="flex justify-between items-center mb-6">
  <h2 className="text-2xl font-semibold text-gray-800">
    Co-Curricular Activities
  </h2>

  <div className="flex gap-3">
    {/* Add Activity Button */}

    <button
  onClick={() => setShowAddEventModal(true)}
  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors flex items-center shadow-md"
>
  + Add Event
</button>

    <button
      onClick={() => setShowAddActivityModal(true)}
      className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors flex items-center shadow-md"
    >
      + Add Activity
    </button>

    {/* Quick Enroll Button */}
    <button
      onClick={() => setShowEnrollModal(true)}
      className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center shadow-md"
    >
      + Quick Enroll
    </button>
  </div>
</div>


      {/* Tabs */}
      <div className="tabs tabs-boxed bg-gray-50 p-1 mb-6">
        <button 
          className={`tab tab-lg ${activeTab === 'manage' ? 'tab-active bg-indigo-100 text-indigo-700' : ''}`}
          onClick={() => setActiveTab('manage')}
        >
          Manage Enrollment
        </button>
        <button 
          className={`tab tab-lg ${activeTab === 'stats' ? 'tab-active bg-indigo-100 text-indigo-700' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Detailed Statistics
        </button>

          <button
  className={`tab tab-lg ${
    activeTab === 'attendance'
      ? 'tab-active bg-indigo-100 text-indigo-700'
      : ''
  }`}
  onClick={() => setActiveTab('attendance')}
>
  Attendance
</button>

      </div>

    

      {/* Manage Activities Tab */}
      {activeTab === 'manage' && (
        <div>
          {/* Inline Enrollment Form / View Selector */}
          <form onSubmit={handleEnroll} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-gray-50 p-6 rounded-xl border border-gray-200">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Select Class</span>
              </label>
              <select 
                name="classId" 
                value={formData.classId} 
                onChange={handleInputChange}
                className="select select-bordered w-full focus:select-primary"
                required
                disabled={classesLoading}
              >
                <option value="">-- Select Class --</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.class} {cls.section}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Select Student</span>
              </label>
              <select 
                name="studentId" 
                value={formData.studentId} 
                onChange={handleInputChange}
                className="select select-bordered w-full focus:select-primary"
                required
                disabled={!formData.classId || studentsLoading}
              >
                <option value="">-- Select Student --</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.full_name}
                  </option>
                ))}
              </select>
            </div>
            
             <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Category (Optional)</span>
              </label>
              <select 
                name="categoryId" 
                value={formData.categoryId} 
                onChange={handleInputChange}
                className="select select-bordered w-full focus:select-primary"
                disabled={categoriesLoading}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Activity to Add</span>
              </label>
              <select 
                name="activityId" 
                value={formData.activityId} 
                onChange={handleInputChange}
                className="select select-bordered w-full focus:select-primary"
                disabled={activitiesLoading}
              >
                <option value="">-- Select Activity --</option>
                {activities.map(activity => (
                  <option key={activity.id} value={activity.id}>
                    {activity.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-control md:col-span-2">
              <label className="label">
                <span className="label-text font-semibold">Remarks</span>
              </label>
              <textarea 
                name="remarks" 
                value={formData.remarks} 
                onChange={handleInputChange}
                className="textarea textarea-bordered h-20 w-full focus:textarea-primary"
                placeholder="E.g., Team Captain, First Place, etc."
              ></textarea>
            </div>
            
            <div className="form-control md:col-span-2 text-right">
              <button 
                type="submit" 
                className="btn btn-primary bg-indigo-600 border-none hover:bg-indigo-700"
                disabled={loading || !formData.studentId || !formData.activityId}
              >
                {loading ? 'Processing...' : '+ Add Activity to Student'}
              </button>
            </div>
          </form>
          
          {/* Student Activities List */}
          {selectedStudent && (
            <div className="mt-8 border-t pt-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="bg-indigo-100 text-indigo-700 p-2 rounded-lg mr-2">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </span>
                Activities for {selectedStudent.name}
              </h3>
              
              {studentActivities.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <p className="text-gray-500">No activities enrolled yet for this student.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-100">
                  <table className="table table-zebra w-full">
                    <thead className="bg-indigo-50 text-indigo-700">
                      <tr>
                        <th>Activity</th>
                        <th>Category</th>
                        <th>Class</th>
                        <th>Remarks</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentActivities.map(activity => (
                        <tr key={activity.id}>
                          <td className="font-medium">{activity.activity_name}</td>
                          <td>
                            <span className="badge badge-ghost badge-sm">{activity.category_name}</span>
                          </td>
                          <td>{activity.class_name}</td>
                          <td className="text-gray-600 italic">{activity.remarks || '-'}</td>
                          <td className="text-right">
                            <button 
                              className="btn btn-error btn-xs btn-outline"
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
          <h3 className="text-xl font-semibold mb-6 text-gray-800">Activity Enrollment Breakdown</h3>
          
          {stats.length === 0 ? (
            <div className="text-center py-12">
               <p className="text-gray-500">No enrollment data available.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
              <table className="table w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th>Activity Name</th>
                    <th>Category</th>
                    <th>Class / Section</th>
                    <th className="text-right">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((stat, index) => (
                    <tr key={`${stat.activity_name}-${stat.class_name}-${index}`} className="hover:bg-gray-50">
                      <td className="font-medium text-indigo-900">{stat.activity_name}</td>
                      <td>{stat.category_name}</td>
                      <td>{stat.class_name}</td>
                      <td className="text-right font-bold">{stat.enrollment_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}


{activeTab === "attendance" && <AttendanceTab />}






      {/* Enroll Student Modal - Using Portal */}
      {showEnrollModal && (
        <EnrollModal 
          onClose={() => setShowEnrollModal(false)}
          onEnrollSuccess={() => {
            setShowEnrollModal(false);
            refreshStats(); // Refresh stats after modal enrollment
            // Also refresh list if the modified student is currently selected
            if (formData.studentId) fetchStudentActivities(formData.studentId);
          }}
          classes={classes}
          categories={categories}
          activities={activities}
        />
      )}

      {showAddActivityModal && (
  <AddActivityModal
    onClose={() => setShowAddActivityModal(false)}
    onSuccess={() => {
      setShowAddActivityModal(false);
      fetchActivities(); // refresh activities list
    }}
    categories={categories}
  />
)}

{showAddEventModal && (
  <AddEventModal
    onClose={() => setShowAddEventModal(false)}
    categories={categories}
    activities={activities}
    students={students}
      classes={classes} 
  />
)}


    </div>
  );
};

// Portal Modal Component
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
  const [modalActivities, setModalActivities] = useState(activities); // separate state for filtering inside modal

  const fetchStudents = async (classId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/students?classId=${classId}`,
        { method: 'GET', credentials: 'include' }
      );
      if (response.ok) {
        const data = await response.json();
        setStudents(data || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'classId' && value) {
      fetchStudents(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/co-curricular/enroll`, 
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        }
      );
      
      if (!response.ok) throw new Error('Failed to enroll');
      onEnrollSuccess();
    } catch (error) {
      console.error('Error enrolling student:', error);
      alert('Error enrolling student');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex justify-center items-start bg-black/40">
      <div className="mt-8 w-full max-w-2xl bg-base-100 rounded-xl shadow-2xl p-6 border-t-4 border-indigo-600">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Enroll Student in Activity</h3>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label text-xs uppercase text-gray-500 font-bold">Class</label>
              <select
                name="classId"
                value={formData.classId}
                onChange={handleInputChange}
                className="select select-bordered w-full focus:select-primary"
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
              <label className="label text-xs uppercase text-gray-500 font-bold">Student</label>
              <select
                name="studentId"
                value={formData.studentId}
                onChange={handleInputChange}
                className="select select-bordered w-full focus:select-primary"
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
              <label className="label text-xs uppercase text-gray-500 font-bold">Category</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className="select select-bordered w-full focus:select-primary"
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
              <label className="label text-xs uppercase text-gray-500 font-bold">Activity</label>
              <select
                name="activityId"
                value={formData.activityId}
                onChange={handleInputChange}
                className="select select-bordered w-full focus:select-primary"
                required
              >
                <option value="">Select an activity</option>
                {activities
                  // Simple filter if category is selected in modal
                  .filter(a => !formData.categoryId || a.category_id == formData.categoryId)
                  .map(activity => (
                    <option key={activity.id} value={activity.id}>
                      {activity.name}
                    </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="label text-xs uppercase text-gray-500 font-bold">Remarks</label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                rows={3}
                className="textarea textarea-bordered w-full focus:textarea-primary"
                placeholder="Enter any remarks here..."
              />
            </div>
          </div>

          <div className="modal-action">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary bg-indigo-600 border-none hover:bg-indigo-700"
              disabled={loading}
            >
              {loading ? 'Enrolling...' : 'Enroll Student'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};


const AddActivityModal = ({ onClose, onSuccess, categories }) => {
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    staffId: '',
    remarks: ''
  });

  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStaffs();
  }, []);

  const fetchStaffs = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/staff`,
        { credentials: 'include' }
      );
      if (res.ok) {
        setStaffs(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/co-curricular/activities`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        }
      );

      if (!res.ok) throw new Error();
      onSuccess();
    } catch {
      alert('Failed to add activity');
    } finally {
      setLoading(false);
    }
  };

 return createPortal(
  <div className="fixed inset-0 z-[9999] flex justify-center items-start bg-black/40">
    <div className="mt-8 w-full max-w-xl bg-base-100 rounded-xl shadow-2xl p-6 border-t-4 border-emerald-600">
      
      {/* Header – SAME AS QUICK ENROLL */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">
          Add New Activity
        </h3>
        <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Activity Name */}
        <div>
          <label className="label text-xs uppercase text-gray-500 font-bold">
            Activity Name
          </label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter activity name"
            className="input input-bordered w-full focus:input-primary"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="label text-xs uppercase text-gray-500 font-bold">
            Category
          </label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className="select select-bordered w-full focus:select-primary"
            required
          >
            <option value="">Select Category</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Staff */}
        <div>
          <label className="label text-xs uppercase text-gray-500 font-bold">
            Staff In-Charge
          </label>
          <select
            name="staffId"
            value={formData.staffId}
            onChange={handleChange}
            className="select select-bordered w-full focus:select-primary"
            required
          >
            <option value="">Select Staff</option>
            {staffs.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Remarks */}
        <div>
          <label className="label text-xs uppercase text-gray-500 font-bold">
            Remarks
          </label>
        <textarea
  name="remarks"
  value={formData.remarks}
  onChange={handleChange}
  rows={3}
 className="
  textarea
  w-full
  border-[3px]
  border-emerald-600
  focus:outline-none
  focus:ring-2
  focus:ring-emerald-600
"

  placeholder="Optional notes about the activity"
/>


        </div>

        {/* Actions – SAME AS QUICK ENROLL */}
        <div className="modal-action">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="btn bg-emerald-600 text-white border-none hover:bg-emerald-700"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Create Activity'}
          </button>
        </div>

      </form>
    </div>
  </div>,
  document.body
);

};


const AddEventModal = ({ onClose, categories, activities, students, classes }) => {

  const [formData, setFormData] = useState({
    eventName: '',
    startDate: '',
    endDate: '',
    categoryId: '',
    activityId: '',
    staffId: '',
      classId: '',  
    studentId: '',
    remarks: ''
  });

  const [staffs, setStaffs] = useState([]); // ✅ ADD
  const [loading, setLoading] = useState(false);

  // ✅ Fetch staffs inside modal
  useEffect(() => {
    fetchStaffs();
  }, []);

  const fetchStaffs = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/staff`,
        { credentials: 'include' }
      );
      if (res.ok) {
        setStaffs(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch staffs', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const res = await fetch(
      `${process.env.REACT_APP_API_URL}/api/co-curricular/events`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      }
    );

    if (!res.ok) throw new Error();
    alert("Event created successfully");
    onClose();
    fetchEvents(); // 🔥 refresh event list
  } catch {
    alert("Failed to create event");
  } finally {
    setLoading(false);
  }
};

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex justify-center items-start bg-black/40 overflow-y-auto">

      <div className="mt-8 w-full max-w-3xl bg-base-100 rounded-xl shadow-2xl p-6 border-t-4 border-purple-600">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Add New Event</h3>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Event Name */}
          <div className="md:col-span-2">
            <label className="label text-xs uppercase font-bold text-gray-500">
              Event Name
            </label>
            <input
              name="eventName"
              value={formData.eventName}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="Enter event name"
              required
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="label text-xs uppercase font-bold text-gray-500">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* End Date */}
          <div>
            <label className="label text-xs uppercase font-bold text-gray-500">
              End Date
            </label>
            <input
  type="date"
  name="endDate"
  value={formData.endDate}
  onChange={handleChange}
  min={formData.startDate || undefined}
  className="input input-bordered w-full"
  required
/>

          </div>

          {/* Category */}
          <div>
            <label className="label text-xs uppercase font-bold text-gray-500">
              Category
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="select select-bordered w-full"
            >
              <option value="">Select Category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Activity */}
          <div>
            <label className="label text-xs uppercase font-bold text-gray-500">
              Activity
            </label>
            <select
              name="activityId"
              value={formData.activityId}
              onChange={handleChange}
              className="select select-bordered w-full"
            >
              <option value="">Select Activity</option>
              {activities.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          {/* Staff */}
          <div>
            <label className="label text-xs uppercase font-bold text-gray-500">
              Staff
            </label>
            <select
              name="staffId"
              value={formData.staffId}
              onChange={handleChange}
              className="select select-bordered w-full"
            >
              <option value="">Select Staff</option>
              {staffs.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Class */}
<div>
  <label className="label text-xs uppercase font-bold text-gray-500">
    Class
  </label>
  <select
    name="classId"
    value={formData.classId}
    onChange={handleChange}
    className="select select-bordered w-full"
    required
  >
    <option value="">Select Class</option>
    {classes.map(cls => (
      <option key={cls.id} value={cls.id}>
        {cls.class} {cls.section}
      </option>
    ))}
  </select>
</div>


          {/* Student */}
          <div>
            <label className="label text-xs uppercase font-bold text-gray-500">
              Student
            </label>
            <select
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              className="select select-bordered w-full"
            >
              <option value="">Select Student</option>
              {students.map(st => (
                <option key={st.id} value={st.id}>{st.full_name}</option>
              ))}
            </select>
          </div>

          {/* Remarks */}
          <div className="md:col-span-2">
            <label className="label text-xs uppercase font-bold text-gray-500">
              Remarks
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              rows={3}
             className="
  textarea
  w-full
  border-2
  border-purple-600
  outline-none
  focus:outline-none
  focus:ring-2
  focus:ring-purple-600
  focus:border-purple-600
  shadow-none
"

              placeholder="Optional remarks"
            />
          </div>

          {/* Actions */}
          <div className="md:col-span-2 modal-action">
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>
            <button
              type="submit"
              className="btn bg-purple-600 text-white border-none hover:bg-purple-700"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Create Event'}
            </button>
          </div>

        </form>
      </div>
    </div>,
    document.body
  );
};

export default AdminCoCurricularPage;