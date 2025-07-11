import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, differenceInMinutes } from 'date-fns';
import { useAuth } from '@/shared/hooks/useAuth';
import { AppLoader } from '@/shared/components/ui/AppLoader';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Card } from '@/shared/components/ui/card';

import WeekSelector from './WeekSelector';
import TimeEntriesTable from './TimeEntriesTable';
import SummaryCard from './SummaryCard';
import useUserProjectStore from '@/store/user-project.store';
import { timeEntryService } from '@/features/time-entry/services/timeEntry.service';
import { toast } from 'sonner';
import { TimeEntry } from '@/features/time-entry/types';
import { WeekSummary } from '../types';

const EmployeeWeeklySummary = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [weekEntries, setWeekEntries] = useState<TimeEntry[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  
  
  const [weekSummary, setWeekSummary] = useState<WeekSummary>({
    dailySummary: [],
    formattedTotal: '',
    totalHours: 0,
    totalMinutes: 0,
    weekEnd: '',
    weekStart: ''
  });
  const [isInitialized, setIsInitialized] = useState(false);
  
  const { user, loading: loadingUser } = useAuth();
  const { selectedProject } = useUserProjectStore()
  

  useEffect(() => {
    const fetchInitialData = async () => {
      if (loadingUser || !user) return;
      
      try {
        setLoading(true);
        setIsInitialized(true);
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
        setError('Error al cargar los datos iniciales. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [user, loadingUser]);

  useEffect(() => {
    if (!isInitialized) return;

    const fetchWeekData = async () => {
      if (!user || !selectedProject) return;

      try {
        const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
        const entries = await timeEntryService.getTimeEntries({
          startDate: currentWeekStart.toISOString(),
          endDate: weekEnd.toISOString(),
          projectId: selectedProject?.id
        });
        setWeekEntries(entries)
        calculateSummary(entries, currentWeekStart, weekEnd, selectedProject.project.lunchMinutes);
        
      } catch (error) {
        console.error(error);
        toast.error('Error al cargar datos', {
          description: 'No se pudieron cargar las horas del día',
          duration: 4000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWeekData();
  }, [currentWeekStart, selectedProject, isInitialized, user]);

  const calculateSummary = (entries: TimeEntry[], weekStart: Date, weekEnd: Date, projectLunchMinutes: number) => {
    const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
    let totalHours = 0;
    let totalMinutes = 0;
    let totalLunchTime = 0;

    const dailySummary = daysOfWeek.map((day) => {
      const formattedDay = format(day, 'yyyy-MM-dd');
      const dayEntries = entries.filter((entry) => format(new Date(entry.startTime), 'yyyy-MM-dd') === formattedDay);

      let hoursWorked = 0;
      let minutesWorked = 0;

      dayEntries.forEach((entry) => {
        if (entry.startTime && entry.endTime) {
          let totalMinutesWorked = differenceInMinutes(new Date(entry.endTime), new Date(entry.startTime))
          if (totalMinutesWorked > 0) {
            minutesWorked += totalMinutesWorked;
            totalMinutes += totalMinutesWorked;
          }
        }
      });

      if (dayEntries.length) {
        totalLunchTime += projectLunchMinutes
      }

      if (minutesWorked >= 60) {
        hoursWorked += Math.floor(minutesWorked / 60);
        minutesWorked = minutesWorked % 60;
      }

      return {
        date: day,
        entries: dayEntries,
        hoursWorked,
        minutesWorked,
        formattedHours: `${hoursWorked}:${minutesWorked.toString().padStart(2, '0')}`,
      };
    });

    if (totalLunchTime > 0) {
      totalMinutes -=totalLunchTime
    }
    
    if (totalMinutes >= 60) {
      totalHours += Math.floor(totalMinutes / 60);
      totalMinutes = totalMinutes % 60;
    }

    

    setWeekSummary({
      dailySummary,
      totalHours,
      totalMinutes,
      formattedTotal: `${totalHours}:${totalMinutes.toString().padStart(2, '0')}`,
      weekStart: format(weekStart, 'dd/MM/yyyy'),
      weekEnd: format(weekEnd, 'dd/MM/yyyy'),
    });
  };

  const handlePreviousWeek = () => {
    setCurrentWeekStart((prevWeek) => subWeeks(prevWeek, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart((prevWeek) => addWeeks(prevWeek, 1));
  };

  const calculateHoursWorked = (entry: TimeEntry) => {
    if (!entry.startTime || !entry.endTime) return '0:00';
    let totalMinutesWorked = differenceInMinutes(new Date(entry.endTime), new Date(entry.startTime));

    if (totalMinutesWorked <= 0) return '0:00';

    const hours = Math.floor(totalMinutesWorked / 60);
    const minutes = totalMinutesWorked % 60;

    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  if (loadingUser || loading || !isInitialized) {
    return <AppLoader text="Cargando resumen semanal..." />;
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!selectedProject) {
    return (
      <div className="p-6">
        <Alert>
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
        <h1 className="text-3xl font-bold tracking-tight">Mi Resumen Semanal</h1>
        <p className="text-muted-foreground">
          Registro de horas trabajadas - {user?.fullName || user?.email}
        </p>
      </div>

      <Card>
        <WeekSelector
          currentWeekStart={currentWeekStart}
          weekSummary={weekSummary}
          onPreviousWeek={handlePreviousWeek}
          onNextWeek={handleNextWeek}
        />
      </Card>
      <SummaryCard
        weekSummary={weekSummary}
        weekEntries={weekEntries}
        showEmployeeCount={false}
        showProjectCount={false}
      />
      <TimeEntriesTable
        entries={weekEntries}
        user={user}
        calculateHoursWorked={calculateHoursWorked}
        showUserColumn={false}
        showProjectColumn={false}
        showEditButton={false}
      />


    </div>
  );
};

export default EmployeeWeeklySummary;