import React from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { AppLoader } from '@/shared/components/ui/AppLoader';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';

import EmployeeWeeklySummary from '../components/EmployeeWeeklySummary';
import ManagerWeeklySummary from '../components/ManagerWeeklySummary';

const WeeklySummaryPage = () => {
  const { loading, user, error } = useAuth();

  if (loading) {
    return <AppLoader text="Cargando resumen semanal..." />;
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
    case 'pm':
      return <ManagerWeeklySummary />;
    default:
      return <EmployeeWeeklySummary />;
  }
};

export default WeeklySummaryPage;