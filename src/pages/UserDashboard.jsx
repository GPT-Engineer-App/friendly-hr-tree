import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { LogOut, User, Calendar, FileText, TrendingUp, Bell } from 'lucide-react';

const UserDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/login');
    } catch (error) {
      toast.error('Error logging out: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">User Dashboard</h1>
          <Button onClick={handleLogout} variant="ghost">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </header>
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