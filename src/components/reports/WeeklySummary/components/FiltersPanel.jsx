import React from 'react';
import { Grid, TextField, MenuItem, Box } from '@mui/material';
import ExportButton from './ExportButton';

const FiltersPanel = ({
  loadingUser,
  user,
  projects,
  users,
  selectedProject,
  selectedUser,
  onProjectChange,
  onUserChange,
  loading,
  onExport
}) => {
  if (loadingUser || user?.role !== "admin") return null;

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2} justifyContent="space-between">
        <Grid item xs={12} md={4}>
          <TextField
            select
            fullWidth
            size="small"
            label="Proyecto"
            value={selectedProject}
            onChange={onProjectChange}
          >
            <MenuItem key="all">Todos los proyectos</MenuItem>
            {projects.map((project) => (
              <MenuItem key={project.id} value={project.id}>
                {project.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        
        {selectedProject && (
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              size="small"
              label="Empleado"
              value={selectedUser}
              disabled={!selectedProject}
              onChange={onUserChange}
            >
              <MenuItem value="">Todos los empleados</MenuItem>
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.displayName || user.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        )}
        
        <Grid item xs={12} md={4} alignItems="center" textAlign="right">
          <ExportButton loading={loading} onExport={onExport} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default FiltersPanel;