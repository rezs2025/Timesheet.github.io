import { WeekSummaryPM } from "@/features/weekly-summary";
import type {
  TimeEntry,
  CreateTimeEntryData,
  TimeEntryFilters,
} from "../types";
import { api } from "@/shared/services/api";

export const timeEntryService = {
  createTimeEntry: async (data: CreateTimeEntryData): Promise<TimeEntry> => {
    const deviceId = localStorage.getItem("deviceId") || "unknown-device";
    const requestData = {
      ...data,
      deviceToken: deviceId,
    };
    const response = await api.post<TimeEntry>("time-sheets", requestData);
    return response.data;
  },

  updateTimeEntry: async (
    id: string,
    data: Partial<TimeEntry>
  ): Promise<TimeEntry> => {
    const response = await api.patch<TimeEntry>(`time-sheets/${id}`, data);
    return response.data;
  },

  getTimeEntries: async (
    filters: TimeEntryFilters = {}
  ): Promise<TimeEntry[]> => {
    const response = await api.get<TimeEntry[]>("time-sheets/user/entries", {
      params: {
        startDate: filters.startDate,
        endDate: filters.endDate,
      },
    });
    return response.data;
  },

  getWeekPMSummary: async (
    filters: TimeEntryFilters = {}
  ): Promise<WeekSummaryPM> => {
    const response = await api.get<WeekSummaryPM>(
      "time-sheets/weekly-pm-report",
      {
        params: {
          startDate: filters.startDate,
          endDate: filters.endDate,
          projectId: filters.projectId,
          userId: filters.userId,
        },
      }
    );
    if (response.data.timeEntries) {
      response.data.timeEntries = response.data.timeEntries.map((entry) => ({
        ...entry,
        startTime: entry.startTime
          ? new Date(entry.startTime)
          : entry.startTime,
        endTime: entry.endTime ? new Date(entry.endTime) : entry.endTime,
      }));
    }
    return response.data;
  },
};
