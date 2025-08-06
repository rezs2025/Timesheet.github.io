import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';

import { timeEntryService } from '@/features/time-entry/services/timeEntry.service';
import { projectsService } from '../services/project.service';
import { UserCard } from './UserCard';
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
  const [actionLoading, setActionLoading] = useState<{[userId: string]: boolean}>({});


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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Usuarios Asignados
          <Badge variant="outline" className="ml-auto">
            {users.length}
          </Badge>
        </CardTitle>
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
        ) : users.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              No hay usuarios asignados a este proyecto
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {users.map((userProject) => {
              const isLoading = actionLoading[userProject.id] || false;
              return (
                <UserCard
                  key={userProject.id}
                  userProject={userProject}
                  isLoading={isLoading}
                  onToggleWork={handleToggleUserWork}
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};