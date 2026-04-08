import React, { useState, useEffect } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import BookSearch from './common/BookSearch';
import StudentBooks from './teacher/StudentBooks';
import MyReservations from './common/MyReservations';
import MyCheckouts from './common/MyCheckouts';

const TeacherLibrary = () => {
  const [myStatus, setMyStatus] = useState(null);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchMyStatus();
    fetchMyStudents();
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

  const fetchMyStudents = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/teacher/students`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">My Checked Out Books</h3>
          <p className="text-2xl">{myStatus?.checkoutCount || 0}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">My Reservations</h3>
          <p className="text-2xl">{myStatus?.reservationCount || 0}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">My Students</h3>
          <p className="text-2xl">{students.length}</p>
        </div>
      </div>

      <Tabs>
        <TabList>
          <Tab>Browse Books</Tab>
          <Tab>Student Books</Tab>
          <Tab>My Checkouts</Tab>
          <Tab>My Reservations</Tab>
        </TabList>

        <TabPanel>
          <BookSearch />
        </TabPanel>
        
        <TabPanel>
          <StudentBooks students={students} />
        </TabPanel>
        
        <TabPanel>
          <MyCheckouts checkouts={myStatus?.checkouts} />
        </TabPanel>
        
        <TabPanel>
          <MyReservations reservations={myStatus?.reservations} />
        </TabPanel>
      </Tabs>
    </div>
  );
};

export default TeacherLibrary;