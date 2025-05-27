import React from 'react';
import { format } from 'date-fns';
import { TableContainer, Paper, Table, TableHead, TableBody, TableRow, TableCell, Typography, Button } from '@mui/material';

const TimeEntriesTable = ({
  weekSummary,
  user,
  projects,
  users,
  onEditClick,
  calculateHoursWorked
}) => {
  const getProjectName = (projectId) => {
    const project = projects.find((p) => p.id === projectId);
    return project ? project.name : "Proyecto no encontrado";
  };

  const getUserName = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.name || user.email : "Usuario no encontrado";
  };

  return (
    <TableContainer component={Paper} sx={{ mb: 3 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: "primary.main" }}>
            <TableCell sx={{ color: "white" }}>Fecha</TableCell>
            <TableCell sx={{ color: "white" }}>Empleado</TableCell>
            <TableCell sx={{ color: "white" }}>Proyecto</TableCell>
            <TableCell sx={{ color: "white" }}>Entrada/Salida</TableCell>
            <TableCell sx={{ color: "white" }}>Almuerzo</TableCell>
            <TableCell sx={{ color: "white" }}>Horas</TableCell>
            <TableCell sx={{ color: "white" }}>Notas</TableCell>
            {user?.role === "admin" && (
              <TableCell sx={{ color: "white" }}>Acciones</TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {weekSummary?.dailySummary.flatMap((day) =>
            day.entries.map((entry, index) => (
              <TableRow
                key={`${day.date}-${index}`}
                sx={{
                  bgcolor: format(day.date, "E") === "Sat" || format(day.date, "E") === "Sun"
                    ? "rgba(0,0,0,0.04)"
                    : "inherit",
                }}
              >
                <TableCell>
                  <Typography sx={{ textTransform: "capitalize" }}>
                    {day.formattedDate}
                  </Typography>
                </TableCell>
                <TableCell>{getUserName(entry.userId)}</TableCell>
                <TableCell>
                  {entry.projectId ? getProjectName(entry.projectId) : "-"}
                </TableCell>
                <TableCell>{entry.checkInTime} - {entry.checkOutTime}</TableCell>
                <TableCell>
                  {entry.lunchDuration ? `${entry.lunchDuration} min` : "-"}
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontWeight: "bold" }}>
                    {calculateHoursWorked(entry)}
                  </Typography>
                </TableCell>
                <TableCell>{entry.notes || "-"}</TableCell>
                {user?.role === "admin" && (
                  <TableCell>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => onEditClick(entry)}
                    >
                      Editar
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TimeEntriesTable;