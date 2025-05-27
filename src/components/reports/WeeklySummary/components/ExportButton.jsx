import React from 'react';
import { Button, CircularProgress } from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';

const ExportButton = ({ loading, onExport }) => {
  return (
    <Button
      variant="contained"
      color="primary"
      disabled={loading}
      startIcon={!loading ? <DownloadIcon /> : <CircularProgress color="info" size="1rem" />}
      onClick={onExport}
    >
      Exportar a excel
    </Button>
  );
};

export default ExportButton;