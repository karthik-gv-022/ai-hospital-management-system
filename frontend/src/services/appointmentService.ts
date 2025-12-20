import { apiGet, apiPost, apiPut, apiDelete } from './api';
import { Appointment, AppointmentBooking, TokenConfirmation } from '../types';

export const appointmentService = {
  // Book new appointment
  bookAppointment: async (bookingData: AppointmentBooking): Promise<Appointment> => {
    return await apiPost<Appointment>('/appointments', bookingData);
  },

  // Get appointment details
  getAppointment: async (appointmentId: string): Promise<Appointment> => {
    return await apiGet<Appointment>(`/appointments/${appointmentId}`);
  },

  // Update appointment
  updateAppointment: async (appointmentId: string, data: Partial<Appointment>): Promise<Appointment> => {
    return await apiPut<Appointment>(`/appointments/${appointmentId}`, data);
  },

  // Cancel appointment
  cancelAppointment: async (appointmentId: string): Promise<any> => {
    return await apiDelete(`/appointments/${appointmentId}`);
  },

  // Get all appointments (admin only)
  getAllAppointments: async (filters?: {
    date_from?: string;
    date_to?: string;
    status?: string;
    doctor_id?: string;
    patient_id?: string;
    skip?: number;
    limit?: number;
  }): Promise<Appointment[]> => {
    const params = new URLSearchParams();

    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.doctor_id) params.append('doctor_id', filters.doctor_id);
    if (filters?.patient_id) params.append('patient_id', filters.patient_id);
    if (filters?.skip !== undefined) params.append('skip', String(filters.skip));
    if (filters?.limit !== undefined) params.append('limit', String(filters.limit));

    const query = params.toString();
    const url = `/appointments/all${query ? `?${query}` : ''}`;

    return await apiGet<Appointment[]>(url);
  },
};