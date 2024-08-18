import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Users, Briefcase, FileText, Settings, Menu, X } from 'lucide-react';
import Header from './Header';

const Sidebar = ({ isOpen, toggleSidebar }) => (
  <div className={`bg-gray-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out z-20`}>
    <button onClick={toggleSidebar} className="md:hidden absolute right-4 top-4">
      <X className="h-6 w-6" />
    </button>
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="flex-1 overflow-x-hidden overflow-y-auto relative">
          <button onClick={toggleSidebar} className="md:hidden absolute left-4 top-4 z-10">
            <Menu className="h-6 w-6" />
          </button>
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;