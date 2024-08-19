import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const EmployeeDetails = () => {
  const { empId } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState({
    emp_id: '',
    name: '',
    email: '',
    official_email: '',
    designation: '',
    date_of_joining: '',
    phone_no: '',
    emergency_contact_no: '',
    dob: '',
    address: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('EmployeeDetails useEffect triggered. empId:', empId);
    if (empId && empId !== 'new') {
      fetchEmployeeDetails();
    } else {
      console.log('Creating new employee or no empId provided. Form reset to default values.');
      setIsLoading(false);
    }
  }, [empId]);

  const fetchEmployeeDetails = async () => {
    console.log('Fetching employee details for empId:', empId);
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('emp_id', empId)
        .single();

      console.log('Supabase query result:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      if (data) {
        console.log('Employee data fetched successfully:', data);
        setEmployee(data);
      } else {
        console.log('No employee found with empId:', empId);
        throw new Error('Employee not found');
      }
    } catch (error) {
      console.error('Error fetching employee details:', error);
      setError('Failed to fetch employee details. Please try again.');
      toast.error('Failed to fetch employee details: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmployee(prev => {
      const updatedEmployee = { ...prev, [name]: value };
      console.log('Employee state updated:', updatedEmployee);
      return updatedEmployee;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted. Current employee state:', employee);
    setIsLoading(true);
    try {
      let result;
      if (empId === 'new') {
        console.log('Creating new employee...');
        result = await supabase.from('employees').insert([employee]);
      } else {
        console.log('Updating existing employee...');
        result = await supabase.from('employees').update(employee).eq('emp_id', empId);
      }

      console.log('Supabase operation result:', result);

      const { error } = result;
      if (error) throw error;

      console.log('Employee saved successfully:', employee);
      toast.success(empId === 'new' ? 'Employee created successfully' : 'Employee information updated successfully');
      navigate('/admin/employee-management');
    } catch (error) {
      console.error('Error saving employee:', error);
      toast.error('Failed to save employee information: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    console.log('Cancelling form submission. Navigating back to employee management.');
    navigate('/admin/employee-management');
  };

  console.log('Rendering EmployeeDetails. Current state:', { employee, isLoading, error });

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">{empId === 'new' ? 'Create New Employee' : 'Edit Employee Details'}</h2>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Employee Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emp_id">Employee ID</Label>
                <Input id="emp_id" name="emp_id" value={employee.emp_id} onChange={handleInputChange} required disabled={empId !== 'new'} />
              </div>
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" value={employee.name} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="email">Personal Email</Label>
                <Input id="email" name="email" type="email" value={employee.email} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="official_email">Official Email</Label>
                <Input id="official_email" name="official_email" type="email" value={employee.official_email} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="designation">Designation</Label>
                <Input id="designation" name="designation" value={employee.designation} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="date_of_joining">Date of Joining</Label>
                <Input id="date_of_joining" name="date_of_joining" type="date" value={employee.date_of_joining} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="phone_no">Phone Number</Label>
                <Input id="phone_no" name="phone_no" value={employee.phone_no} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="emergency_contact_no">Emergency Contact</Label>
                <Input id="emergency_contact_no" name="emergency_contact_no" value={employee.emergency_contact_no} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" name="dob" type="date" value={employee.dob} onChange={handleInputChange} />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" name="address" value={employee.address} onChange={handleInputChange} />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeDetails;