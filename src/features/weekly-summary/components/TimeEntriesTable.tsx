import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Edit } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import { WeekSummary } from '../types';
import { User } from '@/shared/types/user';
import { TimeEntry } from '@/features/time-entry/types';

interface TimeEntriesTableProps {
  entries?: TimeEntry[];
  user: User | null;
  onEditClick?: (entry: any) => void;
  calculateHoursWorked: (entry: TimeEntry) => string;
  showUserColumn?: boolean;
  showProjectColumn?: boolean;
  showEditButton?: boolean;
}

const TimeEntriesTable: React.FC<TimeEntriesTableProps> = ({
  entries,
  user,
  onEditClick,
  calculateHoursWorked,
  showUserColumn = true,
  showProjectColumn = true,
  showEditButton = true,
}) => {

  const getStatusBadge = (entry: TimeEntry) => {
    if (!entry.startTime || !entry.endTime) {
      return <Badge variant="destructive">Incompleto</Badge>;
    }
    return <Badge variant="default">Completo</Badge>;
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Registro de Horas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                {showUserColumn && <TableHead>Empleado</TableHead>}
                {showProjectColumn && <TableHead>Proyecto</TableHead>}
                <TableHead>Entrada</TableHead>
                <TableHead>Salida</TableHead>
                <TableHead>Horas</TableHead>
                <TableHead>Estado</TableHead>
                {showEditButton && <TableHead>Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries && entries.length > 0 ? (
                  entries.map((entry) => (
                    <TableRow
                      key={entry.id}
                      className={
                        format(entry.startTime, "E") === "Sat" || format(entry.startTime, "E") === "Sun"
                          ? "bg-muted/50"
                          : ""
                      }
                    >
                      <TableCell className="font-medium">
                        {format(entry.startTime, "EEEE dd/MM/yyyy", {locale: es })}
                      </TableCell>
                      {showUserColumn && (
                        <TableCell>{entry.user.fullName}</TableCell>
                      )}
                      {showProjectColumn && (
                        <TableCell>
                          {entry.project.name}
                        </TableCell>
                      )}
                      <TableCell>{format(new Date(entry.startTime), 'dd-MM-yyyy h:mm aa') || "-"}</TableCell>
                      <TableCell>{format(new Date(entry.endTime), 'dd-MM-yyyy h:mm aa') || "-"}</TableCell>
                      <TableCell className="font-medium">
                        {entry.workedHoursFormatted}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(entry)}
                      </TableCell>
                      {showEditButton && onEditClick && (
                        <TableCell>
                          {(user?.role === 'admin' || user?.role === 'pm' || user?.id === entry.user.id) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEditClick(entry)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No hay registros de horas para esta semana.
                    </TableCell>
                  </TableRow>
                )
              }
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeEntriesTable;