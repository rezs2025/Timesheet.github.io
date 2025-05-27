import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

// Componentes
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import UserManagement from './components/auth/UserManagement';
import PermissionManager from './components/auth/PermissionManager';
import Dashboard from './components/dashboard/Dashboard';
import TimeEntry from './components/timesheet/TimeEntry';
import WeeklySummary from './components/reports/WeeklySummary/WeeklySummary';
import ApprovalManager from './components/reports/ApprovalManager';
import ProjectList from './components/projects/ProjectList';
import Layout from './components/layout/Layout';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
      
      <Route path="/" element={user ? <Layout /> : <Navigate to="/login" />}>
        <Route index element={<Dashboard />} />
        <Route path="time-entry" element={<TimeEntry />} />
        <Route path="weekly-summary" element={<WeeklySummary />} />
        <Route path="projects" element={<ProjectList />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="permissions" element={<PermissionManager />} />
        <Route path="approvals" element={<ApprovalManager />} />
      </Route>
    </Routes>
  );
}

export default App;