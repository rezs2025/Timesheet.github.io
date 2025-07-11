import { format, eachDayOfInterval, differenceInMinutes } from 'date-fns';
import { TimeEntry } from '@/features/time-entry/types';
import { WeekSummary, DailySummary, UserPerformance, ProjectEfficiency } from '../types';

export const calculateHoursWorked = (entry: TimeEntry): string => {
  if (!entry.startTime || !entry.endTime) return '0:00';
  let totalMinutesWorked = differenceInMinutes(new Date(entry.endTime), new Date(entry.startTime));

  if (totalMinutesWorked <= 0) return '0:00';

  const hours = Math.floor(totalMinutesWorked / 60);
  const minutes = totalMinutesWorked % 60;

  return `${hours}:${minutes.toString().padStart(2, '0')}`;
};

export const calculateSummary = (
  entries: TimeEntry[], 
  weekStart: Date, 
  weekEnd: Date, 
  projectLunchMinutes?: number
): WeekSummary => {
  const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
  let totalHours = 0;
  let totalMinutes = 0;
  let totalLunchTime = 0;

  const dailySummary: DailySummary[] = daysOfWeek.map((day) => {
    const formattedDay = format(day, 'yyyy-MM-dd');
    const dayEntries = entries.filter((entry) => 
      format(new Date(entry.startTime), 'yyyy-MM-dd') === formattedDay
    );

    let hoursWorked = 0;
    let minutesWorked = 0;

    dayEntries.forEach((entry) => {
      if (entry.startTime && entry.endTime) {
        let totalMinutesWorked = differenceInMinutes(new Date(entry.endTime), new Date(entry.startTime));
        if (totalMinutesWorked > 0) {
          minutesWorked += totalMinutesWorked;
          totalMinutes += totalMinutesWorked;
        }
      }
    });

    // Apply lunch time deduction
    if (dayEntries.length && projectLunchMinutes) {
      totalLunchTime += projectLunchMinutes;
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

  // Subtract total lunch time
  if (totalLunchTime > 0) {
    totalMinutes -= totalLunchTime;
  }
  
  if (totalMinutes >= 60) {
    totalHours += Math.floor(totalMinutes / 60);
    totalMinutes = totalMinutes % 60;
  }

  return {
    dailySummary,
    totalHours,
    totalMinutes,
    formattedTotal: `${totalHours}:${totalMinutes.toString().padStart(2, '0')}`,
    weekStart: format(weekStart, 'dd/MM/yyyy'),
    weekEnd: format(weekEnd, 'dd/MM/yyyy'),
  };
};

export const calculateUserPerformance = (entries: TimeEntry[]): UserPerformance[] => {
  const userHours = entries.reduce((acc, entry) => {
    if (entry.startTime && entry.endTime) {
      const minutes = differenceInMinutes(new Date(entry.endTime), new Date(entry.startTime));
      const hours = Math.max(0, minutes / 60);
      const userId = entry.user.id;
      acc[userId] = (acc[userId] || 0) + hours;
    }
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(userHours)
    .map(([userId, hours]) => {
      const user = entries.find(e => e.user.id === userId)?.user;
      return {
        userId,
        hours: Math.round(hours * 100) / 100,
        name: user?.fullName || user?.email || 'Usuario no encontrado',
      };
    })
    .sort((a, b) => b.hours - a.hours);
};

export const calculateProjectEfficiency = (entries: TimeEntry[]): ProjectEfficiency[] => {
  const projectHours = entries.reduce((acc, entry) => {
    if (entry.startTime && entry.endTime) {
      const minutes = differenceInMinutes(new Date(entry.endTime), new Date(entry.startTime));
      const hours = Math.max(0, minutes / 60);
      const projectId = entry.project.id;
      acc[projectId] = (acc[projectId] || 0) + hours;
    }
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(projectHours)
    .map(([projectId, hours]) => {
      const project = entries.find(e => e.project.id === projectId)?.project;
      return {
        projectId,
        hours: Math.round(hours * 100) / 100,
        name: project?.name || 'Proyecto no encontrado',
      };
    })
    .sort((a, b) => b.hours - a.hours);
};

export const getUniqueUsers = (entries: TimeEntry[]): string[] => {
  return [...new Set(entries.map(e => e.user.id))];
};

export const getUniqueProjects = (entries: TimeEntry[]): string[] => {
  return [...new Set(entries.map(e => e.project.id))];
};