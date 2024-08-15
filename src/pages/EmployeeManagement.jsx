import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const EmployeeManagement = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Employee Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>Employee List</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Employee management features will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeManagement;