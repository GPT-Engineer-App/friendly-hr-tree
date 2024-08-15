import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Calendar, FileText, TrendingUp, Bell } from 'lucide-react';
import Header from '../components/Header';

const UserDashboard = () => {
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
                <p>Name: John Doe</p>
                <p>Email: john.doe@example.com</p>
                <p>Department: IT</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" /> Attendance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Present Days: 22</p>
                <p>Absent Days: 1</p>
                <p>Leave Balance: 10 days</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" /> Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Pending: 2</p>
                <p>Approved: 5</p>
                <p>Rejected: 0</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4" /> KPIs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Performance Score: 85%</p>
                <p>Goals Achieved: 4/5</p>
                <p>Next Review: 15 days</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="mr-2 h-4 w-4" /> Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul>
                  <li>Team Meeting - 2 days</li>
                  <li>Project Deadline - 1 week</li>
                  <li>Company Picnic - 2 weeks</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;