import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Check, X, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const EmployeeDetails = () => {
  const { empId } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedEmployee, setEditedEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEmployeeDetails();
    fetchEmployeeDocuments();
  }, [empId]);

  const fetchEmployeeDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('emp_id', empId)
        .single();

      if (error) throw error;
      setEmployee(data);
      setEditedEmployee(data);
    } catch (error) {
      console.error('Error fetching employee details:', error);
      setError('Failed to fetch employee details. Please try again.');
      toast.error('Failed to fetch employee details');
    } finally {
      setIsLoading(false);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedEmployee(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('employees')
        .update(editedEmployee)
        .eq('emp_id', empId);

      if (error) throw error;
      toast.success('Employee information updated successfully');
      setEmployee(editedEmployee);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating employee:', error);
      toast.error('Failed to update employee information');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  if (!employee) {
    return <div className="flex justify-center items-center h-screen">No employee found</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Employee Details</h2>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Employee Information</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emp_id">Employee ID</Label>
                  <Input id="emp_id" name="emp_id" value={editedEmployee.emp_id} onChange={handleInputChange} required />
                </div>
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" value={editedEmployee.name} onChange={handleInputChange} required />
                </div>
                <div>
                  <Label htmlFor="email">Personal Email</Label>
                  <Input id="email" name="email" type="email" value={editedEmployee.email} onChange={handleInputChange} required />
                </div>
                <div>
                  <Label htmlFor="official_email">Official Email</Label>
                  <Input id="official_email" name="official_email" type="email" value={editedEmployee.official_email} onChange={handleInputChange} required />
                </div>
                <div>
                  <Label htmlFor="designation">Designation</Label>
                  <Input id="designation" name="designation" value={editedEmployee.designation} onChange={handleInputChange} required />
                </div>
                <div>
                  <Label htmlFor="date_of_joining">Date of Joining</Label>
                  <Input id="date_of_joining" name="date_of_joining" type="date" value={editedEmployee.date_of_joining} onChange={handleInputChange} required />
                </div>
                <div>
                  <Label htmlFor="phone_no">Phone Number</Label>
                  <Input id="phone_no" name="phone_no" value={editedEmployee.phone_no} onChange={handleInputChange} required />
                </div>
                <div>
                  <Label htmlFor="emergency_contact_no">Emergency Contact</Label>
                  <Input id="emergency_contact_no" name="emergency_contact_no" value={editedEmployee.emergency_contact_no} onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input id="dob" name="dob" type="date" value={editedEmployee.dob} onChange={handleInputChange} />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" name="address" value={editedEmployee.address} onChange={handleInputChange} />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="submit">Save Changes</Button>
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              </div>
            </form>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <p><strong>Employee ID:</strong> {employee.emp_id}</p>
                <p><strong>Name:</strong> {employee.name}</p>
                <p><strong>Personal Email:</strong> {employee.email}</p>
                <p><strong>Official Email:</strong> {employee.official_email}</p>
                <p><strong>Designation:</strong> {employee.designation}</p>
                <p><strong>Date of Joining:</strong> {employee.date_of_joining}</p>
                <p><strong>Phone Number:</strong> {employee.phone_no}</p>
                <p><strong>Emergency Contact:</strong> {employee.emergency_contact_no}</p>
                <p><strong>Date of Birth:</strong> {employee.dob}</p>
              </div>
              <p className="mt-4"><strong>Address:</strong> {employee.address}</p>
              <p className="mt-4"><strong>KYC Status:</strong> 
                <span className={`font-bold ${
                  employee.kyc_status === 'Approved' ? 'text-green-600' :
                  employee.kyc_status === 'Rejected' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {employee.kyc_status}
                </span>
              </p>
              <Button onClick={() => setIsEditing(true)} className="mt-4">Edit</Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Document Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
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
                      <div className="flex flex-wrap gap-2">
                        <a href={doc.document_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" className="w-full sm:w-auto">
                            <ExternalLink className="h-4 w-4 mr-2" /> View
                          </Button>
                        </a>
                        {doc.status !== 'Verified' && (
                          <Button onClick={() => updateDocumentStatus(doc.id, 'Verified')} className="bg-green-500 hover:bg-green-600 w-full sm:w-auto">
                            <Check className="h-4 w-4 mr-2" /> Verify
                          </Button>
                        )}
                        {doc.status !== 'Rejected' && (
                          <Button onClick={() => handleReject(doc.id)} variant="destructive" className="w-full sm:w-auto">
                            <X className="h-4 w-4 mr-2" /> Reject
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Update KYC Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => updateKycStatus('Approved')}
              className="bg-green-500 hover:bg-green-600 w-full sm:w-auto"
            >
              Approve KYC
            </Button>
            <Button
              onClick={() => updateKycStatus('Rejected')}
              variant="destructive"
              className="w-full sm:w-auto"
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