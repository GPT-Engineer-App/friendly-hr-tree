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
      setEmployees(data);
    } catch (error) {
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
        console.error('Employee creation error:', employeeError);
        throw new Error(`Error creating employee: ${employeeError.message}`);
      }

      setEmployees(prevEmployees => [...prevEmployees, employeeData[0]]);

      if (profilePicture) {
        const fileExt = profilePicture.name.split('.').pop();
        const formattedEmpId = newEmployee.emp_id.replace(/\//g, '_');
        const fileName = `${formattedEmpId}/profile_picture.${fileExt}`;

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('employees_info')
          .upload(fileName, profilePicture);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error(`Error uploading profile picture: ${uploadError.message}`);
        }

        const { data: urlData } = supabase.storage
          .from('employees_info')
          .getPublicUrl(fileName);

        const { error: docError } = await supabase
          .from('employee_documents')
          .insert({
            emp_id: newEmployee.emp_id,
            document_type: 'profile_picture',
            document_url: urlData.publicUrl
          });

        if (docError) {
          console.error('Document error:', docError);
          throw new Error(`Error storing document information: ${docError.message}`);
        }
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
  };

  const handleSaveUpdate = async () => {
    try {
      const { error } = await supabase
        .from('employees')
        .update(editingEmployee)
        .eq('emp_id', editingEmployee.emp_id);

      if (error) throw error;

      setEmployees(prevEmployees => 
        prevEmployees.map(emp => 
          emp.emp_id === editingEmployee.emp_id ? editingEmployee : emp
        )
      );

      toast.success('Employee updated successfully');
      setEditingEmployee(null);
    } catch (error) {
      toast.error('Error updating employee: ' + error.message);
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
      toast.error('Error deleting employee: ' + error.message);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Employee Management</h2>
      
      {/* Add Employee Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add New Employee</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ... (form fields remain unchanged) ... */}
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

      {/* Edit Employee Dialog */}
      {editingEmployee && (
        <Dialog open={!!editingEmployee} onOpenChange={() => setEditingEmployee(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Employee</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveUpdate(); }} className="space-y-4">
              {/* ... (edit form fields remain unchanged) ... */}
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default EmployeeManagement;