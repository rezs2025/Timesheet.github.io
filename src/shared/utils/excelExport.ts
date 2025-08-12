import * as XLSX from 'xlsx';
import { format } from 'date-fns';
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
  filename = 'timesheet-records',
  sheetName = 'Timesheet Records',
  includeUserColumn = true,
  includeProjectColumn = true,
}: ExcelExportData) => {
  // Prepare data for Excel
  const excelData = entries.map((entry) => {
    const startTime = new Date(entry.startTime);
    const endTime = entry.endTime ? new Date(entry.endTime) : null;
    
    const rowData: any = {
      'Date': format(startTime, 'EEEE MM/dd/yyyy'),
    };

    if (includeUserColumn) {
      rowData['Employee'] = entry.user.fullName;
    }

    if (includeProjectColumn) {
      rowData['Project'] = entry.project.name;
    }

    rowData['Clock In'] = format(startTime, 'HH:mm');
    rowData['Clock Out'] = endTime ? format(endTime, 'HH:mm') : '-';
    rowData['Hours Worked'] = entry.workedHoursFormatted || calculateHoursWorked(entry);
    rowData['Lunch (min)'] = entry.lunchMinutes || 0;

    return rowData;
  });

  // Create workbook and worksheet
  const ws = XLSX.utils.json_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  
  // Set column widths
  const columnWidths = [
    { wch: 20 }, // Date
    ...(includeUserColumn ? [{ wch: 25 }] : []), // Employee
    ...(includeProjectColumn ? [{ wch: 30 }] : []), // Project
    { wch: 10 }, // Clock In
    { wch: 10 }, // Clock Out
    { wch: 15 }, // Hours Worked
    { wch: 12 }, // Lunch
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
  const weekRange = `${format(weekStart, 'MM-dd-yyyy')}_${format(weekEnd, 'MM-dd-yyyy')}`;
  const filename = `weekly-summary-${weekRange}`;
  
  exportToExcel({
    entries,
    calculateHoursWorked,
    filename,
    sheetName: `Week ${format(weekStart, 'MM/dd')} - ${format(weekEnd, 'MM/dd')}`,
    includeUserColumn,
    includeProjectColumn,
  });
};