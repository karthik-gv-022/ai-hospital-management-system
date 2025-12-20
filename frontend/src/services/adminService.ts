import { apiGet, apiPost, apiPut } from './api';
import { DashboardStats, AnalyticsData, User, Doctor } from '../types';

export const adminService = {
  // Get dashboard statistics
  getDashboardStats: async (): Promise<DashboardStats> => {
    return await apiGet<DashboardStats>('/admin/dashboard');
  },

  // Get system analytics
  getAnalytics: async (period: string = 'week'): Promise<AnalyticsData> => {
    return await apiGet<AnalyticsData>(`/admin/analytics?period=${period}`);
  },

  // Get all users
  getUsers: async (filters?: {
    search?: string;
    role?: string;
    is_active?: boolean;
    skip?: number;
    limit?: number;
  }): Promise<User[]> => {
    const params = new URLSearchParams();

    if (filters?.search) params.append('search', filters.search);
    if (filters?.role) params.append('role', filters.role);
    if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));
    if (filters?.skip !== undefined) params.append('skip', String(filters.skip));
    if (filters?.limit !== undefined) params.append('limit', String(filters.limit));

    const query = params.toString();
    const url = `/admin/users${query ? `?${query}` : ''}`;

    return await apiGet<User[]>(url);
  },

  // Add new doctor
  addDoctor: async (doctorData: any): Promise<any> => {
    return await apiPost('/admin/doctors', doctorData);
  },

  // Toggle user status (activate/deactivate)
  toggleUserStatus: async (userId: string, isActive: boolean): Promise<any> => {
    return await apiPut(`/admin/users/${userId}/status?is_active=${isActive}`);
  },

  // Get all patients
  getPatients: async (filters?: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<any[]> => {
    const params = new URLSearchParams();

    if (filters?.search) params.append('search', filters.search);
    if (filters?.page !== undefined) params.append('page', String(filters.page));
    if (filters?.limit !== undefined) params.append('limit', String(filters.limit));

    const query = params.toString();
    const url = `/admin/patients${query ? `?${query}` : ''}`;

    return await apiGet<any[]>(url);
  },

  // Get patients count
  getPatientsCount: async (search?: string): Promise<{ count: number }> => {
    const params = search ? `?search=${search}` : '';
    return await apiGet<{ count: number }>(`/admin/patients/count${params}`);
  },

  // Get system health
  getSystemHealth: async (): Promise<any> => {
    return await apiGet('/admin/system/health');
  },
};