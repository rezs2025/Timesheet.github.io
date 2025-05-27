import React from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  CircularProgress
} from '@mui/material';
import { format, parseISO } from 'date-fns';

const EditEntryDialog = ({
  editingEntry,
  onClose,
  onSubmit,
  projects,
  users,
  loading
}) => {
  const [editForm, setEditForm] = React.useState({
    checkInTime: '',
    checkOutTime: '',
    lunchDuration: '60'
  });

  React.useEffect(() => {
    if (editingEntry) {
      setEditForm({
        checkInTime: editingEntry.checkInTime || '',
        checkOutTime: editingEntry.checkOutTime || '',
        lunchDuration: editingEntry.lunchDuration || '60'
      });
    }
  }, [editingEntry]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const getProjectName = (projectId) => {
    const project = projects.find((p) => p.id === projectId);
    return project ? project.name : "Proyecto no encontrado";
  };

  const getUserName = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.name || user.email : "Usuario no encontrado";
  };

  if (!editingEntry) return null;

  return (
    <Dialog open={Boolean(editingEntry)} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Editar Registro - {getUserName(editingEntry.userId)}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Proyecto: {getProjectName(editingEntry.projectId)}
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            Fecha: {format(parseISO(editingEntry.date), 'dd/MM/yyyy')}
          </Typography>
          
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Hora de Entrada"
                name="checkInTime"
                value={editForm.checkInTime}
                onChange={handleFormChange}
                type="time"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Hora de Salida"
                name="checkOutTime"
                value={editForm.checkOutTime}
                onChange={handleFormChange}
                type="time"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Tiempo de Almuerzo</FormLabel>
                <RadioGroup
                  row
                  name="lunchDuration"
                  value={editForm.lunchDuration}
                  onChange={handleFormChange}
                >
                  <FormControlLabel value="0" control={<Radio />} label="0 min" />
                  <FormControlLabel value="15" control={<Radio />} label="15 min" />
                  <FormControlLabel value="30" control={<Radio />} label="30 min" />
                  <FormControlLabel value="45" control={<Radio />} label="45 min" />
                  <FormControlLabel value="60" control={<Radio />} label="60 min" />
                </RadioGroup>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button 
          onClick={() => onSubmit(editForm)}
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading && <CircularProgress size={24} sx={{ mr: 1 }} />} Guardar Cambios
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditEntryDialog;