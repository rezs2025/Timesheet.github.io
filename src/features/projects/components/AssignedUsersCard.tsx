import React, { useState, useMemo } from 'react';
import { Users, Play, Square } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Checkbox } from '@/shared/components/ui/checkbox';

import { timeEntryService } from '@/features/time-entry/services/timeEntry.service';
import { projectsService } from '../services/project.service';
import { UserCard } from './UserCard';
import { useAuth } from '@/shared/hooks/useAuth';
import type { UserProjectDetail, Project } from '@/shared/types/project';

interface AssignedUsersCardProps {
  project: Project;
  users: UserProjectDetail[];
  loading: boolean;
  onUsersUpdated: (users: UserProjectDetail[]) => void;
}

export const AssignedUsersCard: React.FC<AssignedUsersCardProps> = ({
  project,
  users,
  loading,
  onUsersUpdated
}) => {
  const { user: currentUser } = useAuth();
  const [actionLoading, setActionLoading] = useState<{[userId: string]: boolean}>({});
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  
  const filteredUsers = useMemo(() => {
    if (!currentUser) return users;
    return users.filter(user => user.id !== currentUser.id);
  }, [users, currentUser]);
  
  const allSelected = selectedUsers.size === filteredUsers.length && filteredUsers.length > 0;
  const someSelected = selectedUsers.size > 0;
  
  const selectedUserObjects = useMemo(() => {
    return filteredUsers.filter(user => selectedUsers.has(user.id));
  }, [filteredUsers, selectedUsers]);


  const handleToggleUserWork = async (userProject: UserProjectDetail) => {
    const isCurrentlyWorking = userProject.lastTimesheet && !userProject.lastTimesheet.endTime;
    const userId = userProject.id;
    
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    
    try {
      if (isCurrentlyWorking) {
        await timeEntryService.updateTimeEntry(userProject.lastTimesheet.id, {
          endTime: new Date(),
          lunchMinutes: project.lunchMinutes
        });
        
        toast.success('Trabajo finalizado', {
          description: `${userProject.fullName} ha finalizado su trabajo en el proyecto`,
        });
      } else {
        await timeEntryService.createTimeEntry({
          userId: userProject.id,
          projectId: project.id,
          startTime: new Date(),
          lunchMinutes: project.lunchMinutes
        });
        
        toast.success('Trabajo iniciado', {
          description: `${userProject.fullName} ha comenzado a trabajar en el proyecto`,
        });
      }
      
      const updatedUsersData = await projectsService.getProjectUsers(project.id);
      onUsersUpdated(updatedUsersData || []);
      
    } catch (error) {
      console.error('Error toggling work status:', error);
      toast.error('Error al cambiar estado', {
        description: 'No se pudo actualizar el estado del trabajo',
        duration: 5000,
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(new Set(filteredUsers.map(user => user.id)));
    } else {
      setSelectedUsers(new Set());
    }
  };
  
  const handleUserSelection = (userId: string, selected: boolean) => {
    const newSelection = new Set(selectedUsers);
    if (selected) {
      newSelection.add(userId);
    } else {
      newSelection.delete(userId);
    }
    setSelectedUsers(newSelection);
  };
  
  const handleBulkAction = async (action: 'start' | 'stop') => {
    if (selectedUserObjects.length === 0) return;
    
    setBulkActionLoading(true);
    const errors: string[] = [];
    
    try {
      const promises = selectedUserObjects.map(async (userProject) => {
        try {
          const isCurrentlyWorking = userProject.lastTimesheet && !userProject.lastTimesheet.endTime;
          
          if (action === 'stop' && isCurrentlyWorking) {
            await timeEntryService.updateTimeEntry(userProject.lastTimesheet.id, {
              endTime: new Date(),
              lunchMinutes: project.lunchMinutes
            });
          } else if (action === 'start' && !isCurrentlyWorking) {
            await timeEntryService.createTimeEntry({
              userId: userProject.id,
              projectId: project.id,
              startTime: new Date(),
              lunchMinutes: project.lunchMinutes
            });
          }
        } catch (error) {
          errors.push(`${userProject.fullName}: Error al ${action === 'start' ? 'iniciar' : 'detener'} trabajo`);
        }
      });
      
      await Promise.all(promises);
      
      const updatedUsersData = await projectsService.getProjectUsers(project.id);
      onUsersUpdated(updatedUsersData || []);
      
      if (errors.length === 0) {
        toast.success(`Acción masiva completada`, {
          description: `Se ${action === 'start' ? 'inició' : 'detuvo'} el trabajo para ${selectedUserObjects.length} usuario(s)`,
        });
        setSelectedUsers(new Set()); // Clear selection after successful action
      } else {
        toast.error('Algunas acciones fallaron', {
          description: errors.join(', '),
          duration: 5000,
        });
      }
      
    } catch (error) {
      toast.error('Error en acción masiva', {
        description: 'No se pudo completar la acción para todos los usuarios',
        duration: 5000,
      });
    } finally {
      setBulkActionLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Usuarios Asignados
          <Badge variant="outline" className="ml-auto">
            {filteredUsers.length}
          </Badge>
        </CardTitle>
        {filteredUsers.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                className="data-[state=checked]:bg-primary"
              />
              <span className="text-sm text-muted-foreground">
                Seleccionar todos ({selectedUsers.size}/{filteredUsers.length})
              </span>
            </div>
            {someSelected && (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handleBulkAction('start')}
                  disabled={bulkActionLoading}
                  className="h-8 flex-1 sm:flex-none"
                >
                  {bulkActionLoading ? (
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent mr-1" />
                  ) : (
                    <Play className="h-3 w-3 mr-1" />
                  )}
                  Iniciar ({selectedUsers.size})
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleBulkAction('stop')}
                  disabled={bulkActionLoading}
                  className="h-8 flex-1 sm:flex-none"
                >
                  {bulkActionLoading ? (
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent mr-1" />
                  ) : (
                    <Square className="h-3 w-3 mr-1" />
                  )}
                  Detener ({selectedUsers.size})
                </Button>
              </div>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              No hay usuarios asignados a este proyecto
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map((userProject) => {
              const isLoading = actionLoading[userProject.id] || false;
              return (
                <UserCard
                  key={userProject.id}
                  userProject={userProject}
                  isLoading={isLoading}
                  isSelected={selectedUsers.has(userProject.id)}
                  onToggleWork={handleToggleUserWork}
                  onSelectionChange={handleUserSelection}
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};