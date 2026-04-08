import { useEffect, useState, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';

// Lazy load icons
const FaPlus = lazy(() => import("react-icons/fa").then(module => ({ default: module.FaPlus })));
const FaArrowLeft = lazy(() => import("react-icons/fa").then(module => ({ default: module.FaArrowLeft })));
const FaEye = lazy(() => import("react-icons/fa").then(module => ({ default: module.FaEye })));
const FaTrash = lazy(() => import("react-icons/fa").then(module => ({ default: module.FaTrash })));

const StudentChildren = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [parentUser, setParentUser] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [classOptions, setClassOptions] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

  const [childFormData, setChildFormData] = useState({
    fullname: '',
    studentId: '',
    admissionNo: '',
    classId: '',
    profileImage: null
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchParentAndChildren();
    fetchClasses();
  }, [userId]);

  const fetchParentAndChildren = async () => {
    try {
      // Fetch parent user details
      const parentResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/users/profileById/${userId}`, {
        credentials: 'include'
      });
      
      if (!parentResponse.ok) throw new Error('Failed to fetch parent');
      const parentData = await parentResponse.json();
      setParentUser(parentData);

      // Fetch children (students linked to this parent)
      const childrenResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/student/parents/${userId}/children`, {
        credentials: 'include'
      });
      
      if (childrenResponse.ok) {
        const childrenData = await childrenResponse.json();
        setChildren(childrenData);
      }
    } catch (error) {
      showErrorToast(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    setLoadingClasses(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/master/classes`, {
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

  const showSuccessToast = (message) => {
    toast({
      title: 'Success',
      description: message,
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };

  const showErrorToast = (message) => {
    toast({
      title: 'Error',
      description: message,
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!childFormData.fullname.trim()) newErrors.fullname = 'Full name is required';
    if (!childFormData.studentId.trim()) newErrors.studentId = 'Student ID is required';
    if (!childFormData.admissionNo.trim()) newErrors.admissionNo = 'Admission number is required';
    if (!childFormData.classId) newErrors.classId = 'Class is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddChild = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const formDataToSend = new FormData();
      
      formDataToSend.append('fullName', childFormData.fullname);
      formDataToSend.append('usertype', 'Student');
      formDataToSend.append('userId', userId); // Link to parent

      // Student profile data
      formDataToSend.append('studentId', childFormData.studentId);
      formDataToSend.append('admissionNo', childFormData.admissionNo);
      formDataToSend.append('classId', childFormData.classId);
      
      if (childFormData.profileImage) {
        formDataToSend.append('StudentprofileImage', childFormData.profileImage);
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/student/students/${userId}`, {
        method: 'POST',
        credentials: 'include',
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add child');
      }

      const newChild = await response.json();
      setChildren([...children, newChild]);
      setShowAddModal(false);
      setChildFormData({
         fullname: '',  studentId: '', admissionNo: '', classId: '', profileImage: null
      });
      showSuccessToast('Child added successfully');
    } catch (error) {
      showErrorToast(error.message);
    }
  };

  const handleViewChild = (childId) => {
    navigate(`/studentview/${childId}`);
  };

  const handleDeleteChild = async (childId) => {
    if (!window.confirm('Are you sure you want to remove this child?')) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/student/children/${childId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to delete child');
      
      setChildren(children.filter(child => child.id !== childId));
      showSuccessToast('Child removed successfully');
    } catch (error) {
      showErrorToast(error.message);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
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
          <h1 className="text-2xl font-bold">Manage Children</h1>
          <p className="text-gray-600">Parent: {parentUser?.fullname} (@{parentUser?.username})</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary ml-auto"
        >
          <Suspense fallback={<div className="w-4 h-4 bg-gray-200 rounded"></div>}>
            <FaPlus className="mr-2" />
          </Suspense>
          Add Child
        </button>
      </div>

      {/* Children List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {children.map(child => (
          <div key={child.id} className="card bg-base-100 shadow-md">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-3">
                <div className="avatar placeholder">
                  <div className="bg-neutral text-neutral-content rounded-full w-12">
                    <span>{child.full_name?.charAt(0) || 'C'}</span>
                  </div>
                </div>
                <div>
                  <h3 className="card-title text-lg">{child.full_name}</h3>
                  <p className="text-sm text-gray-500">@{child.username}</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <p><strong>Student ID:</strong> {child.student_id}</p>
                <p><strong>Admission No:</strong> {child.admission_no}</p>
                <p><strong>Class:</strong> {child.classname}</p>
              </div>

              <div className="card-actions justify-end mt-4">
                <button 
                  onClick={() => handleViewChild(child.id)}
                  className="btn btn-ghost btn-sm text-info"
                >
                  <Suspense fallback={<div className="w-4 h-4 bg-gray-200 rounded"></div>}>
                    <FaEye className="w-4 h-4" />
                  </Suspense>
                  View
                </button>
                <button 
                  onClick={() => handleDeleteChild(child.id)}
                  className="btn btn-ghost btn-sm text-error"
                >
                  <Suspense fallback={<div className="w-4 h-4 bg-gray-200 rounded"></div>}>
                    <FaTrash className="w-4 h-4" />
                  </Suspense>
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {children.length === 0 && (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">No children added yet.</p>
          </div>
        )}
      </div>

      {/* Add Child Modal */}
      <dialog id="add_child_modal" className="modal" open={showAddModal}>
        <div className="modal-box max-w-2xl">
          <h3 className="font-bold text-lg mb-4">Add New Child</h3>
          
          <form onSubmit={handleAddChild}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Info */}
              <div className="space-y-4">
                <h4 className="font-semibold">Account Information</h4>
                
                <div className="form-control">
                  <label className="label">Full Name *</label>
                  <input
                    type="text"
                    value={childFormData.fullname}
                    onChange={(e) => setChildFormData({...childFormData, fullname: e.target.value})}
                    className={`input input-bordered w-full ${errors.fullname ? 'input-error' : ''}`}
                  />
                  {errors.fullname && <span className="text-error text-sm">{errors.fullname}</span>}
                </div>

                <div className="form-control">
                  <label className="label">Admission No *</label>
                  <input
                    type="text"
                    value={childFormData.admissionNo}
                    onChange={(e) => setChildFormData({...childFormData, admissionNo: e.target.value})}
                    className={`input input-bordered w-full ${errors.admissionNo ? 'input-error' : ''}`}
                  />
                  {errors.admissionNo && <span className="text-error text-sm">{errors.admissionNo}</span>}
                </div>
                
              </div>

              {/* Student Info */}
              <div className="space-y-4">
                <h4 className="font-semibold">Student Information</h4>
                
                <div className="form-control">
                  <label className="label">Student ID *</label>
                  <input
                    type="text"
                    value={childFormData.studentId}
                    onChange={(e) => setChildFormData({...childFormData, studentId: e.target.value})}
                    className={`input input-bordered w-full ${errors.studentId ? 'input-error' : ''}`}
                  />
                  {errors.studentId && <span className="text-error text-sm">{errors.studentId}</span>}
                </div>

                <div className="form-control">
                  <label className="label">Class *</label>
                  <select
                    value={childFormData.classId}
                    onChange={(e) => setChildFormData({...childFormData, classId: e.target.value})}
                    className={`select select-bordered w-full ${errors.classId ? 'input-error' : ''}`}
                    disabled={loadingClasses}
                  >
                    <option value="">Select Class</option>
                    {classOptions.map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.class_name}</option>
                    ))}
                  </select>
                  {errors.classId && <span className="text-error text-sm">{errors.classId}</span>}
                </div>

                <div className="form-control">
                  <label className="label">Profile Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setChildFormData({...childFormData, profileImage: e.target.files[0]})}
                    className="file-input file-input-bordered w-full"
                  />
                </div>
              </div>
            </div>

            <div className="modal-action">
              <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-ghost">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Add Child
              </button>
            </div>
          </form>
        </div>
        
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setShowAddModal(false)}>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default StudentChildren;