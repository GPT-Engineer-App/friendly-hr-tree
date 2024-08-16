import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Upload, FileCheck, AlertCircle } from 'lucide-react';

const documentTypes = [
  { id: 'aadhar', name: 'Aadhar Card' },
  { id: 'pan', name: 'PAN Card' },
  { id: '10th_marksheet', name: '10th Marksheet' },
  { id: '12th_marksheet', name: '12th Marksheet' },
  { id: 'ug_degree', name: 'UG Degree' },
  { id: 'pg_degree', name: 'PG Degree' },
  { id: 'diploma', name: 'Diploma' },
  { id: 'other_certificates', name: 'Other Course Certificates' },
  { id: 'bank_passbook', name: 'Bank Passbook (Front Page)' },
];

const KYCDocumentUpload = ({ employeeData }) => {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [employeeData]);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('employee_documents')
        .select('*')
        .eq('emp_id', employeeData.emp_id);

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to fetch documents');
    }
  };

  const handleFileUpload = async (e, documentType) => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const folderName = employeeData.emp_id.replace(/\//g, '');
      const fileName = `${folderName}/${documentType.id}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('employees_info')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('employees_info')
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase
        .from('employee_documents')
        .upsert({
          emp_id: employeeData.emp_id,
          document_type: documentType.id,
          document_url: urlData.publicUrl,
          status: 'pending'
        }, { onConflict: ['emp_id', 'document_type'] });

      if (insertError) throw insertError;

      toast.success(`${documentType.name} uploaded successfully`);
      fetchDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error(`Failed to upload ${documentType.name}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">KYC Documents</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Document Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documentTypes.map((docType) => {
            const existingDoc = documents.find(doc => doc.document_type === docType.id);
            return (
              <TableRow key={docType.id}>
                <TableCell>{docType.name}</TableCell>
                <TableCell>
                  {existingDoc ? (
                    <span className={`inline-flex items-center ${
                      existingDoc.status === 'approved' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {existingDoc.status === 'approved' ? (
                        <FileCheck className="mr-1 h-4 w-4" />
                      ) : (
                        <AlertCircle className="mr-1 h-4 w-4" />
                      )}
                      {existingDoc.status.charAt(0).toUpperCase() + existingDoc.status.slice(1)}
                    </span>
                  ) : 'Not Uploaded'}
                </TableCell>
                <TableCell>
                  {existingDoc ? (
                    <a href={existingDoc.document_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      View Document
                    </a>
                  ) : (
                    <div className="relative">
                      <Input
                        type="file"
                        onChange={(e) => handleFileUpload(e, docType)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploading}
                      />
                      <Button variant="outline" className="w-full">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default KYCDocumentUpload;