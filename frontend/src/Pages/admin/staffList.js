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
const FaEllipsisVertical = lazy(() => import("react-icons/fa6").then(module => ({ default: module.FaEllipsisVertical })));
const FiPhone = lazy(() => import("react-icons/fi").then(module => ({ default: module.FiPhone })));
const FaUserTie = lazy(() => import("react-icons/fa").then(module => ({ default: module.FaUserTie })));
const FaUserGraduate = lazy(() => import("react-icons/fa").then(module => ({ default: module.FaUserGraduate })));
const FaUserCog = lazy(() => import("react-icons/fa").then(module => ({ default: module.FaUserCog })));
const FaPlus = lazy(() => import("react-icons/fa").then(module => ({ default: module.FaPlus })));

// Icon loading fallback component
const IconPlaceholder = ({ size = 'w-6 h-6' }) => (
  <div className={`${size} bg-gray-200 rounded-full animate-pulse`}></div>
);

const StaffList = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Teaching');
  const [isMounted, setIsMounted] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const STAFF_TYPES = ['Teaching', 'Non-teaching', 'Principal'];

  // Form state for new staff
  const [staffFormData, setStaffFormData] = useState({
    userId: '',
    staffId: '',
    position: '',
    staffRole: 'Teaching', // New field for staff role
    gender: 'Male',
    phone: '',
    classId: '',
    profileImage: null
  });

  const [staffFormErrors, setStaffFormErrors] = useState({
    userId: '',
    staffId: '',
    position: '',
    staffRole: '', // New error field for staff role
    phone: '',
    classId: ''
  });

  useEffect(() => {
    setIsMounted(true);
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch staff data
        const staffResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/staff/staff`, {
          method: 'GET',
          credentials: 'include'
        });
        if (!staffResponse.ok) throw new Error('Failed to fetch staff');
        const staffData = await staffResponse.json();
        setStaff(staffData);

        // Fetch users data
        const usersResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/users/userList`, {
          method: 'GET',
          credentials: 'include'
        });
        if (!usersResponse.ok) throw new Error('Failed to fetch users');
        const usersData = await usersResponse.json();
        setUsers(usersData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  const handleDelete = async (staffId) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) return;
    const toastId = showLoadingToast();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/staff/staff/${staffId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Delete failed');
      toast.close(toastId);
      setStaff(staff.filter(member => member.id !== staffId));
      showSuccessToast('Staff member deleted successfully');
    } catch (err) {
      toast.close(toastId);
      showErrorToast(err.message);
    }
  };

  const handleCardClick = (staffId) => {
    navigate(`/staffview/${staffId}`);
  };

  const getStaffTypeIcon = (type) => {
    switch (type) {
      case 'Teaching':
        return <FaChalkboardTeacher className="text-blue-500" />;
      case 'Non-teaching':
        return <FaUserCog className="text-green-500" />;
      case 'Principal':
        return <FaUserTie className="text-purple-500" />;
      default:
        return <FaUser className="text-gray-500" />;
    }
  };

  const filterStaffByType = (staffList, type) => {
    switch (type) {
      case 'Teaching':
        return staffList.filter(member => 
          member.position && !member.position.toLowerCase().includes('principal') && 
          !member.position.toLowerCase().includes('admin') &&
          !member.position.toLowerCase().includes('clerk') &&
          !member.position.toLowerCase().includes('accountant')
        );
      case 'Non-teaching':
        return staffList.filter(member => 
          member.position && (
            member.position.toLowerCase().includes('admin') ||
            member.position.toLowerCase().includes('clerk') ||
            member.position.toLowerCase().includes('accountant') ||
            member.position.toLowerCase().includes('librarian') ||
            member.position.toLowerCase().includes('assistant')
          )
        );
      case 'Principal':
        return staffList.filter(member => 
          member.position && member.position.toLowerCase().includes('principal')
        );
      default:
        return staffList;
    }
  };

  // Form validation
  const validateStaffForm = () => {
    const newErrors = {};
    
    if (!staffFormData.userId) {
      newErrors.userId = 'Please select a user';
    }

    if (!staffFormData.staffId.trim()) {
      newErrors.staffId = 'Staff ID is required';
    }

    if (!staffFormData.position.trim()) {
      newErrors.position = 'Position is required';
    }

    if (!staffFormData.staffRole) {
      newErrors.staffRole = 'Staff role is required';
    }

    if (!staffFormData.phone.trim()) {
      newErrors.phone = 'Staff phone is required';
    } else if (!/^\d+$/.test(staffFormData.phone)) {
      newErrors.phone = 'Invalid staff phone number';
    }

    if (!staffFormData.classId) {
      newErrors.classId = 'Class is required';
    }

    setStaffFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStaffFormChange = (e) => {
    if (!isMounted) return;
    
    const { name, value } = e.target;
    setStaffFormData(prev => ({
      ...prev,
      [name]: value || ''
    }));

    // Clear error when user starts typing
    if (staffFormErrors[name]) {
      setStaffFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setStaffFormData(prev => ({
        ...prev,
        profileImage: file
      }));
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!validateStaffForm()) return;
    
    setIsSubmitting(true);
    const toastId = showLoadingToast();
    try {
      const selectedUser = users.find(user => user.id === staffFormData.userId);
      if (!selectedUser) {
        throw new Error('Selected user not found');
      }

      // Create staff profile using the selected user
      const staffFormDataObj = new FormData();
      staffFormDataObj.append('userId', staffFormData.userId);
      staffFormDataObj.append('staffId', staffFormData.staffId);
      staffFormDataObj.append('position', staffFormData.position);
      staffFormDataObj.append('staffRole', staffFormData.staffRole); // Add staff role
      staffFormDataObj.append('gender', staffFormData.gender);
      staffFormDataObj.append('phone', staffFormData.phone);
      staffFormDataObj.append('fullName', selectedUser.fullname || '');
      staffFormDataObj.append('classId', staffFormData.classId);

      const staffResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/staff/staff/${staffFormData.userId}`, {
        method: 'POST',
        credentials: 'include',
        body: staffFormDataObj
      });

      if (!staffResponse.ok) {
        const errorData = await staffResponse.json();
        throw new Error(errorData.message || 'Failed to create staff profile');
      }

      const staffData = await staffResponse.json();
      const staffId = staffData.id;

      // Upload profile image if available
      if (staffFormData.profileImage) {
        const imageFormData = new FormData();
        imageFormData.append('profileImage', staffFormData.profileImage);
        const imageResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/staff/staff/${staffId}/image`, {
          method: 'PATCH',
          credentials: 'include',
          body: imageFormData
        });

        if (!imageResponse.ok) {
          throw new Error('Staff created but image upload failed');
        }
      }

      toast.close(toastId);
      setShowAddModal(false);
      setStaffFormData({
        userId: '',
        staffId: '',
        position: '',
        staffRole: 'Teaching',
        gender: 'Male',
        phone: '',
        classId: '',
        profileImage: null
      });
      
      showSuccessToast('Staff member created successfully');
      // Redirect to staff view page
      navigate(`/staffview/${staffId}`);
    } catch (err) {
      toast.close(toastId);
      showErrorToast(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAddModal = () => {
    setShowAddModal(true);
    setStaffFormData({
      userId: '',
      staffId: '',
      position: '',
      staffRole: 'Teaching',
      gender: 'Male',
      phone: '',
      classId: '',
      profileImage: null
    });
  };

  // Filter users to show only teacher usertype and skip already assigned users
  const availableUsers = users.filter(user => {
    // Check if user has usertype 'teacher' (case insensitive)
    const isTeacher = user.usertype && user.usertype.toLowerCase() === 'teacher';
    
    // Check if user already has a staff profile
    const hasStaffProfile = staff.some(staffMember => staffMember.userId === user.id);
    
    return isTeacher && !hasStaffProfile;
  });

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
          <h2 className="card-title text-lg">Add New Staff</h2>
        </div>
      </div>
    </div>
  );

  const renderStaffCard = (staffMember) => {
    return (
      <div 
        key={staffMember.id} 
        className="card bg-base-100 shadow-md hover:shadow-lg cursor-pointer transform hover:scale-[1.02] transition-transform duration-200"
        onClick={() => handleCardClick(staffMember.id)}
      >
        <div className="card-body">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="avatar placeholder">
                <div className="bg-neutral text-neutral-content rounded-full w-12">
                  {staffMember.profileImage ? (
                    <img 
                      src={`${process.env.REACT_APP_API_URL}${staffMember.profileImage}`} 
                      alt={staffMember.full_name}
                      className="rounded-full"
                    />
                  ) : (
                    <span className="text-xl">{staffMember.full_name?.charAt(0) || 'S'}</span>
                  )}
                </div>
              </div>
              <div>
                <h2 className="card-title">{staffMember.full_name  || 'No Name'}</h2>
                <p className="text-sm text-gray-500">{staffMember.staffId}</p>
              </div>
            </div>
            
            <div className="dropdown dropdown-end" onClick={(e) => e.stopPropagation()}>
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle btn-xs p-1">
                <Suspense fallback={<IconPlaceholder size="w-3.5 h-3.5" />}>
                  <FaEllipsisVertical className="w-3.5 h-3.5" />
                </Suspense>
              </div>
              <ul tabIndex={0} className="dropdown-content z-[1] menu shadow bg-base-100 rounded-box w-10 p-1 gap-1">
                <li>
                  <button 
                    onClick={() => handleCardClick(staffMember.id)}
                    className="btn btn-ghost btn-square btn-xs p-1 text-success hover:bg-success/20"
                    aria-label="View"
                  >
                    <Suspense fallback={<IconPlaceholder size="w-3.5 h-3.5" />}>
                      <FaEye className="w-3.5 h-3.5" />
                    </Suspense>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleDelete(staffMember.id)}
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
              <span className="text-sm">{staffMember.email || 'No email'}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Suspense fallback={<IconPlaceholder />}>
                <FiPhone className="text-gray-500" />
              </Suspense>
              <span className="text-sm">{staffMember.phone || 'No phone'}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Suspense fallback={<IconPlaceholder />}>
                {getStaffTypeIcon(activeTab)}
              </Suspense>
              <span className="text-sm capitalize">{staffMember.position || 'No position'}</span>
            </div>

            {staffMember.gender && (
              <div className="flex items-center gap-2">
                <Suspense fallback={<IconPlaceholder />}>
                  <FaUser className="text-gray-500" />
                </Suspense>
                <span className="text-sm capitalize">{staffMember.gender}</span>
              </div>
            )}

            {staffMember.classId && (
              <div className="flex items-center gap-2">
                <Suspense fallback={<IconPlaceholder />}>
                  <FaBook className="text-primary" />
                </Suspense>
                <span className="font-medium">Class:</span>
                <span className="badge badge-primary badge-outline  p-2">
                  {classOptions.find(cls => cls.id === staffMember.classId)?.class_name || 'Unknown'}
                </span>
              </div>
            )}

            {staffMember.subjects && staffMember.subjects.length > 0 && (
              <div className="flex items-center gap-2">
                <Suspense fallback={<IconPlaceholder />}>
                  <FaChalkboardTeacher className="text-secondary" />
                </Suspense>
                <span className="font-medium">Subjects:</span>
                <div className="flex flex-wrap gap-1">
                  {staffMember.subjects.map((subject, index) => (
                    <span key={index} className="badge badge-secondary badge-outline text-xs  p-2">
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="flex justify-center items-center py-12">
      <span className="loading loading-spinner loading-lg text-primary"></span>
      <span className="ml-4 text-lg">Loading staff...</span>
    </div>
  );
  
  if (error) return (
    <div className="alert alert-error max-w-2xl mx-auto mt-8">
      <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>Error: {error}</span>
    </div>
  );

  const filteredStaff = filterStaffByType(staff, activeTab);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Staff Management</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            Total {activeTab} Staff: {filteredStaff.length}
          </div>
          <button 
            onClick={openAddModal}
            className="btn btn-primary"
          >
            <Suspense fallback={<IconPlaceholder />}>
              <FaPlus className="mr-2" />
            </Suspense>
            Add New Staff
          </button>
        </div>
      </div>

      {/* Staff Type Tabs */}
      <div className="tabs tabs-boxed bg-base-100 mb-6">
        {STAFF_TYPES.map((type) => (
          <button
            key={type}
            className={`tab ${activeTab === type ? 'tab-active' : ''}`}
            onClick={() => setActiveTab(type)}
          >
            <Suspense fallback={<IconPlaceholder size="w-4 h-4" />}>
              {type === 'Teaching' && <FaChalkboardTeacher className="w-4 h-4 mr-2" />}
              {type === 'Non-teaching' && <FaUserCog className="w-4 h-4 mr-2" />}
              {type === 'Principal' && <FaUserTie className="w-4 h-4 mr-2" />}
            </Suspense>
            {type} Staff
          </button>
        ))}
      </div>

      {/* Staff Grid */}
      <Suspense fallback={<div className="text-center py-8">Loading staff data...</div>}>
        {filteredStaff.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex flex-col items-center gap-4">
              <Suspense fallback={<IconPlaceholder size="w-16 h-16" />}>
                {activeTab === 'Teaching' && <FaChalkboardTeacher className="w-16 h-16 text-gray-400" />}
                {activeTab === 'Non-teaching' && <FaUserCog className="w-16 h-16 text-gray-400" />}
                {activeTab === 'Principal' && <FaUserTie className="w-16 h-16 text-gray-400" />}
              </Suspense>
              <h3 className="text-xl font-semibold text-gray-500">No {activeTab.toLowerCase()} staff found</h3>
              <p className="text-gray-400">There are no {activeTab.toLowerCase()} staff members in the system.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {renderAddCard()}
            {filteredStaff.map(staffMember => renderStaffCard(staffMember))}
          </div>
        )}
      </Suspense>

      {/* Add Staff Modal */}
      <dialog id="add_staff_modal" className="modal" open={showAddModal}>
        <div className="modal-box w-11/12 max-w-3xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-xl">Create New Staff Member</h3>
            <button 
              onClick={() => setShowAddModal(false)} 
              className="btn btn-sm btn-circle"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleCreateStaff} className="space-y-4">
            {/* Profile Image */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Profile Image</span>
              </label>
              <div className="flex items-center gap-4">
                <div className="avatar">
                  <div className="w-16 rounded-full bg-gray-200">
                    {staffFormData.profileImage ? (
                      <img 
                        src={URL.createObjectURL(staffFormData.profileImage)} 
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

            {/* User Selection */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Select User (Teachers Only) *</span>
              </label>
              <select
                name="userId"
                value={staffFormData.userId || ''}
                onChange={handleStaffFormChange}
                className={`select select-bordered w-full ${
                  staffFormErrors.userId ? 'select-error' : ''
                }`}
                required
              >
                <option value="">Select a teacher user</option>
                {availableUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.fullname || user.username} ({user.email}) - {user.usertype}
                  </option>
                ))}
              </select>
              {staffFormErrors.userId && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {staffFormErrors.userId}
                  </span>
                </label>
              )}
              {availableUsers.length === 0 && (
                <label className="label">
                  <span className="label-text-alt text-warning">
                    No available teacher users found. All teacher users already have staff profiles or no teacher users exist.
                  </span>
                </label>
              )}
            </div>

            {/* Staff Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Staff ID */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Staff ID *</span>
                </label>
                <input
                  type="text"
                  name="staffId"
                  value={staffFormData.staffId || ''}
                  onChange={handleStaffFormChange}
                  placeholder="Enter staff ID"
                  className={`input input-bordered w-full ${
                    staffFormErrors.staffId ? 'input-error' : ''
                  }`}
                />
                {staffFormErrors.staffId && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {staffFormErrors.staffId}
                    </span>
                  </label>
                )}
              </div>

              {/* Position */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Position *</span>
                </label>
                <input
                  type="text"
                  name="position"
                  value={staffFormData.position || ''}
                  onChange={handleStaffFormChange}
                  placeholder="Enter position"
                  className={`input input-bordered w-full ${
                    staffFormErrors.position ? 'input-error' : ''
                  }`}
                />
                {staffFormErrors.position && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {staffFormErrors.position}
                    </span>
                  </label>
                )}
              </div>

              {/* Staff Role */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Staff Role *</span>
                </label>
                <select
                  name="staffRole"
                  value={staffFormData.staffRole || 'Teaching'}
                  onChange={handleStaffFormChange}
                  className={`select select-bordered w-full ${
                    staffFormErrors.staffRole ? 'select-error' : ''
                  }`}
                >
                  <option value="Teaching">Teaching</option>
                  <option value="Non-teaching">Non-teaching</option>
                  <option value="Principal">Principal</option>
                </select>
                {staffFormErrors.staffRole && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {staffFormErrors.staffRole}
                    </span>
                  </label>
                )}
              </div>

              {/* Staff Phone */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Staff Phone *</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={staffFormData.phone || ''}
                  onChange={handleStaffFormChange}
                  placeholder="Enter staff phone"
                  className={`input input-bordered w-full ${
                    staffFormErrors.phone ? 'input-error' : ''
                  }`}
                />
                {staffFormErrors.phone && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {staffFormErrors.phone}
                    </span>
                  </label>
                )}
              </div>

              {/* Gender */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Gender *</span>
                </label>
                <select
                  name="gender"
                  value={staffFormData.gender || 'Male'}
                  onChange={handleStaffFormChange}
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
                  value={staffFormData.classId || ''}
                  onChange={handleStaffFormChange}
                  className={`select select-bordered w-full ${
                    staffFormErrors.classId ? 'select-error' : ''
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
                {staffFormErrors.classId && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {staffFormErrors.classId}
                    </span>
                  </label>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="modal-action">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isSubmitting || availableUsers.length === 0}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Creating...
                  </>
                ) : 'Create Staff'}
              </button>
            </div>
          </form>
        </div>
        
        {/* Click outside to close */}
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setShowAddModal(false)}>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default StaffList;