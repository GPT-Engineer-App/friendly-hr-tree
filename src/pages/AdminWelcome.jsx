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
            <li>New user management features added</li>
            <li>Employee data import tool now available</li>
            <li>System maintenance scheduled for next weekend</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminWelcome;