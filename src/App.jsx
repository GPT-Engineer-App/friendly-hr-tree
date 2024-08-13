import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import { useSupabaseAuth } from './integrations/supabase/auth';

const App = () => {
  const { user, loading } = useSupabaseAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
        <Route
          path="/admin-dashboard/*"
          element={user?.app_metadata?.is_admin ? <AdminDashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/user-dashboard"
          element={user && !user.app_metadata?.is_admin ? <UserDashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/"
          element={
            user ? (
              user.app_metadata?.is_admin ? (
                <Navigate to="/admin-dashboard" />
              ) : (
                <Navigate to="/user-dashboard" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;