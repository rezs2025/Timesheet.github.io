import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { TimeEntry } from '@/features/time-entry/types';

export interface ExcelExportData {
  entries: TimeEntry[];
  calculateHoursWorked: (entry: TimeEntry) => string;
  filename?: string;
  sheetName?: string;
  includeUserColumn?: boolean;
  includeProjectColumn?: boolean;
}

export const exportToExcel = ({
  entries,
  calculateHoursWorked,
  filename = 'registro-horas',
  sheetName = 'Registro de Horas',
  includeUserColumn = true,
  includeProjectColumn = true,
}: ExcelExportData) => {
  // Prepare data for Excel
  const excelData = entries.map((entry) => {
    const startTime = new Date(entry.startTime);
    const endTime = entry.endTime ? new Date(entry.endTime) : null;
    
    const rowData: any = {
      'Fecha': format(startTime, 'EEEE dd/MM/yyyy', { locale: es }),
    };

    if (includeUserColumn) {
      rowData['Empleado'] = entry.user.fullName;
    }

    if (includeProjectColumn) {
      rowData['Proyecto'] = entry.project.name;
    }

    rowData['Entrada'] = format(startTime, 'HH:mm');
    rowData['Salida'] = endTime ? format(endTime, 'HH:mm') : '-';
    rowData['Horas Trabajadas'] = entry.workedHoursFormatted || calculateHoursWorked(entry);
    rowData['Almuerzo (min)'] = entry.lunchMinutes || 0;

    return rowData;
  });

  // Create workbook and worksheet
  const ws = XLSX.utils.json_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  
  // Set column widths
  const columnWidths = [
    { wch: 20 }, // Fecha
    ...(includeUserColumn ? [{ wch: 25 }] : []), // Empleado
    ...(includeProjectColumn ? [{ wch: 30 }] : []), // Proyecto
    { wch: 10 }, // Entrada
    { wch: 10 }, // Salida
    { wch: 15 }, // Horas Trabajadas
    { wch: 12 }, // Almuerzo
  ];
  
  ws['!cols'] = columnWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Generate filename with current date
  const currentDate = format(new Date(), 'yyyy-MM-dd');
  const fullFilename = `${filename}-${currentDate}.xlsx`;

  // Save file
  XLSX.writeFile(wb, fullFilename);
};

export const exportWeeklySummaryToExcel = (
  entries: TimeEntry[],
  calculateHoursWorked: (entry: TimeEntry) => string,
  weekStart: Date,
  weekEnd: Date,
  includeUserColumn = true,
  includeProjectColumn = true
) => {
  const weekRange = `${format(weekStart, 'dd-MM-yyyy')}_${format(weekEnd, 'dd-MM-yyyy')}`;
  const filename = `resumen-semanal-${weekRange}`;
  
  exportToExcel({
    entries,
    calculateHoursWorked,
    filename,
    sheetName: `Semana ${format(weekStart, 'dd/MM')} - ${format(weekEnd, 'dd/MM')}`,
    includeUserColumn,
    includeProjectColumn,
  });
};