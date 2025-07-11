import { Project } from "@/shared/types/project";
import { User } from "@/shared/types/user";

export interface TimeEntryLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface TimeEntry {
  startTime:    Date;
  endTime:      Date;
  lunchMinutes: number;
  workedHours:  number;
  workedHoursFormatted: string;
  deviceToken:  string;
  user:         User;
  project:      Project;
  id:           string;
  createdDate:  Date;
  updatedDate:  Date;
  deletedDate:  null;
}


export interface CreateTimeEntryData {
  userId: string;
  projectId: string;
  startTime: Date;
  endTime?: Date;
  lunchMinutes?: number;
  deviceToken?: string;
}

export interface WeeklyTimeEntry {
  date: string;
  entries: TimeEntry[];
  totalHours: number;
}

export interface TimeEntryFilters {
  projectId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface TimeEntrySummary {
  totalHours: number;
  totalDays: number;
  totalProjects: number;
  totalEmployees: number;
}