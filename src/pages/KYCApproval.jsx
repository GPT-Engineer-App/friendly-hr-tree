import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Search, Check, X, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Link } from 'react-router-dom';

const documentTypes = {
  aadhar: 'Aadhar Card',
  pan: 'PAN Card',
  '10th_marksheet': '10th Marksheet',
  '12th_marksheet': '12th Marksheet',
  ug_degree: 'UG Degree',
  pg_degree: 'PG Degree',
  diploma: 'Diploma',
  other_certificates: 'Other Course Certificates',
  bank_passbook: 'Bank Passbook (Front Page)',
};

const KYCApproval = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*');

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

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.emp_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">KYC Document Approval</h2>
      
      <div className="mb-4">
        <Input
          placeholder="Search by employee name or ID..."
          value={searchTerm}
          onChange={handleSearch}
          className="max-w-sm"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee Name</TableHead>
            <TableHead>Employee ID</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEmployees.map((emp) => (
            <TableRow key={emp.id}>
              <TableCell>{emp.name}</TableCell>
              <TableCell>
                <Link to={`/admin/kyc-approval/${emp.emp_id}`} className="text-blue-600 hover:underline">
                  {emp.emp_id}
                </Link>
              </TableCell>
              <TableCell>
                <Link to={`/admin/kyc-approval/${emp.emp_id}`}>
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" /> View Documents
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Employee Documents</DialogTitle>
            <DialogDescription>
              Review and approve KYC documents for the selected employee.
            </DialogDescription>
          </DialogHeader>
          {selectedEmployee && (
            <div>
              <h3 className="text-lg font-semibold mb-2">{selectedEmployee.name}</h3>
              <p className="mb-4">Employee ID: {selectedEmployee.emp_id}</p>
              {/* Add more content for document review here */}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KYCApproval;