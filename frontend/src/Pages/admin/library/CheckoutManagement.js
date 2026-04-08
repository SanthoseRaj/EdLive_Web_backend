import React, { useState, useEffect } from 'react';

const CheckoutManagement = () => {
  const [checkouts, setCheckouts] = useState([]);
  const [overdueBooks, setOverdueBooks] = useState([]);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [newCheckout, setNewCheckout] = useState({
    book_copy_id: '',
    member_id: '',
    checkout_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 14 days from now
  });
  const [bookCopies, setBookCopies] = useState([]);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    fetchCheckouts();
    fetchOverdueBooks();
    fetchBookCopies();
    fetchMembers();
  }, []);

  const fetchCheckouts = async () => {
    try {
      // This would need a new endpoint to get all active checkouts
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

  const fetchOverdueBooks = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/library/checkouts/overdue`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setOverdueBooks(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch overdue books:', error);
    }
  };

  const fetchBookCopies = async () => {
    try {
      // This would need a new endpoint to get available book copies
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/library/books/copies/available`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setBookCopies(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch book copies:', error);
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

  const handleCheckout = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/library/checkouts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newCheckout)
      });

      if (response.ok) {
        const data = await response.json();
        setCheckouts([...checkouts, data.data]);
        setNewCheckout({
          book_copy_id: '',
          member_id: '',
          checkout_date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
        setShowCheckoutForm(false);
        alert('Book checked out successfully!');
        fetchBookCopies(); // Refresh available copies
        fetchCheckouts();
        fetchOverdueBooks();
      } else {
        const errorData = await response.json();
        alert(`Failed to checkout: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Failed to checkout:', error);
    }
  };

  const handleReturn = async (checkoutId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/library/checkouts/${checkoutId}/return`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        alert('Book returned successfully!');
        fetchCheckouts();
        fetchBookCopies();        
        fetchOverdueBooks();
      } else {
        alert('Failed to return book');
      }
    } catch (error) {
      console.error('Failed to return book:', error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Checkout Management</h2>
        <button
          onClick={() => setShowCheckoutForm(!showCheckoutForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {showCheckoutForm ? 'Cancel' : 'New Checkout'}
        </button>
      </div>

      {showCheckoutForm && (
        <form onSubmit={handleCheckout} className="mb-6 p-4 bg-gray-50 rounded">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={newCheckout.book_copy_id}
              onChange={(e) => setNewCheckout({...newCheckout, book_copy_id: e.target.value})}
              required
              className="p-2 border rounded"
            >
              <option value="">Select Book Copy</option>
              {bookCopies.map(copy => (
                <option key={copy.id} value={copy.id}>
                  {copy.barcode} - {copy.book_title} ({copy.condition})
                </option>
              ))}
            </select>
            
            <select
              value={newCheckout.member_id}
              onChange={(e) => setNewCheckout({...newCheckout, member_id: e.target.value})}
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
              type="date"
              value={newCheckout.checkout_date}
              onChange={(e) => setNewCheckout({...newCheckout, checkout_date: e.target.value})}
              required
              className="p-2 border rounded"
            />
            
            <input
              type="date"
              value={newCheckout.due_date}
              onChange={(e) => setNewCheckout({...newCheckout, due_date: e.target.value})}
              required
              className="p-2 border rounded"
            />
          </div>
          <button
            type="submit"
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Process Checkout
          </button>
        </form>
      )}

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-red-600">Overdue Books ({overdueBooks.length})</h3>
        {overdueBooks.length === 0 ? (
          <p className="text-gray-600">No overdue books.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-red-100">
                  <th className="px-4 py-2">Book</th>
                  <th className="px-4 py-2">Member</th>
                  <th className="px-4 py-2">Due Date</th>
                  <th className="px-4 py-2">Days Overdue</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {overdueBooks.map(checkout => {
                  const daysOverdue = Math.floor((new Date() - new Date(checkout.due_date)) / (1000 * 60 * 60 * 24));
                  return (
                    <tr key={checkout.id} className="bg-red-50">
                      <td className="border px-4 py-2">{checkout.title}</td>
                      <td className="border px-4 py-2">{checkout.membership_number}</td>
                      <td className="border px-4 py-2">{new Date(checkout.due_date).toLocaleDateString()}</td>
                      <td className="border px-4 py-2 text-red-600 font-semibold">{daysOverdue}</td>
                      <td className="border px-4 py-2">
                        <button
                          onClick={() => handleReturn(checkout.id)}
                          className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                        >
                          Return
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Active Checkouts ({checkouts.length})</h3>
        {checkouts.length === 0 ? (
          <p className="text-gray-600">No active checkouts.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2">Book</th>
                  <th className="px-4 py-2">Member</th>
                  <th className="px-4 py-2">Checkout Date</th>
                  <th className="px-4 py-2">Due Date</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {checkouts.map(checkout => (
                  <tr key={checkout.id}>
                    <td className="border px-4 py-2">{checkout.title}</td>
                    <td className="border px-4 py-2">{checkout.membership_number}</td>
                    <td className="border px-4 py-2">{new Date(checkout.checkout_date).toLocaleDateString()}</td>
                    <td className="border px-4 py-2">{new Date(checkout.due_date).toLocaleDateString()}</td>
                    <td className="border px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        checkout.status === 'Checked Out' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {checkout.status}
                      </span>
                    </td>
                    <td className="border px-4 py-2">
                      <button
                        onClick={() => handleReturn(checkout.id)}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                      >
                        Return
                      </button>
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

export default CheckoutManagement;