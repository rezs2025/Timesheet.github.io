import React from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { AppLoader } from '@/shared/components/ui/AppLoader';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import PMDashboard from '../components/PMDashboard';

const DashboardPage = () => {
  const { loading, user, error } = useAuth();

  if (loading) {
    return <AppLoader text="Cargando dashboard..." />;
  }

  if (error || !user) {
    return (
      <div className="p-6">
        <Alert>
          <AlertDescription>{error || 'Error de autenticación'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  switch (user.role) {
    case 'admin':
      return <PMDashboard />;
    case 'pm':
      return <PMDashboard />;
  }
};

export default DashboardPage;