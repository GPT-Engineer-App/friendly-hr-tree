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
            <li>Enhanced responsive design for User Management interface</li>
            <li>Added export functionality for user data (CSV and PDF formats)</li>
            <li>Implemented pagination for the user list to handle large numbers of users</li>
            <li>Added sorting options for user list (by email)</li>
            <li>Improved overall responsiveness of the User Management interface</li>
            <li>Implemented Employee Management functionality with form for adding new employees</li>
            <li>Added profile picture upload feature for new employees</li>
            <li>Integrated Supabase storage for employee documents and profile pictures</li>
            <li>Implemented automatic folder creation for employee documents in Supabase storage</li>
            <li>Added error handling and success notifications for employee creation process</li>
            <li>Optimized storage paths for employee documents and profile pictures</li>
            <li>Enhanced Employee Management with inline editing for all fields</li>
            <li>Implemented expandable rows for detailed employee information</li>
            <li>Added date picker for date fields in inline editing</li>
            <li>Improved address editing with a modal for better user experience</li>
            <li>Updated profile picture upload in both add and edit functionalities</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminWelcome;