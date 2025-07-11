import { useState, useEffect } from 'react';
import { startOfWeek, endOfWeek } from 'date-fns';
import { TimeEntry } from '@/features/time-entry/types';
import { WeekSummary } from '../types';
import { timeEntryService } from '@/features/time-entry/services/timeEntry.service';
import { calculateSummary } from '../utils/weeklyCalculations';
import { toast } from 'sonner';

interface UseWeeklySummaryProps {
  currentWeekStart: Date;
  projectId?: string;
  userId?: string;
  projectLunchMinutes?: number;
}

export const useWeeklySummary = ({ 
  currentWeekStart, 
  projectId, 
  userId,
  projectLunchMinutes 
}: UseWeeklySummaryProps) => {
  const [loading, setLoading] = useState(false);
  const [weekEntries, setWeekEntries] = useState<TimeEntry[]>([]);
  const [weekSummary, setWeekSummary] = useState<WeekSummary>({
    dailySummary: [],
    formattedTotal: '0:00',
    totalHours: 0,
    totalMinutes: 0,
    weekEnd: '',
    weekStart: ''
  });

  useEffect(() => {
    const fetchWeekData = async () => {
      try {
        setLoading(true);
        const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
        
        const params: any = {
          startDate: currentWeekStart.toISOString(),
          endDate: weekEnd.toISOString(),
        };

        if (projectId) params.projectId = projectId;
        if (userId) params.userId = userId;

        const entries = await timeEntryService.getTimeEntries(params);
        
        setWeekEntries(entries);
        const summary = calculateSummary(entries, currentWeekStart, weekEnd, projectLunchMinutes);
        setWeekSummary(summary);
        
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

    fetchWeekData();
  }, [currentWeekStart, projectId, userId, projectLunchMinutes]);

  return {
    loading,
    weekEntries,
    weekSummary,
    refetch: () => {
      // Trigger refetch by updating the effect dependencies
    }
  };
};