import { apiPost, apiGet } from './api';
import { AuthResponse, LoginCredentials, PatientRegisterData, DoctorRegisterData, User } from '../types';

export const authService = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return await apiPost<AuthResponse>('/auth/login', credentials);
  },

  // Register new patient
  register: async (userData: PatientRegisterData): Promise<any> => {
    return await apiPost('/auth/register', userData);
  },

  // Register new doctor
  registerDoctor: async (userData: DoctorRegisterData): Promise<any> => {
    return await apiPost('/auth/register-doctor', userData);
  },

  // Refresh access token
  refreshToken: async (refreshToken: string): Promise<{ access_token: string }> => {
    return await apiPost('/auth/refresh', { refresh_token: refreshToken });
  },

  // Logout user
  logout: async (): Promise<void> => {
    try {
      await apiPost('/auth/logout');
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string): Promise<any> => {
    return await apiPost('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },

  // Get current user info
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('access_token');
  },

  // Check if user has specific role
  hasRole: (role: string): boolean => {
    const user = authService.getCurrentUser();
    return user?.role === role;
  },

  // Check if user has any of the specified roles
  hasAnyRole: (roles: string[]): boolean => {
    const user = authService.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  },

  // Store auth data
  storeAuthData: (authData: AuthResponse): void => {
    localStorage.setItem('access_token', authData.access_token);
    localStorage.setItem('refresh_token', authData.refresh_token);
    localStorage.setItem('user', JSON.stringify(authData.user));
  },

  // Clear auth data
  clearAuthData: (): void => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },
};