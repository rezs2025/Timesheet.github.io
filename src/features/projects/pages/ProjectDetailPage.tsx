import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Building } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';

import { projectsService } from '../services/project.service';
import { AssignedUsersCard } from '../components/AssignedUsersCard';
import type { Project, UserProjectDetail } from '@/shared/types/project';


export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [projectUsers, setProjectUsers] = useState<UserProjectDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      navigate('/projects');
      return;
    }

    const fetchProjectData = async () => {
      try {
        setLoading(true);
        
        // Fetch project details and users in parallel
        const [projectData, usersData] = await Promise.all([
          projectsService.findOne(id),
          projectsService.getProjectUsers(id)
        ]);

        setProject(projectData);
        setProjectUsers(usersData || []);
      } catch (error) {
        console.error('Error fetching project:', error);
        toast.error('Error al cargar proyecto', {
          description: 'No se pudo cargar la información del proyecto',
          duration: 5000,
        });
        navigate('/projects');
      } finally {
        setLoading(false);
        setUsersLoading(false);
      }
    };

    fetchProjectData();
  }, [id, navigate]);

  const handleGoBack = () => {
    navigate('/projects');
  };

  const formatDuration = (minutes: number): string => {
    if (minutes === 0) return '0 min';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins} min`;
    } else if (mins === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${mins}m`;
    }
  };

  const handleUsersUpdated = (updatedUsers: UserProjectDetail[]) => {
    setProjectUsers(updatedUsers);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Proyecto no encontrado</h2>
          <Button onClick={handleGoBack} className="mt-4">
            Volver a proyectos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 md:p-6">
      {/* Header */}
      <div>
        <Button
            variant="ghost"
            size="sm"
            onClick={handleGoBack}
            className="h-8 px-2 text-muted-foreground hover:text-foreground -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver a proyectos
        </Button>
      </div>
      <div className="flex items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          <p className="text-muted-foreground">Detalles del proyecto</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Project Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Información del Proyecto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Nombre</h3>
              <p className="text-lg">{project.name}</p>
            </div>
            
            {project.description && (
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Descripción</h3>
                <p className="text-sm">{project.description}</p>
              </div>
            )}
            
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Dirección</h3>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <p className="text-sm">{project.address || 'No especificada'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Coordenadas</h3>
                <p className="text-sm font-mono">
                  {project.latitude.toFixed(6)}, {project.longitude.toFixed(6)}
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Tiempo de Almuerzo</h3>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{formatDuration(project.lunchMinutes)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assigned Users */}
        <AssignedUsersCard
          project={project}
          users={projectUsers}
          loading={usersLoading}
          onUsersUpdated={handleUsersUpdated}
        />
      </div>
    </div>
  );
};

export default ProjectDetailPage;