import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import { useSupabaseAuth } from './integrations/supabase/auth';
import { SupabaseProvider } from './integrations/supabase';
import { SupabaseAuthProvider } from './integrations/supabase/auth';
import { supabase } from './integrations/supabase';

const App = () => {
  const { user, loading } = useSupabaseAuth();
  const [employeeData, setEmployeeData] = useState(null);
  const [loadingEmployee, setLoadingEmployee] = useState(true);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (user && !user.app_metadata?.is_admin) {
        try {
          const { data, error } = await supabase
            .from('employees')
            .select('*, employee_documents(*)')
            .eq('official_email', user.email);

          if (error) throw error;

          if (data && data.length > 0) {
            setEmployeeData(data[0]);
          } else {
            console.warn('No employee data found for the current user');
            setEmployeeData(null);
          }
        } catch (error) {
          console.error('Error fetching employee data:', error);
          setEmployeeData(null);
        }
      }
      setLoadingEmployee(false);
    };

    fetchEmployeeData();
  }, [user]);

  if (loading || loadingEmployee) {
    return <div>Loading...</div>;
  }

  return (
    <SupabaseProvider>
      <SupabaseAuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
            
            {/* Admin Routes */}
            <Route
              path="/admin/*"
              element={
                user?.app_metadata?.is_admin ? (
                  <AdminDashboard />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            
            {/* Non-Admin (User) Routes */}
            <Route
              path="/user/*"
              element={
                user && !user.app_metadata?.is_admin ? (
                  <UserDashboard employeeData={employeeData} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            
            {/* Root path redirect */}
            <Route
              path="/"
              element={
                user ? (
                  user.app_metadata?.is_admin ? (
                    <Navigate to="/admin" />
                  ) : (
                    <Navigate to="/user" />
                  )
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
          </Routes>
        </Router>
      </SupabaseAuthProvider>
    </SupabaseProvider>
  );
};

export default App;