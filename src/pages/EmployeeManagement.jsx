import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const EmployeeManagement = () => {
  // ... (previous state and other functions remain unchanged)

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submit button clicked');
    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    try {
      console.log('Starting employee creation process');
      const { data: userData } = await supabase.auth.getUser();
      const newEmployeeData = {
        ...newEmployee,
        created_by: userData.user.id,
        updated_by: userData.user.id
      };

      console.log('Inserting new employee data:', newEmployeeData);
      const { data, error } = await supabase
        .from('employees')
        .insert([newEmployeeData])
        .select();
      if (error) throw error;

      console.log('Employee inserted successfully:', data);
      const employeeId = data[0].emp_id;

      // Create employee-specific folders
      const employeeFolderPath = `employees_info/${employeeId}`;
      const profilePictureFolderPath = `${employeeFolderPath}/profile_picture`;
      const kycDocumentsFolderPath = `${employeeFolderPath}/kyc_documents`;

      console.log('Creating employee folders');
      // Create folders (this is a no-op if the folders already exist)
      await supabase.storage.from('employees_info').upload(`${employeeId}/.keep`, new Blob(['']));
      await supabase.storage.from('employees_info').upload(`${employeeId}/profile_picture/.keep`, new Blob(['']));
      await supabase.storage.from('employees_info').upload(`${employeeId}/kyc_documents/.keep`, new Blob(['']));

      if (croppedImageUrl) {
        console.log('Uploading profile picture');
        const fileName = `profile_picture.jpeg`;
        const filePath = `${profilePictureFolderPath}/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from('employees_info')
          .upload(filePath, croppedImageUrl);
        if (uploadError) throw uploadError;

        console.log('Storing path in storage_paths table');
        // Store the path in the storage_paths table
        const { error: pathError } = await supabase
          .from('storage_paths')
          .insert({
            emp_id: employeeId,
            profile_picture_path: filePath,
            kyc_documents_path: kycDocumentsFolderPath
          });
        if (pathError) throw pathError;

        console.log('Updating employee record with profile picture path');
        // Update the employee record with the profile picture path
        const { error: updateError } = await supabase
          .from('employees')
          .update({ profile_picture: filePath })
          .eq('emp_id', employeeId);
        if (updateError) throw updateError;
      }

      console.log('Employee creation process completed successfully');
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
      setCroppedImageUrl(null);
    } catch (error) {
      console.error('Error adding employee:', error);
      toast.error('Error adding employee: ' + error.message);
    }
  };

  // ... (rest of the component code remains unchanged)

  return (
    // ... (the JSX remains unchanged)
  );
};

export default EmployeeManagement;