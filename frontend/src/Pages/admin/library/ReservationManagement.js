import React, { useState, useEffect } from 'react';

const ReservationManagement = () => {
  const [reservations, setReservations] = useState([]);
  const [pendingReservations, setPendingReservations] = useState([]);
  const [showFulfillForm, setShowFulfillForm] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [fulfillData, setFulfillData] = useState({
    book_copy_id: '',
    checkout_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  const [bookCopies, setBookCopies] = useState([]);

  useEffect(() => {
    fetchReservations();
    fetchPendingReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      // This would need a new endpoint to get all reservations
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/library/reservations`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setReservations(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
    }
  };

  const fetchPendingReservations = async () => {
    try {
      // This would need a new endpoint to get pending reservations
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/library/reservations/pending`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setPendingReservations(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch pending reservations:', error);
    }
  };

  const fetchAvailableCopies = async (bookId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/library/books/${bookId}/copies/available`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setBookCopies(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch available copies:', error);
    }
  };

  const handleFulfill = async (reservation) => {
    setSelectedReservation(reservation);
    await fetchAvailableCopies(reservation.book_id);
    setShowFulfillForm(true);
  };

  const handleFulfillSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/library/reservations/${selectedReservation.id}/fulfill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...fulfillData,
          member_id: selectedReservation.member_id
        })
      });

      if (response.ok) {
        alert('Reservation fulfilled successfully!');
        setShowFulfillForm(false);
        setSelectedReservation(null);
        setFulfillData({
          book_copy_id: '',
          checkout_date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
        fetchReservations();
        fetchPendingReservations();
      } else {
        const errorData = await response.json();
        alert(`Failed to fulfill reservation: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Failed to fulfill reservation:', error);
    }
  };

  const handleCancel = async (reservationId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/library/reservations/${reservationId}/cancel`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        alert('Reservation cancelled successfully!');
        fetchReservations();
        fetchPendingReservations();
      } else {
        alert('Failed to cancel reservation');
      }
    } catch (error) {
      console.error('Failed to cancel reservation:', error);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Reservation Management</h2>

      {showFulfillForm && selectedReservation && (
        <form onSubmit={handleFulfillSubmit} className="mb-6 p-4 bg-gray-50 rounded">
          <h3 className="text-lg font-semibold mb-4">Fulfill Reservation: {selectedReservation.title}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={fulfillData.book_copy_id}
              onChange={(e) => setFulfillData({...fulfillData, book_copy_id: e.target.value})}
              required
              className="p-2 border rounded"
            >
              <option value="">Select Book Copy</option>
              {bookCopies.map(copy => (
                <option key={copy.id} value={copy.id}>
                  {copy.barcode} ({copy.condition})
                </option>
              ))}
            </select>
            
            <input
              type="date"
              value={fulfillData.checkout_date}
              onChange={(e) => setFulfillData({...fulfillData, checkout_date: e.target.value})}
              required
              className="p-2 border rounded"
            />
            
            <input
              type="date"
              value={fulfillData.due_date}
              onChange={(e) => setFulfillData({...fulfillData, due_date: e.target.value})}
              required
              className="p-2 border rounded"
            />
          </div>
          
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Fulfill Reservation
            </button>
            <button
              type="button"
              onClick={() => {
                setShowFulfillForm(false);
                setSelectedReservation(null);
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-yellow-600">Pending Reservations ({pendingReservations.length})</h3>
        {pendingReservations.length === 0 ? (
          <p className="text-gray-600">No pending reservations.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-yellow-100">
                  <th className="px-4 py-2">Book</th>
                  <th className="px-4 py-2">Member</th>
                  <th className="px-4 py-2">Reservation Date</th>
                  <th className="px-4 py-2">Expiry Date</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingReservations.map(reservation => (
                  <tr key={reservation.id} className="bg-yellow-50">
                    <td className="border px-4 py-2">{reservation.title}</td>
                    <td className="border px-4 py-2">{reservation.membership_number}</td>
                    <td className="border px-4 py-2">{new Date(reservation.reservation_date).toLocaleDateString()}</td>
                    <td className="border px-4 py-2">{new Date(reservation.expiry_date).toLocaleDateString()}</td>
                    <td className="border px-4 py-2">
                      <button
                        onClick={() => handleFulfill(reservation)}
                        className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 mr-2"
                      >
                        Fulfill
                      </button>
                      <button
                        onClick={() => handleCancel(reservation.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                      >
                        Cancel
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
        <h3 className="text-lg font-semibold mb-4">All Reservations</h3>
        {reservations.length === 0 ? (
          <p className="text-gray-600">No reservations recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2">Book</th>
                  <th className="px-4 py-2">Member</th>
                  <th className="px-4 py-2">Reservation Date</th>
                  <th className="px-4 py-2">Expiry Date</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map(reservation => (
                  <tr key={reservation.id}>
                    <td className="border px-4 py-2">{reservation.title}</td>
                    <td className="border px-4 py-2">{reservation.membership_number}</td>
                    <td className="border px-4 py-2">{new Date(reservation.reservation_date).toLocaleDateString()}</td>
                    <td className="border px-4 py-2">{new Date(reservation.expiry_date).toLocaleDateString()}</td>
                    <td className="border px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        reservation.status === 'Fulfilled' 
                          ? 'bg-green-100 text-green-800' 
                          : reservation.status === 'Cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {reservation.status}
                      </span>
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

export default ReservationManagement;