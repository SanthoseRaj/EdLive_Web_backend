import React from 'react';
import { Link } from 'react-router-dom';
import { FaTools, FaHome } from 'react-icons/fa';
import './UnderConstruction.css'; // Optional styling

const UnderConstruction = () => {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-center p-8 max-w-md">
          <svg className="w-20 h-20 mx-auto mb-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-2xl font-bold mb-4">Page Under Construction</h2>
          <p className="mb-6">We're working hard to bring you this feature soon. Please check back later!</p>
          <Link to="/" className="btn btn-primary">Return to Home</Link>
        </div>
      </div>
    );
  };

export default UnderConstruction;