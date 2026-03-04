import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  created_at: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
}

const initialState: AuthState = {
  user: (() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      console.error('Failed to parse user from localStorage');
      return null;
    }
  })(),
  token: (() => {
    try {
      return localStorage.getItem('token') || null;
    } catch {
      return null;
    }
  })(),
  loading: false,
  error: null,
  isAuthenticated: (() => {
    try {
      return !!localStorage.getItem('token');
    } catch {
      return false;
    }
  })(),
  isInitializing: false, // Start as not initializing since we're reading from localStorage
};

// Async Thunks
export const register = createAsyncThunk(
  'auth/register',
  async (data: { username: string; email: string; password: string; phone?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', data);
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Registration failed');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (data: { username_or_email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', data);
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Login failed');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No token found');
      }
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error: any) {
      // Only reject if it's a real error, not 401; let the state remain as-is
      if (error.response?.status === 401) {
        // Clear invalid token silently
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch user');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (data: Partial<User>, { rejectWithValue }) => {
    try {
      const response = await api.put('/auth/me', data);
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update profile');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isInitializing = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null;
    },
    markInitializationComplete: (state) => {
      state.isInitializing = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.access_token;
        state.isAuthenticated = true;
        state.isInitializing = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isInitializing = false;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.access_token;
        state.isAuthenticated = true;
        state.isInitializing = false;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isInitializing = false;
      })
      .addCase(getCurrentUser.pending, (state) => {
        // Don't set loading for getCurrentUser as it's a background task
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isInitializing = false;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        // Only clear auth if there's no token - otherwise keep authenticated
        const token = localStorage.getItem('token');
        if (!token) {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
        }
        state.isInitializing = false;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { logout, clearError, markInitializationComplete } = authSlice.actions;
export default authSlice.reducer;
