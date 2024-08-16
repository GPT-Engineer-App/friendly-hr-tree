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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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

      // 1. Create employee record
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .insert([newEmployee])
        .select();

      if (employeeError) {
        console.error('Employee creation error:', employeeError);
        throw new Error(`Error creating employee: ${employeeError.message}`);
      }

      const employeeId = employeeData[0].emp_id;

      // 2. Create folder reference in storage_paths
      const folderPath = employeeId.replace(/\//g, '_');
      const { error: storagePathError } = await supabase
        .from('storage_paths')
        .insert([{ 
          emp_id: employeeId, 
          folder_path: folderPath,
          folder_type: 'employee' // Add this line
        }]);

      if (storagePathError) {
        console.error('Storage path error:', storagePathError);
        throw new Error(`Error creating storage path: ${storagePathError.message}`);
      }

      // 3. Upload profile picture if provided
      if (profilePicture) {
        const fileExt = profilePicture.name.split('.').pop();
        const filePath = `${folderPath}/profile_picture.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('employees_info')
          .upload(filePath, profilePicture);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error(`Error uploading profile picture: ${uploadError.message}`);
        }

        // 4. Get the public URL of the uploaded file
        const { data: urlData } = supabase.storage
          .from('employees_info')
          .getPublicUrl(filePath);

        // 5. Store the URL in employee_documents
        const { error: docError } = await supabase
          .from('employee_documents')
          .insert({
            emp_id: employeeId,
            file_name: 'profile_picture',
            file_path: filePath,
            file_type: fileExt,
            uploaded_by: 'system',
            file_url: urlData.publicUrl
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

      toast.success('Employee updated successfully');
      setEditingEmployee(null);
      fetchEmployees();
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

      toast.success('Employee deleted successfully');
      fetchEmployees();
    } catch (error) {
      toast.error('Error deleting employee: ' + error.message);
    }
  };

  return (
    // ... (keep the existing JSX)
  );
};

export default EmployeeManagement;