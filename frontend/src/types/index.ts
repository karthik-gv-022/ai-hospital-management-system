// User and Authentication Types
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'doctor' | 'patient';
  is_active: boolean;
  last_login?: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Patient Types
export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: 'Male' | 'Female' | 'Other';
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  blood_group?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  created_at: string;
  updated_at: string;
}

export interface PatientRegisterData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: 'Male' | 'Female' | 'Other';
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  blood_group?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  password: string;
}

export interface PatientProfile extends Patient {
  total_appointments?: number;
  upcoming_appointments?: number;
}

// Doctor Types
export interface Doctor {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  specialization: string;
  department: string;
  license_number: string;
  experience_years: number;
  consultation_fee: number;
  available_days: string[];
  available_time_start: string;
  available_time_end: string;
  max_patients_per_day: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DoctorProfile extends Doctor {
  total_appointments?: number;
  today_appointments?: number;
  average_rating?: number;
  total_revenue?: number;
}

export interface DoctorRegisterData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  specialization: string;
  department: string;
  license_number: string;
  experience_years: number;
  consultation_fee: number;
  available_days: string[];
  available_time_start: string;
  available_time_end: string;
  max_patients_per_day: number;
}

export interface DoctorAvailability {
  doctor_id: string;
  available_days: string[];
  available_time_start: string;
  available_time_end: string;
  max_patients_per_day: number;
  current_patients_today: number;
}

// Appointment Types
export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  consultation_type: 'In-Person' | 'Video' | 'Phone';
  symptoms?: string;
  notes?: string;
  consultation_fee?: number;
  payment_status: 'Pending' | 'Paid' | 'Refunded';
  created_at: string;
  updated_at: string;
  patient?: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
  };
  doctor?: {
    id: string;
    first_name: string;
    last_name: string;
    specialization: string;
    department: string;
  };
}

export interface AppointmentBooking {
  doctor_id: string;
  preferred_date: string;
  preferred_time: string;
  consultation_type: 'In-Person' | 'Video' | 'Phone';
  symptoms?: string;
}

export interface AppointmentFilter {
  status?: string;
  date_from?: string;
  date_to?: string;
  doctor_id?: string;
}

// Token Types
export interface Token {
  id: string;
  patient_id: string;
  doctor_id: string;
  token_number: number;
  appointment_date: string;
  status: 'Waiting' | 'Called' | 'Completed' | 'Cancelled';
  estimated_wait_time?: number;
  actual_wait_time?: number;
  called_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  patient?: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
  };
  doctor?: {
    id: string;
    first_name: string;
    last_name: string;
    specialization: string;
    department: string;
  };
}

export interface TokenDisplay {
  current_token?: Token;
  queue_status: {
    total_patients: number;
    waiting_count: number;
    completed_count: number;
    cancelled_count: number;
  };
  waiting_count: number;
  average_wait_time: number;
}

export interface TokenConfirmation {
  token_number: number;
  estimated_wait_time: number;
  queue_position: number;
}

export interface TokenQueue {
  token_number: number;
  patient_name: string;
  estimated_wait_time: number;
  status: string;
}

// AI/ML Types
export interface DoctorRecommendationRequest {
  symptoms: string;
  preferred_date: string;
  preferred_specialization?: string;
  limit?: number;
}

export interface DoctorRecommendation {
  doctor_id: string;
  doctor_name: string;
  specialization: string;
  department: string;
  consultation_fee: number;
  confidence_score: number;
  recommendation_score: number;
  availability_score: number;
  specialization_match: number;
  reasoning: string;
  estimated_wait_time: number;
  availability?: any;
  patient_reviews?: {
    average_rating: number;
    total_reviews: number;
    recent_reviews: number;
  };
  success_rate?: number;
}

export interface WaitTimePredictionRequest {
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
}

export interface WaitTimePrediction {
  predicted_wait_time: number;
  confidence: number;
  factors: {
    queue_length: number;
    time_of_day: string;
    doctor_workload: number;
  };
  optimization_suggestions: string[];
  alternative_times: Array<{
    time: string;
    predicted_wait_time: number;
    reason: string;
  }>;
  real_time_data?: {
    current_queue_length: number;
    doctor_workload: number;
    average_consultation_time: number;
    patients_waiting: number;
  };
}

// Admin Dashboard Types
export interface DashboardStats {
  overview: {
    total_patients: number;
    total_doctors: number;
    total_users: number;
    today_appointments: number;
    today_tokens: number;
    recent_appointments: number;
  };
  revenue: {
    total_revenue: number;
    monthly_revenue: number;
  };
  demographics: {
    gender_distribution: Array<{
      gender: string;
      count: number;
    }>;
    department_distribution: Array<{
      department: string;
      count: number;
    }>;
  };
}

export interface AnalyticsData {
  period: string;
  date_range: {
    start: string;
    end: string;
  };
  patient_visits: Array<{
    date: string | null;
    visits: number;
  }>;
  appointment_status_breakdown: Array<{
    status: string;
    count: number;
  }>;
  doctor_workload: Array<{
    doctor_name: string;
    specialization: string;
    appointments_count: number;
  }>;
  revenue_trends: Array<{
    date: string | null;
    revenue: number;
  }>;
  payment_breakdown: Array<{
    status: string;
    count: number;
    amount: number;
  }>;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
}

// UI State Types
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface FormErrors {
  [key: string]: string;
}

// Navigation Types
export interface NavigationItem {
  path: string;
  label: string;
  icon: string;
  roles?: string[];
  children?: NavigationItem[];
}

// Chart Data Types
export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
    borderWidth?: number;
  }>;
}

// Filter Types
export interface DateRange {
  start: Date;
  end: Date;
}

export interface FilterOptions {
  search?: string;
  status?: string;
  date_range?: DateRange;
  specialization?: string;
  department?: string;
}