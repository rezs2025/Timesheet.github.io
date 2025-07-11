import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addWeeks, subWeeks } from 'date-fns';
import { useAuth } from '@/shared/hooks/useAuth';
import { AppLoader } from '@/shared/components/ui/AppLoader';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Users, Clock, Building } from 'lucide-react';

import WeekSelector from './WeekSelector';
import FiltersPanel from './FiltersPanel';
import TimeEntriesTable from './TimeEntriesTable';
import SummaryCard from './SummaryCard';
import { calculateHoursWorked, calculateUserPerformance, getUniqueUsers, getUniqueProjects } from '../utils/weeklyCalculations';
import { TeamStats } from '../types';
import { TimeEntry } from '@/features/time-entry/types';
import { Project } from '@/shared/types/project';
import { User } from '@/shared/types/user';
import { toast } from 'sonner';
import { useWeeklyPMSummary } from '../hooks/useWeeklyPMSummary';
import { projectsService } from '@/features/projects/services/project.service';

const ManagerWeeklySummary = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  const { user, loading: loadingUser } = useAuth();
  
  const { loading, weekSummary } = useWeeklyPMSummary({
    currentWeekStart,
    projectId: selectedProject === 'all' ? undefined : selectedProject,
    userId: selectedUser === 'all' ? undefined : selectedUser,
  });

  useEffect(() => {
    const fetchProjectsAndUsers = async () => {
      try {
        const fetchedProjects = await projectsService.findAll();
        setProjects(fetchedProjects.projects || []);
      } catch (error) {
        console.error("Error fetching projects and users:", error);
      }
    };

    fetchProjectsAndUsers();
  }, []);

  const handlePreviousWeek = () => {
    setCurrentWeekStart((prevWeek) => subWeeks(prevWeek, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart((prevWeek) => addWeeks(prevWeek, 1));
  };

  if (loadingUser || loading) {
    return <AppLoader text="Cargando resumen del equipo..." />;
  }

  if (!user) {
    return (
      <div className="p-6">
        <Alert>
          <AlertDescription>Error de autenticación</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {user?.role === 'admin' ? 'Resumen del Sistema' : 'Resumen del Equipo'}
        </h1>
        <p className="text-muted-foreground">
          {user?.role === 'admin' ? 'Vista completa del sistema' : 'Gestión de horas del equipo'} - {user?.fullName || user?.email}
        </p>
      </div>
      <Card>
        <WeekSelector
          currentWeekStart={currentWeekStart}
          weekSummary={weekSummary}
          onPreviousWeek={handlePreviousWeek}
          onNextWeek={handleNextWeek}
        />
        
        <FiltersPanel
          loadingUser={loadingUser}
          loading={loading}
          onExport={() => {/* TODO: Implement export */}}
          user={user}
          projects={projects}
          users={users}
          selectedProject={selectedProject}
          selectedUser={selectedUser}
          onProjectChange={setSelectedProject}
          onUserChange={setSelectedUser}
          showUserFilter={true}
          showProjectFilter={true}
        />
      </Card>

      {/* Team Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4" />
              {user?.role === 'admin' ? 'Total Usuarios' : 'Total Miembros'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weekSummary.totalMembers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4 text-green-600" />
              {user?.role === 'admin' ? 'Usuarios Activos' : 'Activos'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weekSummary.activeMembers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4" />
              Horas Totales
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Total de horas, descontado tiempos de descanso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weekSummary.totalHours}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4 text-blue-600" />
              {user?.role === 'admin' ? 'Promedio/Usuario' : 'Promedio/Persona'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weekSummary.averageHoursPerPerson}</div>
          </CardContent>
        </Card>
      </div>

      <TimeEntriesTable
        entries={weekSummary.timeEntries}
        user={user}
        calculateHoursWorked={calculateHoursWorked}
        showUserColumn={true}
        showProjectColumn={true}
        showEditButton={true}
        onEditClick={(entry) => {
          toast.error('Funcionalidad de edición no implementada aún.');
        }}
      />
    </div>
  );
};

export default ManagerWeeklySummary;