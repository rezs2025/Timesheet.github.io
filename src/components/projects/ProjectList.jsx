import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase/config';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, GeoPoint } from 'firebase/firestore';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationOnIcon,
  Business as BusinessIcon
} from '@mui/icons-material';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    latitude: '',
    longitude: ''
  });
  
  // Cargar proyectos al iniciar
  useEffect(() => {
    fetchProjects();
  }, []);
  
  // Obtener lista de proyectos
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const projectsCollection = collection(db, 'projects');
      const projectsSnapshot = await getDocs(projectsCollection);
      const projectsList = projectsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Asegurar que location sea un objeto con propiedades accesibles
        location: doc.data().location || {}
      }));
      setProjects(projectsList);
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
      setError('Error al cargar los proyectos. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };
  
  // Abrir diálogo para crear/editar proyecto
  const handleOpenDialog = (project = null) => {
    if (project) {
      // Editar proyecto existente
      setCurrentProject(project);
      setFormData({
        name: project.name || '',
        description: project.description || '',
        address: project.location?.address || '',
        latitude: project.location?.latitude?.toString() || '',
        longitude: project.location?.longitude?.toString() || ''
      });
    } else {
      // Nuevo proyecto
      setCurrentProject(null);
      setFormData({
        name: '',
        description: '',
        address: '',
        latitude: '',
        longitude: ''
      });
    }
    setOpenDialog(true);
  };
  
  // Cerrar diálogo
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Guardar proyecto
  const handleSaveProject = async () => {
    try {
      const { name, description, address, latitude, longitude } = formData;
      
      // Validaciones
      if (!name) {
        setError('El nombre del proyecto es obligatorio');
        return;
      }
      
      // Preparar datos del proyecto
      const projectData = {
        name,
        description,
        location: {
          address,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null
        },
        updatedAt: new Date()
      };
      
      if (currentProject) {
        // Actualizar proyecto existente
        const projectRef = doc(db, 'projects', currentProject.id);
        await updateDoc(projectRef, projectData);
      } else {
        // Crear nuevo proyecto
        projectData.createdAt = new Date();
        projectData.createdBy = auth.currentUser.uid;
        await addDoc(collection(db, 'projects'), projectData);
      }
      
      // Cerrar diálogo y recargar proyectos
      handleCloseDialog();
      fetchProjects();
    } catch (error) {
      console.error('Error al guardar proyecto:', error);
      setError('Error al guardar el proyecto. Por favor, intente nuevamente.');
    }
  };
  
  // Eliminar proyecto
  const handleDeleteProject = async (projectId) => {
    if (window.confirm('¿Está seguro de eliminar este proyecto? Esta acción no se puede deshacer.')) {
      try {
        await deleteDoc(doc(db, 'projects', projectId));
        fetchProjects();
      } catch (error) {
        console.error('Error al eliminar proyecto:', error);
        setError('Error al eliminar el proyecto. Por favor, intente nuevamente.');
      }
    }
  };
  
  // Obtener ubicación actual
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('La geolocalización no está soportada por este navegador.');
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          latitude: latitude.toString(),
          longitude: longitude.toString()
        }));
      },
      (error) => {
        console.error('Error al obtener ubicación:', error);
        setError('No se pudo obtener la ubicación. ' + error.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };
  
  if (loading && projects.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Proyectos
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Proyecto
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {projects.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">
            No hay proyectos registrados. Cree un nuevo proyecto para comenzar.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {project.name}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {project.description || 'Sin descripción'}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mt: 2 }}>
                    <LocationOnIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body2">
                      {project.location?.address || 'Sin dirección'}
                    </Typography>
                  </Box>
                  
                  {project.location?.latitude && project.location?.longitude && (
                    <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                      Coordenadas: {project.location.latitude.toFixed(6)}, {project.location.longitude.toFixed(6)}
                    </Typography>
                  )}
                </CardContent>
                
                <CardActions>
                  <Button 
                    size="small" 
                    startIcon={<EditIcon />}
                    onClick={() => handleOpenDialog(project)}
                  >
                    Editar
                  </Button>
                  
                  <Button 
                    size="small" 
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteProject(project.id)}
                  >
                    Eliminar
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Diálogo para crear/editar proyecto */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}
        </DialogTitle>
        
        <DialogContent>
          <TextField
            margin="dense"
            label="Nombre del Proyecto"
            name="name"
            fullWidth
            value={formData.name}
            onChange={handleChange}
            required
          />
          
          <TextField
            margin="dense"
            label="Descripción"
            name="description"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={handleChange}
          />
          
          <TextField
            margin="dense"
            label="Dirección"
            name="address"
            fullWidth
            value={formData.address}
            onChange={handleChange}
          />
          
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Coordenadas GPS
            </Typography>
            
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={5}>
                <TextField
                  size="small"
                  label="Latitud"
                  name="latitude"
                  fullWidth
                  value={formData.latitude}
                  onChange={handleChange}
                  type="number"
                  inputProps={{ step: 'any' }}
                />
              </Grid>
              
              <Grid item xs={5}>
                <TextField
                  size="small"
                  label="Longitud"
                  name="longitude"
                  fullWidth
                  value={formData.longitude}
                  onChange={handleChange}
                  type="number"
                  inputProps={{ step: 'any' }}
                />
              </Grid>
              
              <Grid item xs={2}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleGetCurrentLocation}
                  startIcon={<LocationOnIcon />}
                >
                  Actual
                </Button>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSaveProject} variant="contained" color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectList;