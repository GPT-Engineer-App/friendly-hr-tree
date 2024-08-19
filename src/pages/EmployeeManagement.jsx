import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Search, Edit, Trash2, Plus } from 'lucide-react';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
  const navigate = useNavigate();

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

  const handleCreateOrUpdateEmployee = async (e) => {
    e.preventDefault();
    try {
      let result;
      if (currentEmployee.emp_id) {
        // Update existing employee
        result = await supabase
          .from('employees')
          .update(currentEmployee)
          .eq('emp_id', currentEmployee.emp_id);
      } else {
        // Create new employee
        result = await supabase
          .from('employees')
          .insert([currentEmployee]);
      }

      if (result.error) throw result.error;

      toast.success(currentEmployee.emp_id ? 'Employee updated successfully' : 'Employee created successfully');
      setIsDialogOpen(false);
      fetchEmployees();
    } catch (error) {
      console.error('Error saving employee:', error);
      toast.error('Failed to save employee');
    }
  };

  const handleEdit = (employee) => {
    setCurrentEmployee(employee);
    setIsDialogOpen(true);
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
          <Button onClick={() => { setCurrentEmployee({}); setIsDialogOpen(true); }}>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentEmployee.emp_id ? 'Edit Employee' : 'Create New Employee'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateOrUpdateEmployee} className="space-y-4">
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
              <Button type="submit">
                {currentEmployee.emp_id ? 'Update Employee' : 'Create Employee'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeManagement;