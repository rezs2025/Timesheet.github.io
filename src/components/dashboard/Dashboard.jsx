import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase/config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, parseISO, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  CalendarToday as CalendarTodayIcon,
  Business as BusinessIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import useLoggedUser from "@/hooks/useLoggedUser";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [weekSummary, setWeekSummary] = useState(null);
  const [todayEntry, setTodayEntry] = useState(null);
  const [projects, setProjects] = useState([]);

  const { user, loading: loadingUser } = useLoggedUser();

  useEffect(() => {
    const fetchData = async () => {
      if (loadingUser || !user) return;
      
      try {
        setLoading(true);
        
        // Obtener proyectos
        if (user.role === 'employee') {
          if (user.currentProject) {
            setProjects([user.currentProject]);
          }
        } else {
          const projectsCollection = collection(db, 'projects');
          const projectsSnapshot = await getDocs(projectsCollection);
          const projectsList = projectsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setProjects(projectsList);
        }
        
        // Obtener entradas de tiempo de la semana actual
        const today = new Date();
        const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Lunes
        const weekEnd = endOfWeek(today, { weekStartsOn: 1 }); // Domingo
        
        const formattedWeekStart = format(weekStart, 'yyyy-MM-dd');
        const formattedWeekEnd = format(weekEnd, 'yyyy-MM-dd');
        const formattedToday = format(today, 'yyyy-MM-dd');
        
        const entriesRef = collection(db, 'timeEntries');
        const q = query(
          entriesRef,
          where('userId', '==', auth.currentUser.uid),
          where('date', '>=', formattedWeekStart),
          where('date', '<=', formattedWeekEnd),
          orderBy('date')
        );
        
        const querySnapshot = await getDocs(q);
        const entries = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Calcular horas trabajadas por día
        const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
        let totalHours = 0;
        let totalMinutes = 0;
        
        const dailySummary = daysOfWeek.map(day => {
          const formattedDay = format(day, 'yyyy-MM-dd');
          const dayEntry = entries.find(entry => entry.date === formattedDay);
          
          let hoursWorked = 0;
          let minutesWorked = 0;
          
          if (dayEntry && dayEntry.checkInTime && dayEntry.checkOutTime) {
            const [inHours, inMinutes] = dayEntry.checkInTime.split(':').map(Number);
            const [outHours, outMinutes] = dayEntry.checkOutTime.split(':').map(Number);
            
            let totalMinutesWorked = (outHours * 60 + outMinutes) - (inHours * 60 + inMinutes);
            totalMinutesWorked -= parseInt(dayEntry.lunchDuration || '60', 10);
            
            if (totalMinutesWorked > 0) {
              hoursWorked = Math.floor(totalMinutesWorked / 60);
              minutesWorked = totalMinutesWorked % 60;
              
              totalHours += hoursWorked;
              totalMinutes += minutesWorked;
            }
          }
          
          // Ajustar el total de minutos
          if (totalMinutes >= 60) {
            totalHours += Math.floor(totalMinutes / 60);
            totalMinutes = totalMinutes % 60;
          }
          
          return {
            date: day,
            formattedDate: format(day, 'EEEE d', { locale: es }),
            entry: dayEntry,
            hoursWorked,
            minutesWorked,
            formattedHours: `${hoursWorked}:${minutesWorked.toString().padStart(2, '0')}`
          };
        });
        
        // Encontrar la entrada de hoy
        const todayEntryData = entries.find(entry => entry.date === formattedToday);
        setTodayEntry(todayEntryData);
        
        setWeekSummary({
          dailySummary,
          totalHours,
          totalMinutes,
          formattedTotal: `${totalHours}:${totalMinutes.toString().padStart(2, '0')}`
        });
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
        setError('Error al cargar los datos. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Proyecto no encontrado';
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Tarjeta de estado actual */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccessTimeIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Estado Actual</Typography>
              </Box>
              
              {todayEntry ? (
                <Box>
                  <Typography variant="body1" gutterBottom>
                    <strong>Proyecto:</strong> {getProjectName(todayEntry.projectId)}
                  </Typography>
                  
                  <Typography variant="body1" gutterBottom>
                    <strong>Entrada:</strong> {todayEntry.checkInTime || 'No registrada'}
                  </Typography>
                  
                  <Typography variant="body1" gutterBottom>
                    <strong>Salida:</strong> {todayEntry.checkOutTime || 'No registrada'}
                  </Typography>
                  
                  {todayEntry.checkInTime && todayEntry.checkOutTime && (
                    <Typography variant="body1" gutterBottom>
                      <strong>Horas trabajadas:</strong> {weekSummary.dailySummary.find(day => 
                        format(day.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                      )?.formattedHours || '0:00'}
                    </Typography>
                  )}
                  
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => navigate('/time-entry')}
                    sx={{ mt: 2 }}
                    endIcon={<ArrowForwardIcon />}
                  >
                    {!todayEntry.checkInTime ? 'Registrar Entrada' : 
                     !todayEntry.checkOutTime ? 'Registrar Salida' : 'Ver Detalles'}
                  </Button>
                </Box>
              ) : (
                <Box>
                  <Typography variant="body1" gutterBottom>
                    No has registrado horas hoy.
                  </Typography>
                  
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => navigate('/time-entry')}
                    sx={{ mt: 2 }}
                    endIcon={<ArrowForwardIcon />}
                  >
                    Registrar Horas
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Tarjeta de resumen semanal */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarTodayIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Resumen Semanal</Typography>
              </Box>
              
              {weekSummary && (
                <Box>
                  <Typography variant="body1" gutterBottom>
                    <strong>Total de horas esta semana:</strong> {weekSummary.formattedTotal}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  {weekSummary.dailySummary.map((day) => (
                    <Box key={format(day.date, 'yyyy-MM-dd')} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ 
                        textTransform: 'capitalize',
                        fontWeight: isWithinInterval(new Date(), { start: startOfWeek(day.date), end: endOfWeek(day.date) }) ? 'bold' : 'normal'
                      }}>
                        {day.formattedDate}
                      </Typography>
                      <Typography variant="body2">
                        {day.formattedHours}
                      </Typography>
                    </Box>
                  ))}
                  
                  <Button 
                    variant="outlined" 
                    color="primary"
                    onClick={() => navigate('/weekly-summary')}
                    sx={{ mt: 2 }}
                    endIcon={<ArrowForwardIcon />}
                  >
                    Ver Reporte Completo
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Tarjeta de proyectos */}
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Mis Proyectos</Typography>
              </Box>
              
              {projects.length > 0 ? (
                <Grid container spacing={2}>
                  {projects.map((project) => (
                    <Grid item xs={12} sm={6} md={4} key={project.id}>
                      <Paper elevation={1} sx={{ p: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          {project.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {project.description || 'Sin descripción'}
                        </Typography>
                        {project.location && (
                          <Typography variant="body2" color="text.secondary">
                            <strong>Ubicación:</strong> {project.location.address || 'No especificada'}
                          </Typography>
                        )}
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body1">
                  No hay proyectos asignados.
                </Typography>
              )}
              {
                user?.role === 'admin' &&
                  <Button 
                    variant="outlined" 
                    color="primary"
                    onClick={() => navigate('/projects')}
                    sx={{ mt: 2 }}
                    endIcon={<ArrowForwardIcon />}
                  >
                    Ver Todos los Proyectos
                  </Button>
              }
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;