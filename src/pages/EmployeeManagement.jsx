import React, { useState, useEffect } from 'react';
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
    try {
      if (!newEmployee.emp_id || !newEmployee.name || !newEmployee.email) {
        throw new Error("Employee ID, Name, and Email are required fields.");
      }

      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .insert([newEmployee])
        .select();

      if (employeeError) {
        if (employeeError.code === '23505') {
          throw new Error("An employee with this Employee ID or Email already exists. Please use a unique Employee ID and Email.");
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
        address: '',
        dob: '',
        emergency_contact_no: ''
      });
      setProfilePicture(null);
    } catch (error) {
      console.error('Error adding employee:', error);
      toast.error(error.message || 'An unexpected error occurred while adding the employee. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    setNewEmployee({ ...newEmployee, [e.target.name]: e.target.value });
  };

  const handleProfilePictureChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  const handleSort = (field) => {
    setSortDirection(sortField === field && sortDirection === 'asc' ? 'desc' : 'asc');
    setSortField(field);
  };

  const handleUpdate = (employee) => {
    setEditingEmployee(employee);
    setEditProfilePicture(null);
  };

  const handleSaveUpdate = async () => {
    try {
      const { error } = await supabase
        .from('employees')
        .update(editingEmployee)
        .eq('emp_id', editingEmployee.emp_id);

      if (error) throw error;

      if (editProfilePicture) {
        const fileExt = editProfilePicture.name.split('.').pop();
        const folderName = editingEmployee.emp_id.replace(/\//g, '');
        const fileName = `${folderName}/profile_picture.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('employees_info')
          .upload(fileName, editProfilePicture, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('employees_info')
          .getPublicUrl(fileName);

        await supabase
          .from('employee_documents')
          .upsert({
            emp_id: editingEmployee.emp_id,
            document_type: 'profile_picture',
            document_url: urlData.publicUrl
          });
      }

      setEmployees(prevEmployees => 
        prevEmployees.map(emp => 
          emp.emp_id === editingEmployee.emp_id ? editingEmployee : emp
        )
      );

      toast.success('Employee updated successfully');
      setEditingEmployee(null);
      setEditProfilePicture(null);
    } catch (error) {
      console.error('Error updating employee:', error);
      toast.error(error.message || 'An unexpected error occurred while updating the employee. Please try again.');
    }
  };

  const handleDelete = async (empId) => {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('emp_id', empId);

      if (error) throw error;

      setEmployees(prevEmployees => prevEmployees.filter(emp => emp.emp_id !== empId));

      toast.success('Employee deleted successfully');
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error(error.message || 'An unexpected error occurred while deleting the employee. Please try again.');
    }
  };

  const handleEditProfilePictureChange = (e) => {
    setEditProfilePicture(e.target.files[0]);
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
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={newEmployee.email} onChange={handleInputChange} required />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" name="address" value={newEmployee.address} onChange={handleInputChange} />
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
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => handleSort('name')}>
                  Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.filter(employee =>
                employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                employee.emp_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                employee.email.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((employee) => (
                <TableRow key={employee.emp_id}>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.emp_id}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleUpdate(employee)} className="mr-2">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => handleDelete(employee.emp_id)} variant="destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {editingEmployee && (
        <Dialog open={!!editingEmployee} onOpenChange={() => setEditingEmployee(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Edit Employee</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveUpdate(); }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_emp_id">Employee ID</Label>
                  <Input id="edit_emp_id" name="emp_id" value={editingEmployee.emp_id} onChange={(e) => setEditingEmployee({...editingEmployee, emp_id: e.target.value})} required />
                </div>
                <div>
                  <Label htmlFor="edit_name">Name</Label>
                  <Input id="edit_name" name="name" value={editingEmployee.name} onChange={(e) => setEditingEmployee({...editingEmployee, name: e.target.value})} required />
                </div>
                <div>
                  <Label htmlFor="edit_designation">Designation</Label>
                  <Input id="edit_designation" name="designation" value={editingEmployee.designation} onChange={(e) => setEditingEmployee({...editingEmployee, designation: e.target.value})} />
                </div>
                <div>
                  <Label htmlFor="edit_date_of_joining">Date of Joining</Label>
                  <Input id="edit_date_of_joining" name="date_of_joining" type="date" value={editingEmployee.date_of_joining} onChange={(e) => setEditingEmployee({...editingEmployee, date_of_joining: e.target.value})} />
                </div>
                <div>
                  <Label htmlFor="edit_phone">Phone Number</Label>
                  <Input id="edit_phone" name="phone_no" value={editingEmployee.phone_no} onChange={(e) => setEditingEmployee({...editingEmployee, phone_no: e.target.value})} />
                </div>
                <div>
                  <Label htmlFor="edit_email">Email</Label>
                  <Input id="edit_email" name="email" type="email" value={editingEmployee.email} onChange={(e) => setEditingEmployee({...editingEmployee, email: e.target.value})} required />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="edit_address">Address</Label>
                  <Textarea id="edit_address" name="address" value={editingEmployee.address} onChange={(e) => setEditingEmployee({...editingEmployee, address: e.target.value})} />
                </div>
                <div>
                  <Label htmlFor="edit_dob">Date of Birth</Label>
                  <Input id="edit_dob" name="dob" type="date" value={editingEmployee.dob} onChange={(e) => setEditingEmployee({...editingEmployee, dob: e.target.value})} />
                </div>
                <div>
                  <Label htmlFor="edit_emergency_contact_no">Emergency Contact</Label>
                  <Input id="edit_emergency_contact_no" name="emergency_contact_no" value={editingEmployee.emergency_contact_no} onChange={(e) => setEditingEmployee({...editingEmployee, emergency_contact_no: e.target.value})} />
                </div>
                <div>
                  <Label htmlFor="edit_profile_picture">Profile Picture</Label>
                  <Input id="edit_profile_picture" type="file" onChange={handleEditProfilePictureChange} accept="image/*" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default EmployeeManagement;