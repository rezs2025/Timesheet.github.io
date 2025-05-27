import React from 'react';
import { Box, Grid, Typography, IconButton } from '@mui/material';
import { CalendarToday as CalendarTodayIcon, ArrowBack as ArrowBackIcon, ArrowForward as ArrowForwardIcon } from '@mui/icons-material';

const WeekSelector = ({ currentWeekStart, weekSummary, onPreviousWeek, onNextWeek }) => {
  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={8}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <CalendarTodayIcon sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h6" sx={{ fontSize: { xs: "0.9rem", md: "1.5rem" } }}>
              Semana: {weekSummary?.weekStart} - {weekSummary?.weekEnd}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={4} textAlign="right">
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <IconButton onClick={onPreviousWeek} color="primary">
              <ArrowBackIcon />
            </IconButton>
            <IconButton onClick={onNextWeek} color="primary">
              <ArrowForwardIcon />
            </IconButton>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WeekSelector;