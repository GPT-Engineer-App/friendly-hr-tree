import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, Calendar, ChartBar } from 'lucide-react';

const DashboardCard = ({ title, value, icon }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const Index = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">HRMS Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <DashboardCard title="Total Employees" value="120" icon={<Users className="h-4 w-4 text-muted-foreground" />} />
        <DashboardCard title="Open Positions" value="5" icon={<Briefcase className="h-4 w-4 text-muted-foreground" />} />
        <DashboardCard title="Upcoming Reviews" value="8" icon={<Calendar className="h-4 w-4 text-muted-foreground" />} />
        <DashboardCard title="Department Performance" value="92%" icon={<ChartBar className="h-4 w-4 text-muted-foreground" />} />
      </div>
      <div className="flex space-x-4">
        <Button>View Employees</Button>
        <Button variant="outline">Manage Departments</Button>
      </div>
    </div>
  );
};

export default Index;