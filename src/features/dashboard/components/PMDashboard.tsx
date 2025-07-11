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
  FileText,
  CheckCircle,
  XCircle
} from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { AppLoader } from '@/shared/components/ui/AppLoader';
import { useAuth } from '@/shared/hooks/useAuth';

interface PMStats {
  assignedProjects: number;
  teamMembers: number;
  totalHoursThisWeek: number;
  pendingApprovals: number;
  completedTasks: number;
  myProjects: Array<{
    id: string;
    name: string;
    progress: number;
    status: 'active' | 'completed' | 'paused';
    teamSize: number;
    hoursThisWeek: number;
  }>;
  teamActivity: Array<{
    id: string;
    memberName: string;
    action: string;
    projectName: string;
    timestamp: Date;
  }>;
}

const PMDashboard = () => {
  const navigate = useNavigate();
  const { loading: loadingUser, user, error: errorUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<PMStats>({
    assignedProjects: 3,
    teamMembers: 8,
    totalHoursThisWeek: 156,
    pendingApprovals: 5,
    completedTasks: 12,
    myProjects: [
      {
        id: '1',
        name: 'Casa Verde',
        progress: 75,
        status: 'active',
        teamSize: 4,
        hoursThisWeek: 64
      },
      {
        id: '2',
        name: 'Torre Azul',
        progress: 45,
        status: 'active',
        teamSize: 3,
        hoursThisWeek: 48
      },
      {
        id: '3',
        name: 'Oficina Central',
        progress: 90,
        status: 'active',
        teamSize: 5,
        hoursThisWeek: 72
      }
    ],
    teamActivity: [
      {
        id: '1',
        memberName: 'Juan Pérez',
        action: 'registró 8 horas',
        projectName: 'Casa Verde',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
      },
      {
        id: '2',
        memberName: 'María González',
        action: 'completó tarea de diseño',
        projectName: 'Torre Azul',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000)
      },
      {
        id: '3',
        memberName: 'Carlos Ruiz',
        action: 'solicitó aprobación para horas extra',
        projectName: 'Oficina Central',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000)
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
    return <AppLoader text="Cargando panel de gestión..." />;
  }

  if (errorUser || !user) {
    return (
      <div className="p-6">
        <Alert>
          <AlertDescription>{errorUser || 'Error de autenticación'}</AlertDescription>
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-3 w-3" />;
      case 'completed':
        return <CheckCircle className="h-3 w-3" />;
      case 'paused':
        return <XCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel de Gestión de Proyectos</h1>
        <p className="text-muted-foreground">
          Bienvenido, {user.fullName || user.email}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Building className="h-4 w-4" />
              Mis Proyectos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.assignedProjects}</div>
            <p className="text-xs text-muted-foreground">
              Proyectos asignados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4" />
              Mi Equipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teamMembers}</div>
            <p className="text-xs text-muted-foreground">
              Miembros del equipo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4" />
              Horas Semanales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHoursThisWeek}</div>
            <p className="text-xs text-muted-foreground">
              Horas del equipo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <AlertTriangle className="h-4 w-4" />
              Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">
              Aprobaciones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <CheckCircle className="h-4 w-4" />
              Completadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedTasks}</div>
            <p className="text-xs text-muted-foreground">
              Tareas esta semana
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Mis Proyectos
            </CardTitle>
            <CardDescription>
              Estado actual de proyectos asignados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.myProjects.map((project) => (
              <div key={project.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{project.name}</h4>
                  <Badge className={`${getStatusColor(project.status)} flex items-center gap-1`}>
                    {getStatusIcon(project.status)}
                    {project.status}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progreso</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{project.teamSize} miembros</span>
                  <span>{project.hoursThisWeek} hrs esta semana</span>
                </div>
              </div>
            ))}
            
            <Button 
              variant="outline" 
              onClick={() => navigate('/projects')}
              className="w-full"
            >
              Ver Todos los Proyectos
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Acciones Rápidas
            </CardTitle>
            <CardDescription>
              Herramientas de gestión
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/approvals')}
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <AlertTriangle className="h-6 w-6" />
                <span className="text-sm">Aprobaciones</span>
                {stats.pendingApprovals > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {stats.pendingApprovals}
                  </Badge>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/team')}
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <Users className="h-6 w-6" />
                <span className="text-sm">Mi Equipo</span>
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
                onClick={() => navigate('/timesheet-review')}
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <Clock className="h-6 w-6" />
                <span className="text-sm">Revisión</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Team Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Actividad del Equipo
            </CardTitle>
            <CardDescription>
              Últimas actividades de tu equipo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.teamActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="mt-1">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      <span className="font-semibold">{activity.memberName}</span> {activity.action}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.projectName} • {format(activity.timestamp, "HH:mm - d 'de' MMMM", { locale: es })}
                    </p>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => navigate('/team-activity')}
                className="w-full"
              >
                Ver Actividad Completa
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PMDashboard;