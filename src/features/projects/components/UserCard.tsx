import React from 'react';
import { Play, Square } from 'lucide-react';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';

import type { UserProjectDetail } from '@/shared/types/project';

interface UserCardProps {
  userProject: UserProjectDetail;
  isLoading: boolean;
  onToggleWork: (userProject: UserProjectDetail) => void;
}

export const UserCard: React.FC<UserCardProps> = ({
  userProject,
  isLoading,
  onToggleWork
}) => {
  const getUserInitials = (fullName: string): string => {
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const getUserRoleBadge = (assignmentType: 'employee' | 'pm') => {
    if (assignmentType === 'pm') {
      return <Badge variant="default">Project Manager</Badge>;
    }
    return <Badge variant="secondary">Empleado</Badge>;
  };

  const getUserStatusBadge = (userProject: UserProjectDetail) => {
    const isWorking = userProject.lastTimesheet && !userProject.lastTimesheet.endTime;
    if (isWorking) {
      return <Badge variant="destructive" className="bg-green-600 hover:bg-green-700">Trabajando</Badge>;
    }
    return <Badge variant="outline">Inactivo</Badge>;
  };

  const isWorking = userProject.lastTimesheet && !userProject.lastTimesheet.endTime;

  return (
    <div className="p-4 rounded-lg border space-y-3">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback>
            {getUserInitials(userProject.fullName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {userProject.fullName}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {userProject.email}
          </p>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {getUserRoleBadge(userProject.assignmentType)}
          {getUserStatusBadge(userProject)}
        </div>
        
        <Button
          size="sm"
          variant={isWorking ? "destructive" : "default"}
          onClick={() => onToggleWork(userProject)}
          disabled={isLoading}
          className="h-8"
        >
          {isLoading ? (
            <>
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent mr-1" />
              {isWorking ? 'Deteniendo...' : 'Iniciando...'}
            </>
          ) : isWorking ? (
            <>
              <Square className="h-3 w-3 mr-1" />
              Detener
            </>
          ) : (
            <>
              <Play className="h-3 w-3 mr-1" />
              Iniciar
            </>
          )}
        </Button>
      </div>
    </div>
  );
};