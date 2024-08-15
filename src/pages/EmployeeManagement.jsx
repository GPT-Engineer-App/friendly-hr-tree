import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

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
    setProfilePicture(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // First, insert the new employee
      const { data, error } = await supabase
        .from('employees')
        .insert([newEmployee])
        .select();
      if (error) throw error;

      // If a profile picture was selected, upload it
      if (profilePicture) {
        const fileExt = profilePicture.name.split('.').pop();
        const fileName = `${data[0].emp_id}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('profile-pictures')
          .upload(fileName, profilePicture);
        if (uploadError) throw uploadError;

        // Update the employee record with the profile picture URL
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
                placeholder="Employee ID"
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
                placeholder="Phone Number"
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
              <Input
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