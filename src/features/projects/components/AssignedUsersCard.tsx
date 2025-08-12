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
  
  const allSelected = selectedUsers.size === users.length && users.length > 0;
  const someSelected = selectedUsers.size > 0;
  
  const selectedUserObjects = useMemo(() => {
    return users.filter(user => selectedUsers.has(user.id));
  }, [users, selectedUsers]);


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
        
        toast.success('Work completed', {
          description: `${userProject.fullName} has finished working on the project`,
        });
      } else {
        await timeEntryService.createTimeEntry({
          userId: userProject.id,
          projectId: project.id,
          startTime: new Date(),
          lunchMinutes: project.lunchMinutes
        });
        
        toast.success('Work started', {
          description: `${userProject.fullName} has started working on the project`,
        });
      }
      
      const updatedUsersData = await projectsService.getProjectUsers(project.id);
      onUsersUpdated(updatedUsersData || []);
      
    } catch (error) {
      console.error('Error toggling work status:', error);
      toast.error('Error changing status', {
        description: 'Could not update work status',
        duration: 5000,
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(new Set(users.map(user => user.id)));
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
    
    // Filter users based on their current state
    const eligibleUsers = selectedUserObjects.filter(userProject => {
      const isCurrentlyWorking = userProject.lastTimesheet && !userProject.lastTimesheet.endTime;
      return action === 'start' ? !isCurrentlyWorking : isCurrentlyWorking;
    });
    
    if (eligibleUsers.length === 0) {
      toast.info('No changes needed', {
        description: `All selected users have already ${action === 'start' ? 'started working' : 'finished their work'}`,
      });
      return;
    }
    
    setBulkActionLoading(true);
    const errors: string[] = [];
    
    try {
      const promises = eligibleUsers.map(async (userProject) => {
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
          errors.push(`${userProject.fullName}: Error ${action === 'start' ? 'starting' : 'stopping'} work`);
        }
      });
      
      await Promise.all(promises);
      
      const updatedUsersData = await projectsService.getProjectUsers(project.id);
      onUsersUpdated(updatedUsersData || []);
      
      const skippedCount = selectedUserObjects.length - eligibleUsers.length;
      
      if (errors.length === 0) {
        let description = `Work ${action === 'start' ? 'started' : 'stopped'} for ${eligibleUsers.length} user(s)`;
        if (skippedCount > 0) {
          description += `. Skipped ${skippedCount} user(s) who ${action === 'start' ? 'already had work started' : 'had already finished their work'}`;
        }
        
        toast.success(`Bulk action completed`, {
          description,
        });
        setSelectedUsers(new Set()); // Clear selection after successful action
      } else {
        toast.error('Some actions failed', {
          description: errors.join(', '),
          duration: 5000,
        });
      }
      
    } catch (error) {
      toast.error('Bulk action error', {
        description: 'Could not complete the action for all users',
        duration: 5000,
      });
    } finally {
      setBulkActionLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Users className="h-5 w-5" />
          Assigned Users
          <Badge variant="outline" className="ml-auto">
            {users.length}
          </Badge>
        </CardTitle>
        {users.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                className="data-[state=checked]:bg-primary"
              />
              <span className="text-sm text-muted-foreground">
                Select all ({selectedUsers.size}/{users.length})
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
                  Start ({selectedUsers.size})
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
                  Stop ({selectedUsers.size})
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
        ) : users.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              No users assigned to this project
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((userProject) => {
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