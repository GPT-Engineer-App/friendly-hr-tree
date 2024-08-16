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

  // ... rest of the component code ...

};

export default EmployeeManagement;