// src/features/users/components/UserTable.tsx
import React from 'react';
import { Edit, Trash2, Users, Shield, UserCheck } from 'lucide-react';
import type { User } from '@/shared/types/user';
import { useIsMobile } from '@/shared/hooks/use-mobile';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';

interface Props {
  users: User[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onManageProjects: (id: string) => void;
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (newPage: number) => void;
}

const getRoleConfig = (role: User['role']) => {
  switch (role) {
    case 'admin':
      return { label: 'Administrator', variant: 'destructive' as const, icon: Shield };
    case 'pm':
      return { label: 'Project Manager', variant: 'secondary' as const, icon: UserCheck };
    case 'employee':
      return { label: 'Employee', variant: 'default' as const, icon: Users };
    default:
      return { label: role, variant: 'default' as const, icon: Users };
  }
};

export const UserTable: React.FC<Props> = ({
  users,
  onEdit,
  onDelete,
  onManageProjects,
  page,
  totalPages,
  onPageChange,
}) => {
  const isMobile = useIsMobile();

  // Componente de paginación simple
  const PaginationControls = () => (
    <div className="flex items-center justify-between space-x-2 py-4">
      <div className="text-sm text-muted-foreground">
        Página {page} de {totalPages}
      </div>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );

  return isMobile ? (
    <div className="space-y-4">
      {users.map((user) => {
        const roleConfig = getRoleConfig(user.role);
        const RoleIcon = roleConfig.icon;
        
        return (
          <Card key={user.id} className="w-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RoleIcon className="h-5 w-5" />
                  {user.fullName}
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(user.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit user</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(user.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete user</span>
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1 text-sm">
                <div>
                  <span className="font-medium">Email:</span> {user.email}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Role:</span>
                  <Badge variant={roleConfig.variant}>
                    {roleConfig.label}
                  </Badge>
                </div>
              </div>
            </CardContent>
            {(user.role === 'employee' || user.role === 'pm') && (
              <CardFooter className="flex justify-center pt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onManageProjects(user.id)}
                  className="w-full"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Gestionar Proyectos
                </Button>
              </CardFooter>
            )}
          </Card>
        );
      })}
      <PaginationControls />
    </div>
  ) : (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const roleConfig = getRoleConfig(user.role);
              const RoleIcon = roleConfig.icon;
              
              return (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <RoleIcon className="h-4 w-4" />
                      {user.fullName}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant={roleConfig.variant}>
                      {roleConfig.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center space-x-2">
                      {(user.role === 'employee' || user.role === 'pm') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onManageProjects(user.id)}
                          title="Gestionar proyectos"
                        >
                          <Users className="h-4 w-4" />
                          <span className="sr-only">Gestionar proyectos</span>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(user.id)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit user</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(user.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete user</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <PaginationControls />
    </div>
  );
};