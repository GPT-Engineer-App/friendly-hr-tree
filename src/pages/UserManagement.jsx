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

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editPassword, setEditPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
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

  const createUser = async (e) => {
    e.preventDefault();
    
    if (!newUserEmail || !newUserPassword) {
      toast.error('Please provide both email and password');
      return;
    }
    
    if (newUserPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: newUserEmail,
        password: newUserPassword,
        email_confirm: true
      });
      if (error) {
        console.error('Supabase error:', error);
        if (error.message && error.message.toLowerCase().includes('already been registered')) {
          toast.error('A user with this email already exists. Please use a different email address.');
        } else if (error.status === 422) {
          if (error.message && error.message.toLowerCase().includes('password')) {
            toast.error('Invalid password: The password should be at least 6 characters long.');
          } else {
            toast.error('Invalid input: Please check the email and password.');
          }
        } else if (error.status === 403) {
          toast.error('You do not have permission to create users. Please contact your administrator.');
        } else {
          toast.error('An error occurred while creating the user. Please try again.');
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
      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      toast.success('User created successfully');
      fetchUsers();
      setNewUserEmail('');
      setNewUserPassword('');
      setIsAdmin(false);
    } catch (error) {
      console.error('Error creating user:', error);
      if (error.message && error.message.toLowerCase().includes('already been registered')) {
        toast.error('A user with this email already exists. Please use a different email address.');
      } else {
        toast.error('Error creating user: ' + (error.message || 'Unknown error occurred'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... rest of the component code ...

};

export default UserManagement;