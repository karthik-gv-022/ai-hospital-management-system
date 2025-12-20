import { apiGet, apiPut } from './api';
import { Patient, PatientProfile, Appointment, AppointmentFilter } from '../types';

export const patientService = {
  // Get patient profile
  getProfile: async (): Promise<PatientProfile> => {
    return await apiGet<PatientProfile>('/patients/profile');
  },

  // Update patient profile
  updateProfile: async (data: Partial<Patient>): Promise<Patient> => {
    return await apiPut<Patient>('/patients/profile', data);
  },

  // Get patient appointments
  getAppointments: async (filters?: AppointmentFilter): Promise<Appointment[]> => {
    const params = new URLSearchParams();

    if (filters?.status) params.append('status', filters.status);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.doctor_id) params.append('doctor_id', filters.doctor_id);

    const query = params.toString();
    const url = `/patients/appointments${query ? `?${query}` : ''}`;

    return await apiGet<Appointment[]>(url);
  },

  // Get upcoming appointments
  getUpcomingAppointments: async (days: number = 7): Promise<Appointment[]> => {
    return await apiGet<Appointment[]>(`/appointments/my/upcoming?days=${days}`);
  },

  // Get patient tokens
  getTokens: async (status?: string): Promise<any[]> => {
    const params = status ? `?status=${status}` : '';
    return await apiGet<any[]>(`/tokens/my/tokens${params}`);
  },
};