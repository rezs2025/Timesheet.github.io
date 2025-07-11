import { User } from '@/shared/types/user';
import { api } from './api'

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
}

export const authService = {
  login: async (data: LoginDto) => {
    const res = await api.post<AuthResponse>('/auth/login', data);
    localStorage.setItem('token', res.data.token);
    return res.data;
  },

  register: async (data: RegisterDto) => {
    const { confirmPassword, ...payload } = data;
    const res = await api.post<AuthResponse>('/auth/signup', payload);
    localStorage.setItem('token', res.data.token);
    return res.data;
  },

  me: async () => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    const res = await api.get<AuthResponse>('/auth/me');
    return res.data.user;
  },

  logout: () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  },
};