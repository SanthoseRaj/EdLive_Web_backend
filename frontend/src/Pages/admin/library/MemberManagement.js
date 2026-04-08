import React, { useState, useEffect } from 'react';

const MemberManagement = () => {
  const [members, setMembers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [newMember, setNewMember] = useState({
    user_id: '',
    user_type: 'Student',
    membership_number: '',
    membership_start: new Date().toISOString().split('T')[0],
    membership_end: '',
    max_books: 5
  });
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLoading, setUserLoading] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    if (showAddForm) {
      fetchUsersByType(newMember.user_type);
    }
  }, [newMember.user_type, showAddForm]);

  useEffect(() => {
    // Filter out users who are already members
    if (users.length > 0 && members.length > 0) {
      const filtered = users.filter(user => {
        // Check if this user is already a member
        const isAlreadyMember = members.some(member => 
          member.user_id === user.id && member.user_type === newMember.user_type
        );
        return !isAlreadyMember;
      });
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [users, members, newMember.user_type]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/library/members`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setMembers(Array.isArray(data.data) ? data.data : []);
        setError(null);
      } else {
        throw new Error('Failed to fetch members');
      }
    } catch (error) {
      console.error('Failed to fetch members:', error);
      setError('Failed to load members');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersByType = async (userType) => {
    try {
      setUserLoading(true);
      let apiUrl = '';
      
      switch (userType) {
        case 'Student':
          apiUrl = `${process.env.REACT_APP_API_URL}/api/staff/staff/students/list`;
          break;
        case 'Teacher':
          apiUrl = `${process.env.REACT_APP_API_URL}/api/users/userList`;
          break;
        case 'Staff Admin':
          apiUrl = `${process.env.REACT_APP_API_URL}/api/users/userList`;
          break;
        default:
          apiUrl = `${process.env.REACT_APP_API_URL}/api/users/userList`;
      }

      const response = await fetch(apiUrl, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        let fetchedUsers = [];
        
        if (userType === 'Student') {
          // For students API, data structure might be different
          fetchedUsers = Array.isArray(data) ? data : [];
        } else {
          // For userList API, filter by role
          fetchedUsers = Array.isArray(data) ? data.filter(user => {
            if (userType === 'Teacher') {
              return user.usertype?.toLowerCase().includes('teacher') || 
                     user.usertype?.toLowerCase().includes('faculty');
            } else if (userType === 'Staff Admin') {
              return user.usertype?.toLowerCase().includes('staff admin') || 
                     user.usertype?.toLowerCase().includes('admin');
            }
            return true;
          }) : [];
        }
        
        setUsers(fetchedUsers);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
    } finally {
      setUserLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      // Validate membership number format (example: LIB-2024-001)
      if (!newMember.membership_number.match(/^LIB-\d{4}-\d{3}$/)) {
        alert('Membership number must be in format: LIB-YYYY-NNN (e.g., LIB-2024-001)');
        return;
      }

      // Double-check that the user is not already a member
      const isAlreadyMember = members.some(member => 
        member.user_id === parseInt(newMember.user_id) && member.user_type === newMember.user_type
      );

      if (isAlreadyMember) {
        alert('This user is already a library member. Please select a different user.');
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/library/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newMember)
      });

      if (response.ok) {
        const data = await response.json();
        setMembers(prevMembers => [...prevMembers, data.data]);
        setNewMember({
          user_id: '',
          user_type: 'Student',
          membership_number: '',
          membership_start: new Date().toISOString().split('T')[0],
          membership_end: '',
          max_books: 5
        });
        setShowAddForm(false);
        alert('Member added successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to add member: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Failed to add member:', error);
      alert('Failed to add member. Please try again.');
    }
  };

  const handleViewMember = async (member) => {
    try {
      // Fetch member details with their current status (checkouts, reservations, fines)
      const statusResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/library/members/statusbyid?member_id=${member.id}`, {
        credentials: 'include'
      });
      
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        setSelectedMember({
          ...member,
          status: statusData.data
        });
        setShowViewModal(true);
      } else {
        setSelectedMember(member);
        setShowViewModal(true);
      }
    } catch (error) {
      console.error('Failed to fetch member details:', error);
      setSelectedMember(member);
      setShowViewModal(true);
    }
  };

  const handleDeactivateMember = async (member) => {
    if (!window.confirm(`Are you sure you want to deactivate ${member.user_name || 'this member'}?`)) {
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/library/members/${member.id}/deactivate`, {
        method: 'PUT',
        credentials: 'include'
      });

      if (response.ok) {
        alert('Member deactivated successfully!');
        fetchMembers(); // Refresh the list
      } else {
        const errorData = await response.json();
        alert(`Failed to deactivate member: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Failed to deactivate member:', error);
      alert('Failed to deactivate member. Please try again.');
    }
  };

  const closeModals = () => {
    setShowViewModal(false);
    setSelectedMember(null);
  };

  const generateMembershipNumber = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `LIB-${year}-${randomNum}`;
  };

  // Get already member users for display message
  const getAlreadyMemberUsers = () => {
    if (users.length === 0 || members.length === 0) return [];
    
    return users.filter(user => 
      members.some(member => 
        member.user_id === user.id && member.user_type === newMember.user_type
      )
    );
  };

  const alreadyMemberUsers = getAlreadyMemberUsers();

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Member Management</h2>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setNewMember(prev => ({
              ...prev,
              membership_number: generateMembershipNumber()
            }));
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {showAddForm ? 'Cancel' : 'Add New Member'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddMember} className="mb-6 p-4 bg-gray-50 rounded">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User Type *</label>
              <select
                value={newMember.user_type}
                onChange={(e) => setNewMember({...newMember, user_type: e.target.value, user_id: ''})}
                required
                className="w-full p-2 border rounded"
              >
                <option value="Student">Student</option>
                <option value="Teacher">Teacher</option>
                <option value="Staff Admin">Staff Admin</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User *</label>
              <select
                value={newMember.user_id}
                onChange={(e) => setNewMember({...newMember, user_id: e.target.value})}
                required
                disabled={userLoading}
                className="w-full p-2 border rounded"
              >
                <option value="">Select User</option>
                {filteredUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.full_name || user.fullname || user.student_name} 
                    {user.email ? ` (${user.email})` : ''}
                    {user.classes ? ` - ${user.classes}` : user.admission_no ? ` - ${user.admission_no}` : ''}
                  </option>
                ))}
              </select>
              {userLoading && <div className="text-sm text-gray-500 mt-1">Loading users...</div>}
              {filteredUsers.length === 0 && !userLoading && (
                <div className="text-sm text-yellow-600 mt-1">
                  {users.length === 0 
                    ? 'No users found for this type' 
                    : 'All users of this type are already library members'
                  }
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Membership Number *</label>
              <input
                type="text"
                value={newMember.membership_number}
                onChange={(e) => setNewMember({...newMember, membership_number: e.target.value})}
                required
                className="w-full p-2 border rounded"
                placeholder="LIB-YYYY-NNN"
              />
              <div className="text-xs text-gray-500 mt-1">Format: LIB-YYYY-NNN (e.g., LIB-2024-001)</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Membership Start *</label>
              <input
                type="date"
                value={newMember.membership_start}
                onChange={(e) => setNewMember({...newMember, membership_start: e.target.value})}
                required
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Membership End</label>
              <input
                type="date"
                value={newMember.membership_end}
                onChange={(e) => setNewMember({...newMember, membership_end: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Books</label>
              <input
                type="number"
                value={newMember.max_books}
                onChange={(e) => setNewMember({...newMember, max_books: parseInt(e.target.value) || 5})}
                min="1"
                max="20"
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          {/* Show already member users as information */}
          {alreadyMemberUsers.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded">
              <h4 className="font-semibold text-blue-800 mb-2">Already Library Members:</h4>
              <div className="text-sm text-blue-700">
                {alreadyMemberUsers.slice(0, 5).map(user => (
                  <div key={user.id}>
                    • {user.full_name || user.fullname || user.student_name}
                    {user.email ? ` (${user.email})` : ''}
                  </div>
                ))}
                {alreadyMemberUsers.length > 5 && (
                  <div>... and {alreadyMemberUsers.length - 5} more</div>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add Member
          </button>
        </form>
      )}

      {loading && <div className="text-center py-4">Loading members...</div>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-4 py-2">Member Name</th>
              <th className="px-4 py-2">User Type</th>
              <th className="px-4 py-2">Membership Number</th>
              <th className="px-4 py-2">Max Books</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 && !loading ? (
              <tr>
                <td colSpan="6" className="border px-4 py-4 text-center text-gray-500">
                  No members found
                </td>
              </tr>
            ) : (
              members.map(member => (
                <tr key={member.id}>
                  <td className="border px-4 py-2">
                    {member.user_name || `Member ${member.id}`}
                    {member.user_email && <div className="text-sm text-gray-500">{member.user_email}</div>}
                  </td>
                  <td className="border px-4 py-2 capitalize">{member.user_type}</td>
                  <td className="border px-4 py-2 font-mono">{member.membership_number}</td>
                  <td className="border px-4 py-2">{member.max_books}</td>
                  <td className="border px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      member.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {member.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="border px-4 py-2">
                    <button 
                      onClick={() => handleViewMember(member)}
                      className="text-blue-500 hover:text-blue-700 mr-2"
                    >
                      View
                    </button>
                    {member.is_active && (
                      <button 
                        onClick={() => handleDeactivateMember(member)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View Member Modal */}
      {showViewModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Member Details</h3>
                <button onClick={closeModals} className="text-gray-500 hover:text-gray-700">
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Basic Information</h4>
                  <p><strong>Name:</strong> {selectedMember.user_name || 'N/A'}</p>
                  <p><strong>Email:</strong> {selectedMember.user_email || 'N/A'}</p>
                  <p><strong>User Type:</strong> {selectedMember.user_type}</p>
                  <p><strong>Membership Number:</strong> {selectedMember.membership_number}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Membership Information</h4>
                  <p><strong>Start Date:</strong> {selectedMember.membership_start}</p>
                  <p><strong>End Date:</strong> {selectedMember.membership_end || 'No expiration'}</p>
                  <p><strong>Max Books:</strong> {selectedMember.max_books}</p>
                  <p><strong>Status:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      selectedMember.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedMember.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
              </div>

              {selectedMember.status && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Current Status</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="bg-blue-50 p-3 rounded">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedMember.status.checkoutCount || 0}
                      </div>
                      <div className="text-sm text-blue-800">Books Checked Out</div>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded">
                      <div className="text-2xl font-bold text-yellow-600">
                        {selectedMember.status.reservationCount || 0}
                      </div>
                      <div className="text-sm text-yellow-800">Reservations</div>
                    </div>
                    <div className="bg-red-50 p-3 rounded">
                      <div className="text-2xl font-bold text-red-600">
                        ${selectedMember.status.fineAmount || 0}
                      </div>
                      <div className="text-sm text-red-800">Unpaid Fines</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedMember.max_books - (selectedMember.status.checkoutCount || 0)}
                      </div>
                      <div className="text-sm text-green-800">Books Available</div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end mt-6">
                {selectedMember.is_active && (
                  <button
                    onClick={() => {
                      closeModals();
                      handleDeactivateMember(selectedMember);
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mr-2"
                  >
                    Deactivate Member
                  </button>
                )}
                <button
                  onClick={closeModals}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberManagement;