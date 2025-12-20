import { apiGet, apiPost, apiPut } from './api';
import { Token, TokenDisplay, TokenConfirmation, TokenQueue } from '../types';

export const tokenService = {
  // Generate new token
  generateToken: async (data: {
    doctor_id: string;
    appointment_id?: string;
    appointment_date: string;
  }): Promise<Token> => {
    return await apiPost<Token>('/tokens', data);
  },

  // Quick token generation
  quickGenerateToken: async (doctorId: string, appointmentId?: string): Promise<TokenConfirmation> => {
    const data: any = { doctor_id: doctorId };
    if (appointmentId) data.appointment_id = appointmentId;

    return await apiPost<TokenConfirmation>('/tokens/quick-generate', data);
  },

  // Get current token display
  getCurrentTokenDisplay: async (doctorId?: string): Promise<TokenDisplay> => {
    const params = doctorId ? `?doctor_id=${doctorId}` : '';
    return await apiGet<TokenDisplay>(`/tokens/current${params}`);
  },

  // Get token queue for a doctor
  getTokenQueue: async (doctorId: string): Promise<TokenQueue[]> => {
    return await apiGet<TokenQueue[]>(`/tokens/queue?doctor_id=${doctorId}`);
  },

  // Call next token
  callToken: async (tokenId: string): Promise<any> => {
    return await apiPut(`/tokens/${tokenId}/call`);
  },

  // Complete token
  completeToken: async (tokenId: string, data: {
    actual_wait_time: number;
    notes?: string;
  }): Promise<any> => {
    return await apiPut(`/tokens/${tokenId}/complete`, data);
  },

  // Get my tokens (patient)
  getMyTokens: async (status?: string): Promise<Token[]> => {
    const params = status ? `?status=${status}` : '';
    return await apiGet<Token[]>(`/tokens/my/tokens${params}`);
  },

  // Get daily token summary
  getDailyTokenSummary: async (doctorId: string, date: string): Promise<any> => {
    return await apiGet(`/tokens/summary/daily?doctor_id=${doctorId}&target_date=${date}`);
  },
};