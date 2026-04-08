import { useEffect, useState } from 'react';
import { FaEdit, FaTrash, FaEye, FaPlus } from 'react-icons/fa';

const StaffManagement = () => {
    const [staffs, setStaffs] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [mode, setMode] = useState('add');
    const [formData, setFormData] = useState({});
    const [profileImage, setProfileImage] = useState(null);
    const [preview, setPreview] = useState('');

  useEffect(() => {
    fetchStaffs();
  }, []);

  const fetchStaffs = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/staff/staff`);
      if (!response.ok) throw new Error('Failed to fetch staff');
      const data = await response.json();
      setStaffs(data);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff?')) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/staff/staff/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Delete failed');
      fetchStaffs();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    
    if (profileImage) data.append('profileImage', profileImage);
    
    // Handle nested objects
    const staffData = {
      ...formData,
      personalInfo: JSON.stringify(formData.personalInfo || {}),
      education: JSON.stringify(formData.education || []),
      family: JSON.stringify(formData.family || []),
    };

    Object.entries(staffData).forEach(([key, value]) => {
      if (key !== '_id') data.append(key, value);
    });

    try {
      const url = mode === 'add' ? `${process.env.REACT_APP_API_URL}/api/staff/staff` : `${process.env.REACT_APP_API_URL}/api/staff/staff/${formData._id}`;
      const method = mode === 'add' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        body: data,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Operation failed');
      }

      fetchStaffs();
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // const openEditModal = (staff) => {
  //   setFormData(staff);
  //   setPreview(staff.profileImage ? `/${staff.profileImage}` : '');
  //   setMode('edit');
  //   setModalOpen(true);
  // };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Staff Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => { setMode('add'); setModalOpen(true); }}
        >
          <FaPlus className="mr-2" /> Add Staff
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>ID</th>
              <th>Position</th>
              <th>Contact</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staffs.map((staff) => (
              <tr key={staff._id}>
                <td>{staff.fullName}</td>
                <td>{staff.staffId}</td>
                <td>{staff.position}</td>
                <td>{staff.contact.phone}</td>
                <td>
                  <div className="flex gap-2">
                    <button 
                      className="btn btn-sm btn-info"
                      onClick={() => { setSelectedStaff(staff); setMode('view') }}
                    >
                      <FaEye />
                    </button>
                    <button 
                      className="btn btn-sm btn-warning"
                      onClick={() => { setSelectedStaff(staff); setMode('edit'); setModalOpen(true) }}
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="btn btn-sm btn-error"
                      onClick={() => handleDelete(staff._id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={`modal ${modalOpen ? 'modal-open' : ''}`}>
        <div className="modal-box max-w-3xl">
          <h3 className="text-lg font-bold mb-4">
            {mode === 'add' ? 'Add New Staff' : 'Edit Staff'}
          </h3>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Profile Image Upload */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Profile Image</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file-input file-input-bordered w-full"
                />
                {preview && (
                  <div className="mt-2">
                    <img 
                      src={preview} 
                      alt="Preview" 
                      className="w-32 h-32 rounded-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Personal Information */}
              <div className="space-y-2">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Full Name</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={formData.fullName || ''}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Email</span>
                  </label>
                  <input
                    type="email"
                    className="input input-bordered"
                    value={formData.contact?.email || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      contact: {...formData.contact, email: e.target.value}
                    })}
                    required
                  />
                </div>
              </div>

              {/* Add more fields following the same pattern */}
            </div>

            <div className="modal-action">
              <button type="button" className="btn" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {mode === 'add' ? 'Create' : 'Update'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Staff View Modal */}
      <div className={`modal ${viewModalOpen ? 'modal-open' : ''}`}>
        <div className="modal-box max-w-3xl">
          <div className="flex items-center gap-4 mb-6">
            {selectedStaff?.profileImage && (
              <img
                src={`http://localhost:5000/${selectedStaff.profileImage}`}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover"
              />
            )}
            <div>
              <h2 className="text-2xl font-bold">{selectedStaff?.fullName}</h2>
              <p className="text-gray-600">{selectedStaff?.position}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-bold mb-2">Contact Information</h3>
                <p>Email: {selectedStaff?.contact?.email}</p>
                <p>Phone: {selectedStaff?.contact?.phone}</p>
              </div>
              
              <div>
                <h3 className="font-bold mb-2">Personal Information</h3>
                <p>DOB: {new Date(selectedStaff?.personalInfo?.dob).toLocaleDateString()}</p>
                <p>Blood Group: {selectedStaff?.personalInfo?.bloodGroup}</p>
              </div>
            </div>

            {/* Add more sections for Education, Family, etc. */}
          </div>

          <div className="modal-action">
            <button className="btn" onClick={() => setViewModalOpen(false)}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Staff Modal Component and StaffViewModal would be implemented similarly
// with form fields matching the PDF structure and proper validations

export default StaffManagement;