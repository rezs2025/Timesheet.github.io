// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase/config';
import { 
  collection, query, where, getDocs, orderBy, documentId, doc, getDoc 
} from 'firebase/firestore';
import { 
  format, startOfWeek, endOfWeek, eachDayOfInterval 
} from 'date-fns';
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
import useLoggedUser from '@/hooks/useLoggedUser';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: loadingUser, error: errorUser } = useLoggedUser();

  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [projects, setProjects] = useState([]);
  const [weekSummary, setWeekSummary] = useState(null);
  const [todayEntry, setTodayEntry]   = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (loadingUser) return;

      // Si no hay usuario autenticado
      if (!user) {
        setProjects([]);
        setWeekSummary(null);
        setTodayEntry(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // 1) Proyectos
        if (user.role === 'employee') {
          if (user.currentProject) {
            setProjects([user.currentProject]);
          } else {
            setProjects([]); // Sin proyecto asignado
          }
        } else {
          // admin u otro rol → todos los proyectos
          const projectsSnapshot = await getDocs(collection(db, 'projects'));
          setProjects(
            projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
          );
        }

        // 2) Sólo si tiene proyecto, cargar entradas de tiempo
        if (user.role !== 'employee' || user.currentProject) {
          const today       = new Date();
          const weekStart   = startOfWeek(today, { weekStartsOn: 1 });
          const weekEnd     = endOfWeek(today,   { weekStartsOn: 1 });
          const formattedStart = format(weekStart, 'yyyy-MM-dd');
          const formattedEnd   = format(weekEnd,   'yyyy-MM-dd');
          const formattedToday = format(today,      'yyyy-MM-dd');

          const entriesQuery = query(
            collection(db, 'timeEntries'),
            where('userId', '==', auth.currentUser.uid),
            where('date', '>=', formattedStart),
            where('date', '<=', formattedEnd),
            orderBy('date')
          );
          const qSnap = await getDocs(entriesQuery);
          const entries = qSnap.docs.map(d => ({ id: d.id, ...d.data() }));

          // Resumen diario
          let totalHours   = 0;
          let totalMinutes = 0;
          const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
          const dailySummary = days.map(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const entry = entries.find(e => e.date === dateKey);
            let hours = 0, mins = 0;
            if (entry?.checkInTime && entry?.checkOutTime) {
              const [h1, m1] = entry.checkInTime.split(':').map(Number);
              const [h2, m2] = entry.checkOutTime.split(':').map(Number);
              let diff = (h2 * 60 + m2) - (h1 * 60 + m1)
                         - (parseInt(entry.lunchDuration || '60', 10));
              if (diff > 0) {
                hours = Math.floor(diff / 60);
                mins  = diff % 60;
                totalHours   += hours;
                totalMinutes += mins;
              }
            }
            if (totalMinutes >= 60) {
              totalHours += Math.floor(totalMinutes / 60);
              totalMinutes = totalMinutes % 60;
            }
            return {
              date: day,
              formattedDate: format(day, 'EEEE d', { locale: es }),
              hoursWorked: hours,
              minutesWorked: mins,
              formattedHours: `${hours}:${mins.toString().padStart(2, '0')}`
            };
          });

          setWeekSummary({
            dailySummary,
            totalHours,
            totalMinutes,
            formattedTotal: `${totalHours}:${totalMinutes.toString().padStart(2, '0')}`
          });
          // Hoy
          const todayE = entries.find(e => e.date === formattedToday);
          setTodayEntry(todayE || null);
        } else {
          setWeekSummary(null);
          setTodayEntry(null);
        }
      } catch (err) {
        console.error(err);
        setError('Error al cargar datos del dashboard. Intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, loadingUser]);

  // Spinner mientras carga
  if (loading || loadingUser) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error en hook de usuario
  if (errorUser) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{errorUser}</Alert>
      </Box>
    );
  }

  // Sin proyecto para empleados
  if (user.role === 'employee' && projects.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          No tienes un proyecto asignado. Por favor contacta a un administrador para que te asigne uno.
        </Alert>
      </Box>
    );
  }

  // Error general
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // UI normal
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      <Grid container spacing={3}>

        {/* Estado Actual */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccessTimeIcon sx={{ mr: 1, color: 'primary.main' }}/>
                <Typography variant="h6">Estado Actual</Typography>
              </Box>

              {todayEntry ? (
                <>
                  <Typography><strong>Proyecto:</strong> {
                    projects.find(p => p.id === todayEntry.projectId)?.name
                  }</Typography>
                  <Typography><strong>Entrada:</strong> {todayEntry.checkInTime}</Typography>
                  <Typography><strong>Salida:</strong> {todayEntry.checkOutTime}</Typography>
                  <Typography><strong>Horas trabajadas:</strong> {
                    weekSummary.dailySummary
                      .find(d => format(d.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'))
                      ?.formattedHours || '0:00'
                  }</Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/time-entry')}
                    endIcon={<ArrowForwardIcon />}
                    sx={{ mt: 2 }}
                  >
                    {!todayEntry.checkInTime ? 'Registrar Entrada'
                      : !todayEntry.checkOutTime ? 'Registrar Salida'
                      : 'Ver Detalles'}
                  </Button>
                </>
              ) : (
                <>
                  <Typography>No has registrado horas hoy.</Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/time-entry')}
                    endIcon={<ArrowForwardIcon />}
                    sx={{ mt: 2 }}
                  >
                    Registrar Horas
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Resumen Semanal */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarTodayIcon sx={{ mr: 1, color: 'primary.main' }}/>
                <Typography variant="h6">Resumen Semanal</Typography>
              </Box>
              <Typography><strong>Total de horas esta semana:</strong> {weekSummary.formattedTotal}</Typography>
              <Divider sx={{ my: 2 }}/>
              {weekSummary.dailySummary.map(day => (
                <Box
                  key={format(day.date, 'yyyy-MM-dd')}
                  sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
                >
                  <Typography sx={{ textTransform: 'capitalize' }}>
                    {day.formattedDate}
                  </Typography>
                  <Typography>{day.formattedHours}</Typography>
                </Box>
              ))}
              <Button
                variant="outlined"
                onClick={() => navigate('/weekly-summary')}
                endIcon={<ArrowForwardIcon />}
                sx={{ mt: 2 }}
              >
                Ver Reporte Completo
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Mis Proyectos */}
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BusinessIcon sx={{ mr: 1, color: 'primary.main' }}/>
                <Typography variant="h6">Mis Proyectos</Typography>
              </Box>
              <Grid container spacing={2}>
                {projects.map(proj => (
                  <Grid item xs={12} sm={6} md={4} key={proj.id}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle1">{proj.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {proj.description || 'Sin descripción'}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
              {user.role === 'admin' && (
                <Button
                  variant="outlined"
                  onClick={() => navigate('/projects')}
                  endIcon={<ArrowForwardIcon />}
                  sx={{ mt: 2 }}
                >
                  Ver Todos los Proyectos
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
};

export default Dashboard;
