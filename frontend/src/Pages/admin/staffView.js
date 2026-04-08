import React,{ useEffect, useState,useCallback, useRef, lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { Table } from 'react-bootstrap';


// Lazy load components
const EditableField = lazy(() => import('./EditableField'));
const Section = lazy(() => import('./Section'));
const Modal = lazy(() => import('./Modal'));

const StaffProfile = () => {
  const { _staffid } = useParams(); 
  const [staffData, setStaffData] = useState(null);
  const [editing, setEditing] = useState({ section: null, index: null, field: null,originalValue: '' });
  const [inputValue, setInputValue] = useState('');  
  const [error, setError] = useState('');
  const [activeModal, setActiveModal] = useState(null);
  const [newItem, setNewItem] = useState({});
  const [editingTimetable, setEditingTimetable] = useState(null);
  const [editTimetableData, setEditTimetableData] = useState({});
  const [periods, setPeriods] = useState([]);
  const [loadingPeriods, setLoadingPeriods] = useState(false);
  const [classess, setClassess] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const [sameAddress, setSameAddress] = useState(false);
  
  const handleAddClick = (section) => {
    setActiveModal(section);
    setNewItem(getInitialState(section));
  };
  
  const getInitialState = (section) => {
    switch(section) {
      case 'education':
        return { degree: '', institution: '', start_date: '', end_date: '', grade: '' };
      case 'family':
        return { name: '', relation: '', contact: '' };
      case 'class':
        return { class_id: '', subject_id: '', academic_year: '' };
      case 'document':
        return { document_type: '', document: null };
      default:
        return {};
    }
  };
  
  const handleFormChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setNewItem(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : files ? files[0] : value
    }));
  };
  
  const handleEducationSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('degree', newItem.degree);
      formData.append('university', newItem.university);
      formData.append('year', newItem.year);
      if (newItem.certificate) {
          formData.append('certificate', newItem.certificate);
      }
      
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/staff/staff/${_staffid}/education`,
        {
          method: 'POST',
          body: formData,
          credentials: 'include'
        }
      );
      
      if (!response.ok) throw new Error('Failed to add education');
      
      const data = await response.json();
      setStaffData(prev => ({
        ...prev,
        education: [...prev.education, data],
        degrees: prev.degrees 
        ? `${prev.degrees}, ${data.degree}` 
        : data.degree
      }));
      setActiveModal(null);
    } catch (error) {
      console.error('Error adding education:', error);
    }
  };
  
  const handleFamilySubmit = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/staff/staff/${_staffid}/family`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newItem),
          credentials: 'include'
        }
      );
      
      if (!response.ok) throw new Error('Failed to add family member');
      
      const data = await response.json();
      setStaffData(prev => ({
        ...prev,
        family: [...prev.family, data]
      }));
      setActiveModal(null);
    } catch (error) {
      console.error('Error adding family member:', error);
    }
  };
  
  const handleClassSubmit = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/staff/staff/${_staffid}/timetable`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newItem),
          credentials: 'include'
        }
      );
      
      if (!response.ok) throw new Error('Failed to add class responsibility');
      
      const data = await response.json();
      console.log('Response data:', data);  // Add this line
      console.log('Sending:', newItem);  // Add this before the fetch
      const completeData = {
        ...newItem, // Include what you sent
        ...data,    // Include what you received
        id: data.id || Date.now() // Ensure there's a unique ID
      };
      
      setStaffData(prev => {
        const updated = {
          ...prev,
          classResponsibilities: [...prev.classResponsibilities, completeData.data]
        };
        console.log('Updated state:', updated); // Verify the new state
        return updated;
      });
      setActiveModal(null);
    } catch (error) {
      console.error('Error adding class responsibility:', error);
    }
  };
  
  const handleDocumentSubmit = async () => {
    const formData = new FormData();
    formData.append('document', newItem.document);
    formData.append('document_type', newItem.document_type);
  
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/staff/staff/${_staffid}/documents`,
        {
          method: 'POST',
          body: formData,
          credentials: 'include'
        }
      );
      
      if (!response.ok) throw new Error('Failed to upload document');
      
      const data = await response.json();
      setStaffData(prev => ({
        ...prev,
        documents: [...prev.documents, data]
      }));
      setActiveModal(null);
    } catch (error) {
      console.error('Error uploading document:', error);
    }
  };


  useEffect(() => {
    if (sameAddress && staffData?.current_address) {
      setStaffData(prev => ({
        ...prev,
        permanent_address: prev.current_address
      }));
    }
  }, [staffData?.current_address, sameAddress]);

  useEffect(() => {
    if (activeModal && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeModal]);

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/staff/staff/${_staffid}`,{
          method: 'GET',
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setStaffData(data);
      } catch (error) {
        console.error('Error fetching staff data:', error);
        setError('Failed to load staff profile');
      }
    };
    
    fetchStaffData();
    
    const handleClickOutside = (e) => {
      if (editing && containerRef.current && !containerRef.current.contains(e.target)) {
        handleUpdate();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [_staffid]);

  const handleEdit = (section, index, field, originalValue) => {
    setEditing({ section, index, field, originalValue: originalValue || '' });
    setInputValue(originalValue || '');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      cancelEdit();
    }
    if (e.key === 'Tab' && editing) {
      e.preventDefault();
      handleUpdate();
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append('profileImage', file);
  
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/staff/staff/${_staffid}/image`,
        {
          method: 'PATCH',
          body: formData,
          credentials: 'include'
        }
      );
      
      if (!response.ok) throw new Error('Failed to upload image');
      
      const data = await response.json();
      setStaffData({ ...staffData, profile_image: data.profileImage });
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleDeleteEducation = async (eduId) => {
    if (window.confirm('Are you sure you want to delete this Education?')) {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/staff/staff/${_staffid}/education/${eduId}`,
          {
            method: 'DELETE',
            credentials: 'include'
          }
        );
      
        if (!response.ok) throw new Error('Failed to delete education');
      
        setStaffData(prev => {
          const updatedEducation = prev.education.filter(edu => edu.id !== eduId);
          return {
            ...prev,
            education: updatedEducation,
            degrees: updatedEducation.map(edu => edu.degree).join(', ')
          };
        });
      } catch (error) {
        console.error('Error deleting education:', error);
      }
    }
  };

  const handleDeleteFamily = async (FamId) => {
    if (window.confirm('Are you sure you want to delete this Family?')) {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/staff/staff/${_staffid}/family/${FamId}`,
          {
            method: 'DELETE',
            credentials: 'include'
          }
        );
      
        if (!response.ok) throw new Error('Failed to delete Family');
      
        setStaffData(prev => {
          const updatedFamily = prev.family.filter(fam => fam.id !== FamId);
          return {
            ...prev,
            family: updatedFamily,
          };
        });
      } catch (error) {
        console.error('Error deleting Family:', error);
      }
    }
  };

  const handleUpdate = async () => {
    try {
      let updateData;
      let url = `${process.env.REACT_APP_API_URL}/api/staff/staff/${_staffid}`;
      let method = 'PUT';
  
      if (editing.section) {
        switch(editing.section) {
          case 'basic':
            url = `${url}/basic`;
            method = 'PATCH';
            updateData = { [editing.field]: inputValue };
            break;
          case 'personal':
          url = `${url}/personal`;
          method = 'PATCH';
          updateData = { [editing.field]: inputValue };
          break;
          case 'education':
            url = `${url}/education/${staffData.education[editing.index].id}`;
            method = 'PATCH';
            updateData = { [editing.field]: inputValue };
            break;
          case 'family':
            url = `${url}/family/${staffData.family[editing.index].id}`;
            method = 'PATCH';
            updateData = { [editing.field]: inputValue };
            break;
          case 'classResponsibilities':
            url = `${url}/classes/${staffData.classResponsibilities[editing.index].id}`;
            method = 'PATCH';
            updateData = { [editing.field]: inputValue };
            break;
            case 'service':
            url = `${url}/service`;
            method = 'PATCH';
            updateData = { [editing.field]: inputValue };
            break;
            case 'experience':
            url = `${url}/experience/${staffData.experience[editing.index].id}`;
            method = 'PATCH';
            updateData = { [editing.field]: inputValue };
            break;
          default:
            updateData = { [editing.field]: inputValue };
        }
      } else {
        updateData = { [editing.field]: inputValue };
      }
  
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to update data');
      
      const updatedData = await response.json();
      if (editing.section && editing.section!=="basic" && editing.section!=="personal" && editing.section!=="education"&& editing.section!=="service" ) {
        const section = [...staffData[editing.section]];
        section[editing.index] = updatedData;
        setStaffData(prev => ({ ...prev, [editing.section]: section }));
      } else if (editing.section == "education") {
        setStaffData(prev => {
        const updatedEducation = [...prev.education];
        updatedEducation[editing.index] = updatedData;
        return {
          ...prev,
          education: updatedEducation,
          degrees: updatedEducation.map(edu => edu.degree).join(', ')
        };
      });
      } else if (editing.section == "service") {
        setStaffData(prev => {
        const updatedservice = [...prev.service];
        updatedservice[0] = updatedData;
        return {
          ...prev,
          service: updatedservice,
        };
      });
      }else {
        setStaffData(prev => ({ ...prev, ...updatedData }));
      }
      
      cancelEdit();
    } catch (error) {
      console.error('Error updating data:', error);
    }
  };
  
  // Move all hook declarations before any conditional returns
  const getPeriodDisplay = useCallback((periodId) => {
    if (!periodId) return '---';
    const period = periods.find(p => p.periodid === periodId);
    return period ? `${period.timein}` : '---';
  }, [periods]);

  const getSubjectDisplay = useCallback((SubjectID) => {
    if (!SubjectID) return '---';
    const subject = subjects.find(p => p.subject_id === SubjectID);
    return subject ? `${subject.subject_code}` : '---';
  }, [subjects]);

  const getClassDisplay = useCallback((ClassID) => {
    if (!ClassID) return '---';
    const classe = classess.find(p => p.class_id === ClassID);
    return classe ? `${classe.class_name}` : '---';
  }, [classess]);
  const Timetable = ({ classes }) => {

    
   // All hooks must be called unconditionally at the top level
  const [editingField, setEditingField] = useState({ 
    classId: null, 
    field: null,
    originalValue: '' 
  });
  const [editValue, setEditValue] = useState('');
  const abortControllerRef = useRef(null);

  // Lazy load Font Awesome icons (moved before any conditional returns)
    const FaEdit = lazy(() => import('react-icons/fa').then(module => ({ default: module.FaEdit })));
    const FaTrash = lazy(() => import('react-icons/fa').then(module => ({ default: module.FaTrash })));
  const FaSave = lazy(() => import('react-icons/fa').then(module => ({ default: module.FaSave })));
  const FaTimes = lazy(() => import('react-icons/fa').then(module => ({ default: module.FaTimes })));
  const FaCheck = lazy(() => import('react-icons/fa').then(module => ({ default: module.FaCheck })));
  const getAssignedPeriods = useCallback(() => {
    const assigned = {};
    classes?.forEach(cls => {
      ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].forEach(day => {
        const periodId = cls[`${day}`];
        if (periodId) {
          if (!assigned[day]) {
            assigned[day] = {};
          }
          assigned[day][periodId] = true;
        }
      });
    });
    return assigned;
  }, [classes]);

  const assignedPeriods = getAssignedPeriods();

  const handleFieldClick = useCallback((classId, field, currentValue) => {
    setEditingField({ 
      classId, 
      field,
      originalValue: currentValue || '' 
    });
    setEditValue(currentValue || '');
  }, []);
    const handleDeleteClass = useCallback(async (classId, e) => {
  e.stopPropagation(); // Add this line
  e.preventDefault();  // Also prevent default if needed
  if (window.confirm('Are you sure you want to delete this class?')) {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/staff/staff/${_staffid}/timetable/${classId}`,
        {
          method: 'DELETE',
          credentials: 'include'
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete class');
      }
      setStaffData(prev => ({
        ...prev,
        classResponsibilities: prev.classResponsibilities.filter(cls => cls.id !== classId)
      }));
      // Update state to remove the deleted class
      alert('Class deleted successfully');
    } catch (error) {
      console.error('Error deleting class:', error);
      alert('Failed to delete class');
    }
  }
});
  const cancelEdit = useCallback(() => {
    setEditValue(editingField.originalValue);
    setEditingField({ classId: null, field: null, originalValue: '' });
  }, [editingField.originalValue]);

  const handleFieldSave = useCallback(async () => {
    if (!editingField.classId || !editingField.field) return;

    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/staff/staff/${_staffid}/classes/${editingField.classId}/timetable`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            [editingField.field]: editValue
          }),
          credentials: 'include',
          signal: controller.signal
        }
      );

      const responseText = await response.text();
      
      if (!responseText) {
        if (response.ok) {
          setStaffData(prev => ({
            ...prev,
            classResponsibilities: prev.classResponsibilities.map(cls => 
              cls.id === editingField.classId ? { 
                ...cls, 
                [editingField.field]: editValue 
              } : cls
            )
          }));
          setEditingField({ classId: null, field: null, originalValue: '' });
          return;
        }
        throw new Error('Server returned empty response');
      }

      const responseData = JSON.parse(responseText);

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to update timetable');
      }

      setStaffData(prev => ({
        ...prev,
        classResponsibilities: prev.classResponsibilities.map(cls => 
          cls.id === editingField.classId ? { ...cls, ...responseData.data } : cls
        )
      }));
      setEditingField({ classId: null, field: null, originalValue: '' });
      
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error updating timetable:', error);
        setEditValue(editingField.originalValue);
        alert(error.message || 'Failed to save changes');
      }
    } finally {
      abortControllerRef.current = null;
    }
  }, [editingField, editValue, _staffid]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        cancelEdit();
      }
      if (e.key === 'Enter') {
        handleFieldSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [cancelEdit, handleFieldSave]);

  // Now the early return can happen after all hooks are declared
  if (!classes || classes.length === 0) {
    return <div className="text-center p-4">No timetable data available</div>;
  }

  // Group classes by subject (moved after hooks)
  const groupedClasses = classes.reduce((acc, cls) => {
    if (!acc[cls.subject]) {
      acc[cls.subject] = [];
    }
    acc[cls.subject].push(cls);
    return acc;
  }, {});
  
    return (
      <div className="overflow-x-auto">
            <Table bordered responsive className="w-full">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Subject</th>
                  <th>Mon</th>
                  <th>Tue</th>
                  <th>Wed</th>
                  <th>Thu</th>
                  <th>Fri</th>
                  <th>Sat</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((cls) => (
                  <tr key={cls.id} className="hover:bg-gray-50">
                    {/* Class Name */}
                    <td className="font-semibold">
                      {editingField.classId === cls.id && editingField.field === 'class_id' ? (
                        <select
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleFieldSave}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') cancelEdit();
                            if (e.key === 'Enter') handleFieldSave();
                          }}
                          autoFocus
                          className="p-1 border rounded"
                        >
                          {classess.map(classe => (
                            <option key={classe.class_id} value={classe.class_id}>
                              {classe.class_name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div 
                          onClick={() => handleFieldClick(cls.id, 'class_id', cls.class_name)}
                          className="cursor-pointer hover:bg-gray-100 p-2 rounded"
                        >
                          {getClassDisplay(cls.class_name)}
                        </div>
                      )}
                    </td>
                    
                    {/* Subject */}
                    <td className="font-semibold">
                      {editingField.classId === cls.id && editingField.field === 'subject_id' ? (
                        <select
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleFieldSave}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') cancelEdit();
                            if (e.key === 'Enter') handleFieldSave();
                          }}
                          autoFocus
                          className="p-1 border rounded"
                        >
                          {subjects.map(subject => (
                            <option key={subject.subject_id} value={subject.subject_id}>
                              {subject.subject_code}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div 
                          onClick={() => handleFieldClick(cls.id, 'subject_id', cls.subject)}
                          className="cursor-pointer hover:bg-gray-100 p-2 rounded"
                        >
                          {getSubjectDisplay(cls.subject)}
                        </div>
                      )}
                    </td>
                    
                    {/* Days */}
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map((day) => (
                      <td key={day}>
                        {editingField.classId === cls.id && editingField.field === day ? (
                          <select
                            value={editValue || ''}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleFieldSave}
                            onKeyDown={(e) => {
                              if (e.key === 'Escape') cancelEdit();
                              if (e.key === 'Enter') handleFieldSave();
                            }}
                            autoFocus
                            className="p-1 border rounded"
                          >
                            <option value="">---</option>
                            {periods.map(period => (
                              <option 
                                key={period.periodid} 
                                value={period.periodid}
                                disabled={
                                  assignedPeriods[day] && 
                                  assignedPeriods[day][period.periodid] && 
                                  editValue !== period.periodid}
                              >
                                {period.timein}
                                {assignedPeriods[day] && 
                                assignedPeriods[day][period.periodid] &&
                                editValue !== period.periodid ? ' (Assigned)' : ''}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div 
                            onClick={() => handleFieldClick(cls.id, day, cls[day])}
                            className="cursor-pointer hover:bg-gray-100 p-2 rounded"
                          >
                            {getPeriodDisplay(cls[day])}
                          </div>
                        )}
                      </td>
                    ))}
                    
                    {/* Actions */}
                    <td>
                      <button 
                        onClick={(e) => handleDeleteClass(cls.id, e)}
                        className="text-red-600 hover:text-red-800 p-2 print:hidden"
                        title="Delete"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-4 w-4" 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          <path 
                            fillRule="evenodd" 
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" 
                            clipRule="evenodd" 
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
      </div>
    );
  };
  useEffect(() => {
    const fetchPeriods = async () => {
      setLoadingPeriods(true);
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/master/periods`,{
          method:'GET',
          credentials:'include'
        });
        if (!response.ok) throw new Error('Failed to fetch periods');
        const data = await response.json();
        setPeriods(data);
      } catch (error) {
        console.error('Error fetching periods:', error);
      } finally {
        setLoadingPeriods(false);
      }
    };
    
    fetchPeriods();
  }, []);
  useEffect(() => {
    const fetchClasses = async () => {
      setLoadingClasses(true);
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/master/classes`,{
          method:'GET',
          credentials:'include'
        });
        if (!response.ok) throw new Error('Failed to fetch classes');
        const data = await response.json();
        setClassess(data);
      } catch (error) {
        console.error('Error fetching classes:', error);
      } finally {
        setLoadingClasses(false);
      }
    };
    
    fetchClasses();
  }, []);
  useEffect(() => {
    const fetchSubjects = async () => {
      setLoadingSubjects(true);
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/master/subjects`,{
          method:'GET',
          credentials:'include'
        });
        if (!response.ok) throw new Error('Failed to fetch Subjects');
        const data = await response.json();
        setSubjects(data);
      } catch (error) {
        console.error('Error fetching Subjects:', error);
      } finally {
        setLoadingSubjects(false);
      }
    };
    
    fetchSubjects();
  }, []);
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date)) return 'Invalid Date';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatEditDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date)) return '';
    // Get the local date parts
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Return in YYYY-MM-DD format (HTML date input format)
    return `${year}-${month}-${day}`;
  };

  const cancelEdit = () => {
    setEditing({ section: null, index: null, field: null });
    setInputValue('');
  };

  

  if (!staffData) return <div className="text-center p-8">Loading...</div>;
  if (error) return <div className="text-center p-8 text-error">{error}</div>;

  return (
    <div className="p-4 mx-auto">
      <h1 className="text-3xl font-bold mb-6">{staffData.full_name}'s Profile</h1>
      
      <Suspense fallback={<div>Loading components...</div>}>
        {/* Personal Information Section */}
        <Section title="Basic">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
    {/* Profile Image - 1/4 width */}
    {/* Profile Image Section - Updated with fixed dimensions */}
<div className="w-full md:w-1/4 relative group aspect-square">
  <div className="w-48 h-48 mx-auto"> {/* Fixed dimensions container */}
    <img 
      src={staffData.profile_image ? `${process.env.REACT_APP_API_URL}${staffData.profile_image}` : `${process.env.REACT_APP_API_URL}/uploads/profile-images/profile-picture.jpg`} 
      alt="Profile" 
      className="w-full h-full object-cover rounded-lg border-4 border-base-200"
    />
  </div>
  <label 
    htmlFor="profileImage" 
    className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-lg"
    style={{ width: '192px', height: '192px', left: '50%', transform: 'translateX(-50%)' }} // Match the container dimensions
  >
    <span className="text-white text-sm">Change</span>
    <input
      type="file"
      id="profileImage"
      accept="image/*"
      className="hidden"
      onChange={handleImageUpload}
    />
  </label>
</div>
    
    {/* Right Content - 3/4 width */}
    <div className="w-full md:w-3/4">
      <h3 className="text-2xl font-bold mb-4">{staffData.gender === 'Female' ? 'Miss.' : 'Mr.'} {staffData.full_name}</h3>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <div className="space-y-2">
          <p><span className="font-semibold">{staffData.degrees || ''}</span></p>
          <EditableField
            label="ID No"
            value={staffData.staff_id_no}
            onEdit={() => handleEdit('basic', null, 'staff_id_no', staffData.staff_id_no)}
            editing={editing.section === 'basic'&& editing.index === null && editing.field === 'staff_id_no'}
            {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
          />
          <EditableField
            label="Gender"
            value={staffData.gender}                              
            type="select"
            options={['Male', 'Female']}
            onEdit={() => handleEdit('basic', null, 'gender', staffData.gender)}
            editing={editing.section === 'basic'&& editing.index === null && editing.field === 'gender'}
            {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Phone:</span>
            <div className="flex gap-2">
              <span>
                <EditableField
                  value={staffData.phone}
                  onEdit={() => handleEdit('basic', null, 'phone', staffData.phone)}
                  editing={editing.section === 'basic'&& editing.index === null && editing.field === 'phone'}
                  {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                />
              </span>
              <span>
                <EditableField
                  value={staffData.alt_phone}
                  onEdit={() => handleEdit('basic', null, 'alt_phone', staffData.alt_phone)}
                  editing={editing.section === 'basic'&& editing.index === null && editing.field === 'alt_phone'}
                  {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                />
              </span>
            </div>
          </div>
          <p className="flex items-center gap-2">
            <span className="font-semibold">Email:</span>
            <span className="text-primary">{staffData.email}</span>
                  </p>
                  <div className="form-control">
  <EditableField
    label="Class Responsibility"
    type="select"
    options={classess.map(cls => ({
      value: cls.class_id,
    label: cls.class_name
    }))}
    value={getClassDisplay(staffData.class_id) || ''}
    onEdit={() => handleEdit('basic', null, 'class_id', staffData.class_id || '')}
    editing={editing.section === 'basic' && editing.field === 'class_id'}
    {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
  />
</div>
        </div>
      </div>
    </div>
  </div>
          
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-8">
          <div className="form-control">
  <label className="label">
    <span className="label-text font-medium">Current Address</span>
  </label>
  <EditableField
    type="textarea"
    value={staffData.current_address || ''}
    onEdit={() => handleEdit('basic', null, 'current_address', staffData.current_address || '')}
    editing={editing.section === 'basic' && editing.field === 'current_address'}
    {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
  />
</div>
<div><label className="label flex items-center gap-2">    
    <input
      type="checkbox"
      className="checkbox checkbox-sm"
      checked={staffData.addresses_same}
      onChange={async (e) => {
  const checked = e.target.checked;
  setSameAddress(checked);

  if (checked) {
    try {
      // Step 1: Update permanent_address
      await fetch(`${process.env.REACT_APP_API_URL}/api/staff/staff/${_staffid}/basic`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ permanent_address: staffData.current_address }),
        credentials: 'include'
      });

      // Step 2: Update addresses_same
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/staff/staff/${_staffid}/basic`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ addresses_same: true }),
        credentials: 'include'
      });

      if (!res.ok) throw new Error('Failed to update addresses_same');

      // Update frontend state
      setStaffData(prev => ({
        ...prev,
        permanent_address: staffData.current_address,
        addresses_same: true
      }));

    } catch (err) {
      console.error('Error syncing address fields:', err);
      alert('Failed to sync addresses');
    }
  }
}}

    />
    <span className="text-sm">Same as Current</span>
  </label></div>
<div className="form-control">
  
  <EditableField
    type="textarea"
    label="Permanent Address"
    value={staffData.permanent_address || ''}
    onEdit={() => handleEdit('basic', null, 'permanent_address', staffData.permanent_address || '')}
    editing={editing.section === 'basic' && editing.field === 'permanent_address'}
    {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
  />
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-8">
            <div>
              <EditableField
                label="Date of Birth"
                type="date" 
                value={formatDate(staffData.dob)}
                onEdit={() => handleEdit('personal', null, 'dob', formatEditDate(staffData.dob))}
                editing={editing.section === 'personal'&& editing.index === null && editing.field === 'dob'}
                {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
              />
              <EditableField
                label="Age"
                value={staffData.age}
                onEdit={() => handleEdit('personal', null, 'age', staffData.age)}
                editing={editing.section === 'personal'&& editing.index === null && editing.field === 'age'}
                {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
              />
              <EditableField
                label="Blood Group"
                value={staffData.blood_group}
                onEdit={() => handleEdit('personal', null, 'blood_group', staffData.blood_group)}
                editing={editing.section === 'personal'&& editing.index === null && editing.field === 'blood_group'}
                {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
              />
            </div>
            <div className="hidden md:flex justify-center">
              <div className="divider divider-horizontal"></div>
            </div>
            <div>
              <EditableField
                label="Account No.:"
                value={staffData.bankaccno}
                onEdit={() => handleEdit('personal', null, 'bankaccno', staffData.bankaccno)}
                editing={editing.section === 'personal'&& editing.index === null && editing.field === 'bankaccno'}
                {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
              />
              <EditableField
                label="PAN.:"
                value={staffData.panno}
                onEdit={() => handleEdit('personal', null, 'panno', staffData.panno)}
                editing={editing.section === 'personal'&& editing.index === null && editing.field === 'panno'}
                {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
              />
              <EditableField
                label="Aadhaar No.:"
                value={staffData.aadhaar}
                onEdit={() => handleEdit('personal', null, 'aadhaar', staffData.aadhaar)}
                editing={editing.section === 'personal'  && editing.index === null && editing.field === 'aadhaar'}
                {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
              />
            </div>
          </div>
        </Section>

        {/* Class Responsibilities Section */}
        <Section title="Class Responsibilities">
          <button 
            onClick={() => handleAddClick('class')}
            className="btn btn-sm btn-primary mb-4 print:hidden"
          >
            Add Class Responsibilities
          </button>

          
          {/* Add this timetable component */}
          <div className="mt-6">
            <Timetable classes={staffData.classResponsibilities} />
          </div>

          
        </Section>

        {/* Service Section */}
        {/* Service Section */}
{/* Service Section */}
<Section title="Service Information">
  <div className="space-y-4">
    {/* Current Organization Info */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Joining Date */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">Joining Date</span>
        </label>
        <EditableField
          label=""
          type="date"
          value={formatDate(staffData.service[0]?.joining_date)}
          onEdit={() => handleEdit('service', null, 'joining_date', formatEditDate(staffData.service[0]?.joining_date))}
          editing={editing.section === 'service' && editing.field === 'joining_date'}
          {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
        />
      </div>

      {/* Leave Information */}
      <div className="grid grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Total Leaves</span>
          </label>
          <EditableField
            label=""
            value={staffData.service[0]?.total_leaves || '0'}
            onEdit={() => handleEdit('service', null, 'total_leaves', staffData.service[0]?.total_leaves || '')}
            editing={editing.section === 'service' && editing.field === 'total_leaves'}
            {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Used Leaves</span>
          </label>
          <EditableField
            label=""
            value={staffData.service[0]?.used_leaves || '0'}
            onEdit={() => handleEdit('service', null, 'used_leaves', staffData.service[0]?.used_leaves || '')}
            editing={editing.section === 'service' && editing.field === 'used_leaves'}
            {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
          />
        </div>
      </div>
    </div>

    {/* Previous Experiences Section */}
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Previous Experiences</h3>
        <button 
          onClick={() => handleAddClick('experience')}
          className="btn btn-sm btn-primary print:hidden"
        >
          Add Experience
        </button>
      </div>

      {staffData?.experience?.length > 0 ? (
        <div className="space-y-4">
          {staffData.experience.map((exp, index) => (
            <div key={index} className="card bg-base-200 p-4 group">
              <div className="absolute top-0 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={async () => {
                      if (window.confirm('Are you sure you want to delete this experience?')) {
                        try {
                          const response = await fetch(
                            `${process.env.REACT_APP_API_URL}/api/staff/staff/${_staffid}/experience/${exp.id}`,
                            {
                              method: 'DELETE',
                              credentials: 'include'
                            }
                          );
                          
                          if (!response.ok) throw new Error('Failed to delete experience');
                          const data = await response.json();
                          setStaffData(prev => {
                            const updatedExperiences = prev.experience.filter(expr=>expr.id!==exp.id);
                            return {
                              ...prev,
                              experience: updatedExperiences
                            };
                          });
                        } catch (error) {
                          console.error('Error deleting experience:', error);
                        }
                      }
                    }}
                  className="btn btn-xs btn-error print:hidden"
                >
                  Delete
                </button>
              </div>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <EditableField
                    label="Organization"
                    value={exp.organization}
                    onEdit={() => handleEdit('experience', index, 'organization', exp.organization)}
                    editing={editing.section === 'experience' && editing.index === index && editing.field === 'organization'}
                    {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <EditableField
                      label="From Date"
                      type="date"
                      value={formatDate(exp.from_date)}
                      onEdit={() => handleEdit('experience', index, 'from_date', formatEditDate(exp.from_date))}
                      editing={editing.section === 'experience' && editing.index === index && editing.field === 'from_date'}
                      {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                    />
                    <EditableField
                      label="To Date"
                      type="date"
                      value={formatDate(exp.to_date)}
                      onEdit={() => handleEdit('experience', index, 'to_date', formatEditDate(exp.to_date))}
                      editing={editing.section === 'experience' && editing.index === index && editing.field === 'to_date'}
                      {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                    />
                  </div>
                  <EditableField
                    label="Designation"
                    value={exp.designation}
                    onEdit={() => handleEdit('experience', index, 'designation', exp.designation)}
                    editing={editing.section === 'experience' && editing.index === index && editing.field === 'designation'}
                    {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                  />
                </div>
                <div className="flex gap-2 ml-4">
                  {exp.exp_docs && (
                    <a 
                      href={`${process.env.REACT_APP_API_URL}${exp.exp_docs}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-ghost"
                      title="View Document"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0 1 1 0 002 0zm2-3a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm4-1a1 1 0 10-2 0v4a1 1 0 102 0V8z" clipRule="evenodd" />
                      </svg>
                    </a>
                  )}
                  <input
                    type="file"
                    id={`exp-doc-${index}`}
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;

                      const formData = new FormData();
                      formData.append('exp_doc', file);

                      try {
                        const response = await fetch(
                          `${process.env.REACT_APP_API_URL}/api/staff/staff/${_staffid}/experience/${exp.id}/document`,
                          {
                            method: 'PATCH',
                            body: formData,
                            credentials: 'include'
                          }
                        );
                        
                        if (!response.ok) throw new Error('Failed to upload document');
                        
                        const data = await response.json();
                        setStaffData(prev => {
                          const updatedExperiences = [...prev.experience];
                          updatedExperiences[index].exp_docs = data.exp_docs;
                          return {
                            ...prev,
                            experience: updatedExperiences
                          };
                        });
                      } catch (error) {
                        console.error('Error uploading document:', error);
                      }
                    }}
                  />
                  <label 
                    htmlFor={`exp-doc-${index}`}
                    className="btn btn-sm btn-ghost"
                    title={exp.exp_docs ? "Replace Document" : "Upload Document"}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 transform rotate-180"  // Added transform rotate-90
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </label>                  
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">No previous experiences added</div>
      )}
    </div>

    {/* PF Information */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      <div className="form-control">
        <label className="label">
          <span className="label-text">PF Number</span>
        </label>
        <EditableField
          label=""
          value={staffData.service[0]?.pf_number || ''}
          onEdit={() => handleEdit('service', null, 'pf_number', staffData.service[0]?.pf_number || '')}
          editing={editing.section === 'service' && editing.field === 'pf_number'}
          {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
        />
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text">PF Document</span>
        </label>
        <div className="flex items-center gap-2">
          {staffData.service[0]?.pf_doc ? (
            <>
              <a 
                href={`${process.env.REACT_APP_API_URL}${staffData.service[0].pf_doc}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-sm btn-ghost"
              >
                View PF Document
              </a>
              <input
                type="file"
                id="pf-doc"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;

                  const formData = new FormData();
                  formData.append('pf_doc', file);

                  try {
                    const response = await fetch(
                      `${process.env.REACT_APP_API_URL}/api/staff/staff/${_staffid}/service/docs`,
                      {
                        method: 'PATCH',
                        body: formData,
                        credentials: 'include'
                      }
                    );
                    
                    if (!response.ok) throw new Error('Failed to upload document');
                    
                    const data = await response.json();
                    setStaffData(prev => {
                      const updatedservice = [...prev.service];
                      updatedservice[0] = data;
                      return {
                        ...prev,
                        service: updatedservice,
                      };
                    });
                  } catch (error) {
                    console.error('Error uploading document:', error);
                  }
                }}
              />
              <label htmlFor="pf-doc" className="btn btn-sm btn-ghost">
                Replace
              </label>
            </>
          ) : (
            <input
              type="file"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const formData = new FormData();
                formData.append('pf_doc', file);

                try {
                  const response = await fetch(
                    `${process.env.REACT_APP_API_URL}/api/staff/staff/${_staffid}/service/docs`,
                    {
                      method: 'PATCH',
                      body: formData,
                      credentials: 'include'
                    }
                  );
                  
                  if (!response.ok) throw new Error('Failed to upload document');
                  
                  const data = await response.json();
                  setStaffData(prev => ({
                    ...prev,
                    service: {
                      ...prev.service,
                      pf_docs: data.pf_docs
                    }
                  }));
                } catch (error) {
                  console.error('Error uploading document:', error);
                }
              }}
              className="file-input file-input-bordered file-input-sm w-full"
            />
          )}
        </div>
      </div>
    </div>
  </div>

  {/* Add Experience Modal */}
  <Modal
    isOpen={activeModal === 'experience'}
    onClose={() => setActiveModal(null)}
    title="Add Previous Experience"
  >
    
  </Modal>
</Section>

        {/* Education Section */}
        <Section title="Education related information">
          <button 
            onClick={() => handleAddClick('education')}
            className="btn btn-sm btn-primary mb-4 print:hidden"
          >
            Add Education
          </button>
          {staffData.education.map((edu, index) => (
            <div key={edu.id} className="mb-4 p-3 bg-base-200 rounded-lg relative group">
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleDeleteEducation(edu.id)}
                  className="btn btn-xs btn-error print:hidden"
                >
                  Delete
                </button>
              </div>
              <EditableField
                label="Degree"
                value={edu.degree}
                onEdit={() => handleEdit('education', index, 'degree', edu.degree)}
                editing={editing.section === 'education' && editing.index === index && editing.field === 'degree'}
                {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
              />
              <EditableField
                label="University/ Institute"
                value={edu.university}
                onEdit={() => handleEdit('education', index, 'university', edu.university)}
                editing={editing.section === 'education' && editing.index === index && editing.field === 'university'}
                {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
              />
              <EditableField
                label="Year of Passing"
                value={edu.year}
                onEdit={() => handleEdit('education', index, 'year', edu.year)}
                editing={editing.section === 'education' && editing.index === index && editing.field === 'year'}
                {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
              />
              {edu.certificate && (
                <div className="mt-2">
                  <a 
                    href={`${process.env.REACT_APP_API_URL}${edu.certificate}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="link link-primary"
                  >
                    View Certificate
                  </a>
                </div>
              )}
            </div>
          ))}
        </Section>

        {/* Family Section */}
        <Section title="Family">
          <button 
            onClick={() => handleAddClick('family')}
            className="btn btn-sm btn-primary mb-4 print:hidden"
          >
            Add Family Member
          </button>
          {staffData.family.map((member, index) => (
            <div key={index} className="mb-4 p-3 bg-base-200 rounded-lg relative group">
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleDeleteFamily(member.id)}
                  className="btn btn-xs btn-error print:hidden"
                >
                  Delete
                </button>
              </div>
              <div className="space-y-2">
  <div className="flex items-center gap-2">
    <div className="flex-1">
      <EditableField
        label=""
        type="select"
        options={['Spouse','Son','Daughter','Father','Mother','Sibling','Others']}
        value={member.relation}
        onEdit={() => handleEdit('family', index, 'relation', member.relation)}
        editing={editing.section === 'family' && editing.index === index && editing.field === 'relation'}
        {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
      />
    </div>
    <div className="flex-1">
      <EditableField
        label=""
        value={member.name}
        onEdit={() => handleEdit('family', index, 'name', member.name)}
        editing={editing.section === 'family' && editing.index === index && editing.field === 'name'}
        {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
      />
    </div>
  </div>
  
  <div className="w-full">
    <EditableField
      label="Contact"
      value={member.contact}
      onEdit={() => handleEdit('family', index, 'contact', member.contact)}
      editing={editing.section === 'family' && editing.index === index && editing.field === 'contact'}
      {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
    />
  </div>
</div>           
            </div>
          ))}
          

        </Section>

        

        {/* Documents Section */}
        <Section title="Documents">
          <button 
            onClick={() => handleAddClick('document')}
            className="btn btn-sm btn-primary mb-4 print:hidden"
          >
            Upload Document
          </button>
          <div className="grid grid-cols-2 gap-4">
            {staffData.documents.map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-base-200 rounded">
                <a href={`${process.env.REACT_APP_API_URL}${doc.file_path}`} target="_blank" rel="noopener noreferrer" className="link">
                  {doc.document_type}
                </a>
                <button className="btn btn-xs btn-ghost print:hidden">Edit</button>
              </div>
            ))}
          </div>
        </Section>
        
        {/* Modals */}
        <Modal
          isOpen={!!activeModal}
          onClose={() => setActiveModal(null)}
          title={`Add New ${activeModal?.charAt(0).toUpperCase() + activeModal?.slice(1)}`}
          headerClasses="bg-[rgb(59,55,207)] text-white p-4 rounded-t-lg"
        >
          {activeModal === 'education' && (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Degree</span>
          </label>
          <input 
            autoFocus
            ref={inputRef}
            type="text"
            name="degree"
            value={newItem.degree}
            onChange={handleFormChange}
            className="input input-bordered w-full focus:ring-2 focus:ring-blue-500"
            placeholder="Bachelor of Science"
          />
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">University/Institution</span>
          </label>
          <input
            type="text"
            name="university"
            value={newItem.university}
            onChange={handleFormChange}
            className="input input-bordered w-full"
            placeholder="University Name"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Year of Passing</span>
          </label>
          <input
            type="text"
            name="year"
            value={newItem.year}
            onChange={handleFormChange}
            className="input input-bordered w-full"
            placeholder="2020"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Certificate</span>
          </label>
          <input
            type="file"
            name="certificate"
            onChange={handleFormChange}
            className="file-input file-input-bordered w-full"
            accept=".pdf,.doc,.docx,.jpg,.png"
          />
        </div>
      </div>

      <div className="modal-action">
        <button 
          onClick={() => setActiveModal(null)}
          className="btn btn-ghost mr-2"
        >
          Cancel
        </button>
        <button 
          onClick={handleEducationSubmit} 
          className="btn btn-primary"
        >
          Add Education
        </button>
      </div>
    </div>
  )}

          {activeModal === 'family' && (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Name</span>
          </label>
          <input
            type="text"
            name="name"
            value={newItem.name}
            onChange={handleFormChange}
            className="input input-bordered w-full"
            placeholder="Family member name"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Relationship</span>
          </label>
          <select
            name="relation"
            value={newItem.relation}
            onChange={handleFormChange}
            className="select select-bordered w-full"
          >
            <option value="">Select relationship</option>
            <option value="Spouse">Spouse</option>
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
            <option value="Sibling">Sibling</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Phone Number</span>
          </label>
          <input
            type="text"
            name="contact"
            value={newItem.contact}
            onChange={handleFormChange}
            className="input input-bordered w-full"
            placeholder="Family member Phone Number"
          />
        </div>

      

      <div className="modal-action">
        <button 
          onClick={() => setActiveModal(null)}
          className="btn btn-ghost mr-2"
        >
          Cancel
        </button>
        <button 
          onClick={handleFamilySubmit} 
          className="btn btn-primary"
        >
          Add Family Member
        </button>
      </div>
    </div>
  )}

         {activeModal === 'class' && (
  <div className="space-y-6">
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">Class</span>
        </label>
        <select
          name="class_id"
          value={newItem.class_id || ''}
          onChange={handleFormChange}
          className="select select-bordered w-full"
        >
          <option value="">Select Class</option>
          {classess?.map(cls => (
            <option key={cls.class_id} value={cls.class_id}>
              {cls.class_name} 
            </option>
          ))}
        </select>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">Subject</span>
        </label>
        <select
          name="subject_id"
          value={newItem.subject_id || ''}
          onChange={handleFormChange}
          className="select select-bordered w-full"
        >
          <option value="">Select Subject</option>
          {subjects?.map(subject => (
            <option key={subject.subject_id} value={subject.subject_id}>
              {subject.subject_name}
            </option>
          ))}
        </select>
      </div>
    </div>

    <div className="form-control">
      <label className="label">
        <span className="label-text font-medium">Academic Year</span>
      </label>
      <input
        type="text"
        name="academic_year"
        value={newItem.academic_year}
        onChange={handleFormChange}
        className="input input-bordered w-full"
        placeholder="2023-2024"
      />
    </div>

    <div className="form-control">
      <label className="label">
        <span className="label-text font-medium">Timetable</span>
      </label>
      <div className="bg-base-100 p-4 rounded-lg border border-base-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
            <div key={day} className="flex items-center gap-4">
              <span className="font-medium w-24">{day}</span>
              <select
                name={day.toLowerCase()}
                value={newItem[day.toLowerCase()] || ''}
                onChange={handleFormChange}
                className="select select-bordered flex-1"
              >
                <option value="">No period</option>
                {periods.map(period => (
                  <option key={period.periodid} value={period.periodid}>
                    {period.periodname} ({period.timein}-{period.timeout})
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="modal-action">
      <button 
        onClick={() => setActiveModal(null)}
        className="btn btn-ghost mr-2"
      >
        Cancel
      </button>
      <button 
        onClick={handleClassSubmit} 
        className="btn btn-primary"
      >
        Add Class Responsibility
      </button>
    </div>
  </div>
)}

          {activeModal === 'document' && (
    <div className="space-y-6">
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">Document Type</span>
        </label>
        <select
          name="document_type"
          value={newItem.document_type}
          onChange={handleFormChange}
          className="select select-bordered w-full"
        >
          <option value="">Select document type</option>
          <option value="Resume">Resume</option>
          <option value="Degree Certificate">Degree Certificate</option>
          <option value="ID Proof">ID Proof</option>
          <option value="Experience Letter">Experience Letter</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">Document File</span>
        </label>
        <div className="flex items-center gap-4">
          <input
            type="file"
            name="document"
            onChange={handleFormChange}
            className="file-input file-input-bordered w-full"
          />
        </div>
        <label className="label">
          <span className="label-text-alt">Supported formats: PDF, DOC, DOCX, JPG, PNG</span>
        </label>
      </div>

      <div className="modal-action">
        <button 
          onClick={() => setActiveModal(null)}
          className="btn btn-ghost mr-2"
        >
          Cancel
        </button>
        <button 
          onClick={handleDocumentSubmit} 
          className="btn btn-primary"
        >
          Upload Document
        </button>
      </div>
    </div>
  )}
  {activeModal==='experience'&&(
    <div className="space-y-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text">Organization Name</span>
        </label>
        <input
          type="text"
          name="organization"
          value={newItem.organization || ''}
          onChange={handleFormChange}
          className="input input-bordered w-full"
          placeholder="Organization Name"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">From Date</span>
          </label>
          <input
            type="date"
            name="from_date"
            value={newItem.from_date || ''}
            onChange={handleFormChange}
            className="input input-bordered w-full"
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">To Date</span>
          </label>
          <input
            type="date"
            name="to_date"
            value={newItem.to_date || ''}
            onChange={handleFormChange}
            className="input input-bordered w-full"
          />
        </div>
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Designation</span>
        </label>
        <input
          type="text"
          name="designation"
          value={newItem.designation || ''}
          onChange={handleFormChange}
          className="input input-bordered w-full"
          placeholder="Designation"
        />
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Experience Document (Optional)</span>
        </label>
        <input
          type="file"
          name="document"
          onChange={handleFormChange}
          className="file-input file-input-bordered w-full"
          accept=".pdf,.doc,.docx,.jpg,.png"
        />
      </div>
      <div className="modal-action">
        <button 
          onClick={() => setActiveModal(null)}
          className="btn btn-ghost"
        >
          Cancel
        </button>
        <button 
          onClick={async () => {
            try {
              const formData = new FormData();
              formData.append('organization', newItem.organization);
              formData.append('from_date', newItem.from_date);
              formData.append('to_date', newItem.to_date);
              formData.append('designation', newItem.designation);
              if (newItem.document) {
                formData.append('exp_doc', newItem.document);
              }

              const response = await fetch(
                `${process.env.REACT_APP_API_URL}/api/staff/staff/${_staffid}/experience`,
                {
                  method: 'POST',
                  body: formData,
                  credentials: 'include'
                }
              );
              
              if (!response.ok) throw new Error('Failed to add experience');
              
              const data = await response.json();
              setStaffData(prev => ({
                ...prev,
                experience: [...prev.experience,data]
              }));
              setActiveModal(null);
              setNewItem({});
            } catch (error) {
              console.error('Error adding experience:', error);
            }
          }}
          className="btn btn-primary"
        >
          Add Experience
        </button>
      </div>
    </div>
    )}
        </Modal>
      </Suspense>
    </div>
  );
};

export default StaffProfile;