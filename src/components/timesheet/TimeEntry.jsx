import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase/config';
import { collection, addDoc, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  AccessTime as AccessTimeIcon,
  MyLocation as MyLocationIcon,
  Check as CheckIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

// Función para calcular la distancia entre dos puntos geográficos (fórmula de Haversine)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distancia en km
  return distance * 1000; // Convertir a metros
};

const TimeEntry = () => {
  const [date, setDate] = useState(new Date());
  const [selectedProject, setSelectedProject] = useState('');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [lunchDuration, setLunchDuration] = useState('60');
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [timeEntryId, setTimeEntryId] = useState(null);
  const [existingEntry, setExistingEntry] = useState(null);
  const [locationStatus, setLocationStatus] = useState('pending'); // 'pending', 'verified', 'error'
  const [verifyingLocation, setVerifyingLocation] = useState(false);
  
  // Cargar proyectos al iniciar
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsCollection = collection(db, 'projects');
        const projectsSnapshot = await getDocs(projectsCollection);
        const projectsList = projectsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProjects(projectsList);
      } catch (error) {
        console.error('Error al cargar proyectos:', error);
        setMessage({ type: 'error', text: 'Error al cargar proyectos' });
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Verificar si ya existe un registro para la fecha seleccionada
  useEffect(() => {
    const checkExistingEntry = async () => {
      if (!auth.currentUser) return;
      
      try {
        setLoading(true);
        const formattedDate = format(date, 'yyyy-MM-dd');
        const entriesRef = collection(db, 'timeEntries');
        const q = query(
          entriesRef,
          where('userId', '==', auth.currentUser.uid),
          where('date', '==', formattedDate)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const entryData = querySnapshot.docs[0].data();
          const entryId = querySnapshot.docs[0].id;
          
          setTimeEntryId(entryId);
          setExistingEntry(entryData);
          setCheckInTime(entryData.checkInTime || '');
          setCheckOutTime(entryData.checkOutTime || '');
          setLunchDuration(entryData.lunchDuration || '60');
          setNotes(entryData.notes || '');
          setSelectedProject(entryData.projectId || '');
        } else {
          // Resetear valores si no hay entrada existente
          setTimeEntryId(null);
          setExistingEntry(null);
          setCheckInTime('');
          setCheckOutTime('');
          setLunchDuration('60');
          setNotes('');
        }
      } catch (error) {
        console.error('Error al verificar entrada existente:', error);
        setMessage({ type: 'error', text: 'Error al cargar datos' });
      } finally {
        setLoading(false);
      }
    };
    
    checkExistingEntry();
  }, [date]);

  // Obtener ubicación actual
  const getCurrentLocation = () => {
    setVerifyingLocation(true);
    setLocationStatus('pending');
    setLocationError('');
    
    if (!navigator.geolocation) {
      setLocationError('La geolocalización no está soportada por este navegador.');
      setLocationStatus('error');
      setVerifyingLocation(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        verifyProjectLocation(latitude, longitude);
      },
      (error) => {
        console.error('Error al obtener ubicación:', error);
        setLocationError('No se pudo obtener la ubicación. ' + error.message);
        setLocationStatus('error');
        setVerifyingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Verificar si la ubicación actual está dentro del rango permitido del proyecto
  const verifyProjectLocation = async (latitude, longitude) => {
    if (!selectedProject) {
      setLocationError('Seleccione un proyecto primero');
      setLocationStatus('error');
      setVerifyingLocation(false);
      return;
    }
    
    try {
      const projectRef = doc(db, 'projects', selectedProject);
      const projectSnap = await getDoc(projectRef);
      
      if (projectSnap.exists()) {
        const projectData = projectSnap.data();
        const projectLocation = projectData.location;
        
        if (projectLocation && projectLocation.latitude && projectLocation.longitude) {
          const distance = calculateDistance(
            latitude,
            longitude,
            projectLocation.latitude,
            projectLocation.longitude
          );
          
          // Verificar si está dentro del radio permitido (100 metros)
          if (distance <= 100) {
            setLocationStatus('verified');
            setLocationError('');
          } else {
            setLocationError(`Estás a ${Math.round(distance)} metros del proyecto. Debes estar a menos de 100 metros.`);
            setLocationStatus('error');
          }
        } else {
          setLocationError('El proyecto no tiene una ubicación definida.');
          setLocationStatus('error');
        }
      } else {
        setLocationError('Proyecto no encontrado.');
        setLocationStatus('error');
      }
    } catch (error) {
      console.error('Error al verificar ubicación del proyecto:', error);
      setLocationError('Error al verificar la ubicación.');
      setLocationStatus('error');
    } finally {
      setVerifyingLocation(false);
    }
  };

  // Registrar hora de entrada
  const handleCheckIn = async () => {
    if (!selectedProject) {
      setMessage({ type: 'error', text: 'Seleccione un proyecto' });
      return;
    }
    
    if (locationStatus !== 'verified') {
      setMessage({ type: 'error', text: 'Debe verificar su ubicación primero' });
      return;
    }
    
    try {
      const now = new Date();
      const currentTime = format(now, 'HH:mm');
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      if (timeEntryId) {
        // Actualizar entrada existente
        const entryRef = doc(db, 'timeEntries', timeEntryId);
        await updateDoc(entryRef, {
          checkInTime: currentTime,
          updatedAt: now
        });
      } else {
        // Crear nueva entrada
        const newEntry = {
          userId: auth.currentUser.uid,
          userName: auth.currentUser.displayName || auth.currentUser.email,
          projectId: selectedProject,
          date: formattedDate,
          checkInTime: currentTime,
          lunchDuration: lunchDuration,
          notes: notes,
          createdAt: now,
          updatedAt: now
        };
        
        const docRef = await addDoc(collection(db, 'timeEntries'), newEntry);
        setTimeEntryId(docRef.id);
      }
      
      setCheckInTime(currentTime);
      setMessage({ type: 'success', text: 'Hora de entrada registrada correctamente' });
    } catch (error) {
      console.error('Error al registrar hora de entrada:', error);
      setMessage({ type: 'error', text: 'Error al registrar hora de entrada' });
    }
  };

  // Registrar hora de salida
  const handleCheckOut = async () => {
    if (!checkInTime) {
      setMessage({ type: 'error', text: 'Debe registrar la hora de entrada primero' });
      return;
    }
    
    if (locationStatus !== 'verified') {
      setMessage({ type: 'error', text: 'Debe verificar su ubicación primero' });
      return;
    }
    
    try {
      const now = new Date();
      const currentTime = format(now, 'HH:mm');
      
      if (timeEntryId) {
        const entryRef = doc(db, 'timeEntries', timeEntryId);
        await updateDoc(entryRef, {
          checkOutTime: currentTime,
          lunchDuration: lunchDuration,
          notes: notes,
          updatedAt: now
        });
        
        setCheckOutTime(currentTime);
        setMessage({ type: 'success', text: 'Hora de salida registrada correctamente' });
      } else {
        setMessage({ type: 'error', text: 'No se encontró el registro de entrada' });
      }
    } catch (error) {
      console.error('Error al registrar hora de salida:', error);
      setMessage({ type: 'error', text: 'Error al registrar hora de salida' });
    }
  };

  // Calcular horas trabajadas
  const calculateWorkedHours = () => {
    if (!checkInTime || !checkOutTime) return '0:00';
    
    const [inHours, inMinutes] = checkInTime.split(':').map(Number);
    const [outHours, outMinutes] = checkOutTime.split(':').map(Number);
    
    let totalMinutes = (outHours * 60 + outMinutes) - (inHours * 60 + inMinutes);
    
    // Restar tiempo de almuerzo
    totalMinutes -= parseInt(lunchDuration, 10);
    
    if (totalMinutes < 0) totalMinutes = 0;
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Registro de Tiempo
        </Typography>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Fecha"
                value={date}
                onChange={(newDate) => setDate(newDate)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Proyecto</InputLabel>
                <Select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  label="Proyecto"
                >
                  {projects.map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MyLocationIcon sx={{ mr: 1 }} />
                <Typography variant="subtitle1">
                  Verificación de Ubicación
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={getCurrentLocation}
                  disabled={!selectedProject || verifyingLocation}
                  startIcon={<MyLocationIcon />}
                >
                  Verificar Ubicación
                </Button>
                
                {verifyingLocation && (
                  <CircularProgress size={24} sx={{ ml: 2 }} />
                )}
                
                {locationStatus === 'verified' && (
                  <Box sx={{ display: 'flex', alignItems: 'center', ml: 2, color: 'success.main' }}>
                    <CheckIcon />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      Ubicación verificada
                    </Typography>
                  </Box>
                )}
              </Box>
              
              {locationError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {locationError}
                </Alert>
              )}
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccessTimeIcon sx={{ mr: 1 }} />
                <Typography variant="subtitle1">
                  Hora de Entrada: {checkInTime || 'No registrada'}
                </Typography>
              </Box>
              
              <Button
                variant="contained"
                color="primary"
                onClick={handleCheckIn}
                disabled={locationStatus !== 'verified'}
                fullWidth
              >
                Registrar Entrada
              </Button>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccessTimeIcon sx={{ mr: 1 }} />
                <Typography variant="subtitle1">
                  Hora de Salida: {checkOutTime || 'No registrada'}
                </Typography>
              </Box>
              
              <Button
                variant="contained"
                color="secondary"
                onClick={handleCheckOut}
                disabled={!checkInTime || locationStatus !== 'verified'}
                fullWidth
              >
                Registrar Salida
              </Button>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Tiempo de Almuerzo</FormLabel>
                <RadioGroup
                  row
                  value={lunchDuration}
                  onChange={(e) => setLunchDuration(e.target.value)}
                >
                  <FormControlLabel value="30" control={<Radio />} label="30 minutos" />
                  <FormControlLabel value="60" control={<Radio />} label="60 minutos" />
                </RadioGroup>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="subtitle1">Horas Trabajadas (Neto)</Typography>
                <Typography variant="h4">{calculateWorkedHours()}</Typography>
                <Typography variant="caption">Ya con descuento de almuerzo</Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Notas"
                multiline
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                fullWidth
              />
            </Grid>
          </Grid>
        </Paper>
        
        {message.text && (
          <Alert severity={message.type} sx={{ mt: 2 }}>
            {message.text}
          </Alert>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default TimeEntry;