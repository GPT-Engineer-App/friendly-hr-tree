import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../integrations/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, ArrowUpDown, Edit, Trash2, Save, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [newEmployee, setNewEmployee] = useState({
    emp_id: '',
    name: '',
    designation: '',
    date_of_joining: '',
    phone_no: '',
    email: '',
    official_email: '',
    address: '',
    dob: '',
    emergency_contact_no: ''
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editProfilePicture, setEditProfilePicture] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      let query = supabase.from('employees').select('*');
      
      if (sortField) {
        query = query.order(sortField, { ascending: sortDirection === 'asc' });
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Error fetching employees: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      if (!newEmployee.emp_id || !newEmployee.name || !newEmployee.email || !newEmployee.official_email) {
        throw new Error("Employee ID, Name, Email, and Official Email are required fields.");
      }

      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .insert([newEmployee])
        .select();

      if (employeeError) {
        if (employeeError.code === '23505') {
          throw new Error("An employee with this Employee ID, Email, or Official Email already exists. Please use unique values for these fields.");
        }
        throw employeeError;
      }

      if (profilePicture) {
        const fileExt = profilePicture.name.split('.').pop();
        const folderName = newEmployee.emp_id.replace(/\//g, '');
        const fileName = `${folderName}/profile_picture.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('employees_info')
          .upload(fileName, profilePicture);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('employees_info')
          .getPublicUrl(fileName);

        await supabase
          .from('employee_documents')
          .insert({
            emp_id: newEmployee.emp_id,
            document_type: 'profile_picture',
            document_url: urlData.publicUrl
          });
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
        official_email: '',
        address: '',
        dob: '',
        emergency_contact_no: ''
      });
      setProfilePicture(null);
    } catch (error) {
      console.error('Error adding employee:', error);
      setErrorMessage(error.message || 'An unexpected error occurred while adding the employee. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee(prev => ({ ...prev, [name]: value }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
    }
  };

  const handleSort = (field) => {
    setSortField(field);
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    fetchEmployees();
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.emp_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditEmployee = (employee) => {
    setEditingEmployee({ ...employee });
    setIsEditDialogOpen(true);
  };

  const handleUpdateEmployee = async () => {
    try {
      const { emp_id, ...updateData } = editingEmployee;
      const { error } = await supabase
        .from('employees')
        .update(updateData)
        .eq('emp_id', emp_id);

      if (error) throw error;

      toast.success('Employee updated successfully');
      setIsEditDialogOpen(false);
      fetchEmployees();
    } catch (error) {
      console.error('Error updating employee:', error);
      toast.error('Error updating employee: ' + error.message);
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingEmployee(prev => ({ ...prev, [name]: value }));
  };

  const handleDeleteEmployee = async (id) => {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Employee deleted successfully');
      fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Error deleting employee: ' + error.message);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Employee Management</h2>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add New Employee</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{errorMessage}</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
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
                <Input id="designation" name="designation" value={newEmployee.designation} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="date_of_joining">Date of Joining</Label>
                <Input id="date_of_joining" name="date_of_joining" type="date" value={newEmployee.date_of_joining} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="phone_no">Phone Number</Label>
                <Input id="phone_no" name="phone_no" value={newEmployee.phone_no} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" name="dob" type="date" value={newEmployee.dob} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="emergency_contact_no">Emergency Contact</Label>
                <Input id="emergency_contact_no" name="emergency_contact_no" value={newEmployee.emergency_contact_no} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="profile_picture">Profile Picture</Label>
                <Input id="profile_picture" type="file" onChange={handleProfilePictureChange} accept="image/*" />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" name="address" value={newEmployee.address} onChange={handleInputChange} />
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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.emp_id}>
                  <TableCell>
                    <Link to={`/admin/employee-documents/${employee.emp_id}`} className="text-blue-600 hover:underline">
                      {employee.emp_id}
                    </Link>
                  </TableCell>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.designation}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleEditEmployee(employee)} className="mr-2">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" onClick={() => handleDeleteEmployee(employee.emp_id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          {editingEmployee && (
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateEmployee(); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_emp_id">Employee ID</Label>
                  <Input id="edit_emp_id" name="emp_id" value={editingEmployee.emp_id} onChange={handleEditInputChange} required disabled />
                </div>
                <div>
                  <Label htmlFor="edit_name">Name</Label>
                  <Input id="edit_name" name="name" value={editingEmployee.name} onChange={handleEditInputChange} required />
                </div>
                <div>
                  <Label htmlFor="edit_email">Personal Email</Label>
                  <Input id="edit_email" name="email" type="email" value={editingEmployee.email} onChange={handleEditInputChange} required />
                </div>
                <div>
                  <Label htmlFor="edit_official_email">Official Email</Label>
                  <Input id="edit_official_email" name="official_email" type="email" value={editingEmployee.official_email} onChange={handleEditInputChange} required />
                </div>
                <div>
                  <Label htmlFor="edit_designation">Designation</Label>
                  <Input id="edit_designation" name="designation" value={editingEmployee.designation} onChange={handleEditInputChange} />
                </div>
                <div>
                  <Label htmlFor="edit_date_of_joining">Date of Joining</Label>
                  <Input id="edit_date_of_joining" name="date_of_joining" type="date" value={editingEmployee.date_of_joining} onChange={handleEditInputChange} />
                </div>
                <div>
                  <Label htmlFor="edit_phone_no">Phone Number</Label>
                  <Input id="edit_phone_no" name="phone_no" value={editingEmployee.phone_no} onChange={handleEditInputChange} />
                </div>
                <div>
                  <Label htmlFor="edit_dob">Date of Birth</Label>
                  <Input id="edit_dob" name="dob" type="date" value={editingEmployee.dob} onChange={handleEditInputChange} />
                </div>
                <div>
                  <Label htmlFor="edit_emergency_contact_no">Emergency Contact</Label>
                  <Input id="edit_emergency_contact_no" name="emergency_contact_no" value={editingEmployee.emergency_contact_no} onChange={handleEditInputChange} />
                </div>
              </div>
              <div>
                <Label htmlFor="edit_address">Address</Label>
                <Textarea id="edit_address" name="address" value={editingEmployee.address} onChange={handleEditInputChange} />
              </div>
              <DialogFooter>
                <Button type="submit">Update Employee</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeManagement;