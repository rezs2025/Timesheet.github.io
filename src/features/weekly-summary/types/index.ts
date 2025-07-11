import { TimeEntry } from "@/features/time-entry/types";

export interface DailySummary {
  date: Date;
  entries: TimeEntry[];
  hoursWorked: number;
  minutesWorked: number;
  formattedHours: string;
}

export interface WeekSummary {
  dailySummary: DailySummary[];
  totalHours: number;
  totalMinutes: number;
  formattedTotal: string;
  weekStart: string;
  weekEnd: string;
}

export interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  totalHours: number;
  averageHoursPerMember: number;
  projectsInProgress: number;
}

export interface SystemStats extends TeamStats {
  totalUsers: number;
  activeUsers: number;
  totalProjects: number;
  activeProjects: number;
  topPerformers: UserPerformance[];
  lowPerformers: UserPerformance[];
  projectEfficiency: ProjectEfficiency[];
}

export interface UserPerformance {
  userId: string;
  hours: number;
  name: string;
}

export interface ProjectEfficiency {
  projectId: string;
  hours: number;
  name: string;
}

export interface WeekSummaryPM {
  totalMembers: number;
  activeMembers: number;
  totalHours: number;
  averageHoursPerPerson: number;
  timeEntries: TimeEntry[];
}
