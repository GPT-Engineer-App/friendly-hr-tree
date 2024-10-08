import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../integrations/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Search, Trash2, Plus, Eye } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
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
  const [errorMessages, setErrorMessages] = useState([]);

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
    setErrorMessages([]);
    try {
      const { data, error } = await supabase
        .from('employees')
        .upsert(currentEmployee, { onConflict: 'emp_id' });

      if (error) {
        if (error.code === '23505') {
          if (error.message.includes('employees_email_key')) {
            setErrorMessages(prev => [...prev, 'An employee with this email already exists. Please use a different email.']);
          }
          if (error.message.includes('employees_official_email_key')) {
            setErrorMessages(prev => [...prev, 'An employee with this official email already exists. Please use a different official email.']);
          }
        } else {
          throw error;
        }
      } else {
        toast.success('Employee created successfully');
        setIsCreateDialogOpen(false);
        fetchEmployees();
        resetEmployeeForm();
      }
    } catch (error) {
      console.error('Error upserting employee:', error);
      setErrorMessages(prev => [...prev, `Failed to save employee: ${error.message}`]);
    }
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
    setErrorMessages([]);
  };

  const openCreateDialog = () => {
    resetEmployeeForm();
    setIsCreateDialogOpen(true);
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.emp_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.official_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
          <CardTitle className="text-2xl font-bold">Employee Management</CardTitle>
          <Button onClick={openCreateDialog} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" /> Create New Employee
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={handleSearch}
              className="max-w-sm w-full"
            />
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Official Email</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.emp_id}>
                    <TableCell className="font-medium">{employee.emp_id}</TableCell>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.designation}</TableCell>
                    <TableCell>{employee.official_email}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Link to={`/admin/employee-details/${employee.emp_id}`}>
                          <Button size="sm">
                            <Eye className="h-4 w-4 mr-2" /> View
                          </Button>
                        </Link>
                        <Button variant="destructive" onClick={() => handleDelete(employee.emp_id)} size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={() => {
        setIsCreateDialogOpen(false);
        resetEmployeeForm();
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Employee</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpsertEmployee} className="space-y-4">
            {errorMessages.length > 0 && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                {errorMessages.map((message, index) => (
                  <AlertDescription key={index}>{message}</AlertDescription>
                ))}
              </Alert>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <Label htmlFor="kyc_status">KYC Status</Label>
                <Input id="kyc_status" name="kyc_status" value={currentEmployee.kyc_status || 'Pending'} onChange={handleInputChange} required />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" value={currentEmployee.address || ''} onChange={handleInputChange} />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="submit">Create Employee</Button>
              <Button type="button" variant="outline" onClick={() => {
                setIsCreateDialogOpen(false);
                resetEmployeeForm();
              }}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeManagement;