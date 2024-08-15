import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Users, Briefcase, LogOut } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  const [editingUser, setEditingUser] = useState(null);
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editIsAdmin, setEditIsAdmin] = useState(false);

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

  const updateUser = async () => {
    try {
      const updates = {};
      if (editEmail !== editingUser.email) {
        updates.email = editEmail;
      }
      if (editPassword) {
        updates.password = editPassword;
      }
      const { error } = await supabase.auth.admin.updateUserById(editingUser.id, updates);
      if (error) throw error;

      // Update app_metadata
      const { error: metadataError } = await supabase.auth.admin.updateUserById(
        editingUser.id,
        { app_metadata: { ...editingUser.app_metadata, is_admin: editIsAdmin } }
      );
      if (metadataError) throw metadataError;

      toast.success('User updated successfully');
      fetchUsers();
      setEditingUser(null);
    } catch (error) {
      toast.error('Error updating user: ' + error.message);
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
              autoComplete="off"
            />
            <Input
              type="password"
              placeholder="Enter new user's password"
              value={newUserPassword}
              onChange={(e) => setNewUserPassword(e.target.value)}
              required
              autoComplete="off"
            />
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isAdmin"
                checked={isAdmin}
                onCheckedChange={(checked) => setIsAdmin(checked)}
              />
              <label htmlFor="isAdmin" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Admin
              </label>
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
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button onClick={() => {
                        setEditingUser(user);
                        setEditEmail(user.email);
                        setEditPassword('');
                        setEditIsAdmin(user.app_metadata?.is_admin || false);
                      }}>
                        Update User
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>
                          Make changes to the user's details here. Click save when you're done.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <label htmlFor="email" className="text-right">
                            Email
                          </label>
                          <Input
                            id="email"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <label htmlFor="password" className="text-right">
                            New Password
                          </label>
                          <Input
                            id="password"
                            type="password"
                            value={editPassword}
                            onChange={(e) => setEditPassword(e.target.value)}
                            className="col-span-3"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="editIsAdmin"
                            checked={editIsAdmin}
                            onCheckedChange={(checked) => setEditIsAdmin(checked)}
                          />
                          <label htmlFor="editIsAdmin" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Admin
                          </label>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" onClick={updateUser}>Save changes</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Delete</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the user
                          account and remove their data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteUser(user.id)}>
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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