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
  const [imageRef, setImageRef] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*');
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

  const onImageLoaded = useCallback((img) => {
    setImageRef(img);
  }, []);

  const onCropComplete = (crop) => {
    makeClientCrop(crop);
  };

  const makeClientCrop = async (crop) => {
    if (imageRef && crop.width && crop.height) {
      const croppedImageUrl = await getCroppedImg(
        imageRef,
        crop,
        'newFile.jpeg'
      );
      setCroppedImageUrl(croppedImageUrl);
    }
  };

  const getCroppedImg = (image, crop, fileName) => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        blob.name = fileName;
        resolve(blob);
      }, 'image/jpeg');
    });
  };

  const validateForm = () => {
    const errors = [];
    if (!/^[A-Z]{2}\d{4}$/.test(newEmployee.emp_id)) {
      errors.push("Employee ID must be in the format AA0000");
    }
    if (newEmployee.name.length < 2) {
      errors.push("Name must be at least 2 characters long");
    }
    if (!/^\d{10}$/.test(newEmployee.phone_no)) {
      errors.push("Phone number must be 10 digits");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmployee.email)) {
      errors.push("Invalid email format");
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      const newEmployeeData = {
        ...newEmployee,
        created_by: userData.user.id,
        updated_by: userData.user.id
      };

      const { data, error } = await supabase
        .from('employees')
        .insert([newEmployeeData])
        .select();
      if (error) throw error;

      if (croppedImageUrl) {
        const fileName = `${data[0].emp_id}.jpeg`;
        const { error: uploadError } = await supabase.storage
          .from('profile-pictures')
          .upload(fileName, croppedImageUrl);
        if (uploadError) throw uploadError;

        const { error: updateError } = await supabase
          .from('employees')
          .update({ profile_picture: fileName })
          .eq('emp_id', data[0].emp_id);
        if (updateError) throw updateError;
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
      setCroppedImageUrl(null);
    } catch (error) {
      toast.error('Error adding employee: ' + error.message);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Employee Management</h1>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add New Employee</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="emp_id"
                placeholder="Employee ID (AA0000)"
                value={newEmployee.emp_id}
                onChange={handleInputChange}
                required
              />
              <Input
                name="name"
                placeholder="Name"
                value={newEmployee.name}
                onChange={handleInputChange}
                required
              />
              <Input
                name="designation"
                placeholder="Designation"
                value={newEmployee.designation}
                onChange={handleInputChange}
                required
              />
              <Input
                name="date_of_joining"
                type="date"
                placeholder="Date of Joining"
                value={newEmployee.date_of_joining}
                onChange={handleInputChange}
                required
              />
              <Input
                name="phone_no"
                placeholder="Phone Number (10 digits)"
                value={newEmployee.phone_no}
                onChange={handleInputChange}
                required
              />
              <Input
                name="email"
                type="email"
                placeholder="Email"
                value={newEmployee.email}
                onChange={handleInputChange}
                required
              />
              <Textarea
                name="address"
                placeholder="Address"
                value={newEmployee.address}
                onChange={handleInputChange}
              />
              <Input
                name="dob"
                type="date"
                placeholder="Date of Birth"
                value={newEmployee.dob}
                onChange={handleInputChange}
              />
              <Input
                name="emergency_contact_no"
                placeholder="Emergency Contact Number"
                value={newEmployee.emergency_contact_no}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="profile_picture">Profile Picture</Label>
              <Input
                id="profile_picture"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
            {profilePicture && (
              <ReactCrop
                src={profilePicture}
                crop={crop}
                onChange={(newCrop) => setCrop(newCrop)}
                onImageLoaded={onImageLoaded}
                onComplete={onCropComplete}
              />
            )}
            <Button type="submit">Add Employee</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Employee List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map((employee) => (
              <Card key={employee.emp_id}>
                <CardContent className="flex items-center space-x-4 p-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={employee.profile_picture ? `${supabase.storage.from('profile-pictures').getPublicUrl(employee.profile_picture).data.publicUrl}` : ''} alt={employee.name} />
                    <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{employee.name}</h3>
                    <p className="text-sm text-gray-500">{employee.designation}</p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="link" className="p-0">View Details</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{employee.name}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-3 items-center gap-4">
                            <Label>Employee ID</Label>
                            <span className="col-span-2">{employee.emp_id}</span>
                          </div>
                          <div className="grid grid-cols-3 items-center gap-4">
                            <Label>Email</Label>
                            <span className="col-span-2">{employee.email}</span>
                          </div>
                          <div className="grid grid-cols-3 items-center gap-4">
                            <Label>Phone</Label>
                            <span className="col-span-2">{employee.phone_no}</span>
                          </div>
                          <div className="grid grid-cols-3 items-center gap-4">
                            <Label>Joining Date</Label>
                            <span className="col-span-2">{employee.date_of_joining}</span>
                          </div>
                          <div className="grid grid-cols-3 items-center gap-4">
                            <Label>Address</Label>
                            <span className="col-span-2">{employee.address}</span>
                          </div>
                          <div className="grid grid-cols-3 items-center gap-4">
                            <Label>Date of Birth</Label>
                            <span className="col-span-2">{employee.dob}</span>
                          </div>
                          <div className="grid grid-cols-3 items-center gap-4">
                            <Label>Emergency Contact</Label>
                            <span className="col-span-2">{employee.emergency_contact_no}</span>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeManagement;