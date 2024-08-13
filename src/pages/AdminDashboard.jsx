import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Users, Briefcase, LogOut } from 'lucide-react';

const Sidebar = () => (
  <div className="bg-gray-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
    <nav>
      <Link to="/admin-dashboard/user-management" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white">
        <Users className="inline-block mr-2" size={20} /> User Management
      </Link>
      <Link to="/admin-dashboard/employee-management" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white">
        <Briefcase className="inline-block mr-2" size={20} /> Employee Management
      </Link>
    </nav>
  </div>
);

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.auth.admin.listUsers();
      if (error) throw error;
      setUsers(data.users);
    } catch (error) {
      toast.error('Error fetching users: ' + error.message);
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: newUserEmail,
        password: newUserPassword,
        email_confirm: true
      });
      if (error) throw error;

      // Set the is_admin metadata
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        data.user.id,
        { app_metadata: { is_admin: isAdmin } }
      );
      if (updateError) throw updateError;

      toast.success('User created successfully');
      fetchUsers();
      setNewUserEmail('');
      setNewUserPassword('');
      setIsAdmin(false);
    } catch (error) {
      toast.error('Error creating user: ' + error.message);
    }
  };

  const updateUserEmail = async (userId, newEmail) => {
    try {
      const { data, error } = await supabase.auth.admin.updateUserById(userId, { email: newEmail });
      if (error) throw error;
      toast.success('User email updated successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Error updating user email: ' + error.message);
    }
  };

  const deleteUser = async (userId) => {
    try {
      const { data, error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Error deleting user: ' + error.message);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Create New User</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={createUser} className="space-y-4">
            <Input
              type="email"
              placeholder="Enter new user's email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              required
              autocomplete="off"
            />
            <Input
              type="password"
              placeholder="Enter new user's password"
              value={newUserPassword}
              onChange={(e) => setNewUserPassword(e.target.value)}
              required
              autocomplete="off"
            />
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isAdmin"
                checked={isAdmin}
                onCheckedChange={(checked) => setIsAdmin(checked)}
              />
              <label htmlFor="isAdmin">Admin</label>
            </div>
            <Button type="submit">Create User</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {users.map((user) => (
              <li key={user.id} className="flex items-center justify-between">
                <span>{user.email} {user.app_metadata?.is_admin ? '(Admin)' : ''}</span>
                <div>
                  <Button onClick={() => updateUserEmail(user.id, prompt('Enter new email'))}>Update Email</Button>
                  <Button onClick={() => deleteUser(user.id)} variant="destructive">Delete</Button>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

const EmployeeManagement = () => (
  <div className="p-4">
    <h2 className="text-2xl font-bold mb-4">Employee Management</h2>
    <p>Employee management functionality coming soon...</p>
  </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/login');
    } catch (error) {
      toast.error('Error logging out: ' + error.message);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
            <Button onClick={handleLogout} variant="ghost">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
          <div className="container mx-auto px-6 py-8">
            <Routes>
              <Route path="user-management" element={<UserManagement />} />
              <Route path="employee-management" element={<EmployeeManagement />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;