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
import Layout from '@/components/layout/Layout';
import Loading from '@/components/ui/Loading';
import { useAuth } from '@/shared/hooks/useAuth';

import { ProjectsAdminPage } from '@/features/projects/pages/ProjectsAdminPage';

function App() {
  const { loading, user } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
      
      <Route path="/" element={user ? <Layout /> : <Navigate to="/login" />}>
        <Route index element={<Dashboard />} />
        <Route
          path="projects"
          element={
            user?.role === 'admin'
              ? <ProjectsAdminPage />
              : <Navigate to="/" replace />
          }
      />
        <Route path="time-entry" element={<TimeEntry />} />
        <Route path="weekly-summary" element={<WeeklySummary />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="permissions" element={<PermissionManager />} />
        <Route path="approvals" element={<ApprovalManager />} />
      </Route>
    </Routes>
  );
}

export default App;