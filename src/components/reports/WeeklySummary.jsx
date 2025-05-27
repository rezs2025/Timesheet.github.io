import React, { useState, useEffect } from "react";
import { auth, db } from "../../firebase/config";
import { collection, doc, query, where, getDocs, orderBy, updateDoc } from "firebase/firestore";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addWeeks,
  subWeeks,
  parseISO
} from "date-fns";
import { es } from "date-fns/locale";
import * as XLSX from "xlsx";
import {
  Box,
  Typography,
  Paper,
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
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  GetApp as GetAppIcon,
  CalendarToday as CalendarTodayIcon,
  Clear as ClearIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import useLoggedUser from "@/hooks/useLoggedUser";

const WeeklySummary = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [weekEntries, setWeekEntries] = useState([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [weekSummary, setWeekSummary] = useState(null);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const { user, loading: loadingUser } = useLoggedUser();
  const [editingEntry, setEditingEntry] = useState(null);
  const [editForm, setEditForm] = useState({
    checkInTime: '',
    checkOutTime: '',
    lunchDuration: '60'
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  

  // cargar proyectos y usuarios al iniciar
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!auth.currentUser) return;
      if (loadingUser) return;
      if (!user) {
        setError("Debe iniciar sesión para ver el resumen semanal.");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const projectsCollection = collection(db, "projects");
        const projectsSnapshot = await getDocs(projectsCollection);
        const projectsList = projectsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProjects(projectsList);
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);
        const usersList = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersList);
        if (user?.role === "employee") {
          // Si el usuario no es admin, filtrar por su ID
          setSelectedUser(user.id);
          setSelectedProject(user.currentProject?.id || "");
        }
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
        setError(
          "Error al cargar los datos iniciales. Por favor, intente nuevamente."
        );
      } finally {
        setLoading(false);
      }
      
    };
    fetchInitialData();
  }, [user]);

  // Cargar datos de la semana actual
  useEffect(() => {
    const fetchWeekData = async () => {
      if (!auth.currentUser) return;
      try {
        setLoading(true);
        const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
        // Obtener entradas de tiempo de la semana seleccionada
        const formattedWeekStart = format(currentWeekStart, "yyyy-MM-dd");
        const formattedWeekEnd = format(weekEnd, "yyyy-MM-dd");

        let q;
        if (selectedProject && selectedUser) {
          q = query(
            collection(db, "timeEntries"),
            where("projectId", "==", selectedProject),
            where("userId", "==", selectedUser),
            where("date", ">=", formattedWeekStart),
            where("date", "<=", formattedWeekEnd),
            orderBy("date")
          );
        } else if (selectedProject) {
          q = query(
            collection(db, "timeEntries"),
            where("projectId", "==", selectedProject),
            where("date", ">=", formattedWeekStart),
            where("date", "<=", formattedWeekEnd),
            orderBy("date")
          );
        } else if (selectedUser) {
          q = query(
            collection(db, "timeEntries"),
            where("userId", "==", selectedUser),
            where("date", ">=", formattedWeekStart),
            where("date", "<=", formattedWeekEnd),
            orderBy("date")
          );
        } else {
          q = query(
            collection(db, "timeEntries"),
            where("date", ">=", formattedWeekStart),
            where("date", "<=", formattedWeekEnd),
            orderBy("date")
          );
        }

        const querySnapshot = await getDocs(q);
        const entries = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        calculateSummary(entries, currentWeekStart, weekEnd);

        // Calcular resumen
      } catch (error) {
        console.error("Error al cargar datos:", error);
        setError("Error al cargar los datos. Por favor, intente nuevamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchWeekData();
  }, [currentWeekStart, selectedProject, selectedUser]);

  const calculateSummary = (entries, weekStart, weekEnd) => {
    const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
    let totalHours = 0;
    let totalMinutes = 0;

    const dailySummary = daysOfWeek.map((day) => {
      const formattedDay = format(day, "yyyy-MM-dd");
      const dayEntries = entries.filter((entry) => entry.date === formattedDay);

      let hoursWorked = 0;
      let minutesWorked = 0;

      dayEntries.forEach((entry) => {
        if (entry.checkInTime && entry.checkOutTime) {
          const [inHours, inMinutes] = entry.checkInTime.split(":").map(Number);
          const [outHours, outMinutes] = entry.checkOutTime
            .split(":")
            .map(Number);

          let totalMinutesWorked =
            outHours * 60 + outMinutes - (inHours * 60 + inMinutes);
          totalMinutesWorked -= parseInt(entry.lunchDuration || "60", 10);

          if (totalMinutesWorked > 0) {
            hoursWorked += Math.floor(totalMinutesWorked / 60);
            minutesWorked += totalMinutesWorked % 60;

            totalHours += Math.floor(totalMinutesWorked / 60);
            totalMinutes += totalMinutesWorked % 60;
          }
        }
      });

      // Ajustar minutos si superan 60
      if (minutesWorked >= 60) {
        hoursWorked += Math.floor(minutesWorked / 60);
        minutesWorked = minutesWorked % 60;
      }

      return {
        date: day,
        formattedDate: format(day, "EEEE d", { locale: es }),
        formattedShortDate: format(day, "dd/MM/yyyy"),
        entries: dayEntries,
        hoursWorked,
        minutesWorked,
        formattedHours: `${hoursWorked}:${minutesWorked
          .toString()
          .padStart(2, "0")}`,
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
      formattedTotal: `${totalHours}:${totalMinutes
        .toString()
        .padStart(2, "0")}`,
      weekStart: format(weekStart, "dd/MM/yyyy"),
      weekEnd: format(weekEnd, "dd/MM/yyyy"),
    });
  };

  const handlePreviousWeek = () => {
    setCurrentWeekStart((prevWeek) => subWeeks(prevWeek, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart((prevWeek) => addWeeks(prevWeek, 1));
  };

  const getProjectName = (projectId) => {
    const project = projects.find((p) => p.id === projectId);
    return project ? project.name : "Proyecto no encontrado";
  };

  const getUserName = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.name || user.email : "Usuario no encontrado";
  };

  const exportToExcel = () => {
    if (!weekSummary) return;

    const workbook = XLSX.utils.book_new();

    const excelData = weekSummary.dailySummary.flatMap((day) => {
      return day.entries.map((entry) => ({
        Fecha: day.formattedShortDate,
        Día: format(day.date, "EEEE", { locale: es }),
        Empleado: getUserName(entry.userId),
        Proyecto: entry.projectId ? getProjectName(entry.projectId) : "",
        "Hora Entrada": entry.checkInTime || "",
        "Hora Salida": entry.checkOutTime || "",
        "Tiempo Almuerzo (min)": entry.lunchDuration || "",
        "Horas Trabajadas": calculateHoursWorked(entry),
        Notas: entry.notes || "",
      }));
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const colWidths = [
      { wch: 12 },
      { wch: 12 },
      { wch: 25 },
      { wch: 25 },
      { wch: 12 },
      { wch: 12 },
      { wch: 18 },
      { wch: 15 },
      { wch: 30 },
    ];
    worksheet["!cols"] = colWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte Semanal");
    const fileName = `Reporte_${weekSummary.weekStart.replace(
      /\//g,
      "-"
    )}_${weekSummary.weekEnd.replace(/\//g, "-")}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const calculateHoursWorked = (entry) => {
    if (!entry.checkInTime || !entry.checkOutTime) return "0:00";

    const [inHours, inMinutes] = entry.checkInTime.split(":").map(Number);
    const [outHours, outMinutes] = entry.checkOutTime.split(":").map(Number);

    let totalMinutesWorked =
      outHours * 60 + outMinutes - (inHours * 60 + inMinutes);
    totalMinutesWorked -= parseInt(entry.lunchDuration || "60", 10);

    if (totalMinutesWorked <= 0) return "0:00";

    const hours = Math.floor(totalMinutesWorked / 60);
    const minutes = totalMinutesWorked % 60;

    return `${hours}:${minutes.toString().padStart(2, "0")}`;
  };

  const handleSelectedProject = (event) => {
    const projectId = event.target.value;
    setSelectedProject(projectId);
    setSelectedUser("");
  };

  const handleEditClick = (entry) => {
    setEditingEntry(entry);
    setEditForm({
      checkInTime: entry.checkInTime || '',
      checkOutTime: entry.checkOutTime || '',
      lunchDuration: entry.lunchDuration || '60'
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async () => {
    if (!editingEntry) return;
    
    try {
      setLoading(true);
      const entryRef = doc(db, "timeEntries", editingEntry.id);
      await updateDoc(entryRef, {
        checkInTime: editForm.checkInTime,
        checkOutTime: editForm.checkOutTime,
        lunchDuration: editForm.lunchDuration,
        updatedAt: new Date(),
        updatedBy: auth.currentUser.uid
      });
      
      // Refrescar datos
      const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
      const formattedWeekStart = format(currentWeekStart, "yyyy-MM-dd");
      const formattedWeekEnd = format(weekEnd, "yyyy-MM-dd");
      
      const q = query(
        collection(db, "timeEntries"),
        where("date", ">=", formattedWeekStart),
        where("date", "<=", formattedWeekEnd),
        orderBy("date")
      );
      
      const querySnapshot = await getDocs(q);
      const entries = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      calculateSummary(entries, currentWeekStart, weekEnd);
      setEditingEntry(null);
      setMessage({ type: 'success', text: 'Registro actualizado correctamente' });
    } catch (error) {
      console.error('Error al actualizar registro:', error);
      setMessage({ type: 'error', text: 'Error al actualizar registro' });
    } finally {
      setLoading(false);
    }
  };

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

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={8} >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <CalendarTodayIcon sx={{ mr: 1, color: "primary.main" }} />
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: {
                        xs: "0.9rem", // sm and down
                        md: "1.5rem",    // sm and up
                      },
                    }}
                  >
                    Semana: {weekSummary?.weekStart} - {weekSummary?.weekEnd}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4} textAlign="right">
                <Box sx={{ display: "flex", justifyContent: "flex-end",  }}>
                  <IconButton onClick={handlePreviousWeek} color="primary">
                    <ArrowBackIcon />
                  </IconButton>
                  <IconButton onClick={handleNextWeek} color="primary">
                    <ArrowForwardIcon />
                  </IconButton>
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ mt: 3, mb: 2 }}>
            <Grid container spacing={2} justifyContent={"space-between"}>
              { !loadingUser && user?.role === "admin" && (
                <>
                  <Grid item xs={12} md={4}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Proyecto"
                      value={selectedProject}
                      onChange={handleSelectedProject}
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
                        onChange={(e) => setSelectedUser(e.target.value)}
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
                </>
              )}
              
              <Grid item xs={12} md={4} alignItems={"center"} textAlign={"right"}>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  startIcon={!loading ? <DownloadIcon /> : <CircularProgress color="info" size="1rem" />}
                  onClick={exportToExcel}
                >
                  Exportar a excel
                </Button>
              </Grid>
              
            </Grid>
          </Box>
        </CardContent>
      </Card>

      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "primary.main" }}>
              <TableCell sx={{ color: "white" }}>Fecha</TableCell>
              <TableCell sx={{ color: "white" }}>Empleado</TableCell>
              <TableCell sx={{ color: "white" }}>Proyecto</TableCell>
              <TableCell sx={{ color: "white" }}>Entrada/Salida</TableCell>
              <TableCell sx={{ color: "white" }}>Almuerzo</TableCell>
              <TableCell sx={{ color: "white" }}>Horas</TableCell>
              <TableCell sx={{ color: "white" }}>Notas</TableCell>
              {user?.role === "admin" && (
                <TableCell sx={{ color: "white" }}>Acciones</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {weekSummary?.dailySummary.flatMap((day) =>
              day.entries.map((entry, index) => (
                <TableRow
                  key={`${day.date}-${index}`}
                  sx={{
                    bgcolor:
                      format(day.date, "E") === "Sat" ||
                      format(day.date, "E") === "Sun"
                        ? "rgba(0,0,0,0.04)"
                        : "inherit",
                  }}
                >
                  <TableCell>
                    <Typography sx={{ textTransform: "capitalize" }}>
                      {day.formattedDate}
                    </Typography>
                  </TableCell>
                  <TableCell>{getUserName(entry.userId)}</TableCell>
                  <TableCell>
                    {entry.projectId ? getProjectName(entry.projectId) : "-"}
                  </TableCell>
                  <TableCell>{entry.checkInTime} - {entry.checkOutTime}</TableCell>
                  <TableCell>
                    {entry.lunchDuration ? `${entry.lunchDuration} min` : "-"}
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: "bold" }}>
                      {calculateHoursWorked(entry)}
                    </Typography>
                  </TableCell>
                  <TableCell>{entry.notes || "-"}</TableCell>
                  {user?.role === "admin" && (
                    <TableCell>
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => handleEditClick(entry)}
                      >
                        Editar
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Resumen Total
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography>
                <strong>Total de horas trabajadas:</strong>{" "}
                {weekSummary?.formattedTotal}
              </Typography>
              <Typography>
                <strong>Días registrados:</strong>{" "}
                {
                  weekSummary?.dailySummary.filter((d) => d.entries.length > 0)
                    .length
                }
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography>
                <strong>Proyectos:</strong>{" "}
                {
                  [...new Set(weekEntries.map((e) => e.projectId))].filter(
                    Boolean
                  ).length
                }
              </Typography>
              <Typography>
                <strong>Empleados:</strong>{" "}
                {[...new Set(weekEntries.map((e) => e.userId))].length}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      {editingEntry && (
        <Dialog 
          open={Boolean(editingEntry)} 
          onClose={() => setEditingEntry(null)}
          fullWidth
          maxWidth="sm"
        >
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
                    onChange={handleEditFormChange}
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
                    onChange={handleEditFormChange}
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
                      onChange={handleEditFormChange}
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
            <Button onClick={() => setEditingEntry(null)}>Cancelar</Button>
            <Button 
              onClick={handleEditSubmit}
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Guardar Cambios'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default WeeklySummary;
