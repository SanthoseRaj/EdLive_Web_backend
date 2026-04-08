import React from 'react';

const MyCheckouts = ({ checkouts = [] }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">My Checked Out Books</h2>
      {checkouts.length === 0 ? (
        <p>No books currently checked out.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="px-4 py-2">Title</th>
                <th className="px-4 py-2">Author</th>
                <th className="px-4 py-2">Checkout Date</th>
                <th className="px-4 py-2">Due Date</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {checkouts.map(checkout => (
                <tr key={checkout.id} className={isOverdue(checkout.due_date) ? 'bg-red-100' : ''}>
                  <td className="border px-4 py-2">{checkout.title}</td>
                  <td className="border px-4 py-2">{checkout.author}</td>
                  <td className="border px-4 py-2">{formatDate(checkout.checkout_date)}</td>
                  <td className="border px-4 py-2">{formatDate(checkout.due_date)}</td>
                  <td className="border px-4 py-2">
                    {isOverdue(checkout.due_date) ? 'OVERDUE' : 'Checked Out'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyCheckouts;