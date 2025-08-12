import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Building, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  ArrowRight,
  Calendar,
  BarChart3,
  FileText
} from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { AppLoader } from '@/shared/components/ui/AppLoader';
import { useAuth } from '@/shared/hooks/useAuth';

interface AdminStats {
  totalUsers: number;
  totalProjects: number;
  activeTimesheets: number;
  totalHoursThisWeek: number;
  pendingApprovals: number;
  recentActivity: Array<{
    id: string;
    type: 'timesheet' | 'user' | 'project';
    message: string;
    timestamp: Date;
  }>;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { loading: loadingUser, user, error: errorUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 25,
    totalProjects: 8,
    activeTimesheets: 12,
    totalHoursThisWeek: 320,
    pendingApprovals: 3,
    recentActivity: [
      {
        id: '1',
        type: 'timesheet',
        message: 'Juan Pérez registró 8 horas en Proyecto Casa Verde',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: '2',
        type: 'user',
        message: 'Nueva usuaria María González agregada al sistema',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
      },
      {
        id: '3',
        type: 'project',
        message: 'Proyecto Torre Azul actualizado con nueva dirección',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
      }
    ]
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loadingUser || loading) {
    return <AppLoader text="Cargando panel de administración..." />;
  }

  if (errorUser || !user) {
    return (
      <div className="p-6">
        <Alert>
          <AlertDescription>{errorUser || 'Authentication error'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'timesheet':
        return <Clock className="h-4 w-4" />;
      case 'user':
        return <Users className="h-4 w-4" />;
      case 'project':
        return <Building className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'timesheet':
        return 'text-blue-600';
      case 'user':
        return 'text-green-600';
      case 'project':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Administration Panel</h1>
        <p className="text-muted-foreground">
          Welcome, {user.fullName || user.email}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4" />
              Total Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +2 desde la semana pasada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Building className="h-4 w-4" />
              Active Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              1 nuevo este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4" />
              Trabajando Ahora
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTimesheets}</div>
            <p className="text-xs text-muted-foreground">
              Active employees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              Horas Esta Semana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHoursThisWeek}</div>
            <p className="text-xs text-muted-foreground">
              +15% vs semana anterior
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Acciones Rápidas
            </CardTitle>
            <CardDescription>
              Gestión rápida del sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/users')}
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <Users className="h-6 w-6" />
                <span className="text-sm">Usuarios</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/projects')}
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <Building className="h-6 w-6" />
                <span className="text-sm">Proyectos</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/reports')}
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <FileText className="h-6 w-6" />
                <span className="text-sm">Reportes</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/time-entries')}
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <Clock className="h-6 w-6" />
                <span className="text-sm">Horas</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        {stats.pendingApprovals > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Aprobaciones Pendientes
              </CardTitle>
              <CardDescription>
                {stats.pendingApprovals} elementos requieren tu atención
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Horas extras de Juan Pérez</p>
                    <p className="text-sm text-muted-foreground">Proyecto Casa Verde - 2 horas</p>
                  </div>
                  <Badge variant="outline">Pendiente</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Nuevo proyecto Torre Azul</p>
                    <p className="text-sm text-muted-foreground">Requiere asignación de equipo</p>
                  </div>
                  <Badge variant="outline">Pendiente</Badge>
                </div>
                <Button
                  variant="outline"
                  onClick={() => navigate('/approvals')}
                  className="w-full"
                >
                  Ver Todas las Aprobaciones
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        <Card className={stats.pendingApprovals > 0 ? 'lg:col-span-2' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Actividad Reciente
            </CardTitle>
            <CardDescription>
              Últimas acciones en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className={`mt-1 ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(activity.timestamp, "HH:mm - d 'de' MMMM", { locale: es })}
                    </p>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => navigate('/activity-log')}
                className="w-full"
              >
                Ver Registro Completo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;