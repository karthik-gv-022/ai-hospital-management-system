import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { appointmentService } from '../../services/appointmentService';
import { Appointment, AppointmentBooking } from '../../types';

interface AppointmentState {
  appointments: Appointment[];
  currentAppointment: Appointment | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AppointmentState = {
  appointments: [],
  currentAppointment: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const bookAppointment = createAsyncThunk(
  'appointment/book',
  async (bookingData: AppointmentBooking, { rejectWithValue }) => {
    try {
      const appointment = await appointmentService.bookAppointment(bookingData);
      return appointment;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to book appointment');
    }
  }
);

export const fetchAppointment = createAsyncThunk(
  'appointment/fetch',
  async (appointmentId: string, { rejectWithValue }) => {
    try {
      const appointment = await appointmentService.getAppointment(appointmentId);
      return appointment;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch appointment');
    }
  }
);

export const updateAppointment = createAsyncThunk(
  'appointment/update',
  async (
    { appointmentId, data }: { appointmentId: string; data: Partial<Appointment> },
    { rejectWithValue }
  ) => {
    try {
      const appointment = await appointmentService.updateAppointment(appointmentId, data);
      return appointment;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update appointment');
    }
  }
);

export const cancelAppointment = createAsyncThunk(
  'appointment/cancel',
  async (appointmentId: string, { rejectWithValue }) => {
    try {
      await appointmentService.cancelAppointment(appointmentId);
      return appointmentId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to cancel appointment');
    }
  }
);

const appointmentSlice = createSlice({
  name: 'appointment',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentAppointment: (state, action: PayloadAction<Appointment | null>) => {
      state.currentAppointment = action.payload;
    },
    updateAppointmentLocal: (state, action: PayloadAction<Appointment>) => {
      const index = state.appointments.findIndex(apt => apt.id === action.payload.id);
      if (index >= 0) {
        state.appointments[index] = action.payload;
      }
      if (state.currentAppointment?.id === action.payload.id) {
        state.currentAppointment = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // Book Appointment
    builder
      .addCase(bookAppointment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(bookAppointment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.appointments.push(action.payload);
        state.currentAppointment = action.payload;
        state.error = null;
      })
      .addCase(bookAppointment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Appointment
    builder
      .addCase(fetchAppointment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAppointment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentAppointment = action.payload;
        state.error = null;
      })
      .addCase(fetchAppointment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Appointment
    builder
      .addCase(updateAppointment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAppointment.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.appointments.findIndex(apt => apt.id === action.payload.id);
        if (index >= 0) {
          state.appointments[index] = action.payload;
        }
        if (state.currentAppointment?.id === action.payload.id) {
          state.currentAppointment = action.payload;
        }
        state.error = null;
      })
      .addCase(updateAppointment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Cancel Appointment
    builder
      .addCase(cancelAppointment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.appointments = state.appointments.filter(apt => apt.id !== action.payload);
        if (state.currentAppointment?.id === action.payload) {
          state.currentAppointment = null;
        }
        state.error = null;
      })
      .addCase(cancelAppointment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentAppointment, updateAppointmentLocal } = appointmentSlice.actions;

export default appointmentSlice.reducer;