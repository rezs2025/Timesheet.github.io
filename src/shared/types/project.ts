export interface Project {
  id: string;
  name: string;
  description?: string;
  address?: string;
  latitude: number;
  longitude: number;
  lunchTime: number;
  createdDate: string;  // ISO datetime string
  updatedDate: string;  // ISO datetime string
  deletedDate?: string; // ISO datetime string or undefined
}