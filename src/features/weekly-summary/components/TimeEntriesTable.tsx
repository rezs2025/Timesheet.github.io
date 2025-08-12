import React from 'react';
import { format } from 'date-fns';
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
  exportFileName = 'timesheet-records',
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
          <CardTitle>Time Records</CardTitle>
          {showExportButton && entries.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportToExcel}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              {!isMobile && 'Export Excel'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {entries.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No time records found for this week.
          </div>
        ) : isMobile ? (
          // Mobile: Card layout
          <div className="space-y-4 p-4">
            {entries.map((entry) => {
              entry.startTime = new Date(entry.startTime);
              entry.endTime = new Date(entry.endTime);
              const isWeekend = ['Sat', 'Sun'].includes(format(entry.startTime, 'E'));
              return (
                <Card key={entry.id} className={`${isWeekend ? 'bg-muted/30' : ''} border`}>
                  <CardContent className="p-4 space-y-3">
                    {/* Date header */}
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-base">
                        {format(entry.startTime, 'EEEE MM/dd/yyyy')}
                      </div>
                      {(showEditButton || showDeleteButton) && (
                        <div className="flex gap-1">
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
                      )}
                    </div>

                    {/* User row */}
                    {showUserColumn && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Employee:</span>
                        <span className="font-medium">{entry.user.fullName}</span>
                      </div>
                    )}

                    {/* Project row */}
                    {showProjectColumn && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Project:</span>
                        <span className="font-medium truncate ml-2">{entry.project.name}</span>
                      </div>
                    )}

                    {/* Time info grid */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground block">Clock In:</span>
                        <span className="font-mono font-medium">
                          {entry.startTime ? format(entry.startTime, 'HH:mm') : '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Clock Out:</span>
                        <span className="font-mono font-medium">
                          {entry.endTime ? format(entry.endTime, 'HH:mm') : '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Hours:</span>
                        <span className="font-mono font-bold text-base">
                          {entry.workedHoursFormatted || calculateHoursWorked(entry)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Lunch:</span>
                        <span className="font-medium">{entry.lunchMinutes || 0} min</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          // Desktop: Table layout
          <div className="overflow-x-auto" style={{ width: availableWidth }}>
            <div className="p-3">
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    {showUserColumn && <TableHead>Employee</TableHead>}
                    {showProjectColumn && <TableHead>Project</TableHead>}
                    <TableHead>Clock In</TableHead>
                    <TableHead>Clock Out</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Lunch</TableHead>
                    {(showEditButton || showDeleteButton) && <TableHead className="text-center">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => {
                    entry.startTime = new Date(entry.startTime);
                    entry.endTime = new Date(entry.endTime);
                    const isWeekend = ['Sat', 'Sun'].includes(format(entry.startTime, 'E'));
                    return (
                      <TableRow key={entry.id} className={isWeekend ? 'bg-muted/50' : ''}>
                        <TableCell className="font-medium whitespace-nowrap">
                          {format(entry.startTime, 'EEEE MM/dd/yyyy')}
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
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TimeEntriesTable;
