import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { BounceLoader } from "react-spinners";

/**
 * Loading component using MUI CircularProgress and animated dots.
 */
export default function Loading() {

  const theme = useTheme();

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <BounceLoader
        loading
        color={theme.palette.primary.main}
        size={150}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
      <Typography variant="h6" sx={{ mt: 2 }}>
        Cargando
      </Typography>
    </Box>
  );
}
