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
      if (user) {
        try {
          const { data, error } = await supabase
            .from('employees')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (error) throw error;
          setEmployeeData(data);
        } catch (error) {
          console.error('Error fetching employee data:', error);
        } finally {
          setLoadingEmployee(false);
        }
      } else {
        setLoadingEmployee(false);
      }
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
            <Route
              path="/admin-dashboard/*"
              element={user?.app_metadata?.is_admin ? <AdminDashboard /> : <Navigate to="/login" />}
            />
            <Route
              path="/user-dashboard"
              element={user && !user.app_metadata?.is_admin && employeeData ? <UserDashboard employeeData={employeeData} /> : <Navigate to="/login" />}
            />
            <Route
              path="/"
              element={
                user ? (
                  user.app_metadata?.is_admin ? (
                    <Navigate to="/admin-dashboard" />
                  ) : (
                    employeeData ? <Navigate to="/user-dashboard" /> : <Navigate to="/login" />
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