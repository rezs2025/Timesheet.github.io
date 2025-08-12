// src/features/users/components/UserProjectAssignmentForm.tsx
import React, { useState } from 'react';
import { usersService } from '../services/user.service';
import { ProjectSearch } from './ProjectSearch';
import type { UserProject, AssignmentType, User } from '@/shared/types/user';
import type { Project } from '@/shared/types/project';
import { Plus } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';

interface UserProjectAssignmentFormProps {
  user: User;
  availableProjects: Project[];
  onAssignmentAdded: (assignment: UserProject) => void;
  onCancel: () => void;
}

export const UserProjectAssignmentForm: React.FC<UserProjectAssignmentFormProps> = ({
  user,
  availableProjects,
  onAssignmentAdded,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState('');

  const handleSubmit = async () => {
    if (!selectedProjectId) return;

    // Determinar assignmentType basado en el rol del usuario
    const assignmentType: AssignmentType = user.role === 'pm' ? 'pm' : 'employee';

    try {
      setLoading(true);
      const assignment = await usersService.assignUserToProject({
        userId: user.id,
        projectId: selectedProjectId,
        assignmentType,
      });
      
      onAssignmentAdded(assignment);
      setSelectedProjectId('');
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Error assigning project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
          <div className="text-sm text-destructive">{error}</div>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm">Project</Label>
          <ProjectSearch
            value={selectedProjectId}
            onValueChange={setSelectedProjectId}
            placeholder="Search and select project..."
            disabled={loading}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading || !selectedProjectId}
        >
          <Plus className="h-4 w-4 mr-2" />
          Assign Project
        </Button>
      </div>

    </div>
  );
};