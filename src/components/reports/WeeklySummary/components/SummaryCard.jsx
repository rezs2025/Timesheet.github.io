import React from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';

const SummaryCard = ({ weekSummary, weekEntries }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Resumen Total
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography>
              <strong>Total de horas trabajadas:</strong> {weekSummary?.formattedTotal}
            </Typography>
            <Typography>
              <strong>Días registrados:</strong>{" "}
              {weekSummary?.dailySummary.filter((d) => d.entries.length > 0).length}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography>
              <strong>Proyectos:</strong>{" "}
              {[...new Set(weekEntries.map((e) => e.projectId))].filter(Boolean).length}
            </Typography>
            <Typography>
              <strong>Empleados:</strong> {[...new Set(weekEntries.map((e) => e.userId))].length}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;