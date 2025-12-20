import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { patientService } from '../../services/patientService';
import { Patient, PatientProfile, Appointment } from '../../types';

interface PatientState {
  profile: PatientProfile | null;
  appointments: Appointment[];
  upcomingAppointments: Appointment[];
  tokens: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: PatientState = {
  profile: null,
  appointments: [],
  upcomingAppointments: [],
  tokens: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchPatientProfile = createAsyncThunk(
  'patient/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const profile = await patientService.getProfile();
      return profile;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch profile');
    }
  }
);

export const updatePatientProfile = createAsyncThunk(
  'patient/updateProfile',
  async (data: Partial<Patient>, { rejectWithValue }) => {
    try {
      const updatedProfile = await patientService.updateProfile(data);
      return updatedProfile;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update profile');
    }
  }
);

export const fetchPatientAppointments = createAsyncThunk(
  'patient/fetchAppointments',
  async (filters : any, { rejectWithValue }) => {
    try {
      const appointments = await patientService.getAppointments(filters);
      return appointments;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch appointments');
    }
  }
);

export const fetchUpcomingAppointments = createAsyncThunk(
  'patient/fetchUpcomingAppointments',
  async (days: number = 7, { rejectWithValue }) => {
    try {
      const appointments = await patientService.getUpcomingAppointments(days);
      return appointments;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch upcoming appointments');
    }
  }
);

const patientSlice = createSlice({
  name: 'patient',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateProfileLocal: (state, action: PayloadAction<Partial<PatientProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch Profile
    builder
      .addCase(fetchPatientProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPatientProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(fetchPatientProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Profile
    builder
      .addCase(updatePatientProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePatientProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.profile) {
          state.profile = { ...state.profile, ...action.payload };
        }
        state.error = null;
      })
      .addCase(updatePatientProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Appointments
    builder
      .addCase(fetchPatientAppointments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPatientAppointments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.appointments = action.payload;
        state.error = null;
      })
      .addCase(fetchPatientAppointments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Upcoming Appointments
    builder
      .addCase(fetchUpcomingAppointments.fulfilled, (state, action) => {
        state.upcomingAppointments = action.payload;
      })
      .addCase(fetchUpcomingAppointments.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError, updateProfileLocal } = patientSlice.actions;

export default patientSlice.reducer;