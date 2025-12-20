import { apiPost, apiGet } from './api';
import {
  DoctorRecommendationRequest,
  DoctorRecommendation,
  WaitTimePredictionRequest,
  WaitTimePrediction,
} from '@/types';

export const aiService = {
  // Get AI doctor recommendations
  recommendDoctors: async (request: DoctorRecommendationRequest): Promise<{
    recommended_doctors: DoctorRecommendation[];
    message: string;
    total_available: number;
    recommendation_method: string;
  }> => {
    return await apiPost('/ai/recommend-doctor', request);
  },

  // Predict wait time
  predictWaitTime: async (request: WaitTimePredictionRequest): Promise<{
    success: boolean;
    data: WaitTimePrediction;
    request_info: any;
  }> => {
    return await apiPost('/ai/predict-wait-time', request);
  },

  // Get scheduling insights
  getSchedulingInsights: async (request: {
    doctor_id?: string;
    date_range?: number;
  }): Promise<{
    success: boolean;
    data: any;
    request_info: any;
  }> => {
    return await apiPost('/ai/scheduling-optimization', request);
  },

  // Get AI model status (admin only)
  getModelStatus: async (): Promise<any> => {
    return await apiGet('/ai/model-status');
  },

  // Train AI models (admin only)
  trainModels: async (forceRetrain?: boolean): Promise<any> => {
    const params = forceRetrain ? `?force_retrain=true` : '';
    return await apiPost(`/ai/train-models${params}`);
  },

  // AI health check
  healthCheck: async (): Promise<any> => {
    return await apiGet('/ai/health');
  },
};