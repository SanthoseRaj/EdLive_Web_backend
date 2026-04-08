import React, { useState, useEffect } from 'react';
import BookManagement from './library/BookManagement';
import MemberManagement from './library/MemberManagement';
import CheckoutManagement from './library/CheckoutManagement';
import FineManagement from './library/FineManagement';
import ReservationManagement from './library/ReservationManagement';
import DashboardStats from './library/DashboardStats';

const AdminLibrary = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalMembers: 0,
    activeCheckouts: 0,
    overdueBooks: 0,
    pendingReservations: 0,
    unpaidFines: 0
  });

  const [activeTab, setActiveTab] = useState('books');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // This would be a new endpoint that aggregates stats for admin dashboard
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/library/admin/stats`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    }
  };

  const tabs = [
    { id: 'books', label: 'Books', component: <BookManagement /> },
    { id: 'members', label: 'Members', component: <MemberManagement /> },
    { id: 'checkouts', label: 'Checkouts', component: <CheckoutManagement /> },
    { id: 'reservations', label: 'Reservations', component: <ReservationManagement /> },
    { id: 'fines', label: 'Fines', component: <FineManagement /> }
  ];

  return (
    <div>
      <DashboardStats stats={stats} />
      
      {/* Custom Tabs Implementation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 text-sm font-medium border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {tabs.find(tab => tab.id === activeTab)?.component}
      </div>
    </div>
  );
};

export default AdminLibrary;