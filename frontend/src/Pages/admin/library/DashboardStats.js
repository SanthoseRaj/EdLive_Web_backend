import React from 'react';

const DashboardStats = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Books',
      value: stats.totalBooks,
      color: 'bg-blue-500',
      icon: '📚'
    },
    {
      title: 'Total Members',
      value: stats.totalMembers,
      color: 'bg-green-500',
      icon: '👥'
    },
    {
      title: 'Active Checkouts',
      value: stats.activeCheckouts,
      color: 'bg-yellow-500',
      icon: '📖'
    },
    {
      title: 'Overdue Books',
      value: stats.overdueBooks,
      color: 'bg-red-500',
      icon: '⏰'
    },
    {
      title: 'Pending Reservations',
      value: stats.pendingReservations,
      color: 'bg-purple-500',
      icon: '⏳'
    },
    {
      title: 'Unpaid Fines',
      value: `$${stats.unpaidFines}`,
      color: 'bg-orange-500',
      icon: '💰'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {statCards.map((stat, index) => (
        <div key={index} className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
            <div className={`${stat.color} p-3 rounded-full text-white text-xl`}>
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;