import React, { useState, useEffect } from 'react';

const FineManagement = () => {
  const [fines, setFines] = useState([]);
  const [unpaidFines, setUnpaidFines] = useState([]);
  const [showAddFineForm, setShowAddFineForm] = useState(false);
  const [newFine, setNewFine] = useState({
    checkout_id: '',
    member_id: '',
    amount: '',
    reason: 'Overdue'
  });
  const [checkouts, setCheckouts] = useState([]);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    fetchFines();
    fetchUnpaidFines();
    fetchCheckouts();
    fetchMembers();
  }, []);

  const fetchFines = async () => {
    try {
      // This would need a new endpoint to get all fines
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/library/fines`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setFines(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch fines:', error);
    }
  };

  const fetchUnpaidFines = async () => {
    try {
      // This would need a new endpoint to get unpaid fines
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/library/fines/unpaid`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setUnpaidFines(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch unpaid fines:', error);
    }
  };

  const fetchCheckouts = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/library/checkouts/active`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setCheckouts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch checkouts:', error);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/library/members`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setMembers(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch members:', error);
    }
  };

  const handleAddFine = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/library/fines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...newFine,
          amount: parseFloat(newFine.amount)
        })
      });

      if (response.ok) {
        const data = await response.json();
        setFines([...fines, data.data]);
        setNewFine({
          checkout_id: '',
          member_id: '',
          amount: '',
          reason: 'Overdue'
        });
        setShowAddFineForm(false);
        alert('Fine added successfully!');
        fetchUnpaidFines();
      } else {
        const errorData = await response.json();
        alert(`Failed to add fine: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Failed to add fine:', error);
    }
  };

  const handlePayFine = async (fineId) => {
    const paymentReference = prompt('Enter payment reference:');
    if (!paymentReference) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/library/fines/${fineId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ payment_reference: paymentReference })
      });

      if (response.ok) {
        alert('Fine paid successfully!');
        fetchFines();
        fetchUnpaidFines();
      } else {
        alert('Failed to pay fine');
      }
    } catch (error) {
      console.error('Failed to pay fine:', error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Fine Management</h2>
        <button
          onClick={() => setShowAddFineForm(!showAddFineForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {showAddFineForm ? 'Cancel' : 'Add Fine'}
        </button>
      </div>

      {showAddFineForm && (
        <form onSubmit={handleAddFine} className="mb-6 p-4 bg-gray-50 rounded">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={newFine.checkout_id}
              onChange={(e) => setNewFine({...newFine, checkout_id: e.target.value})}
              required
              className="p-2 border rounded"
            >
              <option value="">Select Checkout</option>
              {checkouts.map(checkout => (
                <option key={checkout.id} value={checkout.id}>
                  {checkout.title} - {checkout.membership_number}
                </option>
              ))}
            </select>
            
            <select
              value={newFine.member_id}
              onChange={(e) => setNewFine({...newFine, member_id: e.target.value})}
              required
              className="p-2 border rounded"
            >
              <option value="">Select Member</option>
              {members.map(member => (
                <option key={member.id} value={member.id}>
                  {member.membership_number} - {member.user_name}
                </option>
              ))}
            </select>
            
            <input
              type="number"
              step="0.01"
              placeholder="Amount *"
              value={newFine.amount}
              onChange={(e) => setNewFine({...newFine, amount: e.target.value})}
              required
              className="p-2 border rounded"
            />
            
            <select
              value={newFine.reason}
              onChange={(e) => setNewFine({...newFine, reason: e.target.value})}
              required
              className="p-2 border rounded"
            >
              <option value="Overdue">Overdue</option>
              <option value="Damaged">Damaged</option>
              <option value="Lost">Lost</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <button
            type="submit"
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add Fine
          </button>
        </form>
      )}

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-red-600">Unpaid Fines (${unpaidFines.reduce((sum, fine) => sum + parseFloat(fine.amount), 0).toFixed(2)})</h3>
        {unpaidFines.length === 0 ? (
          <p className="text-gray-600">No unpaid fines.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-red-100">
                  <th className="px-4 py-2">Member</th>
                  <th className="px-4 py-2">Book</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Reason</th>
                  <th className="px-4 py-2">Due Date</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {unpaidFines.map(fine => (
                  <tr key={fine.id} className="bg-red-50">
                    <td className="border px-4 py-2">{fine.membership_number}</td>
                    <td className="border px-4 py-2">{fine.title}</td>
                    <td className="border px-4 py-2 font-semibold">${parseFloat(fine.amount).toFixed(2)}</td>
                    <td className="border px-4 py-2">{fine.reason}</td>
                    <td className="border px-4 py-2">{fine.due_date ? new Date(fine.due_date).toLocaleDateString() : 'N/A'}</td>
                    <td className="border px-4 py-2">
                      <button
                        onClick={() => handlePayFine(fine.id)}
                        className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                      >
                        Mark Paid
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">All Fines</h3>
        {fines.length === 0 ? (
          <p className="text-gray-600">No fines recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2">Member</th>
                  <th className="px-4 py-2">Book</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Reason</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Payment Date</th>
                </tr>
              </thead>
              <tbody>
                {fines.map(fine => (
                  <tr key={fine.id}>
                    <td className="border px-4 py-2">{fine.membership_number}</td>
                    <td className="border px-4 py-2">{fine.title}</td>
                    <td className="border px-4 py-2">${parseFloat(fine.amount).toFixed(2)}</td>
                    <td className="border px-4 py-2">{fine.reason}</td>
                    <td className="border px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        fine.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {fine.status}
                      </span>
                    </td>
                    <td className="border px-4 py-2">
                      {fine.payment_date ? new Date(fine.payment_date).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FineManagement;