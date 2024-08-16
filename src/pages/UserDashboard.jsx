import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Calendar, FileText, TrendingUp, Bell } from 'lucide-react';
import Header from '../components/Header';

const UserDashboard = ({ employeeData }) => {
  const profilePicture = employeeData.employee_documents?.find(doc => doc.document_type === 'profile_picture')?.document_url;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
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
      </main>
    </div>
  );
};

export default UserDashboard;