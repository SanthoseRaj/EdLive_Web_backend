import React, { useState, useEffect } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import BookSearch from './common/BookSearch';
import MyCheckouts from './common/MyCheckouts';
import MyReservations from './common/MyReservations';
import MyFines from './common/MyFines';

const StudentLibrary = () => {
  const [myStatus, setMyStatus] = useState(null);

  useEffect(() => {
    fetchMyStatus();
  }, []);

  const fetchMyStatus = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/library/members/status`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setMyStatus(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch library status:', error);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Checked Out</h3>
          <p className="text-2xl">{myStatus?.checkoutCount || 0}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Reservations</h3>
          <p className="text-2xl">{myStatus?.reservationCount || 0}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Fines Due</h3>
          <p className="text-2xl">${myStatus?.fineAmount || 0}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Max Books</h3>
          <p className="text-2xl">{myStatus?.member?.max_books || 5}</p>
        </div>
      </div>

      <Tabs>
        <TabList>
          <Tab>Browse Books</Tab>
          <Tab>My Checkouts</Tab>
          <Tab>My Reservations</Tab>
          <Tab>My Fines</Tab>
        </TabList>

        <TabPanel>
          <BookSearch />
        </TabPanel>
        
        <TabPanel>
          <MyCheckouts checkouts={myStatus?.checkouts} />
        </TabPanel>
        
        <TabPanel>
          <MyReservations reservations={myStatus?.reservations} />
        </TabPanel>
        
        <TabPanel>
          <MyFines fines={myStatus?.fines} />
        </TabPanel>
      </Tabs>
    </div>
  );
};

export default StudentLibrary;