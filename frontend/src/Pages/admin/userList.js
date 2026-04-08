import { useEffect, useState, lazy, Suspense, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';

// Lazy load icons
const MdOutlineMail = lazy(() => import("react-icons/md").then(module => ({ default: module.MdOutlineMail })));
const FaUser = lazy(() => import("react-icons/fa").then(module => ({ default: module.FaUser })));
const FaChalkboardTeacher = lazy(() => import("react-icons/fa").then(module => ({ default: module.FaChalkboardTeacher })));
const FaBook = lazy(() => import("react-icons/fa").then(module => ({ default: module.FaBook })));
const FaEdit = lazy(() => import("react-icons/fa").then(module => ({ default: module.FaEdit })));
const FaTrash = lazy(() => import("react-icons/fa").then(module => ({ default: module.FaTrash })));
const FaEye = lazy(() => import("react-icons/fa").then(module => ({ default: module.FaEye })));
const FaChild = lazy(() => import("react-icons/fa").then(module => ({ default: module.FaChild })));
const FaEllipsisVertical = lazy(() => import("react-icons/fa6").then(module => ({ default: module.FaEllipsisVertical })));
const MdPassword = lazy(() => import("react-icons/md").then(module => ({ default: module.MdPassword })));
const MdDriveFileRenameOutline = lazy(() => import("react-icons/md").then(module => ({ default: module.MdDriveFileRenameOutline })));
const FaPlus = lazy(() => import("react-icons/fa").then(module => ({ default: module.FaPlus })));
const FiPhone = lazy(() => import("react-icons/fi").then(module => ({ default: module.FiPhone })));

// Icon loading fallback component
const IconPlaceholder = ({ size = 'w-6 h-6' }) => (
  <div className={`${size} bg-gray-200 rounded-full animate-pulse`}></div>
);

const UserList = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    usertype: '',
    phone_number: '' // Add phone_number
  });
  const [editingUser, setEditingUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  
  const [activeTab, setActiveTab] = useState('Admin');
  const [formData, setFormData] = useState({
    username: '',
    fullname: '',
    email: '',
    phone_number: '', // Add phone_number
    usertype: 'Staff Admin',
    password: ''
  });

  const USER_ROLE_GROUPS = {
  Admin: ['Staff Admin', 'Class Admin','Admin'],
  User: ['Student', 'Teacher', 'Librarian', 'Food Admin', 'User'],
  };
  const defaultRole =
    activeTab === "Admin" ? "Staff Admin" : "Student";
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);

  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedStudentName, setSelectedStudentName] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/userList`, {
          method: 'GET',
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    return () => setIsMounted(false);
  }, []);

  const [classOptions, setClassOptions] = useState([]);  
  const [loadingClasses, setLoadingClasses] = useState(false);

  useEffect(() => {
        const fetchClasses = async () => {
          setLoadingClasses(true);
          try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/master/classes`, {
              method: 'GET',
              credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to fetch classes');
            const data = await response.json();
            setClassOptions(data);
          } catch (err) {
            showErrorToast(err.message);
          } finally {
            setLoadingClasses(false);
          }
        };

        fetchClasses();
    }, []);

  const showSuccessToast = (message) => {
    toast({
      title: 'Success',
      description: message,
      status: 'success',
      duration: 5000,
      isClosable: true,
      position: 'top'
    });
  };

  const showErrorToast = (message) => {
    toast({
      title: 'Error',
      description: message,
      status: 'error',
      duration: 5000,
      isClosable: true,
      position: 'top'
    });
  };

  const showLoadingToast = () => {
    return toast({
      title: 'Processing',
      description: 'Please wait...',
      status: 'info',
      duration: null,
      isClosable: false,
      position: 'top'
    });
  };

  

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const validateForm = (isEdit = false) => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
  
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    // Add phone number validation
  if (!formData.phone_number.trim()) {
    newErrors.phone_number = 'Phone number is required';
  } else if (!/^\d+$/.test(formData.phone_number)) {
    newErrors.phone_number = 'Invalid phone number format';
  } else if (formData.phone_number.length < 10) {
    newErrors.phone_number = 'Phone number must be at least 10 digits';
  }
    if (!isEdit && !formData.password) {
      newErrors.password = 'Password is required';
    } else if (!isEdit && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
  
    if (!formData.usertype) {
      newErrors.usertype = 'User type is required';
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    if (!isMounted) return;
    
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value || ''
    }));
  };

  

  

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    const toastId = showLoadingToast();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Delete failed');
      toast.close(toastId);
      setUsers(users.filter(user => user.id !== userId));
      showSuccessToast('User deleted successfully');
    } catch (err) {
      toast.close(toastId);
      showErrorToast(err.message);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user.id);
    setFormData({
      username: user.username || '',
      fullname: user.fullname || '',
      email: user.email || '',
      phone_number: user.phone_number || '', // Add phone_number
      usertype: user.usertype || 'Student',
      password: ''
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateForm(true)) return;
      
    const toastId = showLoadingToast();
    try {
      const updateData = { ...formData };
      if (!updateData.password) delete updateData.password;

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/users/${editingUser}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) throw new Error('Update failed');
      toast.close(toastId);
      setUsers(users.map(user => 
          user.id === editingUser ? { ...user, ...formData } : user
      ));
      setEditingUser(null);
      showSuccessToast('User updated successfully');
    } catch (err) {
      toast.close(toastId);
      showErrorToast(err.message);
    }
  };

  const handleView = (userId, userType, staffId) => {
    if (userType === 'Teacher' && !staffId) {
      const selectedUser = users.find(user => user.id === userId);
      setSelectedTeacherId(userId);
      // setTeacherFormData(prev => ({
      //   ...prev,
      //   fullName: selectedUser?.fullname || ''
      // }));
      setShowTeacherModal(true);
    } else if (userType === 'Student' && !staffId) {
        const selectedUser = users.find(user => user.id === userId);
      setSelectedStudentId(userId);
      setSelectedStudentName(selectedUser?.fullname || '')
        setFormData({
          fullName: selectedUser?.fullname || '',
          studentId: '',
          admissionNo: '',
          classId: ''
        });
        setShowStudentModal(true);
      }else {
      switch(userType) {
          case 'Student':
              navigate(`/studentview/${staffId}`);
              break;
          case 'Teacher':
              navigate(`/staffview/${staffId}`);
              break;
          case 'Staff Admin':
          case 'Class Admin':
              navigate(`/staff/${userId}`);
              break;
          default:
              break;
      }
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const toastId = showLoadingToast();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/users`, {
        method: 'POST',
        credentials:'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add user');
      }

      const newUser = await response.json();        
      toast.close(toastId);
      setUsers([...users, newUser]);
      setShowAddModal(false);
      setFormData({ username: '', fullname: '', email: '', usertype:
  activeTab === 'Admin'
    ? 'Staff Admin'
    : 'Student', password: '' });
      showSuccessToast(`${activeTab} added successfully`);
    } catch (err) {
      toast.close(toastId);
      showErrorToast(err.message);
    }
  };

  const openAddModal = () => {
    setShowAddModal(true);
    setFormData({
      username: '',
      fullname: '',
      email: '',
      phone_number: '', // Add phone_number
      usertype: activeTab === 'Teacher' ? 'Teacher' : activeTab,
      password: ''
    });
  };

  

  const TeacherProfileModal = () => {
    const inputRef = useRef(null);
    const [teacherFormData, setTeacherFormData] = useState({
    staffId: '',
    position: '',
    gender: 'Male',
    phone: '',
    profileImage: null,
      fullName: '',
    classId:''
  });
  const [teacherErrors, setTeacherErrors] = useState({
    staffId: '',
    position: '',
    phone: '',
    classId: ''
  });
    
    const validateTeacherForm = () => {
    const newErrors = {};
    if (!teacherFormData.staffId.trim()) {
      newErrors.staffId = 'Staff ID is required';
    }
    if (!teacherFormData.position.trim()) {
      newErrors.position = 'Position is required';
      }
      if (!teacherFormData.classId) {
        newErrors.classId = 'Class is required';
      }
    if (!teacherFormData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d+$/.test(teacherFormData.phone)) {
      newErrors.phone = 'Invalid phone number';
    }
    
    setTeacherErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleTeacherInputChange = (e) => {
    if (!isMounted) return;
    
    const { name, value } = e.target;
    setTeacherFormData(prev => ({
      ...prev,
      [name]: value || ''
    }));
    };
    const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setTeacherFormData(prev => ({
        ...prev,
        profileImage: file
      }));
    }
  };
    const handleCreateTeacherProfile = async (e) => {
    e.preventDefault();
    if (!validateTeacherForm()) return;
    setIsSubmitting(true);
    const toastId = showLoadingToast();
    try {
      const formData = new FormData();
      const selectedUser = users.find(user => user.id === selectedTeacherId);
      formData.append('userId', selectedTeacherId);
      formData.append('staffId', teacherFormData.staffId);
      formData.append('position', teacherFormData.position);
      formData.append('gender', teacherFormData.gender);
      formData.append('phone', teacherFormData.phone);
      formData.append('fullName', selectedUser?.fullname||'');
      formData.append('classId', teacherFormData.classId);     
  
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/staff/staff/${selectedTeacherId}`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create teacher profile');
      }
      const responseData = await response.json();
    
    // Expect backend to return the generated staffId
    if (!responseData.id) {
      throw new Error('Server failed to return a staff ID');
    }
      const staffId = responseData.id;
      const staff_id = staffId;
      if (teacherFormData.profileImage) {
        const imageFormData = new FormData();
        imageFormData.append('profileImage', teacherFormData.profileImage);
        const imageResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/Staff/Staff/${staffId}/image`, {
        method: 'PATCH',
        credentials: 'include',
        body: imageFormData
      });

      if (!imageResponse.ok) {
        throw new Error('Profile created but image upload failed');
      }
      }
      toast.close(toastId);
      setUsers(users.map(user => 
        user.id === selectedTeacherId ? { ...user, staff_id: staffId } : user
      ));
      
      setShowTeacherModal(false);
      setTeacherFormData({
        staffId: '',
        position: '',
        gender: 'Male',
        phone: '',
        profileImage: null,
        fullName: ''
      });
      showSuccessToast('Teacher profile created successfully');
      navigate(`/staffview/${staff_id}`);
    } catch (err) {
      toast.close(toastId);
      showErrorToast(err.message);
    } finally {
      setIsSubmitting(false);
    }
    };
    
    // This effect will focus the first input when modal opens
    // useEffect(() => {
    //   if (showTeacherModal && inputRef.current) {
    //     inputRef.current.focus();
    //   }
    // }, [showTeacherModal]);
  
    return (
    <dialog id="teacher_modal" className="modal" open={showTeacherModal}>
  <div className="modal-box w-11/12 max-w-3xl">
    <div className="flex justify-between items-center mb-4">
      <h3 className="font-bold text-xl">Create Teacher Profile</h3>
      <button 
        onClick={() => setShowTeacherModal(false)} 
        className="btn btn-sm btn-circle"
      >
        ✕
      </button>
    </div>

    <form onSubmit={handleCreateTeacherProfile} className="space-y-4">
      {/* Profile Image */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">Profile Image</span>
        </label>
        <div className="flex items-center gap-4">
          <div className="avatar">
            <div className="w-16 rounded-full bg-gray-200">
              {teacherFormData.profileImage ? (
                <img 
                  src={URL.createObjectURL(teacherFormData.profileImage)} 
                  alt="Preview" 
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <span>No Image</span>
                </div>
              )}
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileChange}
            className="file-input file-input-bordered file-input-primary w-full max-w-xs"
          />
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['staffId', 'position', 'phone'].map((field) => (
          <div key={field} className="form-control">
            <label className="label">
              <span className="label-text font-medium">
                {field === 'staffId' ? 'Staff ID' : 
                 field === 'position' ? 'Position' : 'Phone'} *
              </span>
            </label>
            <input
              ref={field === 'staffId' ? inputRef : null}
              type={field === 'phone' ? 'tel' : 'text'}
              name={field}
              value={teacherFormData[field] || ''}
              onChange={(e) => {
                handleTeacherInputChange(e);
                setTeacherErrors(prev => ({...prev, [field]: ''}));
              }}
              placeholder={
                field === 'staffId' ? 'Enter staff ID' : 
                field === 'position' ? 'Enter position' : 'Enter phone number'
              }
              className={`input input-bordered w-full ${
                teacherErrors[field] ? 'input-error' : ''
              }`}
            />
            {teacherErrors[field] && (
              <label className="label">
                <span className="label-text-alt text-error">
                  {teacherErrors[field]}
                </span>
              </label>
            )}
          </div>
        ))}

        {/* Gender */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Gender *</span>
          </label>
          <select
            name="gender"
            value={teacherFormData.gender || 'Male'}
            onChange={handleTeacherInputChange}
            className="select select-bordered w-full"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        {/* Class */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Class *</span>
          </label>
          <select
            name="classId"
            value={teacherFormData.classId || ''}
            onChange={handleTeacherInputChange}
            className={`select select-bordered w-full ${
              teacherErrors.classId ? 'input-error' : ''
            }`}
            disabled={loadingClasses}
          >
            <option value="">Select Class</option>
            {classOptions.map(cls => (
              <option key={cls.id} value={cls.id}>
                {cls.class_name}
              </option>
            ))}
          </select>
          {teacherErrors.classId && (
            <label className="label">
              <span className="label-text-alt text-error">
                {teacherErrors.classId}
              </span>
            </label>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="modal-action">
        <button
          type="button"
          onClick={() => setShowTeacherModal(false)}
          className="btn btn-ghost"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="loading loading-spinner"></span>
              Creating...
            </>
          ) : 'Create Profile'}
        </button>
      </div>
    </form>
  </div>
  
  {/* Click outside to close */}
  <form method="dialog" className="modal-backdrop">
    <button onClick={() => setShowTeacherModal(false)}>close</button>
  </form>
</dialog>
  );
};

  
  const StudentProfileModal = () => {
    const [selectedClass, setSelectedClass] = useState('');
    const [formData, setFormData] = useState({
      studentId: '',
      admissionNo: '',
      fullName: selectedStudentName || '',
      classId: '',
    profileImage: null
    });
    const [errors, setErrors] = useState({
      studentId: '',
      admissionNo: '',
      classId: ''
    });

    

    const validateForm = () => {
      const newErrors = {};
      if (!formData.studentId.trim()) {
        newErrors.studentId = 'Student ID is required';
      }
      if (!formData.admissionNo.trim()) {
        newErrors.admissionNo = 'Admission number is required';
      }
      if (!formData.classId) {
        newErrors.classId = 'Class is required';
      }
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
    const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        profileImage: file
      }));
    }
  };
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      // Clear error when typing
      setErrors(prev => ({...prev, [name]: ''}));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!validateForm()) return;

      const toastId = showLoadingToast();
      try {
        const studentFormData = new FormData();
        const selectedUser = users.find(user => user.id === selectedStudentId);
        studentFormData.append('userId', selectedStudentId);
        studentFormData.append('studentId', formData.studentId);
        studentFormData.append('classId', formData.classId);
        studentFormData.append('admissionNo', formData.admissionNo);
        studentFormData.append('fullName', formData.fullName); 
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/student/students/${selectedStudentId}`, {
          method: 'POST',
          credentials: 'include',
          body: studentFormData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create student profile');
        }

        const data = await response.json();
        if (!data.id) {
          throw new Error('Server failed to return a Student ID');
        }
        const studentId = data.id;
        const student_id = studentId;
        if (formData.profileImage) {
          const imageFormData = new FormData();
          imageFormData.append('StudentprofileImage', formData.profileImage);
          const imageResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/student/students/${studentId}/image`, {
          method: 'PATCH',
          credentials: 'include',
          body: imageFormData
        });

        if (!imageResponse.ok) {
          throw new Error('Profile created but image upload failed');
        }
        }
        toast.close(toastId);
        setUsers(users.map(user => 
          user.id === selectedStudentId ? { ...user, student_id: studentId } : user
        ));
        setShowStudentModal(false);
        setFormData({
          studentId: '',
          admissionNo: '',
          fullName: selectedStudentName || '',
          classId: '',
          profileImage: null
        })
        showSuccessToast('Student profile created successfully');
        navigate(`/studentview/${student_id}`);
      } catch (err) {
        toast.close(toastId);
        showErrorToast(err.message);
      }
    };

    return (
      <dialog id="student_modal" className="modal" open={showStudentModal}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">Create Student Profile</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Profile Image</span>
              </label>
              <div className="flex items-center gap-4">
                <div className="avatar">
                  <div className="w-16 rounded-full bg-gray-200">
                    {formData.profileImage ? (
                      <img 
                        src={URL.createObjectURL(formData.profileImage)} 
                        alt="Preview" 
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <span>No Image</span>
                      </div>
                    )}
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file-input file-input-bordered file-input-primary w-full max-w-xs"
                />
              </div>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Full Name</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                readOnly
                className="input input-bordered w-full"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Student ID *</span>
              </label>
              <input
                type="text"
                name="studentId"
                value={formData.studentId}
                onChange={handleInputChange}
                className={`input input-bordered w-full ${errors.studentId ? 'input-error' : ''}`}
              />
              {errors.studentId && (
                <span className="text-error text-sm">{errors.studentId}</span>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Admission No *</span>
              </label>
              <input
                type="text"
                name="admissionNo"
                value={formData.admissionNo}
                onChange={handleInputChange}
                className={`input input-bordered w-full ${errors.admissionNo ? 'input-error' : ''}`}
              />
              {errors.admissionNo && (
                <span className="text-error text-sm">{errors.admissionNo}</span>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Class *</span>
              </label>
              <select
                name="classId"
                value={formData.classId}
                onChange={handleInputChange}
                className={`select select-bordered w-full ${errors.classId ? 'input-error' : ''}`}
                disabled={loadingClasses}
              >
                <option value="">Select Class</option>
                {classOptions.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.class_name}
                  </option>
                ))}
              </select>
              {errors.classId && (
                <span className="text-error text-sm">{errors.classId}</span>
              )}
            </div>

            <div className="modal-action">
              <button
                type="button"
                onClick={() => setShowStudentModal(false)}
                className="btn"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Create Profile
              </button>
            </div>
          </form>
        </div>
      </dialog>
    );
  };
  const renderUserCard = (user) => {
    return (
      <div key={user.id} className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
        <div className="card-body">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="avatar placeholder">
                <div className="bg-neutral text-neutral-content rounded-full w-12">
                  <span className="text-xl">{user.fullname?.charAt(0) || 'U'}</span>
                </div>
              </div>
              <div>
                <h2 className="card-title">{user.fullname || 'No Name'}</h2>
                <p className="text-sm text-gray-500">@{user.username}</p>
              </div>
            </div>
            
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle btn-xs p-1">
                <Suspense fallback={<IconPlaceholder size="w-3.5 h-3.5" />}>
                  <FaEllipsisVertical className="w-3.5 h-3.5" />
                </Suspense>
              </div>
              <ul tabIndex={0} className="dropdown-content z-[1] menu shadow bg-base-100 rounded-box w-10 p-1 gap-1">
                <li>
                  <button 
                    onClick={() => handleEdit(user)}
                    className="btn btn-ghost btn-square btn-xs p-1 text-info hover:bg-info/20"
                    aria-label="Edit"
                  >
                    <Suspense fallback={<IconPlaceholder size="w-3.5 h-3.5" />}>
                      <FaEdit className="w-3.5 h-3.5" />
                    </Suspense>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleView(user.id, user.usertype, user.staff_id)}
                    className="btn btn-ghost btn-square btn-xs p-1 text-success hover:bg-success/20"
                    aria-label="View"
                  >
                    <Suspense fallback={<IconPlaceholder size="w-3.5 h-3.5" />}>
                      <FaEye className="w-3.5 h-3.5" />
                    </Suspense>
                  </button>
                </li>
                {user.usertype === 'Student' && (
  <li>
    <button 
      onClick={() => navigate(`/student-children/${user.id}`)}
      className="btn btn-ghost btn-square btn-xs p-1 text-warning hover:bg-warning/20"
      aria-label="Manage Children"
    >
      <Suspense fallback={<IconPlaceholder size="w-3.5 h-3.5" />}>
        <FaChild className="w-3.5 h-3.5" />
      </Suspense>
    </button>
  </li>
)}
                {/* {user.usertype === 'Student' && users?.map(student => {
  // Only show students that have a student_id (profile created)
  return student.usertype === 'Student' && student.staff_id ? (
    <li key={student.id}>
      <button 
        onClick={() => handleView(student.id, 'Student', student.staff_id)}
        className="btn btn-ghost btn-square btn-xs p-1 hover:bg-base-200 text-xs"
      >
        {student.fullname || student.username}
      </button>
    </li>
  ) : null;
})} */}
                <li>
                  <button 
                    onClick={() => handleDelete(user.id)}
                    className="btn btn-ghost btn-square btn-xs p-1 text-error hover:bg-error/20"
                    aria-label="Delete"
                  >
                    <Suspense fallback={<IconPlaceholder size="w-3.5 h-3.5" />}>
                      <FaTrash className="w-3.5 h-3.5" />
                    </Suspense>
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2">
              <Suspense fallback={<IconPlaceholder />}>
                <MdOutlineMail className="text-gray-500" />
              </Suspense>
              <span className="text-sm">{user.email}</span>
            </div>
              <div className="flex items-center gap-2">
            <Suspense fallback={<IconPlaceholder />}>
              <FiPhone className="text-gray-500" />
            </Suspense>
            <span className="text-sm">{user.phone_number || 'No phone'}</span>
          </div>
            <div className="flex items-center gap-2">
              <Suspense fallback={<IconPlaceholder />}>
                <FaUser className="text-gray-500" />
              </Suspense>
              <span className="text-sm capitalize">{user.usertype?.toLowerCase()}</span>
            </div>

            {user.usertype === 'Student' && (
              <>
                <div className="flex items-center gap-2">
                  <Suspense fallback={<IconPlaceholder />}>
                    <FaChild className="text-primary" />
                  </Suspense>
                  <span className="font-medium">Children:</span>
                  <span className="badge badge-primary badge-outline  p-2">
                    {user.staff_id || "Not assigned"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Suspense fallback={<IconPlaceholder />}>
                    <FaChalkboardTeacher className="text-secondary" />
                  </Suspense>
                  <span className="font-medium">Classes:</span>
                  <div className="flex flex-wrap gap-1">
                    {user.classes || "No classes assigned"}
                  </div>
                </div>
              </>
            )}

            {user.usertype === 'Teacher' && (
              <>
                <div className="flex items-center gap-2">
                  <Suspense fallback={<IconPlaceholder />}>
                    <FaBook className="text-primary" />
                  </Suspense>
                  <span className="font-medium">Subject:</span>
                  <span className="badge badge-primary badge-outline  p-2">
                    {user.subject || "Not assigned"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Suspense fallback={<IconPlaceholder />}>
                    <FaChalkboardTeacher className="text-secondary" />
                  </Suspense>
                  <span className="font-medium">Classes:</span>
                  <div className="flex flex-wrap gap-1">
                    {user.classes || "No classes assigned"}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderAddCard = () => (
    <div 
      onClick={openAddModal}
      className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow cursor-pointer border-2 border-dashed border-primary hover:border-primary-focus"
    >
      <div className="card-body flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-2 text-primary">
          <Suspense fallback={<IconPlaceholder />}>
            <FaPlus className="w-8 h-8" />
          </Suspense>
          <h2 className="card-title text-lg">Add {activeTab}</h2>
        </div>
      </div>
    </div>
  );

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button 
          onClick={openAddModal}
          className="btn btn-primary"
        >
          <Suspense fallback={<IconPlaceholder />}>
            <FaPlus className="mr-2" />
          </Suspense>
          Add User
        </button>
      </div>

      <div className="tabs tabs-boxed bg-base-100 mb-6">
        {Object.keys(USER_ROLE_GROUPS).map((group) => (
  <button
    key={group}
    className={`tab ${activeTab === group ? 'tab-active' : ''}`}
    onClick={() => setActiveTab(group)}
  >
    {group}
  </button>
))}

      </div>

      <Suspense fallback={<div className="text-center py-8">Loading icons...</div>}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {renderAddCard()}
          {users
            .filter(user =>
  USER_ROLE_GROUPS[activeTab]?.includes(user.usertype))
            .map(user => renderUserCard(user))}
        </div>
      </Suspense>

      {/* Add User Modal */}
      <dialog id="add_modal" className="modal" open={showAddModal}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">Add New {activeTab}</h3>
          <form onSubmit={handleAdd}>
            <div className="form-control">
              <label className="input input-bordered rounded flex items-center gap-2">
                <Suspense fallback={<IconPlaceholder />}>
                  <FaUser />
                </Suspense>
                <input
                  type="text"
                  name="username"
                  placeholder='Username'
                  value={formData.username || ''}
                  onChange={handleChange}
                  className={`input grow input-bordered w-full ${errors.username ? 'input-error' : ''}`}
                  required
                />
              </label>
              {errors.username && (
                <div className="label">
                  <span className="label-text-alt text-error flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {errors.username}
                  </span>
                </div>
              )}
            </div>

            <div className="form-control">
              <label className="input input-bordered rounded flex items-center gap-2 flex-1">
                <Suspense fallback={<IconPlaceholder />}>
                  <MdDriveFileRenameOutline />
                </Suspense>
                <input
                  type="text"
                  name="fullname"
                  placeholder='Full Name'
                  value={formData.fullname || ''}
                  onChange={handleChange}
                  className={`input grow input-bordered w-full ${errors.fullname ? 'input-error' : ''}`}
                  required
                />
              </label>
              {errors.fullname && (
                <div className="label">
                  <span className="label-text-alt text-error flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {errors.fullname}
                  </span>
                </div>
              )}
            </div>
              <div className="form-control">
        <label className="input input-bordered rounded flex items-center gap-2">
          <Suspense fallback={<IconPlaceholder />}>
            <FiPhone />
          </Suspense>
          <input
            type="tel"
            name="phone_number"
            placeholder='Phone Number'
            value={formData.phone_number || ''}
            onChange={handleChange}
            className={`input grow input-bordered w-full ${errors.phone_number ? 'input-error' : ''}`}
            required
          />
        </label>
        {errors.phone_number && (
          <div className="label">
            <span className="label-text-alt text-error flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {errors.phone_number}
            </span>
          </div>
        )}
      </div>
            <div className="form-control">
              <label className="input input-bordered rounded flex items-center gap-2">
                <Suspense fallback={<IconPlaceholder />}>
                  <MdOutlineMail />
                </Suspense>
                <input
                  type="email"
                  name="email"
                  placeholder='Email'
                  value={formData.email || ''}
                  onChange={handleChange}
                  className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`}
                  required
                />
              </label>
              {errors.email && (
                <div className="label">
                  <span className="label-text-alt text-error flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {errors.email}
                  </span>
                </div>
              )}
            </div>

            <div className="form-control">
              <label className="input input-bordered rounded flex items-center gap-2">
                <Suspense fallback={<IconPlaceholder />}>
                  <MdPassword />
                </Suspense>
                <input
                  type="password"
                  name="password"
                  placeholder='Password'
                  value={formData.password || ''}
                  onChange={handleChange}
                  className={`input input-bordered w-full ${errors.password ? 'input-error' : ''}`}
                  required
                />
              </label>
              {errors.password && (
                <div className="label">
                  <span className="label-text-alt text-error flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {errors.password}
                  </span>
                </div>
              )}
            </div>

            <div className="form-control">
              <label className="input input-bordered rounded flex items-center gap-2">
                <select
  name="usertype"
  value={formData.usertype}
  onChange={handleChange}
  className="select select-bordered w-full"
  required
>
  <option value="">Select Role</option>

  <optgroup label="Admin">
    {USER_ROLE_GROUPS.Admin.map((role) => (
      <option key={role} value={role}>
        {role}
      </option>
    ))}
  </optgroup>

  <optgroup label="User">
    {USER_ROLE_GROUPS.User.map((role) => (
      <option key={role} value={role}>
        {role}
      </option>
    ))}
  </optgroup>
</select>

              </label>
              {errors.usertype && (
                <div className="label">
                  <span className="label-text-alt text-error flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {errors.usertype}
                  </span>
                </div>
              )}
            </div>

            <div className="modal-action">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="btn"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Add {activeTab}
              </button>
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setShowAddModal(false)}>close</button>
        </form>
      </dialog>

      {/* Edit User Modal */}
      <dialog id="edit_modal" className="modal" open={!!editingUser}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">Edit User</h3>
          <form onSubmit={handleUpdate}>
            <div className="form-control">
              <label className="input input-bordered rounded flex items-center gap-2">
                <Suspense fallback={<IconPlaceholder />}>
                  <FaUser />
                </Suspense>
                <input
                  type="text"
                  name="username"
                  placeholder='Username'
                  value={formData.username || ''}
                  onChange={handleChange}
                  className="grow"
                  readOnly
                  disabled
                />
              </label>
            </div>

            <div className="form-control">
              <label className="input input-bordered rounded flex items-center gap-2 flex-1">
                <Suspense fallback={<IconPlaceholder />}>
                  <MdDriveFileRenameOutline />
                </Suspense>
                <input
                  type="text"
                  name="fullname"
                  placeholder='Full Name'
                  value={formData.fullname || ''}
                  onChange={handleChange}
                  className={`input grow input-bordered w-full ${errors.fullname ? 'input-error' : ''}`}
                  required
                />
              </label>
              {errors.fullname && (
                <div className="label">
                  <span className="label-text-alt text-error flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {errors.fullname}
                  </span>
                </div>
              )}
            </div>
              <div className="form-control">
        <label className="input input-bordered rounded flex items-center gap-2">
          <Suspense fallback={<IconPlaceholder />}>
            <FiPhone />
          </Suspense>
          <input
            type="tel"
            name="phone_number"
            placeholder='Phone Number'
            value={formData.phone_number || ''}
            onChange={handleChange}
            className={`input grow input-bordered w-full ${errors.phone_number ? 'input-error' : ''}`}
            required
          />
        </label>
        {errors.phone_number && (
          <div className="label">
            <span className="label-text-alt text-error flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {errors.phone_number}
            </span>
          </div>
        )}
      </div>
            <div className="form-control">
              <label className="input input-bordered rounded flex items-center gap-2">
                <Suspense fallback={<IconPlaceholder />}>
                  <MdOutlineMail />
                </Suspense>
                <input
                  type="email"
                  name="email"
                  placeholder='Email'
                  value={formData.email || ''}
                  onChange={handleChange}
                  className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`}
                  required
                />
              </label>
              {errors.email && (
                <div className="label">
                  <span className="label-text-alt text-error flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {errors.email}
                  </span>
                </div>
              )}
            </div>

            <div className="form-control">
              <label className="input input-bordered rounded flex items-center gap-2">
                <Suspense fallback={<IconPlaceholder />}>
                  <MdPassword />
                </Suspense>
                <input
                  type="password"
                  name="password"
                  placeholder='New Password (leave blank to keep current)'
                  value={formData.password || ''}
                  onChange={handleChange}
                  className={`input input-bordered w-full ${errors.password ? 'input-error' : ''}`}
                />
              </label>
              {errors.password && (
                <div className="label">
                  <span className="label-text-alt text-error flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {errors.password}
                  </span>
                </div>
              )}
            </div>

            <div className="form-control">
              <label className="input input-bordered rounded flex items-center gap-2">
                <select
  name="usertype"
  value={formData.usertype}
  onChange={handleChange}
  className="select select-bordered w-full"
  required
>
  <optgroup label="Admin">
    {USER_ROLE_GROUPS.Admin.map(role => (
      <option key={role} value={role}>{role}</option>
    ))}
  </optgroup>

  <optgroup label="User">
    {USER_ROLE_GROUPS.User.map(role => (
      <option key={role} value={role}>{role}</option>
    ))}
  </optgroup>
</select>

              </label>
              {errors.usertype && (
                <div className="label">
                  <span className="label-text-alt text-error flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {errors.usertype}
                  </span>
                </div>
              )}
            </div>

            <div className="modal-action">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="btn"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </dialog>

      <TeacherProfileModal
        show={showTeacherModal}
        setShow={setShowTeacherModal}
        classOptions={classOptions}
        loadingClasses={loadingClasses}
      />
      <StudentProfileModal
        show={showStudentModal}
        setShow={setShowStudentModal}
        classOptions={classOptions}
        loadingClasses={loadingClasses}/>
    </div>
  );
};

export default UserList;