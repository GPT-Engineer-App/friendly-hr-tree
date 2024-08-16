import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Calendar, FileText, TrendingUp, Bell, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const EmployeeInfo = ({ employeeData }) => {
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const profilePicture = employeeData.employee_documents?.find(doc => doc.document_type === 'profile_picture')?.document_url;

  const toggleMoreInfo = () => setShowMoreInfo(!showMoreInfo);

  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-3xl font-bold mb-6">Employee Information</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-4 w-4" /> User Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profilePicture && (
              <img src={profilePicture} alt="Profile" className="w-32 h-32 rounded-full mb-4 mx-auto object-cover" />
            )}
            <p>Name: {employeeData.name}</p>
            <p>Email: {employeeData.official_email}</p>
            <p>Department: {employeeData.designation}</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="mt-4">
                  {showMoreInfo ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
                  {showMoreInfo ? "Show Less" : "Show More"}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Detailed Employee Information</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <p>Employee ID: {employeeData.emp_id}</p>
                  <p>Personal Email: {employeeData.email}</p>
                  <p>Phone: {employeeData.phone_no}</p>
                  <p>Date of Birth: {employeeData.dob}</p>
                  <p>Date of Joining: {employeeData.date_of_joining}</p>
                  <p>Address: {employeeData.address}</p>
                  <p>Emergency Contact: {employeeData.emergency_contact_no}</p>
                </div>
              </DialogContent>
            </Dialog>
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
    </div>
  );
};

export default EmployeeInfo;