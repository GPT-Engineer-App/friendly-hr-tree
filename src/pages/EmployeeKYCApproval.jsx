import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../integrations/supabase';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Check, X, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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

const EmployeeKYCApproval = () => {
  const { empId } = useParams();
  const [documents, setDocuments] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);

  useEffect(() => {
    fetchEmployeeAndDocuments();
  }, [empId]);

  const fetchEmployeeAndDocuments = async () => {
    try {
      // Fetch employee details
      const { data: empData, error: empError } = await supabase
        .from('employees')
        .select('*')
        .eq('emp_id', empId)
        .single();

      if (empError) throw empError;
      setEmployee(empData);

      // Fetch employee documents
      const { data: docData, error: docError } = await supabase
        .from('employee_documents')
        .select('*')
        .eq('emp_id', empId);

      if (docError) throw docError;
      setDocuments(docData || []);
    } catch (error) {
      console.error('Error fetching employee data:', error);
      toast.error('Failed to fetch employee data');
    }
  };

  const handleApprove = async (documentId) => {
    try {
      const { error } = await supabase
        .from('employee_documents')
        .update({ status: 'approved' })
        .eq('id', documentId);

      if (error) throw error;
      toast.success('Document approved successfully');
      fetchEmployeeAndDocuments();
    } catch (error) {
      console.error('Error approving document:', error);
      toast.error('Failed to approve document');
    }
  };

  const handleReject = async (documentId) => {
    try {
      const { error } = await supabase
        .from('employee_documents')
        .update({ status: 'rejected' })
        .eq('id', documentId);

      if (error) throw error;
      toast.success('Document rejected');
      fetchEmployeeAndDocuments();
    } catch (error) {
      console.error('Error rejecting document:', error);
      toast.error('Failed to reject document');
    }
  };

  if (!employee) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">KYC Documents for {employee.name} ({employee.emp_id})</h2>

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
              <TableCell>{documentTypes[doc.document_type]}</TableCell>
              <TableCell>{doc.status}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" onClick={() => setSelectedDocument(doc)}>
                        <Eye className="h-4 w-4 mr-2" /> View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Document Preview</DialogTitle>
                      </DialogHeader>
                      {selectedDocument && (
                        <div className="mt-2">
                          <iframe
                            src={selectedDocument.document_url}
                            title="Document Preview"
                            width="100%"
                            height="500px"
                          />
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  {doc.status === 'pending' && (
                    <>
                      <Button onClick={() => handleApprove(doc.id)} className="bg-green-500 hover:bg-green-600">
                        <Check className="h-4 w-4 mr-2" /> Approve
                      </Button>
                      <Button onClick={() => handleReject(doc.id)} variant="destructive">
                        <X className="h-4 w-4 mr-2" /> Reject
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default EmployeeKYCApproval;