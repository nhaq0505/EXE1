import { api } from './api';

export interface User {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role?: string;
}

export interface AuthResponse {
  token?: string;
  accessToken?: string;
  user: User;
}

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    return api.post<AuthResponse>('/api/auth/login', { email, password });
  },

  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    return api.post<AuthResponse>('/api/auth/register', { name, email, password });
  },

  getProfile: async (): Promise<User> => {
    return api.get<User>('/api/auth/me');
  },

  updateProfile: async (profileData: Partial<User>): Promise<User> => {
    return api.put<User>('/api/auth/me', profileData);
  },

  refreshToken: async (): Promise<{ token?: string; accessToken?: string }> => {
    return api.post<{ token?: string; accessToken?: string }>('/api/auth/refresh');
  }
};
