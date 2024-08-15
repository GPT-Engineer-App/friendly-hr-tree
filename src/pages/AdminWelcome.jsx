import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminWelcome = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Welcome, Admin!</h1>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Welcome to the new admin dashboard. Here you can manage users and employees efficiently.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Recent Updates</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5">
            <li>Implemented admin dashboard with welcome screen</li>
            <li>Added sidebar navigation for user and employee management</li>
            <li>Integrated logout functionality across all screens</li>
            <li>Enhanced user management features</li>
            <li>Improved overall application structure and navigation</li>
            <li>Updated user creation form with compact layout and password visibility toggle</li>
            <li>Added password visibility toggle to the edit user pop-up window</li>
            <li>Implemented search functionality for users by email in the User Management section</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminWelcome;