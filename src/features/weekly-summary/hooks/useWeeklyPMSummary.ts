import { useState, useEffect } from 'react';
import { endOfWeek } from 'date-fns';
import { WeekSummaryPM } from '../types';
import { timeEntryService } from '@/features/time-entry/services/timeEntry.service';
import { toast } from 'sonner';

interface UseWeeklySummaryProps {
  currentWeekStart: Date;
  projectId?: string;
  userId?: string;
}

export const useWeeklyPMSummary = ({ 
  currentWeekStart, 
  projectId, 
  userId,
}: UseWeeklySummaryProps) => {
  const [loading, setLoading] = useState(false);
  const [weekSummary, setWeekSummary] = useState<WeekSummaryPM>({
    totalMembers: 0,
    activeMembers: 0,
    totalHours: 0,
    averageHoursPerPerson: 0,
    timeEntries: [],
  });

  const refetch = async () => {
    try {
      setLoading(true);
      const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
      
      const params: any = {
        startDate: currentWeekStart.toISOString(),
        endDate: weekEnd.toISOString(),
      };

      if (projectId) params.projectId = projectId;
      if (userId) params.userId = userId;

      const weekSummary = await timeEntryService.getWeekPMSummary(params);
      setWeekSummary(weekSummary);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar datos', {
        description: 'No se pudieron cargar las horas del período',
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, [currentWeekStart, projectId, userId]);

  return {
    loading,
    weekSummary,
    refetch,
  };
};