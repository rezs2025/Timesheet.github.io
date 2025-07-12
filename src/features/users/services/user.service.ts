// src/features/users/services/user.service.ts
import { api } from '@/shared/services/api';
import type { 
  User, 
  CreateUserDto, 
  UpdateUserDto, 
  PaginatedUsers,
  UserProject,
  CreateUserProjectDto 
} from '@/shared/types/user';

export const usersService = {
  // CRUD de usuarios
  findAll: async (
    page: number = 1,
    limit: number = 10,
    query: string = '',
    roleFilter?: 'pm' | 'employee'
  ): Promise<PaginatedUsers> => {
    const response = await api.get<PaginatedUsers>('/users', {
      params: { page, limit, query, role: roleFilter }
    });
    return response.data;
  },

  findOne: async (id: string): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  findById: async (id: string): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  create: async (data: CreateUserDto): Promise<User> => {
    const response = await api.post<User>('/users', data);
    return response.data;
  },

  update: async (
    id: string,
    data: UpdateUserDto
  ): Promise<User> => {
    const response = await api.patch<User>(`/users/${id}`, data);
    return response.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  // Gestión de proyectos de usuario
  getUserProjects: async (userId: string): Promise<UserProject[]> => {
    const response = await api.get<UserProject[]>(`/users/${userId}/projects`);
    return response.data;
  },

  assignUserToProject: async (data: CreateUserProjectDto): Promise<UserProject> => {
    const response = await api.post<UserProject>('/user-project', data);
    return response.data;
  },

  removeUserFromProject: async (userProjectId: string): Promise<void> => {
    await api.delete(`/user-project/${userProjectId}`);
  },

  updateUserProjectAssignment: async (
    userId: string, 
    projectId: string, 
    assignmentType: 'employee' | 'pm'
  ): Promise<UserProject> => {
    const response = await api.patch<UserProject>(`/user-project/${userId}/${projectId}`, {
      assignmentType
    });
    return response.data;
  }
};