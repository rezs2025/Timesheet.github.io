// src/features/users/components/UserProjectAssignment.tsx
import React, { useState, useEffect } from 'react';
import { usersService } from '../services/user.service';
import { projectsService } from '@/features/projects/services/project.service';
import { ProjectSearch } from './ProjectSearch';
import type { UserProject, AssignmentType, User } from '@/shared/types/user';
import type { Project } from '@/shared/types/project';
import { Plus, Trash2, Users, UserCheck } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

interface UserProjectAssignmentProps {
  user: User;
  onClose: () => void;
}

export const UserProjectAssignment: React.FC<UserProjectAssignmentProps> = ({
  user,
  onClose,
}) => {
  const [userProjects, setUserProjects] = useState<UserProject[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newAssignment, setNewAssignment] = useState({
    projectId: '',
  });

  // Load user projects and available projects
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [userProjectsData, allProjects] = await Promise.all([
          usersService.getUserProjects(user.id),
          projectsService.findAll(1, 100), // Obtener todos los proyectos
        ]);
        
        setUserProjects(userProjectsData);
        setAllProjects(allProjects.projects);
      } catch (err: any) {
        setError(err.response?.data?.message ?? 'Error loading data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.id]);

  const handleAddAssignment = async () => {
    if (!newAssignment.projectId) return;

    // Determinar assignmentType basado en el rol del usuario
    const assignmentType: AssignmentType = user.role === 'pm' ? 'pm' : 'employee';

    try {
      setLoading(true);
      const assignment = await usersService.assignUserToProject({
        userId: user.id,
        projectId: newAssignment.projectId,
        assignmentType,
      });
      
      setUserProjects(prev => [...prev, assignment]);
      setNewAssignment({ projectId: '' });
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Error assigning project');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAssignment = async (userProjectId: string) => {
    try {
      setLoading(true);
      await usersService.removeUserFromProject(userProjectId);
      setUserProjects(prev => prev.filter(up => up.id !== userProjectId));
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Error removing assignment');
    } finally {
      setLoading(false);
    }
  };
  const getAvailableProjects = () => {
    const assignedProjectIds = userProjects.map(up => up.project.id);
    return allProjects.filter(p => !assignedProjectIds.includes(p.id));
  };

  const getAssignmentTypeConfig = (type: AssignmentType) => {
    switch (type) {
      case 'pm':
        return { label: 'Project Manager', variant: 'secondary' as const, icon: UserCheck };
      case 'employee':
        return { label: 'Employee', variant: 'default' as const, icon: Users };
      default:
        return { label: type, variant: 'default' as const, icon: Users };
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          {user.fullName} ({user.email})
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
          <div className="text-sm text-destructive">{error}</div>
        </div>
      )}

      {/* Assigned projects */
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Assigned Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {userProjects.length === 0 ? (
            <p className="text-sm text-muted-foreground">No assigned projects</p>
          ) : (
            <div className="space-y-3">
              {userProjects.map((userProject) => {
                const typeConfig = getAssignmentTypeConfig(userProject.assignmentType);
                const TypeIcon = typeConfig.icon;
                
                return (
                  <div key={userProject.id} className="flex flex-col space-y-2 p-2 sm:p-3 border rounded-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <TypeIcon className="h-4 w-4 flex-shrink-0" />
                        <p className="font-medium text-sm truncate">{userProject.project.name}</p>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAssignment(userProject.id)}
                        disabled={loading}
                        className="text-destructive hover:text-destructive flex-shrink-0 h-6 w-6 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="space-y-1">
                      {userProject.project.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{userProject.project.description}</p>
                      )}
                      <Badge variant={typeConfig.variant} className="text-xs">
                        {typeConfig.label}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add new assignment */
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Project</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Project</Label>
              <ProjectSearch
                value={newAssignment.projectId}
                onValueChange={(value) => setNewAssignment(prev => ({ ...prev, projectId: value }))}
                placeholder="Search and select project..."
                disabled={loading}
                excludeProjectIds={userProjects.map(up => up.project.id)}
              />
            </div>
          </div>

          <Button
            onClick={handleAddAssignment}
            disabled={loading || !newAssignment.projectId}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Assignment
          </Button>

        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onClose} variant="outline">
          Close
        </Button>
      </div>
    </div>
  );
};