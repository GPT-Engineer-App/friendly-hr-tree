import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Eye, EyeOff, Search, ArrowUpDown, Download } from 'lucide-react';
import { CSVLink } from "react-csv";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const USERS_PER_PAGE = 10;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editIsAdmin, setEditIsAdmin] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('email');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(user =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const sorted = filtered.sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    setFilteredUsers(sorted);
  }, [searchTerm, users, sortField, sortDirection]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.auth.admin.listUsers();
      if (error) throw error;
      setUsers(data.users);
      setFilteredUsers(data.users);
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
      if (error) {
        if (error.status === 422) {
          toast.error('Invalid input: Please check the email and password. The password should be at least 6 characters long.');
        } else {
          throw error;
        }
        return;
      }

      if (!data || !data.user) {
        throw new Error('User data not returned from Supabase');
      }

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
      console.error('Error creating user:', error);
      toast.error('Error creating user: ' + (error.message || 'Unknown error occurred'));
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
      
      if (Object.keys(updates).length > 0) {
        const { error } = await supabase.auth.admin.updateUserById(editingUser.id, updates);
        if (error) throw error;
      }

      const { data: currentUser, error: getUserError } = await supabase.auth.admin.getUserById(editingUser.id);
      if (getUserError) throw getUserError;

      const currentMetadata = currentUser.user.app_metadata || {};
      const updatedMetadata = { ...currentMetadata, is_admin: editIsAdmin };

      const { error: metadataError } = await supabase.auth.admin.updateUserById(
        editingUser.id,
        { app_metadata: updatedMetadata }
      );
      if (metadataError) throw metadataError;

      toast.success('User updated successfully');
      fetchUsers();
      setEditingUser(null);
      setIsUpdateDialogOpen(false);
      setIsConfirmDialogOpen(false);
    } catch (error) {
      toast.error('Error updating user: ' + error.message);
    }
  };

  const deleteUser = async (userId) => {
    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Error deleting user: ' + error.message);
    }
  };

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Email', 'Admin']],
      body: filteredUsers.map(user => [user.email, user.app_metadata?.is_admin ? 'Yes' : 'No']),
    });
    doc.save('users.pdf');
  };

  const csvData = filteredUsers.map(user => ({
    email: user.email,
    isAdmin: user.app_metadata?.is_admin ? 'Yes' : 'No'
  }));

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Create New User</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={createUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Input
                  type="email"
                  id="newUserEmail"
                  placeholder="Email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  required
                  autoComplete="off"
                />
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  id="newUserPassword"
                  placeholder="Password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  required
                  autoComplete="off"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
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
          <div className="mb-4 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="relative w-full sm:w-auto">
              <Input
                type="text"
                placeholder="Search users by email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <div className="flex space-x-2">
              <CSVLink
                data={csvData}
                filename={"users.csv"}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Export CSV
              </CSVLink>
              <Button onClick={exportToPDF}>
                Export PDF
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-2">
                    <button onClick={() => handleSort('email')} className="flex items-center">
                      Email <ArrowUpDown className="ml-1 h-4 w-4" />
                    </button>
                  </th>
                  <th className="text-left p-2">Admin</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr key={user.id} className="border-t">
                    <td className="p-2">{user.email}</td>
                    <td className="p-2">{user.app_metadata?.is_admin ? 'Yes' : 'No'}</td>
                    <td className="p-2">
                      <div className="flex space-x-2">
                        <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
                          <DialogTrigger asChild>
                            <Button onClick={() => {
                              setEditingUser(user);
                              setEditEmail(user.email);
                              setEditPassword('');
                              setEditIsAdmin(user.app_metadata?.is_admin || false);
                              setIsUpdateDialogOpen(true);
                            }}>
                              Update
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
                                <label htmlFor={`editEmail-${user.id}`} className="text-right">
                                  Email
                                </label>
                                <Input
                                  id={`editEmail-${user.id}`}
                                  value={editEmail}
                                  onChange={(e) => setEditEmail(e.target.value)}
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label htmlFor={`editPassword-${user.id}`} className="text-right">
                                  New Password
                                </label>
                                <div className="col-span-3 relative">
                                  <Input
                                    id={`editPassword-${user.id}`}
                                    type={showEditPassword ? "text" : "password"}
                                    value={editPassword}
                                    onChange={(e) => setEditPassword(e.target.value)}
                                    className="pr-10"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowEditPassword(!showEditPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                                  >
                                    {showEditPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </button>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`editIsAdmin-${user.id}`}
                                  checked={editIsAdmin}
                                  onCheckedChange={(checked) => setEditIsAdmin(checked)}
                                />
                                <label htmlFor={`editIsAdmin-${user.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                  Admin
                                </label>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="button" variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>Cancel</Button>
                              <Button type="button" onClick={() => setIsConfirmDialogOpen(true)}>Save changes</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirm User Update</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to update this user's information? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setIsConfirmDialogOpen(false)}>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={updateUser}>Confirm</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <div>
              <span className="mr-2">Page {currentPage} of {totalPages}</span>
              <Select value={USERS_PER_PAGE.toString()} onValueChange={(value) => setUsersPerPage(parseInt(value))}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Users per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 per page</SelectItem>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="20">20 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-x-2">
              <Button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;