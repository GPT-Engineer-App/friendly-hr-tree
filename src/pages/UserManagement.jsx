import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
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

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editIsAdmin, setEditIsAdmin] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

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
              id="newUserEmail"
              placeholder="Enter new user's email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              required
              autoComplete="off"
            />
            <Input
              type="password"
              id="newUserPassword"
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
                  <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => {
                        setEditingUser(user);
                        setEditEmail(user.email);
                        setEditPassword('');
                        setEditIsAdmin(user.app_metadata?.is_admin || false);
                        setIsUpdateDialogOpen(true);
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
                          <Input
                            id={`editPassword-${user.id}`}
                            type="password"
                            value={editPassword}
                            onChange={(e) => setEditPassword(e.target.value)}
                            className="col-span-3"
                          />
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
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;