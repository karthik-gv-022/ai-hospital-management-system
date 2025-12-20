import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { adminService } from '../../services/adminService';
import { DashboardStats, AnalyticsData, User, Doctor } from '../../types';

interface AdminState {
  dashboardStats: DashboardStats | null;
  analytics: AnalyticsData | null;
  users: User[];
  doctors: Doctor[];
  patients: any[];
  systemHealth: any;
  isLoading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  dashboardStats: null,
  analytics: null,
  users: [],
  doctors: [],
  patients: [],
  systemHealth: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
  'admin/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await adminService.getDashboardStats();
      return stats;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch dashboard stats');
    }
  }
);

export const fetchAnalytics = createAsyncThunk(
  'admin/fetchAnalytics',
  async (period: string = 'week', { rejectWithValue }) => {
    try {
      const analytics = await adminService.getAnalytics(period);
      return analytics;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch analytics');
    }
  }
);

export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (filters : {
    search?: string;
    role?: string;
    is_active?: boolean;
    skip?: number;
    limit?: number;
  }, { rejectWithValue }) => {
    try {
      const users = await adminService.getUsers(filters);
      return users;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch users');
    }
  }
);

export const addDoctor = createAsyncThunk(
  'admin/addDoctor',
  async (doctorData: any, { rejectWithValue }) => {
    try {
      const result = await adminService.addDoctor(doctorData);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to add doctor');
    }
  }
);

export const toggleUserStatus = createAsyncThunk(
  'admin/toggleUserStatus',
  async (
    { userId, isActive }: { userId: string; isActive: boolean },
    { rejectWithValue }
  ) => {
    try {
      const result = await adminService.toggleUserStatus(userId, isActive);
      return { userId, isActive, result };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update user status');
    }
  }
);

export const fetchPatients = createAsyncThunk(
  'admin/fetchPatients',
  async (filters : {
    search?: string;
    page?: number;
    limit?: number;
  }, { rejectWithValue }) => {
    try {
      const patients = await adminService.getPatients(filters);
      return patients;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch patients');
    }
  }
);

export const fetchSystemHealth = createAsyncThunk(
  'admin/fetchSystemHealth',
  async (_, { rejectWithValue }) => {
    try {
      const health = await adminService.getSystemHealth();
      return health;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch system health');
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUserStatus: (state, action: PayloadAction<{ userId: string; isActive: boolean }>) => {
      const userIndex = state.users.findIndex(u => u.id === action.payload.userId);
      if (userIndex >= 0) {
        state.users[userIndex] = {
          ...state.users[userIndex],
          is_active: action.payload.isActive
        };
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch Dashboard Stats
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboardStats = action.payload;
        state.error = null;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Analytics
    builder
      .addCase(fetchAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = action.payload;
        state.error = null;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Add Doctor
    builder
      .addCase(addDoctor.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addDoctor.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(addDoctor.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Toggle User Status
    builder
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        const { userId, isActive } = action.payload;
        const userIndex = state.users.findIndex(u => u.id === userId);
        if (userIndex >= 0) {
          state.users[userIndex] = {
            ...state.users[userIndex],
            is_active: isActive
          };
        }
      })
      .addCase(toggleUserStatus.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Fetch Patients
    builder
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.patients = action.payload;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Fetch System Health
    builder
      .addCase(fetchSystemHealth.fulfilled, (state, action) => {
        state.systemHealth = action.payload;
      })
      .addCase(fetchSystemHealth.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError, updateUserStatus } = adminSlice.actions;

export default adminSlice.reducer;