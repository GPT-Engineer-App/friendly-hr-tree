import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../integrations/supabase';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Check, X } from 'lucide-react';

const EmployeeDetails = () => {
  const { empId } = useParams();
  const [employee, setEmployee] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [kycStatus, setKycStatus] = useState('pending');

  useEffect(() => {
    fetchEmployeeDetails();
    fetchEmployeeDocuments();
  }, [empId]);

  const fetchEmployeeDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('emp_id', empId)
        .single();

      if (error) throw error;
      setEmployee(data);
      setKycStatus(data.kyc_status || 'pending');
    } catch (error) {
      console.error('Error fetching employee details:', error);
      toast.error('Failed to fetch employee details');
    }
  };

  const fetchEmployeeDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('employee_documents')
        .select('*')
        .eq('emp_id', empId);

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching employee documents:', error);
      toast.error('Failed to fetch employee documents');
    }
  };

  const updateDocumentStatus = async (documentId, newStatus) => {
    try {
      const { error } = await supabase
        .from('employee_documents')
        .update({ status: newStatus })
        .eq('id', documentId);

      if (error) throw error;
      toast.success(`Document status updated to ${newStatus}`);
      fetchEmployeeDocuments();
    } catch (error) {
      console.error('Error updating document status:', error);
      toast.error('Failed to update document status');
    }
  };

  const updateKycStatus = async (newStatus) => {
    try {
      const { error } = await supabase
        .from('employees')
        .update({ kyc_status: newStatus })
        .eq('emp_id', empId);

      if (error) throw error;
      setKycStatus(newStatus);
      toast.success(`KYC status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating KYC status:', error);
      toast.error('Failed to update KYC status');
    }
  };

  if (!employee) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Employee Details - {employee.name}</h2>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Employee Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Employee ID:</strong> {employee.emp_id}</p>
          <p><strong>Name:</strong> {employee.name}</p>
          <p><strong>Email:</strong> {employee.email}</p>
          <p><strong>Designation:</strong> {employee.designation}</p>
          <p><strong>KYC Status:</strong> {kycStatus}</p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Document Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>{doc.document_type}</TableCell>
                  <TableCell>{doc.status}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() => updateDocumentStatus(doc.id, 'verified')}
                      className="mr-2 bg-green-500 hover:bg-green-600"
                    >
                      <Check className="h-4 w-4 mr-2" /> Verify
                    </Button>
                    <Button
                      onClick={() => updateDocumentStatus(doc.id, 'rejected')}
                      variant="destructive"
                    >
                      <X className="h-4 w-4 mr-2" /> Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Update KYC Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Button
              onClick={() => updateKycStatus('approved')}
              className="bg-green-500 hover:bg-green-600"
            >
              Approve KYC
            </Button>
            <Button
              onClick={() => updateKycStatus('rejected')}
              variant="destructive"
            >
              Reject KYC
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeDetails;