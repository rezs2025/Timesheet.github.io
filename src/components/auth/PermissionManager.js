import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase/config';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import {
  Security as SecurityIcon,
  Save as SaveIcon
} from '@mui/icons-material';

const PermissionManager = () => {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userPermissions, setUserPermissions] = useState({});
  
  // Cargar usuarios, proyectos y permisos al iniciar
  useEffect(() => {
    const fetchData = async () => {
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
        
        // Inicializar permisos de usuarios
        const initialPermissions = {};
        usersList.forEach(user => {
          initialPermissions[user.id] = {
            role: user.role || 'employee',
            projectId: user.projectId || ''
          };
        });
        setUserPermissions(initialPermissions);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError('Error al cargar los datos. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Manejar cambio de rol
  const handleRoleChange = (userId, newRole) => {
    setUserPermissions(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        role: newRole
      }
    }));
  };
  
  // Manejar cambio de proyecto
  const handleProjectChange = (userId, newProjectId) => {
    setUserPermissions(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        projectId: newProjectId
      }
    }));
  };
  
  // Guardar cambios de permisos
  const handleSavePermissions = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Actualizar permisos de cada usuario
      for (const userId in userPermissions) {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          role: userPermissions[userId].role,
          projectId: userPermissions[userId].projectId,
          updatedAt: new Date()
        });
      }
      
      setSuccess('Permisos actualizados correctamente');
    } catch (error) {
      console.error('Error al guardar permisos:', error);
      setError('Error al guardar los permisos. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };
  
  // Obtener nombre del proyecto
  const getProjectName = (projectId) => {
    if (!projectId) return 'Sin asignar';
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
  
  if (error === 'No tienes permisos para acceder a esta sección') {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <SecurityIcon sx={{ mr: 1 }} />
        Gestión de Permisos
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
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Asignación de Roles y Proyectos
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Asigne roles y proyectos a los usuarios del sistema. Los administradores tienen acceso a todas las funciones, mientras que los empleados solo pueden registrar su tiempo en el proyecto asignado.
          </Typography>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Usuario</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Proyecto Asignado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <FormControl fullWidth size="small">
                      <Select
                        value={userPermissions[user.id]?.role || 'employee'}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      >
                        <MenuItem value="employee">Empleado</MenuItem>
                        <MenuItem value="admin">Administrador</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <FormControl fullWidth size="small">
                      <Select
                        value={userPermissions[user.id]?.projectId || ''}
                        onChange={(e) => handleProjectChange(user.id, e.target.value)}
                      >
                        <MenuItem value="">Sin asignar</MenuItem>
                        {projects.map((project) => (
                          <MenuItem key={project.id} value={project.id}>
                            {project.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSavePermissions}
            startIcon={<SaveIcon />}
            disabled={loading}
          >
            Guardar Cambios
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default PermissionManager;