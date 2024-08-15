import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase';
import { Button } from "@/components/ui/button";
import { LogOut } from 'lucide-react';
import { toast } from "sonner";

const Header = () => {
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
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">TSVGlobal HR Connect</h1>
        <Button onClick={handleLogout} variant="ghost">
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </div>
    </header>
  );
};

export default Header;