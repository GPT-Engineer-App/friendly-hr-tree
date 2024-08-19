import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Search, Edit, Trash2, Plus } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState({
    emp_id: '',
    name: '',
    designation: '',
    date_of_joining: '',
    phone_no: '',
    email: '',
    address: '',
    dob: '',
    emergency_contact_no: '',
    official_email: '',
    kyc_status: 'Pending'
  });
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('emp_id', { ascending: true });

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to fetch employees');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentEmployee(prev => ({ ...prev, [name]: value }));
  };

  const handleUpsertEmployee = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      const { data, error } = await supabase
        .from('employees')
        .upsert(currentEmployee, { onConflict: 'emp_id' });

      if (error) {
        if (error.code === '23505' && error.message.includes('employees_email_key')) {
          setErrorMessage('An employee with this email already exists. Please use a different email.');
        } else {
          throw error;
        }
      } else {
        toast.success(isEditDialogOpen ? 'Employee updated successfully' : 'Employee created successfully');
        setIsEditDialogOpen(false);
        setIsCreateDialogOpen(false);
        fetchEmployees();
        resetEmployeeForm();
      }
    } catch (error) {
      console.error('Error upserting employee:', error);
      toast.error('Failed to save employee: ' + error.message);
    }
  };

  const handleEdit = (employee) => {
    setCurrentEmployee(employee);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (emp_id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        const { error } = await supabase
          .from('employees')
          .delete()
          .eq('emp_id', emp_id);

        if (error) throw error;
        
        toast.success('Employee deleted successfully');
        fetchEmployees();
      } catch (error) {
        console.error('Error deleting employee:', error);
        toast.error('Failed to delete employee: ' + error.message);
      }
    }
  };

  const resetEmployeeForm = () => {
    setCurrentEmployee({
      emp_id: '',
      name: '',
      designation: '',
      date_of_joining: '',
      phone_no: '',
      email: '',
      address: '',
      dob: '',
      emergency_contact_no: '',
      official_email: '',
      kyc_status: 'Pending'
    });
    setErrorMessage('');
  };

  const openCreateDialog = () => {
    resetEmployeeForm();
    setIsCreateDialogOpen(true);
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.emp_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Employee Management</CardTitle>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" /> Create New Employee
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={handleSearch}
              className="max-w-sm"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>KYC Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.emp_id}>
                  <TableCell>{employee.emp_id}</TableCell>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.designation}</TableCell>
                  <TableCell>{employee.kyc_status}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button onClick={() => handleEdit(employee)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" onClick={() => handleDelete(employee.emp_id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Employee Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpsertEmployee} className="space-y-4">
            {errorMessage && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            <div>
              <Label htmlFor="emp_id">Employee ID</Label>
              <Input id="emp_id" name="emp_id" value={currentEmployee.emp_id || ''} onChange={handleInputChange} required disabled />
            </div>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" value={currentEmployee.name || ''} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={currentEmployee.email || ''} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="official_email">Official Email</Label>
              <Input id="official_email" name="official_email" type="email" value={currentEmployee.official_email || ''} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="designation">Designation</Label>
              <Input id="designation" name="designation" value={currentEmployee.designation || ''} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="date_of_joining">Date of Joining</Label>
              <Input id="date_of_joining" name="date_of_joining" type="date" value={currentEmployee.date_of_joining || ''} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="phone_no">Phone Number</Label>
              <Input id="phone_no" name="phone_no" value={currentEmployee.phone_no || ''} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="emergency_contact_no">Emergency Contact</Label>
              <Input id="emergency_contact_no" name="emergency_contact_no" value={currentEmployee.emergency_contact_no || ''} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="dob">Date of Birth</Label>
              <Input id="dob" name="dob" type="date" value={currentEmployee.dob || ''} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" value={currentEmployee.address || ''} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="kyc_status">KYC Status</Label>
              <Input id="kyc_status" name="kyc_status" value={currentEmployee.kyc_status || 'Pending'} onChange={handleInputChange} required />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="submit">Update Employee</Button>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Employee Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Employee</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpsertEmployee} className="space-y-4">
            {errorMessage && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            <div>
              <Label htmlFor="emp_id">Employee ID</Label>
              <Input id="emp_id" name="emp_id" value={currentEmployee.emp_id || ''} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" value={currentEmployee.name || ''} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={currentEmployee.email || ''} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="official_email">Official Email</Label>
              <Input id="official_email" name="official_email" type="email" value={currentEmployee.official_email || ''} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="designation">Designation</Label>
              <Input id="designation" name="designation" value={currentEmployee.designation || ''} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="date_of_joining">Date of Joining</Label>
              <Input id="date_of_joining" name="date_of_joining" type="date" value={currentEmployee.date_of_joining || ''} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="phone_no">Phone Number</Label>
              <Input id="phone_no" name="phone_no" value={currentEmployee.phone_no || ''} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="emergency_contact_no">Emergency Contact</Label>
              <Input id="emergency_contact_no" name="emergency_contact_no" value={currentEmployee.emergency_contact_no || ''} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="dob">Date of Birth</Label>
              <Input id="dob" name="dob" type="date" value={currentEmployee.dob || ''} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" value={currentEmployee.address || ''} onChange={handleInputChange} />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="submit">Create Employee</Button>
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeManagement;