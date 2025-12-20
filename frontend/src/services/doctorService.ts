import { apiGet, apiPut, apiPost } from './api';
import { Doctor, DoctorProfile, Appointment, DoctorAvailability } from '../types';

export const doctorService = {
  // Get all doctors with optional filters
  getDoctors: async (filters?: {
    specialization?: string;
    department?: string;
    available_today?: boolean;
    skip?: number;
    limit?: number;
  }): Promise<Doctor[]> => {
    const params = new URLSearchParams();

    if (filters?.specialization) params.append('specialization', filters.specialization);
    if (filters?.department) params.append('department', filters.department);
    if (filters?.available_today !== undefined) params.append('available_today', String(filters.available_today));
    if (filters?.skip !== undefined) params.append('skip', String(filters.skip));
    if (filters?.limit !== undefined) params.append('limit', String(filters.limit));

    const query = params.toString();
    const url = `/doctors${query ? `?${query}` : ''}`;

    return await apiGet<Doctor[]>(url);
  },

  // Get doctor details by ID
  getDoctorById: async (doctorId: string): Promise<Doctor> => {
    return await apiGet<Doctor>(`/doctors/${doctorId}`);
  },

  // Get current doctor's profile
  getMyProfile: async (): Promise<DoctorProfile> => {
    return await apiGet<DoctorProfile>('/doctors/profile/me');
  },

  // Get doctor's appointments
  getAppointments: async (filters?: {
    date?: string;
    status?: string;
  }): Promise<Appointment[]> => {
    const params = new URLSearchParams();

    if (filters?.date) params.append('date', filters.date);
    if (filters?.status) params.append('status', filters.status);

    const query = params.toString();
    const url = `/doctors/appointments${query ? `?${query}` : ''}`;

    return await apiGet<Appointment[]>(url);
  },

  // Get today's appointments
  getTodayAppointments: async (): Promise<Appointment[]> => {
    return await apiGet<Appointment[]>('/appointments/doctor/today');
  },

  // Update doctor availability
  updateAvailability: async (availability: DoctorAvailability): Promise<any> => {
    return await apiPut(`/doctors/${availability.doctor_id}/availability`, availability);
  },

  // Get doctor availability for a specific date
  getAvailability: async (doctorId: string, date: string): Promise<any> => {
    return await apiGet(`/doctors/${doctorId}/availability/${date}`);
  },
};