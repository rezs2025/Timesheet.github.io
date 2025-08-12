import React from 'react';
import { Play, Square, UserCheck } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Badge } from '@/shared/components/ui/badge';

import type { UserProjectDetail } from '@/shared/types/project';

interface UserCardProps {
  userProject: UserProjectDetail;
  isLoading: boolean;
  isSelected: boolean;
  onToggleWork: (userProject: UserProjectDetail) => void;
  onSelectionChange: (userId: string, selected: boolean) => void;
}

export const UserCard: React.FC<UserCardProps> = ({
  userProject,
  isLoading,
  isSelected,
  onToggleWork,
  onSelectionChange
}) => {
  const getUserInitials = (fullName: string): string => {
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };



  const isWorking = userProject.lastTimesheet && !userProject.lastTimesheet.endTime;

  return (
    <div className="p-4 rounded-lg border">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelectionChange(userProject.id, !!checked)}
          />
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
            {userProject.assignmentType === 'pm' && (
              <div className="mt-1">
                <Badge variant="secondary" className="text-xs h-4 px-1.5">
                  <UserCheck className="h-3 w-3 mr-1" />
                  PM
                </Badge>
              </div>
            )}
          </div>
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
                {isWorking ? 'Stopping...' : 'Starting...'}
              </>
            ) : isWorking ? (
              <>
                <Square className="h-3 w-3 mr-1" />
                Stop
              </>
            ) : (
              <>
                <Play className="h-3 w-3 mr-1" />
                Start
              </>
            )}
          </Button>
      </div>
    </div>
  );
};