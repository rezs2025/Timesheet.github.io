import { AssignmentType } from "./user";

export interface Project {
  id: string;
  name: string;
  description?: string;
  address?: string;
  latitude: number;
  longitude: number;
  lunchMinutes: number;
  createdDate: string;  // ISO datetime string
  updatedDate: string;  // ISO datetime string
  deletedDate?: string; // ISO datetime string or undefined
}


export interface UserProjectDetail {
  assignmentType: AssignmentType;
  createdDate:    Date;
  deletedDate:    null;
  email:          string;
  fullName:       string;
  id:             string;
  isActive:       boolean;
  lastTimesheet:  LastTimesheet;
  updatedDate:    Date;
}

export interface LastTimesheet {
  id:           string;
  startTime:    Date;
  createdDate:  Date;
  deletedDate:  null;
  deviceToken:  string;
  endTime:      Date;
  lunchMinutes: number;
  updatedDate:  Date;
  role:         string;
}

export interface EmployeeActivity extends Partial<Project> {
  totalEmployees: number;
  activeEmployees: number;
}