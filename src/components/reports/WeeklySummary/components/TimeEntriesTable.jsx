import React from 'react';
import { format } from 'date-fns';
import {
  TableContainer, Paper, Table, TableHead, TableBody, TableRow,
  TableCell, Typography, Button, useMediaQuery, Box, Card, CardContent, Stack
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

const TimeEntriesTable = ({
  weekSummary,
  user,
  projects,
  users,
  onEditClick,
  calculateHoursWorked
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const getProjectName = (projectId) => {
    const project = projects.find((p) => p.id === projectId);
    return project ? project.name : "Proyecto no encontrado";
  };

  const getUserName = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.name || user.email : "Usuario no encontrado";
  };

  if (isSmallScreen) {
    // Vista móvil con tarjetas
    return (
      <Stack spacing={2} sx={{ mb: 3 }}>
        {weekSummary?.dailySummary.flatMap((day) =>
          day.entries.map((entry, index) => (
            <Card
              key={`${day.date}-${index}`}
              sx={{
                bgcolor: format(day.date, "E") === "Sat" || format(day.date, "E") === "Sun"
                  ? "rgba(0,0,0,0.04)"
                  : "background.paper"
              }}
            >
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold">
                  {day.formattedDate}
                </Typography>
                <Typography variant="body2">Empleado: {getUserName(entry.userId)}</Typography>
                <Typography variant="body2">Proyecto: {entry.projectId ? getProjectName(entry.projectId) : "-"}</Typography>
                <Typography variant="body2">Entrada/Salida: {entry.checkInTime} - {entry.checkOutTime}</Typography>
                <Typography variant="body2">Almuerzo: {entry.lunchDuration ? `${entry.lunchDuration} min` : "-"}</Typography>
                <Typography variant="body2" fontWeight="bold">
                  Horas trabajadas: {calculateHoursWorked(entry)}
                </Typography>
                <Typography variant="body2">Notas: {entry.notes || "-"}</Typography>
                {user?.role === "admin" && (
                  <Box mt={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => onEditClick(entry)}
                    >
                      Editar
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </Stack>
    );
  }

  // Vista de escritorio con tabla
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
