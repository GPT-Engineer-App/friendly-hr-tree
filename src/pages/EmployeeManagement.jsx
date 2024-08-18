import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, ArrowUpDown, Edit, Trash2, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('emp_id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
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
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order(sortField, { ascending: sortDirection === 'asc' });

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to fetch employees');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleEdit = (empId) => {
    navigate(`/admin/employee-details/${empId}`, { state: { isEditing: true } });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('employees')
        .insert([newEmployee]);

      if (error) throw error;

      toast.success('Employee created successfully');
      setShowCreateDialog(false);
      fetchEmployees();
    } catch (error) {
      console.error('Error creating employee:', error);
      toast.error('Failed to create employee');
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.emp_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Employee List</CardTitle>
          <Button onClick={() => setShowCreateDialog(true)}>
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
                <TableHead className="cursor-pointer" onClick={() => handleSort('emp_id')}>
                  Employee ID {sortField === 'emp_id' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                  Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>KYC Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.emp_id}>
                  <TableCell>
                    <Link to={`/admin/employee-details/${encodeURIComponent(employee.emp_id)}`} className="text-blue-600 hover:underline">
                      {employee.emp_id}
                    </Link>
                  </TableCell>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.designation}</TableCell>
                  <TableCell>
                    <span className={`font-bold ${
                      employee.kyc_status === 'Approved' ? 'text-green-600' :
                      employee.kyc_status === 'Rejected' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {employee.kyc_status || 'Pending'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button className="mr-2" onClick={() => handleEdit(employee.emp_id)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Employee</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateEmployee} className="space-y-4">
            <div>
              <Label htmlFor="emp_id">Employee ID</Label>
              <Input id="emp_id" name="emp_id" value={newEmployee.emp_id} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" value={newEmployee.name} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="email">Personal Email</Label>
              <Input id="email" name="email" type="email" value={newEmployee.email} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="official_email">Official Email</Label>
              <Input id="official_email" name="official_email" type="email" value={newEmployee.official_email} onChange={handleInputChange} required />
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
              <Label htmlFor="emergency_contact_no">Emergency Contact</Label>
              <Input id="emergency_contact_no" name="emergency_contact_no" value={newEmployee.emergency_contact_no} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="dob">Date of Birth</Label>
              <Input id="dob" name="dob" type="date" value={newEmployee.dob} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" name="address" value={newEmployee.address} onChange={handleInputChange} />
            </div>
            <Button type="submit">Create Employee</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeManagement;