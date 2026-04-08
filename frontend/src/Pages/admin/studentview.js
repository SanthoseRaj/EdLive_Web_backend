import React, { useEffect, useState, useCallback, useRef, lazy, Suspense } from 'react';
import { useParams, useNavigate  } from 'react-router-dom';
import { Table } from 'react-bootstrap';

// Lazy load components
const EditableField = lazy(() => import('./EditableField'));
const Section = lazy(() => import('./Section'));
const Modal = lazy(() => import('./Modal'));

const StudentView = () => {
    const { _studentid } = useParams();
    const navigate = useNavigate();
    const [studentData, setStudentData] = useState(null);
    const [editing, setEditing] = useState({ section: null, index: null, field: null, originalValue: '' });
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState('');
    const [activeModal, setActiveModal] = useState(null);
    const [newItem, setNewItem] = useState({});
    const inputRef = useRef(null);
    const containerRef = useRef(null);
      const [periods, setPeriods] = useState([]);
      const [loadingPeriods, setLoadingPeriods] = useState(false);
      const [classess, setClassess] = useState([]);
      const [loadingClasses, setLoadingClasses] = useState(false);
      const [subjects, setSubjects] = useState([]);
    const [loadingSubjects, setLoadingSubjects] = useState(false);
    
    const FaArrowLeft = lazy(() => import("react-icons/fa").then(module => ({ default: module.FaArrowLeft })));

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/student/students/${_studentid}`, {
                    method: 'GET',
                    credentials: 'include'
                });
                if (!response.ok) throw new Error('Failed to fetch');
                const data = await response.json();
                setStudentData(data);
            } catch (error) {
                console.error('Error fetching student data:', error);
                setError('Failed to load student profile');
            }
        };

        fetchStudentData();

        const handleClickOutside = (e) => {
            if (editing && containerRef.current && !containerRef.current.contains(e.target)) {
                handleUpdate();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [_studentid]);

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
    const handleEdit = (section, index, field, originalValue) => {
        setEditing({ section, index, field, originalValue: originalValue || '' });
        setInputValue(originalValue || '');
    };
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
    const handleUpdate = async () => {
        try {
            let updateData;
            let url = `${process.env.REACT_APP_API_URL}/api/student/students/${_studentid}`;
            let method = 'PATCH';

            if (editing.section) {
                switch(editing.section) {
                    case 'basic_info':
                        url = `${url}/basic`;
                        method = 'PATCH';
                        updateData = { [editing.field]: inputValue };
                        break;
                    case 'basic':
                        url = `${url}`;
                        method = 'PATCH';
                        updateData = { [editing.field]: inputValue };
                        break;
                    case 'personal':
                        url = `${url}/personal`;
                        method = 'PATCH';
                        updateData = { [editing.field]: inputValue };
                        break;
                    case 'education':
                        url = `${url}/education/${studentData.education[editing.index].id}`;
                        method = 'PATCH';
                        updateData = { [editing.field]: inputValue };
                        break;
                    case 'family':
                        url = `${url}/family/${studentData.family[editing.index].id}`;
                        method = 'PATCH';
                        updateData = { [editing.field]: inputValue };
                        break;
                    case 'performance':
                        url = `${url}/performance`;
                        method = 'PATCH';
                        updateData = { [editing.field]: inputValue };
                        break;
                    case 'health':
                        url = `${url}/health`;
                        method = 'PATCH';
                        updateData = { [editing.field]: inputValue };
                        break;
                    case 'school':
                        url = `${url}/school`;
                        method = 'PATCH';
                        updateData = { [editing.field]: inputValue };
                        break;
                    case 'parent':
                        url = `${url}/parent`;
                        method = 'PATCH';
                        updateData = { [editing.field]: inputValue };
                        break;
                    case 'caste':
                        url = `${url}/caste`;
                        method = 'PATCH';
                        updateData = { [editing.field]: inputValue };
                        break;
                    // case 'education':
                    //     url = `${url}/education/${staffData.education[editing.index].id}`;
                    //     method = 'PATCH';
                    //     updateData = { [editing.field]: inputValue };
                    //     break;
                    // case 'family':
                    //     url = `${url}/family/${staffData.family[editing.index].id}`;
                    //     method = 'PATCH';
                    //     updateData = { [editing.field]: inputValue };
                    //     break;
                    // case 'classResponsibilities':
                    //     url = `${url}/classes/${staffData.classResponsibilities[editing.index].id}`;
                    //     method = 'PATCH';
                    //     updateData = { [editing.field]: inputValue };
                    //     break;
                    case 'service':
                        url = `${url}/service`;
                        method = 'PATCH';
                        updateData = { [editing.field]: inputValue };
                        break;
                    // case 'experience':
                    //     url = `${url}/experience/${staffData.experience[editing.index].id}`;
                    //     method = 'PATCH';
                    //     updateData = { [editing.field]: inputValue };
                    //     break;
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
            if (editing.section) {
                setStudentData(prev => ({
                    ...prev,
                    [editing.section]: {
                        ...prev[editing.section],
                        ...updatedData
                    }
                }));
            } else {
                setStudentData(prev => ({ ...prev, ...updatedData }));
            }

            cancelEdit();
        } catch (error) {
            console.error('Error updating data:', error);
        }
    };

    const cancelEdit = () => {
        setEditing({ section: null, index: null, field: null });
        setInputValue('');
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('StudentprofileImage', file);

        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/api/student/students/${_studentid}/image`,
                {
                    method: 'PATCH',
                    body: formData,
                    credentials: 'include'
                }
            );

            if (!response.ok) throw new Error('Failed to upload image');

            const data = await response.json();
            setStudentData({ ...studentData, profile_img: data.profileImage });
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        if (isNaN(date)) return 'Invalid Date';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

     const handleAddItem = async (section) => {
        try {
            const url = `${process.env.REACT_APP_API_URL}/api/student/students/${_studentid}/${section}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newItem[section]),
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Failed to add item');

            const data = await response.json();
            setStudentData(prev => ({
                ...prev,
                [section]: [...(prev[section] || []), data]
            }));
            setNewItem(prev => ({ ...prev, [section]: {} }));
            setActiveModal(null);
        } catch (error) {
            console.error(`Error adding ${section} item:`, error);
        }
    };

    const handleDeleteItem = async (section, id) => {
        try {
            const url = `${process.env.REACT_APP_API_URL}/api/student/students/${_studentid}/${section}/${id}`;
            const response = await fetch(url, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Failed to delete item');

            setStudentData(prev => ({
                ...prev,
                [section]: prev[section].filter(item => item.id !== id)
            }));
        } catch (error) {
            console.error(`Error deleting ${section} item:`, error);
        }
    };

    if (!studentData) return <div className="text-center p-8">Loading...</div>;
    if (error) return <div className="text-center p-8 text-error">{error}</div>;

    return (
        <div className="p-4 mx-auto">
            {/* Header with Back Button - Similar to StudentChildren.js */}
            <div className="flex items-center gap-4 mb-6">
                <button 
                    onClick={() => navigate(-1)}
                    className="btn btn-ghost btn-circle"
                >
                    <Suspense fallback={<div className="w-5 h-5 bg-gray-200 rounded"></div>}>
                        <FaArrowLeft className="w-5 h-5" />
                    </Suspense>
                </button>
                <div>
            <h1 className="text-3xl font-bold mb-6">{studentData.full_name}'s Profile</h1>
                </div>
            </div>
            <Suspense fallback={<div>Loading components...</div>}>
                {/* Basic Information Section */}
                <Section title="Basic Information">
                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                        {/* Profile Image */}
                        <div className="w-full md:w-1/4 relative group ">
                            <div className="w-48 h-48 mx-auto aspect-square">
                                <img
                                    src={studentData.profile_img ? `${process.env.REACT_APP_API_URL}${studentData.profile_img}` : `${process.env.REACT_APP_API_URL}/uploads/profile-images/profile-picture.jpg`}
                                    alt="Profile"
                                    className="w-full h-full object-cover rounded-lg border-4 border-base-200"
                                />
                            </div>
                            <label
                                htmlFor="StudentprofileImage"
                                className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-lg"
                                style={{ width: '192px', height: '192px', left: '50%', transform: 'translateX(-50%)' }}
                            >
                                <span className="text-white text-sm">Change</span>
                                <input
                                    type="file"
                                    id="StudentprofileImage"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />
                            </label>
                        </div>

                        {/* Right Content */}
                        <div className="w-full md:w-3/4">
                            <h3 className="text-2xl font-bold mb-4">{studentData.full_name}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <EditableField
                                        label="Admission No"
                                        value={studentData.admission_no}
                                        onEdit={() => handleEdit('basic', null, 'admission_no', studentData.admission_no)}
                                        editing={editing.section === 'basic' && editing.field === 'admission_no'}
                                        {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                                    />
                                    <EditableField
                                        label="Student ID"
                                        value={studentData.student_id}
                                        onEdit={() => handleEdit('basic', null, 'student_id', studentData.student_id)}
                                        editing={editing.section === 'basic' && editing.field === 'student_id'}
                                        {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                                    />
                                    <EditableField
                                        label="Class"
                                        type="select"
                                        options={classess.map(cls => ({
                                        value: cls.class_id,
                                        label: cls.class_name
                                        }))}
                                        value={getClassDisplay(studentData.class_id) || ''}
                                        onEdit={() => handleEdit('basic', null, 'class_id', studentData.class_id || '')}
                                        editing={editing.section === 'basic' && editing.field === 'class_id'}
                                        {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-8">
                        <div>
                            <EditableField
                                label="Date of Birth"
                                type="date"
                                value={formatDate(studentData.basic_info?.date_of_birth)}
                                onEdit={() => handleEdit('basic_info', null, 'date_of_birth', studentData.basic_info?.date_of_birth)}
                                editing={editing.section === 'basic_info' && editing.field === 'date_of_birth'}
                                {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                            />
                            <EditableField
                                label="Gender"
                                value={studentData.basic_info?.gender}
                                type="select"
                                options={['Male', 'Female', 'Other']}
                                onEdit={() => handleEdit('basic_info', null, 'gender', studentData.basic_info?.gender)}
                                editing={editing.section === 'basic_info' && editing.field === 'gender'}
                                {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                            />
                            <EditableField
                                label="Blood Group"
                                value={studentData.basic_info?.blood_group}
                                onEdit={() => handleEdit('basic_info', null, 'blood_group', studentData.basic_info?.blood_group)}
                                editing={editing.section === 'basic_info' && editing.field === 'blood_group'}
                                {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                            />
                        </div>
                        <div className="hidden md:flex justify-center">
                            <div className="divider divider-horizontal"></div>
                        </div>
                        <div>
                            <EditableField
                                label="Contact Number"
                                value={studentData.basic_info?.contact_number}
                                onEdit={() => handleEdit('basic_info', null, 'contact_number', studentData.basic_info?.contact_number)}
                                editing={editing.section === 'basic_info' && editing.field === 'contact_number'}
                                {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                            />
                        </div>
                    </div>
                </Section>

                {/* Performance Section */}
                <Section title="Performance">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 hidden">
                        <EditableField
                            label="Overall Grade"
                            value={studentData.performance?.overall_grade}
                            onEdit={() => handleEdit('performance', null, 'overall_grade', studentData.performance?.overall_grade)}
                            editing={editing.section === 'performance' && editing.field === 'overall_grade'}
                            {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                        />
                        <EditableField
                            label="Attendance Percentage"
                            value={studentData.performance?.attendance_percentage}
                            onEdit={() => handleEdit('performance', null, 'attendance_percentage', studentData.performance?.attendance_percentage)}
                            editing={editing.section === 'performance' && editing.field === 'attendance_percentage'}
                            {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                        />
                    </div>
                    
                    <div className="mb-4 hidden">
                        <h4 className="font-bold mb-2">Subjects Performance</h4>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Subject</th>
                                    <th>Grade</th>
                                    <th>Remarks</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {studentData.performance?.subjects?.map((subject, index) => (
                                    <tr key={index}>
                                        <td>
                                            <EditableField
                                                value={subject.name}
                                                onEdit={() => handleEdit('performance', index, 'name', subject.name)}
                                                editing={editing.section === 'performance' && editing.index === index && editing.field === 'name'}
                                                {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                                            />
                                        </td>
                                        <td>
                                            <EditableField
                                                value={subject.grade}
                                                onEdit={() => handleEdit('performance', index, 'grade', subject.grade)}
                                                editing={editing.section === 'performance' && editing.index === index && editing.field === 'grade'}
                                                {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                                            />
                                        </td>
                                        <td>
                                            <EditableField
                                                value={subject.remarks}
                                                type="textarea"
                                                onEdit={() => handleEdit('performance', index, 'remarks', subject.remarks)}
                                                editing={editing.section === 'performance' && editing.index === index && editing.field === 'remarks'}
                                                {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                                            />
                                        </td>
                                        <td>
                                            <button 
                                                className="btn btn-error btn-xs"
                                                onClick={() => handleDeleteItem('performance', subject.id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        <button 
                            className="btn btn-primary btn-sm mt-2"
                            onClick={() => setActiveModal('performance')}
                        >
                            Add Subject Performance
                        </button>
                    </div>
                </Section>

                {/* Health Section */}
                <Section title="Student's Health">
                    <div className="space-y-6">
                        {/* Disabilities Section */}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableField
                                label="Any kind of disabilities?"
                                value={studentData.health?.disability}
                                type="checkbox"
                                onEdit={() => handleEdit('health', null, 'disability', studentData.health?.disability || '')}
                                editing={editing.section === 'health' && editing.field === 'disability'}
                                //onEdit={() => setEditingField('disease')}
                                //inputValue={inputValues.disease}
                                //setInputValue={(val) => setInputValues(prev => ({...prev, disease: val}))}
                                //handleUpdate={(val) => handleSave('disease', val)}
                                //cancelEdit={() => setEditingField(null)}
                                {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                                />                        
                            {studentData.health?.disability && (
                            <div className="mt-2">
                                <EditableField
                                label="Disability Details"
                                value={studentData.health?.disability_details || ''}
                                type="textarea"
                                onEdit={() => handleEdit('health', null, 'disability_details', studentData.health?.disability_details || '')}
                                editing={editing.section === 'health' && editing.field === 'disability_details'}
                                {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                                />
                            </div>
                            )}
                        </div>
                        {/* Existing Disease Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            
                            <EditableField
                                label="Any existing disease?"
                                value={studentData.health?.disease}
                                type="checkbox"
                                onEdit={() => handleEdit('health', null, 'disease', studentData.health?.disease || '')}
                                editing={editing.section === 'health' && editing.field === 'disease'}
                                //onEdit={() => setEditingField('disease')}
                                //inputValue={inputValues.disease}
                                //setInputValue={(val) => setInputValues(prev => ({...prev, disease: val}))}
                                //handleUpdate={(val) => handleSave('disease', val)}
                                //cancelEdit={() => setEditingField(null)}
                                {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                                />

                            {studentData.health?.disease && (
                            <div className="mt-2">
                                <EditableField
                                label="Disease Details"
                                value={studentData.health?.disease_details || ''}
                                type="textarea"
                                onEdit={() => handleEdit('health', null, 'disease_details', studentData.health?.disease_details || '')}
                                editing={editing.section === 'health' && editing.field === 'disease_details'}
                                {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                                />
                            </div>
                            )}
                        </div>

                        {/* Disease Details - Only shown if has_existing_disease is 'Yes' */}
                        {(studentData.health?.has_existing_disease === 'Yes') && (
                            <div className="space-y-2">
                                <div className="font-bold">Disease Details</div>
                                <EditableField
                                    value={studentData.health?.disease_details || ''}
                                    type="textarea"
                                    onEdit={() => handleEdit('health', null, 'disease_details', studentData.health?.disease_details || '')}
                                    editing={editing.section === 'health' && editing.field === 'disease_details'}
                                    {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                                />
                            </div>
                        )}

                        <div className="divider"></div>

                        {/* Immunization Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="font-medium">Immunisation?</div>
                            <EditableField
                                value={studentData.health?.immunisation || ''}
                                type="select"
                                options={['None', 'Some', 'Complete']}
                                onEdit={() => handleEdit('health', null, 'immunisation', studentData.health?.immunisation || '')}
                                editing={editing.section === 'health' && editing.field === 'immunisation'}
                                {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                            />
                        </div>

                        {/* Basic Health Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                            <EditableField
                                label="Height (cm)"
                                value={studentData.health?.height || ''}
                                onEdit={() => handleEdit('health', null, 'height', studentData.health?.height || '')}
                                editing={editing.section === 'health' && editing.field === 'height'}
                                {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                            />
                            <EditableField
                                label="Weight (kg)"
                                value={studentData.health?.weight || ''}
                                onEdit={() => handleEdit('health', null, 'weight', studentData.health?.weight || '')}
                                editing={editing.section === 'health' && editing.field === 'weight'}
                                {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                            />
                            <EditableField
                                label="Vision Left Eye"
                                value={studentData.health?.vision_left || ''}
                                onEdit={() => handleEdit('health', null, 'vision_left', studentData.health?.vision_left || '')}
                                editing={editing.section === 'health' && editing.field === 'vision_left'}
                                {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                            />
                            <EditableField
                                label="Vision Right Eye"
                                value={studentData.health?.vision_right || ''}
                                onEdit={() => handleEdit('health', null, 'vision_right', studentData.health?.vision_right || '')}
                                editing={editing.section === 'health' && editing.field === 'vision_right'}
                                {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                            />
                        </div>

                        {/* Medical History Section */}
                        <div className="mt-6 hidden">
                            <h4 className="font-bold mb-2">Medical History</h4>
                            {studentData.health?.medical_history?.length > 0 ? (
                                <div className="space-y-4">
                                    {studentData.health.medical_history.map((record, index) => (
                                        <div key={index} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-bold">{record.condition}</div>
                                                    <div className="text-sm text-gray-500">
                                                        Diagnosed: {formatDate(record.diagnosis_date)}
                                                    </div>
                                                </div>
                                                <button 
                                                    className="btn btn-error btn-xs"
                                                    onClick={() => handleDeleteItem('health', record.id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                            <div className="mt-2">
                                                <EditableField
                                                    value={record.treatment}
                                                    type="textarea"
                                                    onEdit={() => handleEdit('health', index, 'treatment', record.treatment)}
                                                    editing={editing.section === 'health' && editing.index === index && editing.field === 'treatment'}
                                                    {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                                                    noLabel
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-gray-500">No medical history records</div>
                            )}
                            <button 
                                className="btn btn-primary btn-sm mt-4"
                                onClick={() => setActiveModal('health')}
                            >
                                Add Medical Record
                            </button>
                        </div>
                    </div>
                </Section>

                {/* School Information Section */}
                <Section title="School Information">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <EditableField
                                    label="Joining Date"
                                    type="date"
                                    value={formatDate(studentData.school?.admission_date)}
                                    onEdit={() => handleEdit('school', null, 'admission_date', studentData.school?.admission_date)}
                                    editing={editing.section === 'school' && editing.field === 'admission_date'}
                                    {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                                    displayFormat="dd, MMMM yyyy"
                                />
                                <EditableField
                                    label="Class Joined"
                                    value={studentData.school?.class_joined || ''}
                                    onEdit={() => handleEdit('school', null, 'class_joined', studentData.school?.class_joined || '')}
                                    editing={editing.section === 'school' && editing.field === 'class_joined'}
                                    {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                                />
                                <EditableField
                                    label="Previous School"
                                    value={studentData.school?.prev_school || ''}
                                    onEdit={() => handleEdit('school', null, 'prev_school', studentData.school?.prev_school || '')}
                                    editing={editing.section === 'school' && editing.field === 'prev_school'}
                                    {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                                />
                            </div>
                            <div className="space-y-4">
                                <EditableField
                                    label="Class Teacher"
                                    value={studentData.school?.class_teacher || ''}
                                    onEdit={() => handleEdit('school', null, 'class_teacher', studentData.school?.class_teacher || '')}
                                    editing={editing.section === 'school' && editing.field === 'class_teacher'}
                                    {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                                />
                                <EditableField
                                    label="Email"
                                    type="email"
                                    value={studentData.school?.email || 'hgfshj@gmail.com'}
                                    onEdit={() => handleEdit('school', null, 'email', studentData.school?.email || '')}
                                    editing={editing.section === 'school' && editing.field === 'email'}
                                    {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                                />
                                <EditableField
                                    label="Mobile"
                                    type="tel"
                                    value={studentData.school?.mobile || '+91 4786565909'}
                                    onEdit={() => handleEdit('school', null, 'mobile', studentData.school?.mobile || '')}
                                    editing={editing.section === 'school' && editing.field === 'mobile'}
                                    {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                                />
                            </div>
                        </div>

                        {/* Current Class Information */}
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <EditableField
                                label="Current Class/Grade"
                                value={studentData.school?.current_class || ''}
                                onEdit={() => handleEdit('school', null, 'current_class', studentData.school?.current_class || '')}
                                editing={editing.section === 'school' && editing.field === 'current_class'}
                                {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                            />
                            <EditableField
                                label="Section"
                                value={studentData.school?.section || ''}
                                onEdit={() => handleEdit('school', null, 'section', studentData.school?.section || '')}
                                editing={editing.section === 'school' && editing.field === 'section'}
                                {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                            />
                            <EditableField
                                label="Roll Number"
                                value={studentData.school?.roll_number || ''}
                                onEdit={() => handleEdit('school', null, 'roll_number', studentData.school?.roll_number || '')}
                                editing={editing.section === 'school' && editing.field === 'roll_number'}
                                {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                            />
                        </div>

                        {/* Previous Schools Section - Simplified */}
                        {studentData.school?.previous_schools?.length > 0 && (
                            <div className="mt-6">
                                <h4 className="font-bold mb-2">Previous Schools Details</h4>
                                <div className="space-y-3">
                                    {studentData.school.previous_schools.map((school, index) => (
                                        <div key={index} className="border rounded-lg p-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-medium">{school.name || 'Unknown School'}</div>
                                                    <div className="text-sm text-gray-600">
                                                        Class: {school.class_completed || 'N/A'} | Year: {school.year || 'N/A'}
                                                    </div>
                                                </div>
                                                <button 
                                                    className="btn btn-error btn-xs"
                                                    onClick={() => handleDeleteItem('school', school.id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        <button 
                            className="btn btn-primary btn-sm mt-4"
                            onClick={() => setActiveModal('school')}
                        >
                            Add Previous School
                        </button>
                    </div>
                </Section>

                {/* Parent/Guardian Information Section */}
                <Section title="Parents / Guardian">
                    <div className="space-y-6">
                        {/* Parents Same as Guardian Toggle */}

                        {/* Father's Section */}
                        <div className="border rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <EditableField
                                    label="Father Name"
                                    value={studentData.parent?.father_name || "Mr."}
                                    onEdit={() => handleEdit('parent', null, 'father_name', studentData.parent?.father_name)}
                                    editing={editing.section === 'parent' && editing.field === 'father_name'}
                                    {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                                    colon
                                />
                            
                            
                                <EditableField
                                    label="Occupation"
                                    value={studentData.parent?.father_occupation || ""}
                                    onEdit={() => handleEdit('parent', null, 'father_occupation', studentData.parent?.father_occupation)}
                                    editing={editing.section === 'parent' && editing.field === 'father_occupation'}
                                    {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                                    colon
                                />
                                <EditableField
                                    label="Age"
                                    value={studentData.parent?.father_age || ""}
                                    onEdit={() => handleEdit('parent', null, 'father_age', studentData.parent?.father_age)}
                                    editing={editing.section === 'parent' && editing.field === 'father_age'}
                                    {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                                    colon
                                />
                                <EditableField
                                    label="Mobile"
                                    value={studentData.parent?.father_contact || ""}
                                    onEdit={() => handleEdit('parent', null, 'father_contact', studentData.parent?.father_contact)}
                                    editing={editing.section === 'parent' && editing.field === 'father_contact'}
                                    {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                                    colon
                                />
                                <EditableField
                                    label="Email ID"
                                    value={studentData.parent?.father_email || ""}
                                    onEdit={() => handleEdit('parent', null, 'father_email', studentData.parent?.father_email)}
                                    editing={editing.section === 'parent' && editing.field === 'father_email'}
                                    {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                                    colon
                                />
                            </div>
                            
                            <div className="mt-4">
                                <EditableField
                                    label="Address"
                                    value={studentData.parent?.father_address || ""}
                                    type="textarea"
                                    onEdit={() => handleEdit('parent', null, 'father_address', studentData.parent?.father_address)}
                                    editing={editing.section === 'parent' && editing.field === 'father_address'}
                                    {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                                    colon
                                    noLabel
                                />
                            </div>
                        </div>

                        {/* Mother's Section */}
                        <div className="border rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <EditableField
                                    label="Mother Name"
                                    value={studentData.parent?.mother_name || "Mrs."}
                                    onEdit={() => handleEdit('parent', null, 'mother_name', studentData.parent?.mother_name)}
                                    editing={editing.section === 'parent' && editing.field === 'mother_name'}
                                    {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                                    colon
                                />
                                <EditableField
                                    label="Occupation"
                                    value={studentData.parent?.mother_occupation || ""}
                                    onEdit={() => handleEdit('parent', null, 'mother_occupation', studentData.parent?.mother_occupation)}
                                    editing={editing.section === 'parent' && editing.field === 'mother_occupation'}
                                    {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                                    colon
                                />
                                <EditableField
                                    label="Age"
                                    value={studentData.parent?.mother_age || ""}
                                    onEdit={() => handleEdit('parent', null, 'mother_age', studentData.parent?.mother_age)}
                                    editing={editing.section === 'parent' && editing.field === 'mother_age'}
                                    {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                                    colon
                                />
                                <EditableField
                                    label="Mobile"
                                    value={studentData.parent?.mother_contact || ""}
                                    onEdit={() => handleEdit('parent', null, 'mother_contact', studentData.parent?.mother_contact)}
                                    editing={editing.section === 'parent' && editing.field === 'mother_contact'}
                                    {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                                    colon
                                />
                                <EditableField
                                    label="Email ID"
                                    value={studentData.parent?.mother_email || ""}
                                    onEdit={() => handleEdit('parent', null, 'mother_email', studentData.parent?.mother_email)}
                                    editing={editing.section === 'parent' && editing.field === 'mother_email'}
                                    {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                                    colon
                                />
                            </div>
                            
                            <div className="mt-4">
                                <EditableField
                                    label="Address"
                                    value={studentData.parent?.mother_address || ""}
                                    type="textarea"
                                    onEdit={() => handleEdit('parent', null, 'mother_address', studentData.parent?.mother_address)}
                                    editing={editing.section === 'parent' && editing.field === 'mother_address'}
                                    {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                                    colon
                                    noLabel
                                />
                            </div>
                        </div>
                        <div className="border rounded-lg p-4">
                        <EditableField
                                label="Are parents and guardian same?"
                                value={studentData.parent?.guardian_same}
                                type="checkbox"
                                onEdit={() => handleEdit('parent', null, 'guardian_same', studentData.parent?.guardian_same || '')}
                                editing={editing.section === 'parent' && editing.field === 'guardian_same'}
                                //onEdit={() => setEditingField('disease')}
                                //inputValue={inputValues.disease}
                                //setInputValue={(val) => setInputValues(prev => ({...prev, disease: val}))}
                                //handleUpdate={(val) => handleSave('disease', val)}
                                //cancelEdit={() => setEditingField(null)}
                                {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                                />

                        {/* Guardians Section (if parents are not same as guardians) */}
                        {!studentData.parent?.guardian_same==='Yes' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <EditableField
                                    label="Father Name"
                                    value={studentData.parent?.guardian_name || "Mr."}
                                    onEdit={() => handleEdit('parent', null, 'guardian_name', studentData.parent?.guardian_name)}
                                    editing={editing.section === 'parent' && editing.field === 'guardian_name'}
                                    {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                                    colon
                                />
                            
                            
                                <EditableField
                                    label="Occupation"
                                    value={studentData.parent?.guardian_occupation || ""}
                                    onEdit={() => handleEdit('parent', null, 'guardian_occupation', studentData.parent?.guardian_occupation)}
                                    editing={editing.section === 'parent' && editing.field === 'guardian_occupation'}
                                    {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                                    colon
                                />
                                <EditableField
                                    label="Age"
                                    value={studentData.parent?.guardian_age || ""}
                                    onEdit={() => handleEdit('parent', null, 'guardian_age', studentData.parent?.guardian_age)}
                                    editing={editing.section === 'parent' && editing.field === 'guardian_age'}
                                    {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                                    colon
                                />
                                <EditableField
                                    label="Mobile"
                                    value={studentData.parent?.guardian_contact || ""}
                                    onEdit={() => handleEdit('parent', null, 'guardian_contact', studentData.parent?.guardian_contact)}
                                    editing={editing.section === 'parent' && editing.field === 'guardian_contact'}
                                    {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                                    colon
                                />
                                <EditableField
                                    label="Email ID"
                                    value={studentData.parent?.guardian_email || ""}
                                    onEdit={() => handleEdit('parent', null, 'guardian_email', studentData.parent?.guardian_email)}
                                    editing={editing.section === 'parent' && editing.field === 'guardian_email'}
                                    {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                                    colon
                                />
                                <EditableField
                                    label="Address"
                                    value={studentData.parent?.guardian_address || ""}
                                    type="textarea"
                                    onEdit={() => handleEdit('parent', null, 'guardian_address', studentData.parent?.guardian_address)}
                                    editing={editing.section === 'parent' && editing.field === 'guardian_address'}
                                    {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                                    colon
                                    noLabel
                                />
                            </div>
                            )}
                            </div>
                    </div>
                </Section>

                {/* Caste/Religion Section */}
                <Section title="Caste/Religion Information">
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-4">
                        <EditableField
                            label="Religion"
                            value={studentData.caste?.religion}
                            onEdit={() => handleEdit('caste', null, 'religion', studentData.caste?.religion)}
                            editing={editing.section === 'caste' && editing.field === 'religion'}
                            {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                        />
                        <EditableField
                            label="Caste"
                            value={studentData.caste?.caste}
                            onEdit={() => handleEdit('caste', null, 'caste', studentData.caste?.caste)}
                            editing={editing.section === 'caste' && editing.field === 'caste'}
                            {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                        />
                        <EditableField
                            label="Sub Caste"
                            value={studentData.caste?.sub_caste}
                            onEdit={() => handleEdit('caste', null, 'sub_caste', studentData.caste?.sub_caste)}
                            editing={editing.section === 'caste' && editing.field === 'sub_caste'}
                            {...{ inputValue, setInputValue, handleUpdate, cancelEdit }}
                        />
                    </div>
                </Section>

                {/* Modals for adding new items */}
                <Modal 
                    isOpen={activeModal === 'performance'}
                    onClose={() => setActiveModal(null)}
                    title="Add Subject Performance"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block">Subject Name</label>
                            <input
                                type="text"
                                className="input input-bordered w-full"
                                value={newItem.performance?.name || ''}
                                onChange={(e) => setNewItem(prev => ({
                                    ...prev,
                                    performance: {
                                        ...prev.performance,
                                        name: e.target.value
                                    }
                                }))}
                            />
                        </div>
                        <div>
                            <label className="block">Grade</label>
                            <input
                                type="text"
                                className="input input-bordered w-full"
                                value={newItem.performance?.grade || ''}
                                onChange={(e) => setNewItem(prev => ({
                                    ...prev,
                                    performance: {
                                        ...prev.performance,
                                        grade: e.target.value
                                    }
                                }))}
                            />
                        </div>
                        <div>
                            <label className="block">Remarks</label>
                            <textarea
                                className="textarea textarea-bordered w-full"
                                value={newItem.performance?.remarks || ''}
                                onChange={(e) => setNewItem(prev => ({
                                    ...prev,
                                    performance: {
                                        ...prev.performance,
                                        remarks: e.target.value
                                    }
                                }))}
                            />
                        </div>
                        <button 
                            className="btn btn-primary"
                            onClick={() => handleAddItem('performance')}
                        >
                            Add Performance
                        </button>
                    </div>
                </Modal>

                <Modal 
                    isOpen={activeModal === 'health'}
                    onClose={() => setActiveModal(null)}
                    title="Add Medical Record"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block">Condition</label>
                            <input
                                type="text"
                                className="input input-bordered w-full"
                                value={newItem.health?.condition || ''}
                                onChange={(e) => setNewItem(prev => ({
                                    ...prev,
                                    health: {
                                        ...prev.health,
                                        condition: e.target.value
                                    }
                                }))}
                            />
                        </div>
                        <div>
                            <label className="block">Diagnosis Date</label>
                            <input
                                type="date"
                                className="input input-bordered w-full"
                                value={newItem.health?.diagnosis_date || ''}
                                onChange={(e) => setNewItem(prev => ({
                                    ...prev,
                                    health: {
                                        ...prev.health,
                                        diagnosis_date: e.target.value
                                    }
                                }))}
                            />
                        </div>
                        <div>
                            <label className="block">Treatment</label>
                            <textarea
                                className="textarea textarea-bordered w-full"
                                value={newItem.health?.treatment || ''}
                                onChange={(e) => setNewItem(prev => ({
                                    ...prev,
                                    health: {
                                        ...prev.health,
                                        treatment: e.target.value
                                    }
                                }))}
                            />
                        </div>
                        <button 
                            className="btn btn-primary"
                            onClick={() => handleAddItem('health')}
                        >
                            Add Medical Record
                        </button>
                    </div>
                </Modal>

                <Modal 
                    isOpen={activeModal === 'school'}
                    onClose={() => setActiveModal(null)}
                    title="Add Previous School"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block">School Name</label>
                            <input
                                type="text"
                                className="input input-bordered w-full"
                                value={newItem.school?.name || ''}
                                onChange={(e) => setNewItem(prev => ({
                                    ...prev,
                                    school: {
                                        ...prev.school,
                                        name: e.target.value
                                    }
                                }))}
                            />
                        </div>
                        <div>
                            <label className="block">Class Completed</label>
                            <input
                                type="text"
                                className="input input-bordered w-full"
                                value={newItem.school?.class_completed || ''}
                                onChange={(e) => setNewItem(prev => ({
                                    ...prev,
                                    school: {
                                        ...prev.school,
                                        class_completed: e.target.value
                                    }
                                }))}
                            />
                        </div>
                        <div>
                            <label className="block">Year</label>
                            <input
                                type="text"
                                className="input input-bordered w-full"
                                value={newItem.school?.year || ''}
                                onChange={(e) => setNewItem(prev => ({
                                    ...prev,
                                    school: {
                                        ...prev.school,
                                        year: e.target.value
                                    }
                                }))}
                            />
                        </div>
                        <button 
                            className="btn btn-primary"
                            onClick={() => handleAddItem('school')}
                        >
                            Add School
                        </button>
                    </div>
                </Modal>

                <Modal 
                    isOpen={activeModal === 'parent'}
                    onClose={() => setActiveModal(null)}
                    title="Add Guardian"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block">Name</label>
                            <input
                                type="text"
                                className="input input-bordered w-full"
                                value={newItem.parent?.name || ''}
                                onChange={(e) => setNewItem(prev => ({
                                    ...prev,
                                    parent: {
                                        ...prev.parent,
                                        name: e.target.value
                                    }
                                }))}
                            />
                        </div>
                        <div>
                            <label className="block">Relationship</label>
                            <input
                                type="text"
                                className="input input-bordered w-full"
                                value={newItem.parent?.relationship || ''}
                                onChange={(e) => setNewItem(prev => ({
                                    ...prev,
                                    parent: {
                                        ...prev.parent,
                                        relationship: e.target.value
                                    }
                                }))}
                            />
                        </div>
                        <div>
                            <label className="block">Contact</label>
                            <input
                                type="text"
                                className="input input-bordered w-full"
                                value={newItem.parent?.contact || ''}
                                onChange={(e) => setNewItem(prev => ({
                                    ...prev,
                                    parent: {
                                        ...prev.parent,
                                        contact: e.target.value
                                    }
                                }))}
                            />
                        </div>
                        <div>
                            <label className="block">Address</label>
                            <textarea
                                className="textarea textarea-bordered w-full"
                                value={newItem.parent?.address || ''}
                                onChange={(e) => setNewItem(prev => ({
                                    ...prev,
                                    parent: {
                                        ...prev.parent,
                                        address: e.target.value
                                    }
                                }))}
                            />
                        </div>
                        <button 
                            className="btn btn-primary"
                            onClick={() => handleAddItem('parent')}
                        >
                            Add Guardian
                        </button>
                    </div>
                </Modal>
            </Suspense>
        </div>
    );
};

export default StudentView;