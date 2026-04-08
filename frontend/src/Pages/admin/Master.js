import React, { useState, useEffect, lazy, Suspense } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

// Lazy load components
const Modal = lazy(() => import("./Modal"));
const Section = lazy(() => import("./Section"));

const Master = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('classes');
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Form states
  const [classForm, setClassForm] = useState({ class: '', section: '', noofstudent: '' });
  const [subjectForm, setSubjectForm] = useState({
    subject_code: '',
    subject_name: '',
    short_name: '',
    category: 'Core',
    grade_levels: [],
    credit_value: 1.0,
    weekly_periods: 5,
    is_active: true
  });
  const [periodForm, setPeriodForm] = useState({ periodname: '', timein: '', timeout: '' });

  // Grade level options
  const gradeOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  // Set initial tab based on URL path
  const getInitialTab = () => {
    if (location.pathname.includes('/classmaster')) return 'classes';
    if (location.pathname.includes('/subjectmaster')) return 'subjects';
    if (location.pathname.includes('/periodmaster')) return 'periods';
    return 'classes'; // default
  };

  useEffect(() => {
    setActiveTab(getInitialTab());
    resetForms();
  }, [location.pathname]);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [classesRes, subjectsRes, periodsRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/api/master/classes`),
          axios.get(`${process.env.REACT_APP_API_URL}/api/master/SubjectsMaster`),
          axios.get(`${process.env.REACT_APP_API_URL}/api/master/periods`)
        ]);
        setClasses(classesRes.data);
        setSubjects(subjectsRes.data);
        setPeriods(periodsRes.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Reset forms
  const resetForms = () => {
    setClassForm({ class: '', section: '', noofstudent: '' });
    setSubjectForm({
      subject_code: '',
      subject_name: '',
      short_name: '',
      category: 'Core',
      grade_levels: [],
      credit_value: 1.0,
      weekly_periods: 5,
      is_active: true
    });
    setPeriodForm({ periodname: '', timein: '', timeout: '' });
    setEditId(null);
    setIsEditing(false);
    setValidationErrors({});
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    resetForms();
  };

  // Validate required fields
  const validateRequiredFields = () => {
    const errors = {};

    switch (activeTab) {
      case 'classes':
        if (!classForm.class?.trim()) {
          errors.class = 'Class name is required';
        }
        if (!classForm.section?.trim()) {
          errors.section = 'Section is required';
        }
        break;
      case 'subjects':
        if (!subjectForm.subject_code?.trim()) {
          errors.subject_code = 'Subject code is required';
        }
        if (!subjectForm.subject_name?.trim()) {
          errors.subject_name = 'Subject name is required';
        }
        if (!subjectForm.weekly_periods || subjectForm.weekly_periods < 1) {
          errors.weekly_periods = 'Weekly periods must be at least 1';
        }
        break;
      case 'periods':
        if (!periodForm.periodname?.trim()) {
          errors.periodname = 'Period name is required';
        }
        if (!periodForm.timein) {
          errors.timein = 'Time in is required';
        }
        if (!periodForm.timeout) {
          errors.timeout = 'Time out is required';
        }
        break;
      default:
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle edit mode toggle
  const handleEditToggle = (id = null) => {
    if (id) {
      setEditId(id);
      setIsEditing(true);
      // Populate form with existing data
      switch (activeTab) {
        case 'classes':
          const classToEdit = classes.find(c => c.id === id);
          setClassForm({ 
            class: classToEdit.class, 
            section: classToEdit.section,
            noofstudent: classToEdit.noofstudent || ''
          });
          break;
        case 'subjects':
          const subjectToEdit = subjects.find(s => s.subject_id === id);
          setSubjectForm({
            subject_code: subjectToEdit.subject_code,
            subject_name: subjectToEdit.subject_name,
            short_name: subjectToEdit.short_name || '',
            category: subjectToEdit.category,
            grade_levels: subjectToEdit.grade_levels || [],
            credit_value: subjectToEdit.credit_value,
            weekly_periods: subjectToEdit.weekly_periods,
            is_active: subjectToEdit.is_active
          });
          break;
        case 'periods':
          const periodToEdit = periods.find(p => p.periodid === id);
          setPeriodForm({
            periodname: periodToEdit.periodname,
            timein: periodToEdit.timein,
            timeout: periodToEdit.timeout
          });
          break;
        default:
          break;
      }
    } else {
      resetForms();
    }
  };

  // Form change handlers
  const handleClassChange = (e) => {
    const { name, value } = e.target;
    setClassForm({ ...classForm, [name]: value });
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubjectChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSubjectForm({
      ...subjectForm,
      [name]: type === 'checkbox' ? checked : value
    });

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePeriodChange = (e) => {
    const { name, value } = e.target;
    setPeriodForm({ ...periodForm, [name]: value });

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleGradeLevelChange = (grade) => {
    setSubjectForm(prev => {
      const newGrades = prev.grade_levels.includes(grade)
        ? prev.grade_levels.filter(g => g !== grade)
        : [...prev.grade_levels, grade];
      return { ...prev, grade_levels: newGrades };
    });
  };

  // Handle save
  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!validateRequiredFields()) {
      alert('Please fix all validation errors before saving.');
      return;
    }

    try {
      setSaving(true);
      let response;

      if (editId) {
        // Update existing record
        switch (activeTab) {
          case 'classes':
            response = await axios.put(`${process.env.REACT_APP_API_URL}/api/master/classes/${editId}`, classForm);
            setClasses(classes.map(c => c.id === editId ? response.data : c));
            break;
          case 'subjects':
            response = await axios.put(`${process.env.REACT_APP_API_URL}/api/master/subjects/${editId}`, subjectForm);
            setSubjects(subjects.map(s => s.subject_id === editId ? response.data : s));
            break;
          case 'periods':
            response = await axios.put(`${process.env.REACT_APP_API_URL}/api/master/periods/${editId}`, periodForm);
            setPeriods(periods.map(p => p.periodid === editId ? response.data : p));
            break;
          default:
            break;
        }
      } else {
        // Create new record
        switch (activeTab) {
          case 'classes':
            response = await axios.post(`${process.env.REACT_APP_API_URL}/api/master/classes`, classForm);
            setClasses([...classes, response.data]);
            break;
          case 'subjects':
            response = await axios.post(`${process.env.REACT_APP_API_URL}/api/master/subjects`, subjectForm);
            setSubjects([...subjects, response.data]);
            break;
          case 'periods':
            response = await axios.post(`${process.env.REACT_APP_API_URL}/api/master/periods`, periodForm);
            setPeriods([...periods, response.data]);
            break;
          default:
            break;
        }
      }

      resetForms();
      setSaving(false);
      alert(`${activeTab.slice(0, -1)} ${editId ? 'updated' : 'added'} successfully!`);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm(`Are you sure you want to delete this ${activeTab.slice(0, -1)}?`)) {
      try {
        setLoading(true);
        switch (activeTab) {
          case 'classes':
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/master/classes/${id}`);
            setClasses(classes.filter(c => c.id !== id));
            break;
          case 'subjects':
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/master/subjects/${id}`);
            setSubjects(subjects.filter(s => s.subject_id !== id));
            break;
          case 'periods':
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/master/periods/${id}`);
            setPeriods(periods.filter(p => p.periodid !== id));
            break;
          default:
            break;
        }
        setLoading(false);
        alert(`${activeTab.slice(0, -1)} deleted successfully!`);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }
  };

  // Helper function to get validation error message
  const getValidationError = (fieldName) => {
    return validationErrors[fieldName];
  };

  // Render functions for each tab
  const renderClassTab = () => (
    <Section title="Class Management">
      <div className="space-y-6">
        {/* Class Form */}
        <div className="bg-base-100 p-6 rounded-lg border border-base-300">
          <h3 className="text-lg font-semibold mb-4">
            {isEditing ? 'Edit Class' : 'Add New Class'}
          </h3>
          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Class</span>
                </label>
                <input
                  type="text"
                  name="class"
                  value={classForm.class}
                  onChange={handleClassChange}
                  className={`input input-bordered w-full ${
                    getValidationError('class') ? 'input-error' : ''
                  }`}
                  placeholder="Enter class name"
                  required
                />
                {getValidationError('class') && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {getValidationError('class')}
                    </span>
                  </label>
                )}
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Section</span>
                </label>
                <input
                  type="text"
                  name="section"
                  value={classForm.section}
                  onChange={handleClassChange}
                  className={`input input-bordered w-full ${
                    getValidationError('section') ? 'input-error' : ''
                  }`}
                  placeholder="Enter section"
                  required
                />
                {getValidationError('section') && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {getValidationError('section')}
                    </span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">No. of Students</span>
                </label>
                <input
                  type="number"
                  name="noofstudent"
                  value={classForm.noofstudent}
                  onChange={handleClassChange}
                  className="input input-bordered w-full"
                  placeholder="Enter number of students"
                />
              </div>
            </div>
            
            <div className="flex space-x-2 mt-6">
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Saving...
                  </>
                ) : (
                  isEditing ? 'Update Class' : 'Add Class'
                )}
              </button>
              {isEditing && (
                <button 
                  type="button" 
                  onClick={() => handleEditToggle()} 
                  className="btn btn-ghost"
                  disabled={saving}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
        
        {/* Class List */}
        <div className="bg-base-100 rounded-lg border border-base-300">
          <div className="p-4 border-b border-base-300">
            <h3 className="text-lg font-semibold">Class List</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr className="bg-base-300">
                  <th className="font-semibold p-3">ID</th>
                  <th className="font-semibold p-3">Class</th>
                  <th className="font-semibold p-3">Section</th>
                  <th className="font-semibold p-3">No. of Students</th>
                  <th className="font-semibold p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {classes.map(cls => (
                  <tr key={cls.id} className="hover:bg-base-200">
                    <td className="p-3">{cls.id}</td>
                    <td className="p-3">{cls.class}</td>
                    <td className="p-3">{cls.section}</td>
                    <td className="p-3">{cls.noofstudent || 'N/A'}</td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditToggle(cls.id)} 
                          className="btn btn-info btn-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(cls.id)} 
                          className="btn btn-error btn-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {classes.length === 0 && (
            <div className="text-center py-8 text-base-content/70">
              No classes found
            </div>
          )}
        </div>
      </div>
    </Section>
  );

  const renderSubjectTab = () => (
    <Section title="Subject Management">
      <div className="space-y-6">
        {/* Subject Form */}
        <div className="bg-base-100 p-6 rounded-lg border border-base-300">
          <h3 className="text-lg font-semibold mb-4">
            {isEditing ? 'Edit Subject' : 'Add New Subject'}
          </h3>
          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Subject Code</span>
                </label>
                <input
                  type="text"
                  name="subject_code"
                  value={subjectForm.subject_code}
                  onChange={handleSubjectChange}
                  className={`input input-bordered w-full ${
                    getValidationError('subject_code') ? 'input-error' : ''
                  }`}
                  required
                />
                {getValidationError('subject_code') && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {getValidationError('subject_code')}
                    </span>
                  </label>
                )}
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Subject Name</span>
                </label>
                <input
                  type="text"
                  name="subject_name"
                  value={subjectForm.subject_name}
                  onChange={handleSubjectChange}
                  className={`input input-bordered w-full ${
                    getValidationError('subject_name') ? 'input-error' : ''
                  }`}
                  required
                />
                {getValidationError('subject_name') && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {getValidationError('subject_name')}
                    </span>
                  </label>
                )}
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Short Name</span>
                </label>
                <input
                  type="text"
                  name="short_name"
                  value={subjectForm.short_name}
                  onChange={handleSubjectChange}
                  className="input input-bordered w-full"
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Category</span>
                </label>
                <select
                  name="category"
                  value={subjectForm.category}
                  onChange={handleSubjectChange}
                  className="select select-bordered w-full"
                  required
                >
                  <option value="Core">Core</option>
                  <option value="Elective">Elective</option>
                  <option value="Language">Language</option>
                  <option value="Arts">Arts</option>
                  <option value="Science">Science</option>
                  <option value="Humanities">Humanities</option>
                  <option value="Physical Education">Physical Education</option>
                  <option value="Vocational">Vocational</option>
                </select>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Credit Value</span>
                </label>
                <input
                  type="number"
                  name="credit_value"
                  value={subjectForm.credit_value}
                  onChange={handleSubjectChange}
                  className="input input-bordered w-full"
                  step="0.5"
                  min="0.5"
                  max="5"
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Weekly Periods</span>
                </label>
                <input
                  type="number"
                  name="weekly_periods"
                  value={subjectForm.weekly_periods}
                  onChange={handleSubjectChange}
                  className={`input input-bordered w-full ${
                    getValidationError('weekly_periods') ? 'input-error' : ''
                  }`}
                  min="1"
                  max="10"
                  required
                />
                {getValidationError('weekly_periods') && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {getValidationError('weekly_periods')}
                    </span>
                  </label>
                )}
              </div>
              
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text font-semibold">Active</span>
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={subjectForm.is_active}
                    onChange={handleSubjectChange}
                    className="toggle toggle-primary"
                  />
                </label>
              </div>
            </div>
            
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text font-semibold">Grade Levels</span>
              </label>
              <div className="flex flex-wrap gap-4">
                {gradeOptions.map(grade => (
                  <div key={grade} className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text mr-2">Grade {grade}</span> 
                      <input
                        type="checkbox"
                        checked={(subjectForm.grade_levels || []).includes(grade)}
                        onChange={() => handleGradeLevelChange(grade)}
                        className="checkbox checkbox-primary"
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex space-x-2 mt-6">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Saving...
                  </>
                ) : (
                  isEditing ? 'Update Subject' : 'Add Subject'
                )}
              </button>
              {isEditing && (
                <button type="button" onClick={() => handleEditToggle()} className="btn btn-ghost" disabled={saving}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
        
        {/* Subject List */}
        <div className="bg-base-100 rounded-lg border border-base-300">
          <div className="p-4 border-b border-base-300">
            <h3 className="text-lg font-semibold">Subject List</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr className="bg-base-300">
                  <th className="font-semibold p-3">ID</th>
                  <th className="font-semibold p-3">Code</th>
                  <th className="font-semibold p-3">Name</th>
                  <th className="font-semibold p-3">Short Name</th>
                  <th className="font-semibold p-3">Category</th>
                  <th className="font-semibold p-3">Active</th>
                  <th className="font-semibold p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map(subject => (
                  <tr key={subject.subject_id} className="hover:bg-base-200">
                    <td className="p-3">{subject.subject_id}</td>
                    <td className="p-3">{subject.subject_code}</td>
                    <td className="p-3">{subject.subject_name}</td>
                    <td className="p-3">{subject.short_name || '-'}</td>
                    <td className="p-3">{subject.category}</td>
                    <td className="p-3">
                      <input 
                        type="checkbox" 
                        checked={subject.is_active} 
                        className="checkbox checkbox-sm" 
                        readOnly 
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditToggle(subject.subject_id)} 
                          className="btn btn-info btn-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(subject.subject_id)} 
                          className="btn btn-error btn-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {subjects.length === 0 && (
            <div className="text-center py-8 text-base-content/70">
              No subjects found
            </div>
          )}
        </div>
      </div>
    </Section>
  );

  const renderPeriodTab = () => (
    <Section title="Period Management">
      <div className="space-y-6">
        {/* Period Form */}
        <div className="bg-base-100 p-6 rounded-lg border border-base-300">
          <h3 className="text-lg font-semibold mb-4">
            {isEditing ? 'Edit Period' : 'Add New Period'}
          </h3>
          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Period Name</span>
                </label>
                <input
                  type="text"
                  name="periodname"
                  value={periodForm.periodname}
                  onChange={handlePeriodChange}
                  className={`input input-bordered w-full ${
                    getValidationError('periodname') ? 'input-error' : ''
                  }`}
                  required
                />
                {getValidationError('periodname') && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {getValidationError('periodname')}
                    </span>
                  </label>
                )}
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Time In</span>
                </label>
                <input
                  type="time"
                  name="timein"
                  value={periodForm.timein}
                  onChange={handlePeriodChange}
                  className={`input input-bordered w-full ${
                    getValidationError('timein') ? 'input-error' : ''
                  }`}
                  required
                />
                {getValidationError('timein') && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {getValidationError('timein')}
                    </span>
                  </label>
                )}
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Time Out</span>
                </label>
                <input
                  type="time"
                  name="timeout"
                  value={periodForm.timeout}
                  onChange={handlePeriodChange}
                  className={`input input-bordered w-full ${
                    getValidationError('timeout') ? 'input-error' : ''
                  }`}
                  required
                />
                {getValidationError('timeout') && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {getValidationError('timeout')}
                    </span>
                  </label>
                )}
              </div>
            </div>
            
            <div className="flex space-x-2 mt-6">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Saving...
                  </>
                ) : (
                  isEditing ? 'Update Period' : 'Add Period'
                )}
              </button>
              {isEditing && (
                <button type="button" onClick={() => handleEditToggle()} className="btn btn-ghost" disabled={saving}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
        
        {/* Period List */}
        <div className="bg-base-100 rounded-lg border border-base-300">
          <div className="p-4 border-b border-base-300">
            <h3 className="text-lg font-semibold">Period List</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr className="bg-base-300">
                  <th className="font-semibold p-3">ID</th>
                  <th className="font-semibold p-3">Period Name</th>
                  <th className="font-semibold p-3">Time In</th>
                  <th className="font-semibold p-3">Time Out</th>
                  <th className="font-semibold p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {periods.map(period => (
                  <tr key={period.periodid} className="hover:bg-base-200">
                    <td className="p-3">{period.periodid}</td>
                    <td className="p-3">{period.periodname}</td>
                    <td className="p-3">{period.timein}</td>
                    <td className="p-3">{period.timeout}</td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditToggle(period.periodid)} 
                          className="btn btn-info btn-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(period.periodid)} 
                          className="btn btn-error btn-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {periods.length === 0 && (
            <div className="text-center py-8 text-base-content/70">
              No periods found
            </div>
          )}
        </div>
      </div>
    </Section>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="mt-4">Loading master data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* Navbar */}
      <div className="navbar bg-base-100 shadow-lg">
        <div className="navbar-center hidden lg:flex">
          <div className="tabs">
            <button 
              className={`tab tab-lg tab-bordered ${activeTab === 'classes' ? 'tab-active' : ''}`}
              onClick={() => handleTabChange('classes')}
            >
              Classes
            </button> 
            <button 
              className={`tab tab-lg tab-bordered ${activeTab === 'subjects' ? 'tab-active' : ''}`}
              onClick={() => handleTabChange('subjects')}
            >
              Subjects
            </button> 
            <button 
              className={`tab tab-lg tab-bordered ${activeTab === 'periods' ? 'tab-active' : ''}`}
              onClick={() => handleTabChange('periods')}
            >
              Periods
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto p-4">
        {error && (
          <div className="alert alert-error mb-4">
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Error: {error}</span>
            </div>
          </div>
        )}
        
        <Suspense fallback={
          <div className="flex justify-center items-center py-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        }>
          {activeTab === 'classes' && renderClassTab()}
          {activeTab === 'subjects' && renderSubjectTab()}
          {activeTab === 'periods' && renderPeriodTab()}
        </Suspense>
      </div>
    </div>
  );
};

export default Master;