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
  const [employees, setEmployees] = useState([]);
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
  const [crop, setCrop] = useState({ aspect: 1 });
  const [croppedImageUrl, setCroppedImageUrl] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase.from('employees').select('*');
      if (error) throw error;
      setEmployees(data);
    } catch (error) {
      toast.error('Error fetching employees: ' + error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setProfilePicture(reader.result));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    const canvas = document.createElement('canvas');
    const image = new Image();
    image.src = profilePicture;
    image.onload = () => {
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(
        image,
        croppedAreaPixels.x * scaleX,
        croppedAreaPixels.y * scaleY,
        croppedAreaPixels.width * scaleX,
        croppedAreaPixels.height * scaleY,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );
      setCroppedImageUrl(canvas.toDataURL('image/jpeg'));
    };
  }, [profilePicture]);

  const validateForm = () => {
    const errors = [];
    if (!newEmployee.emp_id) errors.push("Employee ID is required");
    if (!newEmployee.name) errors.push("Name is required");
    if (!newEmployee.designation) errors.push("Designation is required");
    if (!newEmployee.date_of_joining) errors.push("Date of Joining is required");
    if (!newEmployee.phone_no) errors.push("Phone Number is required");
    if (!newEmployee.email) errors.push("Email is required");
    return errors;
  };

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
                <Input id="emp_id" name="emp_id" value={newEmployee.emp_id} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" value={newEmployee.name} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="designation">Designation</Label>
                <Input id="designation" name="designation" value={newEmployee.designation} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="date_of_joining">Date of Joining</Label>
                <Input id="date_of_joining" name="date_of_joining" type="date" value={newEmployee.date_of_joining} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="phone_no">Phone Number</Label>
                <Input id="phone_no" name="phone_no" value={newEmployee.phone_no} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={newEmployee.email} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" name="dob" type="date" value={newEmployee.dob} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="emergency_contact_no">Emergency Contact Number</Label>
                <Input id="emergency_contact_no" name="emergency_contact_no" value={newEmployee.emergency_contact_no} onChange={handleInputChange} />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" name="address" value={newEmployee.address} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="profile_picture">Profile Picture</Label>
              <Input id="profile_picture" type="file" onChange={handleFileChange} accept="image/*" />
            </div>
            {profilePicture && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button type="button">Crop Image</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Crop Profile Picture</DialogTitle>
                  </DialogHeader>
                  <ReactCrop
                    src={profilePicture}
                    crop={crop}
                    onChange={(newCrop) => setCrop(newCrop)}
                    onComplete={handleCropComplete}
                    aspect={1}
                  >
                    <img src={profilePicture} alt="Profile" />
                  </ReactCrop>
                </DialogContent>
              </Dialog>
            )}
            {croppedImageUrl && (
              <div>
                <h3>Cropped Image Preview:</h3>
                <img src={croppedImageUrl} alt="Cropped profile" className="max-w-xs" />
              </div>
            )}
            <Button type="submit">Add Employee</Button>
          </form>
        </CardContent>
      </Card>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Employee List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-2">Employee ID</th>
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Designation</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Phone</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.emp_id} className="border-t">
                    <td className="p-2">{employee.emp_id}</td>
                    <td className="p-2">{employee.name}</td>
                    <td className="p-2">{employee.designation}</td>
                    <td className="p-2">{employee.email}</td>
                    <td className="p-2">{employee.phone_no}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeManagement;