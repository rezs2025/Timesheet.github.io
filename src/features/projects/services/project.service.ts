// src/features/projects/services/projects.service.ts
import { api } from '@/shared/services/api';
import type { Project } from '@/shared/types/project';

export interface PaginatedProjects {
  projects: Project[];
  totalCount: number;
  page: number;
  totalPages: number;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  address?: string;
  latitude: number;
  longitude: number;
  lunchTime: number;
}

export interface UpdateProjectDto extends Partial<CreateProjectDto> {}

export const projectsService = {
  findAll: async (
    page: number = 1,
    limit: number = 10,
    query: string = '',
  ): Promise<PaginatedProjects> => {
    const response = await api.get<PaginatedProjects>('/projects', {
      params: { page, limit, query }
    });
    return response.data;
  },

  findOne: async (id: string): Promise<Project> => {
    const response = await api.get<Project>(`/projects/${id}`);
    return response.data;
  },

  create: async (data: CreateProjectDto): Promise<Project> => {
    const response = await api.post<Project>('/projects', data);
    return response.data;
  },

  update: async (
    id: string,
    data: UpdateProjectDto
  ): Promise<Project> => {
    const response = await api.patch<Project>(`/projects/${id}`, data);
    return response.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  }
};
