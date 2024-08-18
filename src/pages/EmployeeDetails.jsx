import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../integrations/supabase';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Check, X, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const EmployeeDetails = () => {
  const { empId } = useParams();
  const [employee, setEmployee] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);

  useEffect(() => {
    fetchEmployeeDetails();
    fetchEmployeeDocuments();
  }, [empId]);

  const fetchEmployeeDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('emp_id, name, official_email, designation, kyc_status')
        .eq('emp_id', empId)
        .single();

      if (error) throw error;
      setEmployee(data);
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

  const updateDocumentStatus = async (documentId, newStatus, reason = null) => {
    try {
      const updateData = { status: newStatus };
      if (reason) {
        updateData.reject_reason = reason;
      }

      const { error } = await supabase
        .from('employee_documents')
        .update(updateData)
        .eq('id', documentId);

      if (error) throw error;
      toast.success(`Document ${newStatus}`);
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
      setEmployee(prev => ({ ...prev, kyc_status: newStatus }));
      toast.success(`KYC status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating KYC status:', error);
      toast.error('Failed to update KYC status');
    }
  };

  const handleReject = (documentId) => {
    setSelectedDocumentId(documentId);
    setShowRejectDialog(true);
  };

  const confirmReject = () => {
    if (selectedDocumentId) {
      updateDocumentStatus(selectedDocumentId, 'Rejected', rejectReason);
      setShowRejectDialog(false);
      setRejectReason('');
      setSelectedDocumentId(null);
    }
  };

  if (!employee) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Employee Details</h2>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Employee Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Employee ID:</strong> {employee.emp_id}</p>
          <p><strong>Name:</strong> {employee.name}</p>
          <p><strong>Official Email:</strong> {employee.official_email}</p>
          <p><strong>Designation:</strong> {employee.designation}</p>
          <p><strong>KYC Status:</strong> 
            <span className={`font-bold ${
              employee.kyc_status === 'Approved' ? 'text-green-600' :
              employee.kyc_status === 'Rejected' ? 'text-red-600' :
              'text-yellow-600'
            }`}>
              {employee.kyc_status}
            </span>
          </p>
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
                  <TableCell>
                    <span className={`font-bold ${
                      doc.status === 'Verified' ? 'text-green-600' :
                      doc.status === 'Rejected' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {doc.status}
                    </span>
                    {doc.status === 'Rejected' && doc.reject_reason && (
                      <p className="text-sm text-red-600">Reason: {doc.reject_reason}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <a href={doc.document_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline">
                          <ExternalLink className="h-4 w-4 mr-2" /> View
                        </Button>
                      </a>
                      {doc.status !== 'Verified' && (
                        <Button onClick={() => updateDocumentStatus(doc.id, 'Verified')} className="bg-green-500 hover:bg-green-600">
                          <Check className="h-4 w-4 mr-2" /> Verify
                        </Button>
                      )}
                      {doc.status !== 'Rejected' && (
                        <Button onClick={() => handleReject(doc.id)} variant="destructive">
                          <X className="h-4 w-4 mr-2" /> Reject
                        </Button>
                      )}
                    </div>
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
              onClick={() => updateKycStatus('Approved')}
              className="bg-green-500 hover:bg-green-600"
            >
              Approve KYC
            </Button>
            <Button
              onClick={() => updateKycStatus('Rejected')}
              variant="destructive"
            >
              Reject KYC
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Document</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rejectReason" className="text-right">
                Reason
              </Label>
              <Input
                id="rejectReason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmReject} variant="destructive">
              Confirm Reject
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeDetails;