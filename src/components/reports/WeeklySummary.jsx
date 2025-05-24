import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase/config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import * as XLSX from 'xlsx';
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
  IconButton,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  GetApp as GetAppIcon,
  CalendarToday as CalendarTodayIcon
} from '@mui/icons-material';

const WeeklySummary = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [weekEntries, setWeekEntries] = useState([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [weekSummary, setWeekSummary] = useState(null);
  const [projects, setProjects] = useState([]);
  
  // Cargar datos de la semana actual
  useEffect(() => {
    const fetchWeekData = async () => {
      if (!auth.currentUser) return;
      
      try {
        setLoading(true);
        
        // Obtener proyectos
        const projectsCollection = collection(db, 'projects');
        const projectsSnapshot = await getDocs(projectsCollection);
        const projectsList = projectsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProjects(projectsList);
        
        // Obtener entradas de tiempo de la semana seleccionada
        const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
        
        const formattedWeekStart = format(currentWeekStart, 'yyyy-MM-dd');
        const formattedWeekEnd = format(weekEnd, 'yyyy-MM-dd');
        
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
        const daysOfWeek = eachDayOfInterval({ start: currentWeekStart, end: weekEnd });
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
          
          return {
            date: day,
            formattedDate: format(day, 'EEEE d', { locale: es }),
            formattedShortDate: format(day, 'dd/MM/yyyy'),
            entry: dayEntry,
            hoursWorked,
            minutesWorked,
            formattedHours: `${hoursWorked}:${minutesWorked.toString().padStart(2, '0')}`
          };
        });
        
        // Ajustar el total de minutos
        if (totalMinutes >= 60) {
          totalHours += Math.floor(totalMinutes / 60);
          totalMinutes = totalMinutes % 60;
        }
        
        setWeekEntries(entries);
        setWeekSummary({
          dailySummary,
          totalHours,
          totalMinutes,
          formattedTotal: `${totalHours}:${totalMinutes.toString().padStart(2, '0')}`,
          weekStart: format(currentWeekStart, 'dd/MM/yyyy'),
          weekEnd: format(weekEnd, 'dd/MM/yyyy')
        });
      } catch (error) {
        console.error('Error al cargar datos de la semana:', error);
        setError('Error al cargar los datos. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchWeekData();
  }, [currentWeekStart]);
  
  // Navegar a la semana anterior
  const handlePreviousWeek = () => {
    setCurrentWeekStart(prevWeek => subWeeks(prevWeek, 1));
  };
  
  // Navegar a la semana siguiente
  const handleNextWeek = () => {
    setCurrentWeekStart(prevWeek => addWeeks(prevWeek, 1));
  };
  
  // Obtener nombre del proyecto
  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Proyecto no encontrado';
  };
  
  // Exportar a Excel
  const exportToExcel = () => {
    if (!weekSummary) return;
    
    const workbook = XLSX.utils.book_new();
    
    // Datos para el Excel
    const excelData = weekSummary.dailySummary.map(day => {
      const entry = day.entry || {};
      return {
        'Fecha': day.formattedShortDate,
        'Día': format(day.date, 'EEEE', { locale: es }),
        'Proyecto': entry.projectId ? getProjectName(entry.projectId) : '',
        'Hora Entrada': entry.checkInTime || '',
        'Hora Salida': entry.checkOutTime || '',
        'Tiempo Almuerzo (min)': entry.lunchDuration || '',
        'Horas Trabajadas': day.formattedHours,
        'Notas': entry.notes || ''
      };
    });
    
    // Crear hoja de cálculo
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Ajustar ancho de columnas
    const colWidths = [
      { wch: 12 }, // Fecha
      { wch: 12 }, // Día
      { wch: 20 }, // Proyecto
      { wch: 12 }, // Hora Entrada
      { wch: 12 }, // Hora Salida
      { wch: 18 }, // Tiempo Almuerzo
      { wch: 15 }, // Horas Trabajadas
      { wch: 30 }  // Notas
    ];
    worksheet['!cols'] = colWidths;
    
    // Añadir hoja al libro
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte Semanal');
    
    // Generar archivo y descargarlo
    const fileName = `Reporte_${auth.currentUser.displayName || auth.currentUser.email}_${weekSummary.weekStart.replace(/\//g, '-')}_${weekSummary.weekEnd.replace(/\//g, '-')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
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
        Resumen Semanal
      </Typography>
      
      {weekSummary && (
        <>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarTodayIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">
                    Semana: {weekSummary.weekStart} - {weekSummary.weekEnd}
                  </Typography>
                </Box>
                
                <Box>
                  <IconButton onClick={handlePreviousWeek} color="primary">
                    <ArrowBackIcon />
                  </IconButton>
                  <IconButton onClick={handleNextWeek} color="primary">
                    <ArrowForwardIcon />
                  </IconButton>
                </Box>
              </Box>
              
              <Typography variant="h5" sx={{ textAlign: 'center', my: 2 }}>
                Total de horas: {weekSummary.formattedTotal}
              </Typography>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<GetAppIcon />}
                onClick={exportToExcel}
                sx={{ mt: 2 }}
              >
                Exportar a Excel
              </Button>
            </CardContent>
          </Card>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white' }}>Fecha</TableCell>
                  <TableCell sx={{ color: 'white' }}>Proyecto</TableCell>
                  <TableCell sx={{ color: 'white' }}>Entrada</TableCell>
                  <TableCell sx={{ color: 'white' }}>Salida</TableCell>
                  <TableCell sx={{ color: 'white' }}>Almuerzo</TableCell>
                  <TableCell sx={{ color: 'white' }}>Horas</TableCell>
                  <TableCell sx={{ color: 'white' }}>Notas</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {weekSummary.dailySummary.map((day) => {
                  const entry = day.entry || {};
                  return (
                    <TableRow key={format(day.date, 'yyyy-MM-dd')} sx={{
                      bgcolor: format(day.date, 'E') === 'Sat' || format(day.date, 'E') === 'Sun' ? 'rgba(0,0,0,0.04)' : 'inherit'
                    }}>
                      <TableCell>
                        <Typography sx={{ textTransform: 'capitalize' }}>
                          {day.formattedDate}
                        </Typography>
                      </TableCell>
                      <TableCell>{entry.projectId ? getProjectName(entry.projectId) : '-'}</TableCell>
                      <TableCell>{entry.checkInTime || '-'}</TableCell>
                      <TableCell>{entry.checkOutTime || '-'}</TableCell>
                      <TableCell>{entry.lunchDuration ? `${entry.lunchDuration} min` : '-'}</TableCell>
                      <TableCell>
                        <Typography sx={{ fontWeight: 'bold' }}>
                          {day.formattedHours}
                        </Typography>
                      </TableCell>
                      <TableCell>{entry.notes || '-'}</TableCell>
                    </TableRow>
                  );
                })}
                <TableRow sx={{ bgcolor: 'rgba(25, 118, 210, 0.08)' }}>
                  <TableCell colSpan={5} sx={{ textAlign: 'right' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      Total de horas:
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {weekSummary.formattedTotal}
                    </Typography>
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
};

export default WeeklySummary;