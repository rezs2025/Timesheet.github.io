import React from 'react';
import { CardContent } from '@/shared/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Label } from '@/shared/components/ui/label';
import { UserSearch } from '@/features/users/components/UserSearch';

interface FiltersPanelProps {
  loadingUser: boolean;
  loading: boolean;
  user: any;
  projects: any[];
  users: any[];
  selectedProject: string;
  selectedUser: string;
  onProjectChange: (value: string) => void;
  onUserChange: (value: string) => void;
  showUserFilter?: boolean;
  showProjectFilter?: boolean;
}

const FiltersPanel: React.FC<FiltersPanelProps> = ({
  loading,
  user,
  projects,
  selectedProject,
  selectedUser,
  onProjectChange,
  onUserChange,
  showUserFilter = true,
  showProjectFilter = true,
}) => {
  return (
    <CardContent className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          {showProjectFilter && (user?.role === 'admin' || user?.role === 'pm') && (
            <div className="space-y-2">
              <Label htmlFor="project-select">Proyecto</Label>
              <Select value={selectedProject} onValueChange={onProjectChange}>
                <SelectTrigger id="project-select">
                  <SelectValue placeholder="Todos los proyectos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los proyectos</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {showUserFilter && user?.role === 'admin' && (
            <div className="space-y-2">
              <Label htmlFor="user-select">Empleado</Label>
              <UserSearch
                value={selectedUser}
                onValueChange={(value) => onUserChange(value)}
                placeholder="Buscar y seleccionar empleado..."
                disabled={loading}
                roleFilter='employee'
              />
            </div>
          )}
        </div>
      </div>
    </CardContent>
  );
};

export default FiltersPanel;