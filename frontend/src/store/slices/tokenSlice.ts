import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { tokenService } from '../../services/tokenService';
import { Token, TokenDisplay, TokenConfirmation, TokenQueue } from '../../types';

interface TokenState {
  currentToken: Token | null;
  tokenDisplay: TokenDisplay | null;
  tokenQueue: TokenQueue[];
  myTokens: Token[];
  tokenConfirmation: TokenConfirmation | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: TokenState = {
  currentToken: null,
  tokenDisplay: null,
  tokenQueue: [],
  myTokens: [],
  tokenConfirmation: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const generateToken = createAsyncThunk(
  'token/generate',
  async (data: {
    doctor_id: string;
    appointment_id?: string;
    appointment_date: string;
  }, { rejectWithValue }) => {
    try {
      const token = await tokenService.generateToken(data);
      return token;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to generate token');
    }
  }
);

export const quickGenerateToken = createAsyncThunk(
  'token/quickGenerate',
  async (
    { doctorId, appointmentId }: { doctorId: string; appointmentId?: string },
    { rejectWithValue }
  ) => {
    try {
      const confirmation = await tokenService.quickGenerateToken(doctorId, appointmentId);
      return confirmation;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to generate token');
    }
  }
);

export const fetchTokenDisplay = createAsyncThunk(
  'token/fetchDisplay',
  async (doctorId : string, { rejectWithValue }) => {
    try {
      const display = await tokenService.getCurrentTokenDisplay(doctorId);
      return display;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch token display');
    }
  }
);

export const fetchTokenQueue = createAsyncThunk(
  'token/fetchQueue',
  async (doctorId: string, { rejectWithValue }) => {
    try {
      const queue = await tokenService.getTokenQueue(doctorId);
      return queue;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch token queue');
    }
  }
);

export const callToken = createAsyncThunk(
  'token/call',
  async (tokenId: string, { rejectWithValue }) => {
    try {
      const result = await tokenService.callToken(tokenId);
      return { tokenId, result };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to call token');
    }
  }
);

export const completeToken = createAsyncThunk(
  'token/complete',
  async (
    { tokenId, data }: { tokenId: string; data: { actual_wait_time: number; notes?: string } },
    { rejectWithValue }
  ) => {
    try {
      const result = await tokenService.completeToken(tokenId, data);
      return { tokenId, result };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to complete token');
    }
  }
);

export const fetchMyTokens = createAsyncThunk(
  'token/fetchMyTokens',
  async (status : string, { rejectWithValue }) => {
    try {
      const tokens = await tokenService.getMyTokens(status);
      return tokens;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch tokens');
    }
  }
);

const tokenSlice = createSlice({
  name: 'token',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentToken: (state, action: PayloadAction<Token | null>) => {
      state.currentToken = action.payload;
    },
    clearTokenConfirmation: (state) => {
      state.tokenConfirmation = null;
    },
  },
  extraReducers: (builder) => {
    // Generate Token
    builder
      .addCase(generateToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentToken = action.payload;
        state.error = null;
      })
      .addCase(generateToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Quick Generate Token
    builder
      .addCase(quickGenerateToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(quickGenerateToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tokenConfirmation = action.payload;
        state.error = null;
      })
      .addCase(quickGenerateToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Token Display
    builder
      .addCase(fetchTokenDisplay.fulfilled, (state, action) => {
        state.tokenDisplay = action.payload;
      })
      .addCase(fetchTokenDisplay.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Fetch Token Queue
    builder
      .addCase(fetchTokenQueue.fulfilled, (state, action) => {
        state.tokenQueue = action.payload;
      })
      .addCase(fetchTokenQueue.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Call Token
    builder
      .addCase(callToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(callToken.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update token queue to reflect called token
        const tokenId = action.payload.tokenId;
        const tokenIndex = state.tokenQueue.findIndex(t =>
          state.myTokens.find(mt => mt.id === tokenId)?.token_number === t.token_number
        );
        if (tokenIndex >= 0) {
          state.tokenQueue[tokenIndex] = { ...state.tokenQueue[tokenIndex], status: 'Called' };
        }
        state.error = null;
      })
      .addCase(callToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Complete Token
    builder
      .addCase(completeToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(completeToken.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update token queue to reflect completed token
        const tokenId = action.payload.tokenId;
        const tokenIndex = state.tokenQueue.findIndex(t =>
          state.myTokens.find(mt => mt.id === tokenId)?.token_number === t.token_number
        );
        if (tokenIndex >= 0) {
          state.tokenQueue[tokenIndex] = { ...state.tokenQueue[tokenIndex], status: 'Completed' };
        }
        state.error = null;
      })
      .addCase(completeToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch My Tokens
    builder
      .addCase(fetchMyTokens.fulfilled, (state, action) => {
        state.myTokens = action.payload;
      })
      .addCase(fetchMyTokens.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentToken, clearTokenConfirmation } = tokenSlice.actions;

export default tokenSlice.reducer;