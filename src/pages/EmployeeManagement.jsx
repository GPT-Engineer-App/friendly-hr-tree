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
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [inlineEditingEmployee, setInlineEditingEmployee] = useState(null);

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
    try {
      console.log("Starting employee creation process");

      // Basic validation
      if (!newEmployee.emp_id || !newEmployee.name || !newEmployee.email) {
        throw new Error("Employee ID, Name, and Email are required fields.");
      }

      // Insert employee data
      console.log("Inserting new employee data:", newEmployee);
      const { data, error } = await supabase
        .from('employees')
        .insert([newEmployee])
        .select();

      if (error) throw error;
      console.log("Employee inserted successfully:", data);

      const employeeId = data[0].emp_id;
      const sanitizedEmpId = employeeId.replace(/\s+/g, '_').toLowerCase();

      // Create folders
      const folderPath = `${sanitizedEmpId}`;
      const { data: folderData, error: folderError } = await supabase
        .storage
        .from('employees')
        .list(folderPath);

      if (folderError && folderError.message !== 'The resource was not found') {
        throw folderError;
      }

      if (!folderData) {
        await supabase.storage.from('employees').upload(`${folderPath}/.keep`, new Blob(['']));
      }
      console.log("Folders created successfully");

      // Insert storage paths
      const { error: pathError } = await supabase
        .from('employee_storage_paths')
        .insert([
          { emp_id: employeeId, storage_path: folderPath }
        ]);

      if (pathError) throw pathError;
      console.log("Storage paths inserted successfully");

      // Upload profile picture if provided
      if (profilePicture) {
        console.log("Uploading profile picture");
        const fileExt = profilePicture.name.split('.').pop();
        const filePath = `${folderPath}/profile_picture.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('employees')
          .upload(filePath, profilePicture);

        if (uploadError) throw uploadError;
        console.log("Profile picture uploaded successfully");

        // Get public URL for the uploaded file
        const { data: urlData } = supabase.storage
          .from('employees')
          .getPublicUrl(filePath);

        // Update employee record with profile picture URL
        const { error: updateError } = await supabase
          .from('employees')
          .update({ profile_picture_url: urlData.publicUrl })
          .eq('emp_id', employeeId);

        if (updateError) throw updateError;
        console.log("Employee document record updated successfully");
      }

      console.log("The employee creation process was completed successfully.");
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
      console.error("Error in employee creation process:", error);
      toast.error('Error adding employee: ' + error.message);
    }
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
    setEditingEmployee({ ...employee });
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
      // Basic validation
      if (!editingEmployee.name || !editingEmployee.email) {
        throw new Error("Name and Email are required fields.");
      }

      const { error } = await supabase
        .from('employees')
        .update(editingEmployee)
        .eq('emp_id', editingEmployee.emp_id);
      
      if (error) throw error;
      toast.success('Employee updated successfully');
      setEditingEmployee(null);
      fetchEmployees();
    } catch (error) {
      toast.error('Error updating employee: ' + error.message);
    }
  };

  const handleInlineEdit = (employee) => {
    setInlineEditingEmployee({ ...employee });
  };

  const handleInlineEditChange = (e, field) => {
    setInlineEditingEmployee(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleInlineEditSave = async () => {
    try {
      const { error } = await supabase
        .from('employees')
        .update(inlineEditingEmployee)
        .eq('emp_id', inlineEditingEmployee.emp_id);
      
      if (error) throw error;
      toast.success('Employee updated successfully');
      setInlineEditingEmployee(null);
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emp_id">Employee ID</Label>
                <Input
                  id="emp_id"
                  name="emp_id"
                  value={newEmployee.emp_id}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={newEmployee.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  name="designation"
                  value={newEmployee.designation}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="date_of_joining">Date of Joining</Label>
                <Input
                  id="date_of_joining"
                  name="date_of_joining"
                  type="date"
                  value={newEmployee.date_of_joining}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="phone_no">Phone Number</Label>
                <Input
                  id="phone_no"
                  name="phone_no"
                  value={newEmployee.phone_no}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={newEmployee.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={newEmployee.address}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  name="dob"
                  type="date"
                  value={newEmployee.dob}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="emergency_contact_no">Emergency Contact Number</Label>
                <Input
                  id="emergency_contact_no"
                  name="emergency_contact_no"
                  value={newEmployee.emergency_contact_no}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="profile_picture">Profile Picture</Label>
                <Input
                  id="profile_picture"
                  name="profile_picture"
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                />
              </div>
            </div>
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
                  <TableCell>
                    {inlineEditingEmployee && inlineEditingEmployee.emp_id === employee.emp_id ? (
                      <Input
                        value={inlineEditingEmployee.name}
                        onChange={(e) => handleInlineEditChange(e, 'name')}
                      />
                    ) : (
                      employee.name
                    )}
                  </TableCell>
                  <TableCell>
                    {inlineEditingEmployee && inlineEditingEmployee.emp_id === employee.emp_id ? (
                      <Input
                        value={inlineEditingEmployee.designation}
                        onChange={(e) => handleInlineEditChange(e, 'designation')}
                      />
                    ) : (
                      employee.designation
                    )}
                  </TableCell>
                  <TableCell>
                    {inlineEditingEmployee && inlineEditingEmployee.emp_id === employee.emp_id ? (
                      <Input
                        value={inlineEditingEmployee.email}
                        onChange={(e) => handleInlineEditChange(e, 'email')}
                      />
                    ) : (
                      employee.email
                    )}
                  </TableCell>
                  <TableCell>
                    {inlineEditingEmployee && inlineEditingEmployee.emp_id === employee.emp_id ? (
                      <>
                        <Button variant="ghost" size="sm" onClick={handleInlineEditSave}>
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setInlineEditingEmployee(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => handleInlineEdit(employee)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleUpdate(employee)}>
                          Full Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(employee.emp_id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
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

      {/* Full Edit Form */}
      {editingEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Edit Employee</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit_name">Name</Label>
                    <Input
                      id="edit_name"
                      name="name"
                      value={editingEmployee.name}
                      onChange={(e) => setEditingEmployee({...editingEmployee, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_designation">Designation</Label>
                    <Input
                      id="edit_designation"
                      name="designation"
                      value={editingEmployee.designation}
                      onChange={(e) => setEditingEmployee({...editingEmployee, designation: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_date_of_joining">Date of Joining</Label>
                    <Input
                      id="edit_date_of_joining"
                      name="date_of_joining"
                      type="date"
                      value={editingEmployee.date_of_joining}
                      onChange={(e) => setEditingEmployee({...editingEmployee, date_of_joining: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_phone_no">Phone Number</Label>
                    <Input
                      id="edit_phone_no"
                      name="phone_no"
                      value={editingEmployee.phone_no}
                      onChange={(e) => setEditingEmployee({...editingEmployee, phone_no: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_email">Email</Label>
                    <Input
                      id="edit_email"
                      name="email"
                      type="email"
                      value={editingEmployee.email}
                      onChange={(e) => setEditingEmployee({...editingEmployee, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="edit_address">Address</Label>
                    <Textarea
                      id="edit_address"
                      name="address"
                      value={editingEmployee.address}
                      onChange={(e) => setEditingEmployee({...editingEmployee, address: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_dob">Date of Birth</Label>
                    <Input
                      id="edit_dob"
                      name="dob"
                      type="date"
                      value={editingEmployee.dob}
                      onChange={(e) => setEditingEmployee({...editingEmployee, dob: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_emergency_contact_no">Emergency Contact Number</Label>
                    <Input
                      id="edit_emergency_contact_no"
                      name="emergency_contact_no"
                      value={editingEmployee.emergency_contact_no}
                      onChange={(e) => setEditingEmployee({...editingEmployee, emergency_contact_no: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_profile_picture">Update Profile Picture</Label>
                    <Input
                      id="edit_profile_picture"
                      name="profile_picture"
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setEditingEmployee(null)}>Cancel</Button>
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;