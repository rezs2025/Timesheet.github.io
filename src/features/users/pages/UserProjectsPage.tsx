// src/features/users/pages/UserProjectsPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usersService } from '../services/user.service';
import { projectsService } from '@/features/projects/services/project.service';
import { UserProjectAssignmentForm } from '../components/UserProjectAssignmentForm';
import type { UserProject, User } from '@/shared/types/user';
import type { Project } from '@/shared/types/project';
import { Plus, Trash2, Users, UserCheck, ArrowLeft } from 'lucide-react';
import { useIsMobile } from '@/shared/hooks/use-mobile';

import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/shared/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog';

export function UserProjectsPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [user, setUser] = useState<User | null>(null);
  const [userProjects, setUserProjects] = useState<UserProject[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  // Cargar datos del usuario y sus proyectos
  useEffect(() => {
    if (!userId) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const [userData, userProjectsData, allProjectsData] = await Promise.all([
          usersService.findById(userId),
          usersService.getUserProjects(userId),
          projectsService.findAll(1, 100),
        ]);
        
        setUser(userData);
        setUserProjects(userProjectsData);
        setAllProjects(allProjectsData.projects);
      } catch (err: any) {
        setError(err.response?.data?.message ?? 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleRemoveAssignment = async () => {
    if (!projectToDelete) return;
    
    try {
      setLoading(true);
      await usersService.removeUserFromProject(projectToDelete);
      setUserProjects(prev => prev.filter(up => up.id !== projectToDelete));
      setError(null);
      setProjectToDelete(null);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Error al remover asignación');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteConfirmation = (userProjectId: string) => {
    setProjectToDelete(userProjectId);
  };

  const handleAssignmentAdded = (newAssignment: UserProject) => {
    setUserProjects(prev => [...prev, newAssignment]);
    setModalOpen(false);
  };

  const getAssignmentTypeConfig = (type: string) => {
    switch (type) {
      case 'pm':
        return { label: 'Project Manager', variant: 'secondary' as const, icon: UserCheck };
      case 'employee':
        return { label: 'Empleado', variant: 'default' as const, icon: Users };
      default:
        return { label: type, variant: 'default' as const, icon: Users };
    }
  };

  const getAvailableProjects = () => {
    const assignedProjectIds = userProjects.map(up => up.project.id);
    return allProjects.filter(p => !assignedProjectIds.includes(p.id));
  };

  if (loading && !user) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-destructive">Usuario no encontrado</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Navigation */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/users')}
          className="h-8 px-2 text-muted-foreground hover:text-foreground -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver a usuarios
        </Button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            Proyectos de {user.fullName}
          </h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {!isMobile && 'Asignar'} Proyecto
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
          <div className="text-sm text-destructive">{error}</div>
        </div>
      )}

      {/* Lista de proyectos */}
      {isMobile ? (
        <div className="space-y-4">
          {userProjects.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No hay proyectos asignados</p>
              </CardContent>
            </Card>
          ) : (
            userProjects.map((userProject) => {
              const typeConfig = getAssignmentTypeConfig(userProject.assignmentType);
              const TypeIcon = typeConfig.icon;
              
              return (
                <Card key={userProject.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg grid grid-cols-[1fr_auto] gap-4 items-start">
                      <div className="flex items-start space-x-2">
                        <TypeIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span className="leading-tight">{userProject.project.name}</span>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteConfirmation(userProject.id)}
                          disabled={loading}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {userProject.project.description && (
                      <p className="text-sm text-muted-foreground">
                        {userProject.project.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <Badge variant={typeConfig.variant} className="text-xs">
                        {typeConfig.label}
                      </Badge>
                      {userProject.project.address && (
                        <p className="text-xs text-muted-foreground">
                          📍 {userProject.project.address}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proyecto</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No hay proyectos asignados
                  </TableCell>
                </TableRow>
              ) : (
                userProjects.map((userProject) => {
                  const typeConfig = getAssignmentTypeConfig(userProject.assignmentType);
                  const TypeIcon = typeConfig.icon;
                  
                  return (
                    <TableRow key={userProject.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <TypeIcon className="h-4 w-4" />
                          {userProject.project.name}
                        </div>
                      </TableCell>
                      <TableCell>{userProject.project.address || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={typeConfig.variant}>
                          {typeConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteConfirmation(userProject.id)}
                            disabled={loading}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Modal para asignar proyecto */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-[96vw] sm:max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Asignar Proyecto</DialogTitle>
            <DialogDescription>
              Selecciona un proyecto para asignar a {user.fullName}.
            </DialogDescription>
          </DialogHeader>
          {user && (
            <UserProjectAssignmentForm
              user={user}
              availableProjects={getAvailableProjects()}
              onAssignmentAdded={handleAssignmentAdded}
              onCancel={() => setModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación para eliminar */}
      <AlertDialog open={!!projectToDelete} onOpenChange={() => setProjectToDelete(null)}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar asignación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la asignación del proyecto para este usuario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoveAssignment}
              disabled={loading}
            >
              {loading ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}