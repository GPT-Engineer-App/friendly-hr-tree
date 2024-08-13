import { Users, Briefcase, FileText, Settings } from "lucide-react";
import Index from "./pages/Index.jsx";

export const navItems = [
  {
    title: "Employees",
    to: "/",
    icon: <Users className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "Departments",
    to: "/departments",
    icon: <Briefcase className="h-4 w-4" />,
    page: null, // We'll create this page later
  },
  {
    title: "Leave Management",
    to: "/leave-management",
    icon: <FileText className="h-4 w-4" />,
    page: null, // We'll create this page later
  },
  {
    title: "Settings",
    to: "/settings",
    icon: <Settings className="h-4 w-4" />,
    page: null, // We'll create this page later
  },
];