import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Componentes
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import { DashboardPage } from '@/features/dashboard';
import { WeeklySummaryPage } from '@/features/weekly-summary';
import TimeEntry from '@/features/time-entry/pages/TimeEntryPage';
import { AppLoader } from '@/shared/components/ui/AppLoader';
import { useAuth } from '@/shared/hooks/useAuth';

import { ProjectsAdminPage } from '@/features/projects/pages/ProjectsAdminPage';
import { ProjectDetailPage } from '@/features/projects/pages/ProjectDetailPage';
import { UsersAdminPage } from '@/features/users/pages/UsersAdminPage';
import { UserProjectsPage } from '@/features/users/pages/UserProjectsPage';
import { MainLayout } from './layouts/main-layout';

function App() {
  const { loading, user } = useAuth();

  if (loading) {
    return <AppLoader text="Verificando autenticación..." />;
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
      <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" />} />
      
      <Route path="/" element={user ? <MainLayout /> : <Navigate to="/login" />}>
        <Route index element={<DashboardPage />} />
        <Route
          path="projects"
          element={
            ['admin', 'pm'].includes(user?.role ?? '')
              ? <ProjectsAdminPage />
              : <Navigate to="/" replace />
          }
        />
        <Route
          path="projects/:id"
          element={
            ['admin', 'pm'].includes(user?.role ?? '')
              ? <ProjectDetailPage />
              : <Navigate to="/" replace />
          }
        />
        <Route path="time-entry" element={<TimeEntry />} />
        <Route path="weekly-summary" element={<WeeklySummaryPage />} />
        <Route 
          path="users" 
          element={
            user?.role === 'admin'
              ? <UsersAdminPage />
              : <Navigate to="/" replace />
          }
        />
        <Route 
          path="users/:userId/projects" 
          element={
            user?.role === 'admin'
              ? <UserProjectsPage />
              : <Navigate to="/" replace />
          }
        />
      </Route>
    </Routes>
  );
}

export default App;