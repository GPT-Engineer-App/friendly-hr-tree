import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, ArrowUpDown, Edit, Trash2, Save, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// ... (keep all existing imports and other code)

const EmployeeManagement = () => {
  // ... (keep all existing state and other functions)

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Basic validation
      if (!newEmployee.emp_id || !newEmployee.name || !newEmployee.email) {
        throw new Error("Employee ID, Name, and Email are required fields.");
      }

      // Insert employee data
      const { data, error } = await supabase
        .from('employees')
        .insert([newEmployee])
        .select();

      if (error) throw error;

      const employeeId = data[0].emp_id;

      // Create folders and upload profile picture
      if (profilePicture) {
        const folderPath = `${employeeId}`;
        const fileExt = profilePicture.name.split('.').pop();
        const filePath = `${folderPath}/profile_picture.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('employees')
          .upload(filePath, profilePicture);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('employees')
          .getPublicUrl(filePath);

        await supabase
          .from('employees')
          .update({ profile_picture_url: urlData.publicUrl })
          .eq('emp_id', employeeId);

        // Insert into employee_documents table
        const { error: docError } = await supabase
          .from('employee_documents')
          .insert({
            emp_id: employeeId,
            file_name: 'profile_picture',
            file_path: filePath,
            file_type: fileExt,
            uploaded_by: 'system', // or use the current user's ID if available
          });

        if (docError) throw docError;
      }

      toast.success('Employee added successfully');
      fetchEmployees();
      setNewEmployee({
        emp_id: '',
        name: '',
        designation: '',
        date_of_joining: '',
        phone_no: '',
        email: '',
        address: '',
        dob: '',
        emergency_contact_no: ''
      });
      setProfilePicture(null);
    } catch (error) {
      toast.error('Error adding employee: ' + error.message);
    }
  };

  // ... (keep all other existing functions)

  return (
    // ... (keep the existing JSX)
  );
};

export default EmployeeManagement;