export interface TimeEntryLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface TimeEntry {
  id: string;
  userId: string;
  userName: string;
  projectId: string;
  date: string; // 'yyyy-MM-dd' format
  checkInTime: string; // 'HH:mm' format
  checkOutTime: string; // 'HH:mm' format
  lunchDuration: string; // minutes as string
  notes?: string;
  location: TimeEntryLocation;
  checkOutLocation?: TimeEntryLocation;
  status: 'pending' | 'approved' | 'rejected';
  approvalNote?: string;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  updatedBy?: string;
}

export interface CreateTimeEntryData {
  userId: string;
  userName: string;
  projectId: string;
  date: string;
  checkInTime: string;
  location: TimeEntryLocation;
  notes?: string;
}

export interface UpdateTimeEntryData {
  checkOutTime?: string;
  checkOutLocation?: TimeEntryLocation;
  lunchDuration?: string;
  notes?: string;
  status?: 'pending' | 'approved' | 'rejected';
  approvalNote?: string;
  approvedBy?: string;
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