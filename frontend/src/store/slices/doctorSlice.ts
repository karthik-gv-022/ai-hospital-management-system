import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { doctorService } from '../../services/doctorService';
import { Doctor, DoctorProfile, Appointment, DoctorAvailability } from '../../types';

interface DoctorState {
  doctors: Doctor[];
  profile: DoctorProfile | null;
  appointments: Appointment[];
  todayAppointments: Appointment[];
  isLoading: boolean;
  error: string | null;
}

const initialState: DoctorState = {
  doctors: [],
  profile: null,
  appointments: [],
  todayAppointments: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchDoctors = createAsyncThunk(
  'doctor/fetchDoctors',
  async (filters : {
    specialization?: string;
    department?: string;
    available_today?: boolean;
    skip?: number;
    limit?: number;
  }, { rejectWithValue }) => {
    try {
      const doctors = await doctorService.getDoctors(filters);
      return doctors;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch doctors');
    }
  }
);

export const fetchDoctorById = createAsyncThunk(
  'doctor/fetchDoctorById',
  async (doctorId: string, { rejectWithValue }) => {
    try {
      const doctor = await doctorService.getDoctorById(doctorId);
      return doctor;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch doctor');
    }
  }
);

export const fetchDoctorProfile = createAsyncThunk(
  'doctor/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const profile = await doctorService.getMyProfile();
      return profile;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch profile');
    }
  }
);

export const fetchDoctorAppointments = createAsyncThunk(
  'doctor/fetchAppointments',
  async (filters : {
    date?: string;
    status?: string;
  }, { rejectWithValue }) => {
    try {
      const appointments = await doctorService.getAppointments(filters);
      return appointments;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch appointments');
    }
  }
);

export const fetchTodayAppointments = createAsyncThunk(
  'doctor/fetchTodayAppointments',
  async (_, { rejectWithValue }) => {
    try {
      const appointments = await doctorService.getTodayAppointments();
      return appointments;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch today\'s appointments');
    }
  }
);

export const updateDoctorAvailability = createAsyncThunk(
  'doctor/updateAvailability',
  async (availability: DoctorAvailability, { rejectWithValue }) => {
    try {
      const result = await doctorService.updateAvailability(availability);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update availability');
    }
  }
);

const doctorSlice = createSlice({
  name: 'doctor',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateProfileLocal: (state, action: PayloadAction<Partial<DoctorProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch Doctors
    builder
      .addCase(fetchDoctors.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.isLoading = false;
        state.doctors = action.payload;
        state.error = null;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Doctor by ID
    builder
      .addCase(fetchDoctorById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDoctorById.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update or add doctor to the list
        const index = state.doctors.findIndex(d => d.id === action.payload.id);
        if (index >= 0) {
          state.doctors[index] = action.payload;
        } else {
          state.doctors.push(action.payload);
        }
        state.error = null;
      })
      .addCase(fetchDoctorById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Profile
    builder
      .addCase(fetchDoctorProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDoctorProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(fetchDoctorProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Appointments
    builder
      .addCase(fetchDoctorAppointments.fulfilled, (state, action) => {
        state.appointments = action.payload;
      })
      .addCase(fetchDoctorAppointments.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Fetch Today's Appointments
    builder
      .addCase(fetchTodayAppointments.fulfilled, (state, action) => {
        state.todayAppointments = action.payload;
      })
      .addCase(fetchTodayAppointments.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Update Availability
    builder
      .addCase(updateDoctorAvailability.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateDoctorAvailability.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(updateDoctorAvailability.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, updateProfileLocal } = doctorSlice.actions;

export default doctorSlice.reducer;