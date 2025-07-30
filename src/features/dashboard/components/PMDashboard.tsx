import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building, 
  Clock, 
  ArrowRight,
  CheckCircle,
  XCircle
} from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { AppLoader } from '@/shared/components/ui/AppLoader';
import { useAuth } from '@/shared/hooks/useAuth';
import { projectsService } from '@/features/projects/services/project.service';
import { EmployeeActivity } from '@/shared/types/project';

const PMDashboard = () => {
  const navigate = useNavigate();
  const { loading: loadingUser, user, error: errorUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [projects, setProjects] = useState<EmployeeActivity[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const projects  = await projectsService.getEmployeeActivity(
          new Date(new Date().setHours(0, 0, 0, 0)).toISOString(), // Start of today
          new Date(new Date().setHours(23, 59, 59, 999)).toISOString() // End of today
        );
        setProjects(projects);
      } catch (err) {
        setError('Error al cargar los proyectos');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
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

  const getProjectProgress = (totalEmployees: number = 0, activeEmployees: number = 0) => {
    return totalEmployees > 0 ? (activeEmployees / totalEmployees) * 100 : 0;
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel de Gestión de Proyectos</h1>
        <p className="text-muted-foreground">
          Bienvenido, {user.fullName || user.email}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
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
            {projects.map((project) => (
              <div 
                key={project.id} 
                className="border rounded-lg p-4 space-y-3 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{project.name}</h4>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Usuarios activos</span>
                    <span>{getProjectProgress(project.totalEmployees, project.activeEmployees)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${getProjectProgress(project.totalEmployees, project.activeEmployees)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{project.totalEmployees} miembros</span>
                  <span>{project.activeEmployees} activo</span>
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
      </div>
    </div>
  );
};

export default PMDashboard;