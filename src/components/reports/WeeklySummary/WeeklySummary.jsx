import React, { useState, useEffect } from "react";
import { auth, db } from "@/firebase/config";
import { collection, doc, query, where, getDocs, orderBy, updateDoc } from "firebase/firestore";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks } from "date-fns";
import { es } from "date-fns/locale";
import useLoggedUser from "@/hooks/useLoggedUser";
import WeekSelector from "./components/WeekSelector";
import FiltersPanel from "./components/FiltersPanel";
import TimeEntriesTable from "./components/TimeEntriesTable";
import SummaryCard from "./components/SummaryCard";
import EditEntryDialog from "./components/EditEntryDialog";
import { Box, Typography, Card, Alert } from "@mui/material";
import * as XLSX from "xlsx";

const WeeklySummary = () => {
  // Estados
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [weekEntries, setWeekEntries] = useState([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [weekSummary, setWeekSummary] = useState(null);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [editingEntry, setEditingEntry] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  
  const { user, loading: loadingUser } = useLoggedUser();
  

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
  };

  const handleEditSubmit = async (editForm) => {
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
        <WeekSelector 
          currentWeekStart={currentWeekStart}
          weekSummary={weekSummary}
          onPreviousWeek={handlePreviousWeek}
          onNextWeek={handleNextWeek}
        />
        
        <FiltersPanel
          loadingUser={loadingUser}
          loading={loading}
          onExport={exportToExcel}
          user={user}
          projects={projects}
          users={users}
          selectedProject={selectedProject}
          selectedUser={selectedUser}
          onProjectChange={handleSelectedProject}
          onUserChange={(e) => setSelectedUser(e.target.value)}
        />
      </Card>

      <TimeEntriesTable
        weekSummary={weekSummary}
        user={user}
        projects={projects}
        users={users}
        onEditClick={handleEditClick}
        calculateHoursWorked={calculateHoursWorked}
      />

      <SummaryCard 
        weekSummary={weekSummary}
        weekEntries={weekEntries}
      />

      <EditEntryDialog
        editingEntry={editingEntry}
        onClose={() => setEditingEntry(null)}
        onSubmit={handleEditSubmit}
        projects={projects}
        users={users}
        loading={loading}
      />
    </Box>
  );
};

export default WeeklySummary;
