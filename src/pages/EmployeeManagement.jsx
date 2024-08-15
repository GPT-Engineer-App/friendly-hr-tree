import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, ArrowUpDown, Edit, Trash2 } from 'lucide-react';

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
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [employeesPerPage] = useState(10);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      let { data, error } = await supabase
        .from('employees')
        .select('*')
        .order(sortField, { ascending: sortDirection === 'asc' });
      
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
    // ... (keep the existing handleSubmit logic)
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    setSortField(field);
    setSortDirection(current => current === 'asc' ? 'desc' : 'asc');
    fetchEmployees();
  };

  const handleUpdate = (employee) => {
    setEditingEmployee(employee);
    setIsUpdateDialogOpen(true);
  };

  const handleDelete = async (empId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        const { error } = await supabase
          .from('employees')
          .delete()
          .eq('emp_id', empId);
        
        if (error) throw error;
        toast.success('Employee deleted successfully');
        fetchEmployees();
      } catch (error) {
        toast.error('Error deleting employee: ' + error.message);
      }
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('employees')
        .update(editingEmployee)
        .eq('emp_id', editingEmployee.emp_id);
      
      if (error) throw error;
      toast.success('Employee updated successfully');
      setIsUpdateDialogOpen(false);
      fetchEmployees();
    } catch (error) {
      toast.error('Error updating employee: ' + error.message);
    }
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.emp_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Employee Management</h1>
      
      {/* Add Employee Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add New Employee</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ... (keep the existing form fields) */}
            <Button type="submit">Add Employee</Button>
          </form>
        </CardContent>
      </Card>

      {/* Employee List */}
      <Card>
        <CardHeader>
          <CardTitle>Employee List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={handleSearch}
              className="max-w-sm"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Employee ID</TableHead>
                <TableHead>
                  <button onClick={() => handleSort('name')} className="flex items-center">
                    Name <ArrowUpDown className="ml-2 h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentEmployees.map((employee) => (
                <TableRow key={employee.emp_id}>
                  <TableCell className="font-medium">{employee.emp_id}</TableCell>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.designation}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => handleUpdate(employee)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(employee.emp_id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 flex justify-between items-center">
            <div>
              Showing {indexOfFirstEmployee + 1} to {Math.min(indexOfLastEmployee, filteredEmployees.length)} of {filteredEmployees.length} employees
            </div>
            <div className="space-x-2">
              <Button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                onClick={() => paginate(currentPage + 1)}
                disabled={indexOfLastEmployee >= filteredEmployees.length}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Update Employee Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Employee</DialogTitle>
          </DialogHeader>
          {editingEmployee && (
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editingEmployee.name}
                  onChange={(e) => setEditingEmployee({...editingEmployee, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-designation">Designation</Label>
                <Input
                  id="edit-designation"
                  value={editingEmployee.designation}
                  onChange={(e) => setEditingEmployee({...editingEmployee, designation: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  value={editingEmployee.email}
                  onChange={(e) => setEditingEmployee({...editingEmployee, email: e.target.value})}
                />
              </div>
              <DialogFooter>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeManagement;