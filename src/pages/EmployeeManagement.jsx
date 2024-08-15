import React, { useState } from 'react';
import { supabase } from '../integrations/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submit button clicked');
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
      const folderPath = `${sanitizedEmpId}`;
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

      // Step 4: Upload the profile picture (if provided)
      if (profilePicture) {
        console.log('Uploading profile picture');
        const fileName = `profile_picture.${profilePicture.name.split('.').pop()}`;
        const filePath = `${folderPath}/profile_pic/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from('employees_info')
          .upload(filePath, profilePicture);
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
            document_url: publicUrlData.publicUrl
          });
        if (documentError) {
          console.error('Error inserting document record:', documentError);
          throw documentError;
        }
        console.log('Employee document record updated successfully');
      }

      console.log('The employee creation process was completed successfully');
      toast.success('Employee added successfully');
      // Reset form fields
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
      console.error('Error adding employee:', error);
      toast.error('Error adding employee: ' + (error.message || 'Unknown error occurred'));
    }
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emp_id">Employee ID</Label>
                <Input
                  id="emp_id"
                  name="emp_id"
                  value={newEmployee.emp_id}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={newEmployee.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  name="designation"
                  value={newEmployee.designation}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="date_of_joining">Date of Joining</Label>
                <Input
                  id="date_of_joining"
                  name="date_of_joining"
                  type="date"
                  value={newEmployee.date_of_joining}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone_no">Phone Number</Label>
                <Input
                  id="phone_no"
                  name="phone_no"
                  value={newEmployee.phone_no}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={newEmployee.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={newEmployee.address}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  name="dob"
                  type="date"
                  value={newEmployee.dob}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="emergency_contact_no">Emergency Contact</Label>
                <Input
                  id="emergency_contact_no"
                  name="emergency_contact_no"
                  value={newEmployee.emergency_contact_no}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="profile_picture">Profile Picture</Label>
                <Input
                  id="profile_picture"
                  name="profile_picture"
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                />
              </div>
            </div>
            <Button type="submit">Add Employee</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeManagement;