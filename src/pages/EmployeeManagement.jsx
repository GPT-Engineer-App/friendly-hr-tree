import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const EmployeeManagement = () => {
  const [newEmployee, setNewEmployee] = useState({
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
  const [profilePicture, setProfilePicture] = useState(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState(null);

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
      const sanitizedEmpId = newEmployee.emp_id.replace(/\//g, '_');
      const newEmployeeData = {
        ...newEmployee,
        emp_id: sanitizedEmpId,
        created_by: userData.user.id,
        updated_by: userData.user.id
      };

      // Step 1: Insert the record in the employees table
      console.log('Inserting new employee data:', newEmployeeData);
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .insert([newEmployeeData])
        .select();
      if (employeeError) throw employeeError;
      console.log('Employee inserted successfully:', employeeData);

      // Step 2: Create folders in Supabase storage
      const folderPath = `employees_info/${sanitizedEmpId}`;
      const subFolders = ['profile_pic', 'kyc_documents'];
      for (const subFolder of subFolders) {
        const { error: folderError } = await supabase.storage
          .from('employees_info')
          .upload(`${folderPath}/${subFolder}/.keep`, new Blob(['']));
        if (folderError && folderError.message !== 'The resource already exists') {
          throw folderError;
        }
      }
      console.log('Folders created successfully');

      // Step 3: Insert records into the storage_paths table
      const storagePaths = subFolders.map(subFolder => ({
        emp_id: sanitizedEmpId,
        folder_type: subFolder === 'profile_pic' ? 'profile_picture' : 'kyc_documents',
        folder_path: `${folderPath}/${subFolder}`
      }));
      const { error: storagePathError } = await supabase
        .from('storage_paths')
        .insert(storagePaths);
      if (storagePathError) {
        console.error('Error inserting storage paths:', storagePathError);
        throw storagePathError;
      }
      console.log('Storage paths inserted successfully');

      // Step 4: Upload the profile picture
      if (croppedImageUrl) {
        console.log('Uploading profile picture');
        const fileName = `profile_picture.jpeg`;
        const filePath = `${folderPath}/profile_pic/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from('employees_info')
          .upload(filePath, croppedImageUrl);
        if (uploadError) throw uploadError;
        console.log('Profile picture uploaded successfully');

        // Step 5: Update the employee_documents table
        const { data: publicUrlData } = supabase.storage
          .from('employees_info')
          .getPublicUrl(filePath);
        
        const { error: documentError } = await supabase
          .from('employee_documents')
          .insert({
            emp_id: sanitizedEmpId,
            document_type: 'profile_picture',
            document_path: filePath,
            document_url: publicUrlData.publicUrl
          });
        if (documentError) throw documentError;
        console.log('Employee document record updated successfully');
      }

      console.log('The employee creation process was completed successfully');
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
      toast.error('Error adding employee: ' + (error.message || 'Unknown error occurred'));
    }
  };

  const validateForm = () => {
    const errors = [];
    // Add your form validation logic here
    return errors;
  };

  const fetchEmployees = async () => {
    // Add your fetchEmployees logic here
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Employee Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>Add New Employee</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Add your form fields here */}
            <Button type="submit">Add Employee</Button>
          </form>
        </CardContent>
      </Card>
      {/* Add your employee list or other components here */}
    </div>
  );
};

export default EmployeeManagement;