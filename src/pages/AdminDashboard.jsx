import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Users, UserPlus, Home } from 'lucide-react';
import Header from '../components/Header';
import AdminWelcome from './AdminWelcome';
import UserManagement from './UserManagement';
import EmployeeManagement from './EmployeeManagement';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="bg-gray-800 text-white w-64 flex-shrink-0">
        <div className="p-4">
          <h2 className="text-2xl font-semibold">Admin Dashboard</h2>
        </div>
        <nav className="mt-6">
          <Link to="/admin-dashboard" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white">
            <Home className="inline-block mr-2" size={20} /> Home
          </Link>
          <Link to="/admin-dashboard/user-management" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white">
            <Users className="inline-block mr-2" size={20} /> User Management
          </Link>
          <Link to="/admin-dashboard/employee-management" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white">
            <UserPlus className="inline-block mr-2" size={20} /> Employee Management
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1">
        <Header />
        <main className="p-6">
          <Routes>
            <Route path="/" element={<AdminWelcome />} />
            <Route path="/user-management" element={<UserManagement />} />
            <Route path="/employee-management" element={<EmployeeManagement />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;