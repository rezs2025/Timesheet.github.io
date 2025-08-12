import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Edit, Trash2, Download } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { useSidebar } from '@/shared/components/ui/sidebar';
import { useIsMobile } from '@/shared/hooks/use-mobile';
import { TimeEntry } from '@/features/time-entry/types';
import { User } from '@/shared/types/user';
import { exportToExcel } from '@/shared/utils/excelExport';

interface TimeEntriesTableProps {
  entries?: TimeEntry[];
  user: User | null;
  onEditClick?: (entry: TimeEntry) => void;
  onDeleteClick?: (entry: TimeEntry) => void;
  calculateHoursWorked: (entry: TimeEntry) => string;
  showUserColumn?: boolean;
  showProjectColumn?: boolean;
  showEditButton?: boolean;
  showDeleteButton?: boolean;
  showExportButton?: boolean;
  exportFileName?: string;
}

const TimeEntriesTable: React.FC<TimeEntriesTableProps> = ({
  entries = [],
  user,
  onEditClick,
  onDeleteClick,
  calculateHoursWorked,
  showUserColumn = true,
  showProjectColumn = true,
  showEditButton = true,
  showDeleteButton = false,
  showExportButton = true,
  exportFileName = 'registro-horas',
}) => {
  const { state } = useSidebar();
  const isMobile = useIsMobile();
  
  // Calcular el ancho disponible basado en el estado del sidebar
  const availableWidth = isMobile 
    ? '100%' // En mobile el sidebar es overlay, usar todo el ancho
    : state === 'expanded' 
      ? 'calc(100vw - var(--sidebar-width) - 3rem)'
      : 'calc(100vw - var(--sidebar-width-icon) - 3rem)';

  const columnsCount =
    5 +
    (showUserColumn ? 1 : 0) +
    (showProjectColumn ? 1 : 0) +
    (showEditButton || showDeleteButton ? 1 : 0);

  const handleExportToExcel = () => {
    if (entries.length === 0) {
      return;
    }

    exportToExcel({
      entries,
      calculateHoursWorked,
      filename: exportFileName,
      includeUserColumn: showUserColumn,
      includeProjectColumn: showProjectColumn,
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Registro de Horas</CardTitle>
          {showExportButton && entries.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportToExcel}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              {!isMobile && 'Exportar Excel'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto" style={{ width: availableWidth }}>
          <div className="p-3">
            <Table className="min-w-[800px]">
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                {showUserColumn && <TableHead>Empleado</TableHead>}
                {showProjectColumn && <TableHead>Proyecto</TableHead>}
                <TableHead>Entrada</TableHead>
                <TableHead>Salida</TableHead>
                <TableHead>Horas</TableHead>
                <TableHead>Almuerzo</TableHead>
                {(showEditButton || showDeleteButton) && <TableHead className="text-center">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.length > 0 ? (
                entries.map((entry) => {
                  entry.startTime = new Date(entry.startTime);
                  entry.endTime = new Date(entry.endTime);
                  const isWeekend = ['Sat', 'Sun'].includes(format(entry.startTime, 'E'));
                  return (
                    <TableRow key={entry.id} className={isWeekend ? 'bg-muted/50' : ''}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {format(entry.startTime, 'dd/MM/yyyy', { locale: es })}
                      </TableCell>
                      {showUserColumn && (
                        <TableCell className="whitespace-nowrap">{entry.user.fullName}</TableCell>
                      )}
                      {showProjectColumn && (
                        <TableCell className="truncate max-w-xs">{entry.project.name}</TableCell>
                      )}
                      <TableCell>
                        {entry.startTime
                          ? format(entry.startTime, 'HH:mm')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {entry.endTime
                          ? format(entry.endTime, 'HH:mm')
                          : '-'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {entry.workedHoursFormatted || calculateHoursWorked(entry)}
                      </TableCell>
                      <TableCell>{entry.lunchMinutes || 0} min</TableCell>
                      {(showEditButton || showDeleteButton) && (
                        <TableCell>
                          <div className="flex justify-center gap-1">
                            {showEditButton &&
                              onEditClick &&
                              (user?.role === 'admin' || user?.role === 'pm' || user?.id === entry.user.id) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onEditClick(entry)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                            {showDeleteButton &&
                              onDeleteClick &&
                              (user?.role === 'admin' || user?.role === 'pm') && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onDeleteClick(entry)}
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={columnsCount} className="text-center text-muted-foreground py-4">
                    No hay registros de horas para esta semana.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeEntriesTable;
