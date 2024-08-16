import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from '../components/Header';
import EmployeeInfo from './EmployeeInfo';

const UserDashboard = ({ employeeData }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<EmployeeInfo employeeData={employeeData} />} />
          {/* Add more user routes here if needed */}
        </Routes>
      </main>
    </div>
  );
};

export default UserDashboard;