import React from 'react';
import { NavLink } from 'react-router-dom';
import { Users, Briefcase, FileText, Settings } from 'lucide-react';

const Sidebar = () => (
  <div className="bg-gray-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
    <nav>
      <NavLink to="/" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white">
        <Users className="inline-block mr-2" size={20} /> Employees
      </NavLink>
      <NavLink to="/departments" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white">
        <Briefcase className="inline-block mr-2" size={20} /> Departments
      </NavLink>
      <NavLink to="/leave-management" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white">
        <FileText className="inline-block mr-2" size={20} /> Leave Management
      </NavLink>
      <NavLink to="/settings" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white">
        <Settings className="inline-block mr-2" size={20} /> Settings
      </NavLink>
    </nav>
  </div>
);

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;