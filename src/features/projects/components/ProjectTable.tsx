// src/features/projects/components/ProjectTable.tsx
import React from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Project } from '@/shared/types/project';
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
  projects: Project[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (newPage: number) => void;
}

export const ProjectTable: React.FC<Props> = ({
  projects,
  onEdit,
  onDelete,
  page,
  totalPages,
  onPageChange,
}) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const handleViewDetails = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

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
      {projects.map((project) => (
        <Card key={project.id} className="w-full">
          <CardHeader className="pb-1">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>{project.name}</span>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewDetails(project.id)}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">Ver detalles</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(project.id)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Editar proyecto</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(project.id)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Eliminar proyecto</span>
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {project.description && (
              <p className="text-sm text-muted-foreground">
                {project.description}
              </p>
            )}
            <div className="space-y-1 text-sm">
              <div>
                <span className="font-medium">Dirección:</span> {project.address || '-'}
              </div>
              <div>
                <span className="font-medium">Coordenadas:</span>{' '}
                {`${project.latitude.toFixed(4)}, ${project.longitude.toFixed(4)}`}
              </div>
              <div>
                <span className="font-medium">Tiempo de almuerzo:</span>{' '}
                <Badge variant="secondary">{project.lunchMinutes} min</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <PaginationControls />
    </div>
  ) : (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead className="text-right">Tiempo Almuerzo</TableHead>
              <TableHead className="text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="font-medium">{project.name}</TableCell>
                <TableCell>{project.address || '-'}</TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary">{project.lunchMinutes} min</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(project.id)}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Ver detalles</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(project.id)}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Editar proyecto</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(project.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Eliminar proyecto</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <PaginationControls />
    </div>
  );
};