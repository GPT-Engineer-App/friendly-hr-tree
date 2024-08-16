import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, EyeOff, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [newUserPassword, setNewUserPassword] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editPassword, setEditPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchEmployees();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data: { users }, error } = await supabase.auth.admin.listUsers();
      if (error) throw error;
      setUsers(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error fetching users: ' + error.message);
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('emp_id, name, official_email')
        .is('user_id', null);
      if (error) throw error;
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Error fetching employees: ' + error.message);
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    
    if (!newUserPassword || !selectedEmployee) {
      setErrorMessage('Please provide a password and select an employee');
      return;
    }
    
    if (newUserPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      // Find the selected employee
      const selectedEmployeeData = employees.find(emp => emp.emp_id === selectedEmployee);
      if (!selectedEmployeeData) {
        throw new Error('Selected employee not found');
      }

      // Create user with the employee's official email
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email: selectedEmployeeData.official_email,
        password: newUserPassword,
        email_confirm: true,
        user_metadata: { is_admin: isAdmin },
        app_metadata: { is_admin: isAdmin }
      });

      if (userError) throw userError;

      // Update employee record with the new user_id
      const { error: employeeError } = await supabase
        .from('employees')
        .update({ user_id: userData.user.id })
        .eq('emp_id', selectedEmployee);

      if (employeeError) throw employeeError;

      toast.success('User created and associated with employee successfully');
      fetchUsers();
      fetchEmployees();
      setNewUserPassword('');
      setSelectedEmployee('');
      setIsAdmin(false);
    } catch (error) {
      console.error('Error creating user:', error);
      setErrorMessage(error.message || 'An error occurred while creating the user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditPassword('');
  };

  const handleUpdateUser = async () => {
    try {
      const isAdminStatus = editingUser.user_metadata?.is_admin || false;
      const updates = {
        email: editingUser.email,
        user_metadata: { is_admin: isAdminStatus },
        app_metadata: { is_admin: isAdminStatus }
      };
      if (editPassword) {
        updates.password = editPassword;
      }
      const { error } = await supabase.auth.admin.updateUserById(editingUser.id, updates);
      if (error) throw error;
      toast.success('User updated successfully');
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Error updating user: ' + error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const { error: employeeError } = await supabase
        .from('employees')
        .update({ user_id: null })
        .eq('user_id', userId);

      if (employeeError) {
        console.error('Error updating employee:', employeeError);
        // If the error is due to no matching rows, we can ignore it
        if (employeeError.code !== 'PGRST116') {
          throw employeeError;
        }
      }

      const { error: userError } = await supabase.auth.admin.deleteUser(userId);
      if (userError) throw userError;

      toast.success('User deleted and employee association removed successfully');
      fetchUsers();
      fetchEmployees();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Error deleting user: ' + error.message);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add New User</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={createUser} className="space-y-4">
            {errorMessage && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{errorMessage}</span>
              </div>
            )}
            <div>
              <Label htmlFor="employee">Associate Employee</Label>
              <Select onValueChange={setSelectedEmployee} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select an employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.emp_id} value={employee.emp_id}>
                      {employee.name} ({employee.official_email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isAdmin"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                className="mr-2"
              />
              <Label htmlFor="isAdmin">Is Admin</Label>
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create User'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.user_metadata?.is_admin ? 'Admin' : 'User'}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleEditUser(user)} className="mr-2">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => handleDeleteUser(user.id)} variant="destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateUser(); }} className="space-y-4">
              <div>
                <Label htmlFor="editEmail">Email</Label>
                <Input id="editEmail" type="email" value={editingUser.email} onChange={(e) => setEditingUser({...editingUser, email: e.target.value})} />
              </div>
              <div>
                <Label htmlFor="editPassword">New Password (leave blank to keep current)</Label>
                <div className="relative">
                  <Input
                    id="editPassword"
                    type={showEditPassword ? "text" : "password"}
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showEditPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="editIsAdmin"
                  checked={editingUser.user_metadata?.is_admin || false}
                  onChange={(e) => setEditingUser({...editingUser, user_metadata: {...editingUser.user_metadata, is_admin: e.target.checked}})}
                  className="mr-2"
                />
                <Label htmlFor="editIsAdmin">Is Admin</Label>
              </div>
              <Button type="submit">Update User</Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default UserManagement;