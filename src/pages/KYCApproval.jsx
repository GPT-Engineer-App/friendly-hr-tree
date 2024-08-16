import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Search, Check, X, Eye } from 'lucide-react';
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

const KYCApproval = () => {
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocument, setSelectedDocument] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('employee_documents')
        .select('*, employees(name, emp_id)')
        .eq('status', 'pending');

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to fetch documents for approval');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredDocuments = documents.filter(doc =>
    doc.employees.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.employees.emp_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApprove = async (documentId) => {
    try {
      const { error } = await supabase
        .from('employee_documents')
        .update({ status: 'approved' })
        .eq('id', documentId);

      if (error) throw error;
      toast.success('Document approved successfully');
      fetchDocuments();
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
      fetchDocuments();
    } catch (error) {
      console.error('Error rejecting document:', error);
      toast.error('Failed to reject document');
    }
  };

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
            <TableHead>Document Type</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredDocuments.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell>{doc.employees.name}</TableCell>
              <TableCell>{doc.employees.emp_id}</TableCell>
              <TableCell>{documentTypes[doc.document_type]}</TableCell>
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
                  <Button onClick={() => handleApprove(doc.id)} className="bg-green-500 hover:bg-green-600">
                    <Check className="h-4 w-4 mr-2" /> Approve
                  </Button>
                  <Button onClick={() => handleReject(doc.id)} variant="destructive">
                    <X className="h-4 w-4 mr-2" /> Reject
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default KYCApproval;