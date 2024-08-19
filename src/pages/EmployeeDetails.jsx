import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Check, X, Edit, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const EmployeeDetails = () => {
  const { empId } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (empId) {
      fetchEmployeeDetails();
      fetchEmployeeDocuments();
    } else {
      setError('No employee ID provided');
      setIsLoading(false);
    }
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
      if (data) {
        setEmployee(data);
      } else {
        throw new Error('Employee not found');
      }
    } catch (error) {
      console.error('Error fetching employee details:', error);
      setError('Failed to fetch employee details. Please try again.');
      toast.error('Failed to fetch employee details: ' + error.message);
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
      toast.error('Failed to fetch employee documents: ' + error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmployee(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('employees')
        .update(employee)
        .eq('emp_id', empId);

      if (error) throw error;

      toast.success('Employee information updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving employee:', error);
      toast.error('Failed to save employee information: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/employee-management');
  };

  const handleApprove = async (documentId) => {
    try {
      const { error } = await supabase
        .from('employee_documents')
        .update({ status: 'approved' })
        .eq('id', documentId);

      if (error) throw error;
      toast.success('Document approved successfully');
      fetchEmployeeDocuments();
    } catch (error) {
      console.error('Error approving document:', error);
      toast.error('Failed to approve document: ' + error.message);
    }
  };

  const handleReject = async (documentId, rejectReason) => {
    try {
      const { error } = await supabase
        .from('employee_documents')
        .update({ status: 'rejected', reject_reason: rejectReason })
        .eq('id', documentId);

      if (error) throw error;
      toast.success('Document rejected');
      fetchEmployeeDocuments();
    } catch (error) {
      console.error('Error rejecting document:', error);
      toast.error('Failed to reject document: ' + error.message);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading employee details...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  if (!employee) {
    return <div className="flex justify-center items-center h-screen text-red-500">Employee not found</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Employee Details - {employee.name} ({employee.emp_id})</h2>
      
      <Tabs defaultValue="info" className="w-full">
        <TabsList>
          <TabsTrigger value="info">Employee Information</TabsTrigger>
          <TabsTrigger value="documents">Document Verification</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Employee Information
                <Button onClick={() => setIsEditing(!isEditing)}>
                  {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
                  {isEditing ? 'Save' : 'Edit'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emp_id">Employee ID</Label>
                    <Input id="emp_id" name="emp_id" value={employee.emp_id} onChange={handleInputChange} required disabled />
                  </div>
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" value={employee.name} onChange={handleInputChange} required disabled={!isEditing} />
                  </div>
                  <div>
                    <Label htmlFor="email">Personal Email</Label>
                    <Input id="email" name="email" type="email" value={employee.email} onChange={handleInputChange} required disabled={!isEditing} />
                  </div>
                  <div>
                    <Label htmlFor="official_email">Official Email</Label>
                    <Input id="official_email" name="official_email" type="email" value={employee.official_email} onChange={handleInputChange} required disabled={!isEditing} />
                  </div>
                  <div>
                    <Label htmlFor="designation">Designation</Label>
                    <Input id="designation" name="designation" value={employee.designation} onChange={handleInputChange} required disabled={!isEditing} />
                  </div>
                  <div>
                    <Label htmlFor="date_of_joining">Date of Joining</Label>
                    <Input id="date_of_joining" name="date_of_joining" type="date" value={employee.date_of_joining} onChange={handleInputChange} required disabled={!isEditing} />
                  </div>
                  <div>
                    <Label htmlFor="phone_no">Phone Number</Label>
                    <Input id="phone_no" name="phone_no" value={employee.phone_no} onChange={handleInputChange} required disabled={!isEditing} />
                  </div>
                  <div>
                    <Label htmlFor="emergency_contact_no">Emergency Contact</Label>
                    <Input id="emergency_contact_no" name="emergency_contact_no" value={employee.emergency_contact_no} onChange={handleInputChange} disabled={!isEditing} />
                  </div>
                  <div>
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input id="dob" name="dob" type="date" value={employee.dob} onChange={handleInputChange} disabled={!isEditing} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" name="address" value={employee.address} onChange={handleInputChange} disabled={!isEditing} />
                </div>
                {isEditing && (
                  <div className="flex justify-end space-x-2">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents">
          <Card>
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
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="destructive">
                                    <X className="h-4 w-4 mr-2" /> Reject
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Reject Document</DialogTitle>
                                  </DialogHeader>
                                  <form onSubmit={(e) => {
                                    e.preventDefault();
                                    const reason = e.target.rejectReason.value;
                                    handleReject(doc.id, reason);
                                  }}>
                                    <Label htmlFor="rejectReason">Reason for Rejection</Label>
                                    <Textarea id="rejectReason" name="rejectReason" required />
                                    <Button type="submit" className="mt-2">Submit Rejection</Button>
                                  </form>
                                </DialogContent>
                              </Dialog>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmployeeDetails;