import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CreateAchievementModal = ({ 
  onClose, 
  onCreateSuccess,
  students = [],
  categories = [],
  classes = [],
  academicYears = []
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    studentId: '',
    categoryId: 'academic',
    achievementDate: new Date(),
    awardedBy: '',
    classId: '',
    academicYearId: '',
    isVisible: 'school'
  });

  const visibilityOptions = [
    { value: 'private', label: 'Private (Only Admins)' },
    { value: 'class', label: 'Class (Classmates)' },
    { value: 'school', label: 'School (All Students)' },
    { value: 'public', label: 'Public (Everyone)' }
  ];

  const categoryOptions = [
    { value: 'academic', label: 'Academic' },
    { value: 'sports', label: 'Sports' },
    { value: 'arts', label: 'Arts' },
    { value: 'leadership', label: 'Leadership' },
    { value: 'community', label: 'Community Service' }
  ];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Prevent body scroll when modal is open
  useEffect(() => {
    // Store the current scroll position
    const scrollY = window.scrollY;
    
    // Add styles to prevent scrolling and maintain position
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    
    return () => {
      // Restore scrolling and position
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      achievementDate: date
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/achievements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          achievementDate: formData.achievementDate.toISOString()
        })
      });
      
      // First check if the response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(text || 'Server returned non-JSON response');
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create achievement');
      }
      
      onCreateSuccess(data);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
      console.error('Error creating achievement:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-start justify-center bg-black bg-opacity-50 p-4 "
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h3 className="text-2xl font-bold text-gray-800">Create New Achievement</h3>
          <button 
            onClick={onClose} 
            className="btn btn-circle btn-sm btn-ghost text-gray-500 hover:text-gray-700"
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>
        
        {error && (
          <div className="alert alert-error mx-6 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Title*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="input input-bordered w-full focus:ring-2 focus:ring-primary"
                  required
                  placeholder="Achievement title"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Category*</span>
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="select select-bordered w-full focus:ring-2 focus:ring-primary"
                  required
                >
                  {categoryOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Description*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="textarea textarea-bordered h-32 w-full focus:ring-2 focus:ring-primary"
                  required
                  placeholder="Detailed description of the achievement"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Image URL</span>
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="input input-bordered w-full focus:ring-2 focus:ring-primary"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            {/* Student and Achievement Details */}
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Student</span>
                </label>
                <select
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  className="select select-bordered w-full focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select a student</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.student_name} ({student.admission_no})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Class*</span>
                </label>
                <select
                  name="classId"
                  value={formData.classId}
                  onChange={handleChange}
                  className="select select-bordered w-full focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select a class</option>
                  {classes.map(cls => (
                    <option key={cls.class_id} value={cls.class_id}>
                      {cls.class_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Achievement Date*</span>
                </label>
                <DatePicker
                  selected={formData.achievementDate}
                  onChange={handleDateChange}
                  className="input input-bordered w-full focus:ring-2 focus:ring-primary"
                  dateFormat="yyyy-MM-dd"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Awarded By*</span>
                </label>
                <input
                  type="text"
                  name="awardedBy"
                  value={formData.awardedBy}
                  onChange={handleChange}
                  className="input input-bordered w-full focus:ring-2 focus:ring-primary"
                  required
                  placeholder="Organization or person name"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Academic Year*</span>
                </label>
                <select
                  name="academicYearId"
                  value={formData.academicYearId}
                  onChange={handleChange}
                  className="select select-bordered w-full focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select academic year</option>
                  {academicYears.map(year => (
                    <option key={year.id} value={year.id}>
                      {year.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Visibility*</span>
                </label>
                <select
                  name="isVisible"
                  value={formData.isVisible}
                  onChange={handleChange}
                  className="select select-bordered w-full focus:ring-2 focus:ring-primary"
                  required
                >
                  {visibilityOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <button 
              type="button" 
              onClick={onClose}
              className="btn btn-ghost hover:bg-gray-100 px-6"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={`btn btn-primary px-6 text-white ${isSubmitting ? 'loading' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Achievement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAchievementModal;