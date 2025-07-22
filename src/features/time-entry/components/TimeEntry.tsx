import React, { useState, useEffect } from 'react';
import { format, differenceInMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, MapPin, AlertTriangle, RotateCcw, Play, Square, Calendar, TrendingUp, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';

import { useGeolocation } from '../hooks/useGeolocation';
import { timeEntryService } from '../services/timeEntry.service';
import { useAuth } from '@/shared/hooks/useAuth';
import type { TimeEntry as TimeEntryType } from '../types';
import { useElapsedTime } from '../hooks/useElapsedTime';
import { startOfToday } from 'date-fns'
import { ProjectSelector } from '@/shared/components/project-selector';
import { UserProject } from '@/shared/types/user';
import { usersService } from "@/features/users/services/user.service";
import clsx from 'clsx';

export const TimeEntry: React.FC = () => {
  const [date] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [todayEntries, setTodayEntries] = useState<TimeEntryType[]>([]);
  const [isWorking, setIsWorking] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<TimeEntryType | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showLocationUpdate, setShowLocationUpdate] = useState(false);
  const { user, loading: loadingUser } = useAuth();
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<UserProject | null>(null);
  const startDate = currentEntry ? new Date(currentEntry.startTime) : null
  const elapsed = useElapsedTime(startDate)
  const {
    location,
    error: geolocationError,
    status: locationStatus,
    refresh: refreshLocation,
  } = useGeolocation({
    timeout: 15000,
    enableHighAccuracy: true,
  });

  useEffect(() => {
    const initializeProjects = async () => {
      if (!user) return;
      try {
        const projects = await usersService.getUserProjects(user.id);
        if (projects.length) {
          setSelectedProject(projects[0]);
          setProjects(projects);
        }
      } catch (error) {
        console.error(error);
      }
    };
    initializeProjects();
  }, [user]);

  useEffect(() => {
    const endDate = new Date().toISOString();
    const startDate = startOfToday().toISOString();

    const fetchTodayEntries = async () => {
      setLoading(true);
      try {
        const entries = await timeEntryService.getTimeEntries({
          startDate,
          projectId: selectedProject?.id
        });
        setTodayEntries(entries);

        // Check if there's an active time entry (no end time)
        const activeEntry = entries.find(entry => !entry.endTime);
        if (activeEntry) {
          setCurrentEntry(activeEntry);
          setIsWorking(true);
        }
      } catch (error) {
        toast.error('Error al cargar datos', {
          description: 'No se pudieron cargar las horas del día',
          duration: 4000,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchTodayEntries();
  }, [selectedProject]);

  if (loadingUser || loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!loadingUser && !projects.length) {
    return (
      <div className="p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No estás asignado a ningún proyecto. Contacta a tu administrador para que te asigne uno.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Registro de Tiempo</h1>
        <p className="text-muted-foreground">
          Registra tu hora de entrada y salida del proyecto
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
          </CardTitle>
          <CardDescription
            className={clsx(projects.length > 1 && "my-1")}
          >
            {currentEntry
              ? `Proyecto: ${currentEntry.project.name}`
              : projects.length > 1
                ? 'Seleccione Proyecto'
                : selectedProject
                  ? `Proyecto: ${selectedProject.project.name}`
                  : ''}
            { projects.length > 1 && !isWorking &&
            
              <ProjectSelector
                projects={projects}
                selectedProject={selectedProject}
                onSelectProject={setSelectedProject}
              />
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Location Validation Error - Moved to top for visibility */}
          {locationError && (
            <Alert className="border-destructive bg-destructive/10">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-destructive">
                {locationError}
              </AlertDescription>
            </Alert>
          )}

          {/* Location Status */}
          {locationStatus !== 'success' && (
          <div className="space-y-2">
            <Label>Estado de Ubicación</Label>
            {locationStatus === 'loading' && (
              <div className="flex items-center gap-2 p-3 border rounded-lg">
                <div className="animate-spin">
                  <RotateCcw className="h-4 w-4" />
                </div>
                <span className="text-sm">Obteniendo ubicación...</span>
              </div>
            )}
            {locationStatus === 'error' && (
              <div className="space-y-3 p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-destructive">
                      Error al obtener ubicación
                    </p>
                    <p className="text-sm text-destructive/80">
                      {geolocationError || 'No se pudo obtener tu ubicación actual'}
                    </p>
                  </div>
                </div>
                <div className="flex justify-center pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRefreshLocation}
                    className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reintentar Ubicación
                  </Button>
                </div>
              </div>
            )}
          </div>
          )}

          {/* Location Update Button */}
          {showLocationUpdate && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={handleRefreshLocation}
                className="w-full sm:w-auto"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar Ubicación
              </Button>
            </div>
          )}

          {isWorking && (
            <div className="flex items-center gap-2 text-lg">
              <Play className="h-5 w-5 animate-pulse" />
              <span>Tiempo trabajado: {elapsed}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!isWorking && (
              <Button
                disabled={locationStatus !== 'success'}
                className="h-12"
                onClick={handleStartWork}
              >
                <Play className="h-4 w-4 mr-2" />
                Iniciar Trabajo
              </Button>
            )}
            
            {isWorking && (
              <>
                <Button
                  disabled={locationStatus !== 'success'}
                  variant="destructive"
                  className="h-12"
                  onClick={handleStopWork}
                >
                  <Square className="h-4 w-4 mr-2" />
                  Detener Trabajo
                </Button>
              </>
            )}
          </div>

          {/* Today's Entries */}
          {todayEntries.length > 0 && (
            <div className="space-y-4">
              <Separator />
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <h3 className="text-lg font-semibold">Entradas de Hoy</h3>
              </div>
              <div className="space-y-2">
                {todayEntries.map((entry) => (
                  <Card key={entry.id} className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-mono">
                            {format(new Date(entry.startTime), 'HH:mm')} - {entry.endTime ? format(new Date(entry.endTime), 'HH:mm') : 'Activo'}
                          </span>
                        </div>
                        <Badge variant={entry.endTime ? 'secondary' : 'default'}>
                          {entry.endTime ? 'Completado' : 'En progreso'}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {entry.project.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {entry.endTime ? calculateEntryDuration(entry) : calculateActiveEntryDuration(entry)}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Helper functions
  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }

  function formatDistance(distance: number): string {
    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(1)}km`;
    }
    return `${Math.round(distance)}m`;
  }

  function validateLocation(): boolean {
    if (!location || !selectedProject) return false;
    
    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      selectedProject.project.latitude,
      selectedProject.project.longitude
    );
    
    if (distance > 100) {
      const formattedDistance = formatDistance(distance);
      const errorMessage = `Estás a ${formattedDistance} del proyecto. Debes estar a menos de 100m para registrar tu entrada.`;
      setLocationError(errorMessage);
      setShowLocationUpdate(true);
      toast.error('Ubicación muy lejana', {
        description: errorMessage,
        duration: 5000,
      });
      return false;
    }
    
    setLocationError(null);
    setShowLocationUpdate(false);
    return true;
  }

  function handleRefreshLocation() {
    setLocationError(null);
    setShowLocationUpdate(false);
    refreshLocation();
  }

  function formatDuration(totalMinutes: number): string {
    if (totalMinutes <= 0) return '0m';
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours === 0) {
      return `${minutes}m`;
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${minutes}m`;
    }
  }

  function calculateEntryDuration(entry: TimeEntryType): string {
    if (!entry.endTime) return '0m';
    
    const totalDuration = differenceInMinutes(new Date(entry.endTime), new Date(entry.startTime));
    return formatDuration(Math.max(0, totalDuration));
  }

  function calculateActiveEntryDuration(entry: TimeEntryType): string {
    if (entry.endTime) return calculateEntryDuration(entry);
    
    const currentDuration = differenceInMinutes(new Date(), new Date(entry.startTime));
    
    if (currentDuration < 60) {
      return `${currentDuration}m (trabajando)`;
    } else {
      return `${formatDuration(currentDuration)} (trabajando)`;
    }
  }

  async function handleStartWork() {
    if (!user || !selectedProject || !location) return;
    
    // Validate location before starting work
    if (!validateLocation()) {
      return;
    }
    
    try {
      setLoading(true);
      const now = new Date();
      
      const newEntry = await timeEntryService.createTimeEntry({
        userId: user.id,
        projectId: selectedProject.project.id,
        startTime: now,
        lunchMinutes: selectedProject.project.lunchMinutes
      });
      
      setCurrentEntry(newEntry);
      setIsWorking(true);
      toast.success('Trabajo iniciado', {
        description: 'Tu jornada laboral ha comenzado exitosamente',
      });
      
      // Refresh today's entries
      const endDate = new Date().toISOString();
      const startDate = startOfToday().toISOString();
      const entries = await timeEntryService.getTimeEntries({
        startDate,
        endDate,
        projectId: selectedProject.id
      });
      setTodayEntries(entries);
    } catch (error) {
      toast.error('Error al iniciar trabajo', {
        description: 'No se pudo registrar el inicio de tu jornada. Intenta de nuevo.',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleStopWork() {
    if (!currentEntry || !location || !selectedProject) return;
    if (!validateLocation()) {
      return;
    }
    
    try {
      setLoading(true);
      const now = new Date();
      
      // Update the current entry with end time
      await timeEntryService.updateTimeEntry(currentEntry.id, {
        endTime: now,
        lunchMinutes: currentEntry.project.lunchMinutes,
      });
      
      setIsWorking(false);
      setCurrentEntry(null);
      toast.success('Trabajo finalizado', {
        description: 'Tu jornada laboral ha sido registrada exitosamente',
      });
      
      // Refresh today's entries
      const endDate = new Date().toISOString();
      const startDate = startOfToday().toISOString();
      const entries = await timeEntryService.getTimeEntries({
        startDate,
        endDate,
        projectId: selectedProject?.id
      });
      setTodayEntries(entries);
    } catch (error) {
      toast.error('Error al finalizar trabajo', {
        description: 'No se pudo registrar el final de tu jornada. Intenta de nuevo.',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  }
};

export default TimeEntry;