import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase/config';
import { collection, query, where, getDocs, doc, updateDoc, orderBy } from 'firebase/firestore';
import { format, startOfWeek, endOfWeek, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarTodayIcon
} from '@mui/icons-material';

const ApprovalManager = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeEntries, setTimeEntries] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedWeek, setSelectedWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [openDialog, setOpenDialog] = useState(false);
  const [currentEntry, setCurrentEntry] = useState(null);
  const [approvalNote, setApprovalNote] = useState('');
  
  // Cargar datos iniciales
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!auth.currentUser) return;
      
      try {
        setLoading(true);
        
        // Verificar si el usuario actual es administrador
        const adminQuery = query(
          collection(db, 'users'),
          where('email', '==', auth.currentUser.email),
          where('role', '==', 'admin')
        );
        const adminSnapshot = await getDocs(adminQuery);
        
        if (adminSnapshot.empty) {
          setError('No tienes permisos para acceder a esta sección');
          setLoading(false);
          return;
        }
        
        // Cargar usuarios
        const usersCollection = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollection);
        const usersList = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersList);
        
        // Cargar proyectos
        const projectsCollection = collection(db, 'projects');
        const projectsSnapshot = await getDocs(projectsCollection);
        const projectsList = projectsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProjects(projectsList);
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
        setError('Error al cargar los datos. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);
  
  // Cargar entradas de tiempo según los filtros seleccionados
  useEffect(() => {
    const fetchTimeEntries = async () => {
      if (!auth.currentUser) return;
      
      try {
        setLoading(true);
        setError('');
        
        // Construir la consulta base
        let timeEntriesQuery = collection(db, 'timeEntries');
        let constraints = [];
        
        // Filtrar por semana
        const weekStart = selectedWeek;
        const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 });
        const formattedWeekStart = format(weekStart, 'yyyy-MM-dd');
        const formattedWeekEnd = format(weekEnd, 'yyyy-MM-dd');
        
        constraints.push(where('date', '>=', formattedWeekStart));
        constraints.push(where('date', '<=', formattedWeekEnd));
        
        // Filtrar por usuario si está seleccionado
        if (selectedUser) {
          constraints.push(where('userId', '==', selectedUser));
        }
        
        // Filtrar por proyecto si está seleccionado
        if (selectedProject) {
          constraints.push(where('projectId', '==', selectedProject));
        }
        
        // Ejecutar la consulta
        const q = query(timeEntriesQuery, ...constraints, orderBy('date'));
        const querySnapshot = await getDocs(q);
        
        const entries = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date // Asegurarse de que la fecha esté en el formato correcto
        }));
        
        setTimeEntries(entries);
      } catch (error) {
        console.error('Error al cargar entradas de tiempo:', error);
        setError('Error al cargar los datos. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    
    // Solo ejecutar la consulta si hay filtros seleccionados
    if (selectedWeek) {
      fetchTimeEntries();
    }
  }, [selectedUser, selectedProject, selectedWeek]);
  
  // Abrir diálogo de aprobación/rechazo
  const handleOpenDialog = (entry, isApproval) => {
    setCurrentEntry({
      ...entry,
      isApproval
    });
    setApprovalNote('');
    setOpenDialog(true);
  };
  
  // Cerrar diálogo
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentEntry(null);
    setApprovalNote('');
  };
  
  // Procesar aprobación o rechazo
  const handleProcessApproval = async () => {
    if (!currentEntry) return;
    
    try {
      setLoading(true);
      
      const entryRef = doc(db, 'timeEntries', currentEntry.id);
      await updateDoc(entryRef, {
        status: currentEntry.isApproval ? 'approved' : 'rejected',
        approvalNote: approvalNote,
        approvedBy: auth.currentUser.uid,
        approvedAt: new Date(),
        updatedAt: new Date()
      });
      
      // Actualizar la lista de entradas
      setTimeEntries(prev => prev.map(entry => 
        entry.id === currentEntry.id ? 
        { 
          ...entry, 
          status: currentEntry.isApproval ? 'approved' : 'rejected',
          approvalNote: approvalNote,
          approvedBy: auth.currentUser.uid,
          approvedAt: new Date()
        } : 
        entry
      ));
      
      setSuccess(`Registro ${currentEntry.isApproval ? 'aprobado' : 'rechazado'} correctamente`);
      handleCloseDialog();
    } catch (error) {
      console.error('Error al procesar la aprobación:', error);
      setError('Error al procesar la solicitud. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };
  
  // Calcular horas trabajadas
  const calculateWorkedHours = (entry) => {
    if (!entry.checkInTime || !entry.checkOutTime) return '0:00';
    
    const [inHours, inMinutes] = entry.checkInTime.split(':').map(Number);
    const [outHours, outMinutes] = entry.checkOutTime.split(':').map(Number);
    
    let totalMinutes = (outHours * 60 + outMinutes) - (inHours * 60 + inMinutes);
    
    // Restar tiempo de almuerzo
    totalMinutes -= parseInt(entry.lunchDuration || '60', 10);
    
    if (totalMinutes < 0) totalMinutes = 0;
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };
  
  // Obtener nombre del usuario
  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Usuario desconocido';
  };
  
  // Obtener nombre del proyecto
  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Proyecto desconocido';
  };
  
  // Renderizar chip de estado
  const renderStatusChip = (status) => {
    switch (status) {
      case 'approved':
        return <Chip label="Aprobado" color="success" size="small" icon={<CheckCircleIcon />} />;
      case 'rejected':
        return <Chip label="Rechazado" color="error" size="small" icon={<CancelIcon />} />;
      default:
        return <Chip label="Pendiente" color="warning" size="small" />;
    }
  };
  
  if (loading && users.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error === 'No tienes permisos para acceder a esta sección') {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Aprobación de Horas Trabajadas
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Empleado</InputLabel>
              <Select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                label="Empleado"
              >
                <MenuItem value="">Todos los empleados</MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Proyecto</InputLabel>
              <Select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                label="Proyecto"
              >
                <MenuItem value="">Todos los proyectos</MenuItem>
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarTodayIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="subtitle1">
                Semana: {format(selectedWeek, 'dd/MM/yyyy')} - {format(endOfWeek(selectedWeek, { weekStartsOn: 1 }), 'dd/MM/yyyy')}
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ mb: 3 }} />
        
        {timeEntries.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Empleado</TableCell>
                  <TableCell>Proyecto</TableCell>
                  <TableCell>Entrada</TableCell>
                  <TableCell>Salida</TableCell>
                  <TableCell>Almuerzo</TableCell>
                  <TableCell>Horas Netas</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {timeEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.date}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                        {getUserName(entry.userId)}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <BusinessIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                        {getProjectName(entry.projectId)}
                      </Box>
                    </TableCell>
                    <TableCell>{entry.checkInTime || '-'}</TableCell>
                    <TableCell>{entry.checkOutTime || '-'}</TableCell>
                    <TableCell>{entry.lunchDuration || '60'} min</TableCell>
                    <TableCell>{calculateWorkedHours(entry)}</TableCell>
                    <TableCell>{renderStatusChip(entry.status)}</TableCell>
                    <TableCell>
                      {entry.status !== 'approved' && (
                        <Button 
                          variant="contained" 
                          color="success" 
                          size="small" 
                          onClick={() => handleOpenDialog(entry, true)}
                          sx={{ mr: 1, mb: { xs: 1, md: 0 } }}
                        >
                          Aprobar
                        </Button>
                      )}
                      {entry.status !== 'rejected' && (
                        <Button 
                          variant="contained" 
                          color="error" 
                          size="small"
                          onClick={() => handleOpenDialog(entry, false)}
                        >
                          Rechazar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Alert severity="info">
            No hay registros de tiempo para los filtros seleccionados.
          </Alert>
        )}
      </Paper>
      
      {/* Diálogo de aprobación/rechazo */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {currentEntry?.isApproval ? 'Aprobar Registro' : 'Rechazar Registro'}
        </DialogTitle>
        <DialogContent>
          {currentEntry && (
            <>
              <DialogContentText sx={{ mb: 2 }}>
                {currentEntry.isApproval 
                  ? '¿Está seguro de que desea aprobar este registro de tiempo?' 
                  : '¿Está seguro de que desea rechazar este registro de tiempo?'}
              </DialogContentText>
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Empleado: {getUserName(currentEntry.userId)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Fecha: {currentEntry.date}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Entrada: {currentEntry.checkInTime || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Salida: {currentEntry.checkOutTime || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Horas trabajadas: {calculateWorkedHours(currentEntry)}
                  </Typography>
                </Grid>
              </Grid>
              
              <TextField
                label="Nota"
                multiline
                rows={3}
                value={approvalNote}
                onChange={(e) => setApprovalNote(e.target.value)}
                fullWidth
                placeholder={currentEntry.isApproval 
                  ? 'Agregar comentario (opcional)' 
                  : 'Indique el motivo del rechazo'}
                required={!currentEntry.isApproval}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button 
            onClick={handleProcessApproval} 
            variant="contained" 
            color={currentEntry?.isApproval ? 'success' : 'error'}
            disabled={!currentEntry?.isApproval && !approvalNote}
          >
            {currentEntry?.isApproval ? 'Aprobar' : 'Rechazar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApprovalManager;