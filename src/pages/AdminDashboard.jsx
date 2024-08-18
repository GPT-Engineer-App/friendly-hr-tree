import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Users, Home, Briefcase, FileText, Menu } from 'lucide-react';
import Header from '../components/Header';
import AdminWelcome from './AdminWelcome';
import UserManagement from './UserManagement';
import EmployeeManagement from './EmployeeManagement';
import KYCApproval from './KYCApproval';
import EmployeeKYCApproval from './EmployeeKYCApproval';
import EmployeeDocuments from './EmployeeDocuments';
import EmployeeDetails from './EmployeeDetails';
import { Button } from "@/components/ui/button";
import { useState } from 'react';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Mobile menu button */}
      <Button
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={toggleSidebar}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Sidebar */}
      <aside className={`bg-gray-800 text-white w-64 flex-shrink-0 ${sidebarOpen ? 'block' : 'hidden'} md:block fixed md:static h-full z-40 transition-all duration-300 ease-in-out`}>
        <div className="p-4">
          <h2 className="text-2xl font-semibold">Admin Dashboard</h2>
        </div>
        <nav className="mt-6">
          <Link to="/admin" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white">
            <Home className="inline-block mr-2" size={20} /> Home
          </Link>
          <Link to="/admin/user-management" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white">
            <Users className="inline-block mr-2" size={20} /> User Management
          </Link>
          <Link to="/admin/employee-management" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white">
            <Briefcase className="inline-block mr-2" size={20} /> Employee Management
          </Link>
          <Link to="/admin/kyc-approval" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white">
            <FileText className="inline-block mr-2" size={20} /> KYC Approval
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 md:ml-64">
        <Header />
        <main className="p-6">
          <Routes>
            <Route path="/" element={<AdminWelcome />} />
            <Route path="/user-management" element={<UserManagement />} />
            <Route path="/employee-management" element={<EmployeeManagement />} />
            <Route path="/kyc-approval" element={<KYCApproval />} />
            <Route path="/kyc-approval/:empId" element={<EmployeeKYCApproval />} />
            <Route path="/employee-documents/:empId" element={<EmployeeDocuments />} />
            <Route path="/employee-details/:empId" element={<EmployeeDetails />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;