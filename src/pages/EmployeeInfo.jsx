import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Calendar, FileText, TrendingUp, Bell, ChevronDown, ChevronUp, Mail, Phone, MapPin, Briefcase, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import KYCDocumentUpload from '../components/KYCDocumentUpload';

const EmployeeInfo = ({ employeeData }) => {
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const profilePicture = employeeData.employee_documents?.find(doc => doc.document_type === 'profile_picture')?.document_url;

  const toggleMoreInfo = () => setShowMoreInfo(!showMoreInfo);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-3xl font-bold mb-6">Employee Information</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-4 w-4" /> User Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              {profilePicture && (
                <img src={profilePicture} alt="Profile" className="w-32 h-32 rounded-full object-cover" />
              )}
              <div className="flex-grow space-y-2">
                <p className="text-lg font-semibold">{employeeData.name}</p>
                <p className="flex items-center"><Mail className="mr-2 h-4 w-4" /> {employeeData.official_email}</p>
                <p className="flex items-center"><Briefcase className="mr-2 h-4 w-4" /> {employeeData.designation}</p>
                <p className="flex items-center"><Clock className="mr-2 h-4 w-4" /> Employee ID: {employeeData.emp_id}</p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="mt-2">
                      {showMoreInfo ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
                      {showMoreInfo ? "Show Less" : "Show More"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Detailed Employee Information</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <p className="flex items-center"><Mail className="mr-2 h-4 w-4" /> Personal Email: {employeeData.email}</p>
                      <p className="flex items-center"><Phone className="mr-2 h-4 w-4" /> Phone: {employeeData.phone_no}</p>
                      <p className="flex items-center"><Calendar className="mr-2 h-4 w-4" /> Date of Birth: {formatDate(employeeData.dob)}</p>
                      <p className="flex items-center"><Calendar className="mr-2 h-4 w-4" /> Date of Joining: {formatDate(employeeData.date_of_joining)}</p>
                      <p className="flex items-center"><MapPin className="mr-2 h-4 w-4" /> Address: {employeeData.address}</p>
                      <p className="flex items-center"><Phone className="mr-2 h-4 w-4" /> Emergency Contact: {employeeData.emergency_contact_no}</p>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" /> Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Present Days: N/A</p>
            <p>Absent Days: N/A</p>
            <p>Leave Balance: N/A</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-4 w-4" /> Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Pending: N/A</p>
            <p>Approved: N/A</p>
            <p>Rejected: N/A</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-4 w-4" /> KPIs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Performance Score: N/A</p>
            <p>Goals Achieved: N/A</p>
            <p>Next Review: N/A</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-4 w-4" /> Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>No upcoming events</p>
          </CardContent>
        </Card>
      </div>
      
      <KYCDocumentUpload employeeData={employeeData} />
    </div>
  );
};

export default EmployeeInfo;