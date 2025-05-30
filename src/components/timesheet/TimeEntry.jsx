import React, { useState, useEffect } from "react";
import { auth, db } from "../../firebase/config";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
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
  Backdrop,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  AccessTime as AccessTimeIcon,
  MyLocation as MyLocationIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useGeolocation } from "@/hooks/useGeolocation";
import useLoggedUser from "@/hooks/useLoggedUser";

// Función para calcular la distancia entre dos puntos geográficos (fórmula de Haversine)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distancia en km
  return distance * 1000; // Convertir a metros
};

const TimeEntry = () => {
  const [date, setDate] = useState(new Date());
  const [selectedProject, setSelectedProject] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkInTime, setCheckInTime] = useState("");
  const [checkOutTime, setCheckOutTime] = useState("");
  const [lunchDuration, setLunchDuration] = useState("60");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [timeEntryId, setTimeEntryId] = useState(null);
  const [existingEntry, setExistingEntry] = useState(null);
  const { user, loadingUser } = useLoggedUser();

  // Usamos el hook de geolocalización
  const {
    location,
    error: locationError,
    status: locationStatus,
    accuracy,
    refreshLocation,
  } = useGeolocation({
    timeout: 15000,
    enableHighAccuracy: true,
  });

  // Cargar proyecto al iniciar
  useEffect(() => {
    setSelectedProject(user?.currentProject?.id || "");
  }, [user]);

  // Verificar si ya existe un registro para la fecha seleccionada
  useEffect(() => {
    const checkExistingEntry = async () => {
      if (!auth.currentUser) return;

      try {
        setLoading(true);
        const formattedDate = format(date, "yyyy-MM-dd");
        const entriesRef = collection(db, "timeEntries");
        const q = query(
          entriesRef,
          where("userId", "==", auth.currentUser.uid),
          where("date", "==", formattedDate)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const entryData = querySnapshot.docs[0].data();
          const entryId = querySnapshot.docs[0].id;

          setTimeEntryId(entryId);
          setExistingEntry(entryData);
          setCheckInTime(entryData.checkInTime || "");
          setCheckOutTime(entryData.checkOutTime || "");
          setLunchDuration(entryData.lunchDuration || "60");
          setNotes(entryData.notes || "");
          setSelectedProject(entryData.projectId || "");
        } else {
          // Resetear valores si no hay entrada existente
          resetEntry();
        }
      } catch (error) {
        console.error("Error al verificar entrada existente:", error);
        setMessage({ type: "error", text: "Error al cargar datos" });
      } finally {
        setLoading(false);
      }
    };

    checkExistingEntry();
  }, [date]);

  const resetEntry = () => {
    setTimeEntryId(null);
    setExistingEntry(null);
    setCheckInTime("");
    setCheckOutTime("");
    setLunchDuration("60");
    setNotes("");
  };

  // Verificar si la ubicación actual está dentro del rango permitido del proyecto
  const verifyProjectLocation = async () => {
    if (!selectedProject) {
      setMessage({ type: "error", text: "Seleccione un proyecto primero" });
      return false;
    }

    if (locationStatus !== "success") {
      setMessage({ type: "error", text: "Debe obtener su ubicación primero" });
      return false;
    }

    try {
      const projectRef = doc(db, "projects", selectedProject);
      const projectSnap = await getDoc(projectRef);

      if (projectSnap.exists()) {
        const projectData = projectSnap.data();
        const projectLocation = projectData.location;

        if (
          projectLocation &&
          projectLocation.latitude &&
          projectLocation.longitude
        ) {
          const distance = calculateDistance(
            location.latitude,
            location.longitude,
            projectLocation.latitude,
            projectLocation.longitude
          );

          // Verificar si está dentro del radio permitido (100 metros)
          if (distance <= 100) {
            return true;
          } else {
            setMessage({
              type: "error",
              text: `Estás a ${Math.round(
                distance
              )} metros del proyecto. Debes estar a menos de 100 metros.`,
            });
            return false;
          }
        } else {
          setMessage({
            type: "error",
            text: "El proyecto no tiene una ubicación definida.",
          });
          return false;
        }
      } else {
        setMessage({ type: "error", text: "Proyecto no encontrado." });
        return false;
      }
    } catch (error) {
      console.error("Error al verificar ubicación del proyecto:", error);
      setMessage({ type: "error", text: "Error al verificar la ubicación." });
      return false;
    }
  };

  // Registrar hora de entrada
  const handleCheckIn = async () => {
    if (!selectedProject) {
      setMessage({ type: "error", text: "Seleccione un proyecto" });
      return;
    }

    const isLocationValid = await verifyProjectLocation();
    if (!isLocationValid) return;

    try {
      const now = new Date();
      const currentTime = format(now, "HH:mm");
      const formattedDate = format(date, "yyyy-MM-dd");

      if (timeEntryId) {
        // Actualizar entrada existente
        const entryRef = doc(db, "timeEntries", timeEntryId);
        await updateDoc(entryRef, {
          checkInTime: currentTime,
          updatedAt: now,
          location: {
            // Guardamos la ubicación del check-in
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: accuracy,
          },
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
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: accuracy,
          },
          createdAt: now,
          updatedAt: now,
        };

        const docRef = await addDoc(collection(db, "timeEntries"), newEntry);
        setTimeEntryId(docRef.id);
      }

      setCheckInTime(currentTime);
      setMessage({
        type: "success",
        text: "Hora de entrada registrada correctamente",
      });
    } catch (error) {
      console.error("Error al registrar hora de entrada:", error);
      setMessage({ type: "error", text: "Error al registrar hora de entrada" });
    }
  };

  // Registrar hora de salida
  const handleCheckOut = async () => {
    if (!checkInTime) {
      setMessage({
        type: "error",
        text: "Debe registrar la hora de entrada primero",
      });
      return;
    }

    const isLocationValid = await verifyProjectLocation();
    if (!isLocationValid) return;

    try {
      const now = new Date();
      const currentTime = format(now, "HH:mm");

      if (timeEntryId) {
        const entryRef = doc(db, "timeEntries", timeEntryId);
        await updateDoc(entryRef, {
          checkOutTime: currentTime,
          lunchDuration: lunchDuration,
          notes: notes,
          updatedAt: now,
          checkOutLocation: {
            // Guardamos la ubicación del check-out
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: accuracy,
          },
        });

        setCheckOutTime(currentTime);
        setMessage({
          type: "success",
          text: "Hora de salida registrada correctamente",
        });
      } else {
        setMessage({
          type: "error",
          text: "No se encontró el registro de entrada",
        });
      }
    } catch (error) {
      console.error("Error al registrar hora de salida:", error);
      setMessage({ type: "error", text: "Error al registrar hora de salida" });
    }
  };

  // Calcular horas trabajadas
  const calculateWorkedHours = () => {
    if (!checkInTime || !checkOutTime) return "0:00";

    const [inHours, inMinutes] = checkInTime.split(":").map(Number);
    const [outHours, outMinutes] = checkOutTime.split(":").map(Number);

    let totalMinutes = outHours * 60 + outMinutes - (inHours * 60 + inMinutes);

    // Restar tiempo de almuerzo
    totalMinutes -= parseInt(lunchDuration, 10);

    if (totalMinutes < 0) totalMinutes = 0;

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}:${minutes.toString().padStart(2, "0")}`;
  };

  if (loadingUser || loading) {
    return (
      <Backdrop open sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, color: '#fff' }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  if (!loadingUser && user && !user.currentProject?.id) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          No estás asignado a ningún proyecto. Contacta a tu administrador para que te asigne uno.
        </Alert>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box sx={{ p: 2 }}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{ fontWeight: "bold", mb: 3 }}
        >
          Registro de Tiempo
        </Typography>

        <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Fecha"
                value={format(date, "dd/MM/yyyy")}
                fullWidth
                size="small"
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
            {locationStatus === "loading" && (
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    textAlign: "center",
                  }}
                >
                  <CircularProgress size={24} />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Obteniendo ubicación...
                  </Typography>
                </Box>
              </Grid>
            )}
            {locationStatus === "error" && (
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    textAlign: "center",
                    bgcolor: "error.light",
                    color: "error.contrastText",
                  }}
                >
                  <WarningIcon sx={{ fontSize: "1.5rem", mb: 1 }} />
                  <Typography variant="body2">
                    {locationError || "Error al obtener ubicación"}
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={refreshLocation}
                    sx={{ mt: 1 }}
                  >
                    Reintentar
                  </Button>
                </Box>
              </Grid>
            )}
            {!checkInTime && locationStatus === "success" && (
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    mb: 2,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    <AccessTimeIcon sx={{ mr: 1, fontSize: "1rem" }} />
                    Hora de Entrada
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {checkInTime || "--:--"}
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={handleCheckIn}
                    disabled={locationStatus !== "success"}
                    fullWidth
                    size="small"
                  >
                    <MyLocationIcon sx={{ mr: 1, fontSize: "1rem" }} />
                    Registrar Entrada
                  </Button>
                </Box>
              </Grid>
            )}
            <Grid item xs={12}>
              <Box
                sx={{
                  p: 1,
                  bgcolor: "primary.light",
                  color: "primary.contrastText",
                  borderRadius: 1,
                  textAlign: "center",
                }}
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ fontWeight: "bold", mb: 0 }}>
                      Proyecto:{" "}
                      {user?.currentProject?.name || "No seleccionado"}
                    </Typography>
                  </Grid>
                  <Grid
                    item
                    xs={4}
                    sx={{ textAlign: "left", alignItems: "top" }}
                  >
                    {checkInTime && (
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        Entrada: <b>{checkInTime}</b>
                      </Typography>
                    )}
                    {checkOutTime && (
                      <Typography variant="body2">
                        Salida: <b>{checkOutTime}</b>
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="subtitle2">
                      Horas Trabajadas
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      {calculateWorkedHours()}
                    </Typography>
                    <Typography variant="caption">
                      Neto (descontado almuerzo)
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {checkInTime && !checkOutTime && (
              <>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="lunch-duration-label">
                      Tiempo de Almuerzo
                    </InputLabel>
                    <Select
                      labelId="lunch-duration-label"
                      id="lunch-duration"
                      value={lunchDuration}
                      label="Tiempo de Almuerzo"
                      onChange={(e) => setLunchDuration(e.target.value)}
                    >
                      <MenuItem value="0">0 min</MenuItem>
                      <MenuItem value="15">15 min</MenuItem>
                      <MenuItem value="30">30 min</MenuItem>
                      <MenuItem value="45">45 min</MenuItem>
                      <MenuItem value="60">60 min</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Notas adicionales"
                    multiline
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    fullWidth
                    size="small"
                  />
                </Grid>
              </>
            )}
            {/* Salida */}
            {checkInTime && !checkOutTime && locationStatus === "success" && (
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    p: 2,
                    mb: 2,
                  }}
                >
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleCheckOut}
                    disabled={!checkInTime || locationStatus !== "success"}
                    fullWidth
                    size="small"
                  >
                    <AccessTimeIcon sx={{ mr: 1, fontSize: "1rem" }} />
                    Registrar Salida
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
          {message.text && (
            <Alert
              severity={message.type}
              sx={{ mb: 2 }}
              onClose={() => setMessage({ type: "", text: "" })}
            >
              {message.text}
            </Alert>
          )}
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default TimeEntry;
