import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';

/**
 * Owns the app's auth/session state. Unlike the other slices (which all
 * come from createCrudSlice.js), this one is hand-written because auth
 * isn't a list-of-rows resource — it's a single current-user session,
 * plus a handful of one-off action flows (register, reset, etc.) that
 * don't map onto fetchAll/create/update/remove.
 *
 * `useAuth.js` is what actually drives this slice day-to-day (subscribing
 * to Supabase's onAuthStateChange and dispatching `sessionChanged`) —
 * the thunks below are for the explicit user actions on the Auth pages.
 */

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ email, password, fullName }, { rejectWithValue }) => {
    try {
      return await authService.signUp({ email, password, fullName });
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      return await authService.signIn({ email, password });
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await authService.signOut();
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

// PAGE 10 — Forgot Password. Component should treat this as "always succeeds"
// in the UI regardless of fulfilled/rejected (see authService.js note).
export const requestPasswordReset = createAsyncThunk(
  'auth/requestPasswordReset',
  async (email, { rejectWithValue }) => {
    try {
      await authService.sendPasswordResetEmail(email);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// PAGE 11 — Reset Password.
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (newPassword, { rejectWithValue }) => {
    try {
      const user = await authService.updatePassword(newPassword);
      await authService.signOutOtherSessions();
      return user;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Settings → Security (PAGE 17).
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (newPassword, { rejectWithValue }) => {
    try {
      return await authService.changePassword(newPassword);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// PAGE 09 — Email Verification (resend).
export const resendVerificationEmail = createAsyncThunk(
  'auth/resendVerificationEmail',
  async (email, { rejectWithValue }) => {
    try {
      await authService.resendVerificationEmail(email);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,          // Supabase auth user object
    session: null,        // Supabase session (access_token, refresh_token, etc.)
    status: 'idle',        // idle | loading | succeeded | failed
    error: null,
    initialized: false,     // true once the first getSession() check has resolved —
                             // gate your router on this to avoid a login-flash on reload
  },
  reducers: {
    // Dispatched by useAuth.js on every Supabase auth event.
    sessionChanged(state, action) {
      const { session } = action.payload;
      state.session = session;
      state.user = session?.user ?? null;
      state.initialized = true;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => { state.status = 'loading'; state.error = null; })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.session = action.payload.session;
      })
      .addCase(registerUser.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; })

      // Login
      .addCase(loginUser.pending, (state) => { state.status = 'loading'; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.session = action.payload.session;
      })
      .addCase(loginUser.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.session = null;
        state.status = 'idle';
      })

      // Generic matcher for other auth async thunks
      .addMatcher(
        (action) => action.type.startsWith('auth/') && action.type.endsWith('/rejected'),
        (state, action) => { state.error = action.payload; }
      )
      .addMatcher(
        (action) => action.type.startsWith('auth/') && action.type.endsWith('/pending'),
        (state) => { state.status = 'loading'; }
      )
      .addMatcher(
        (action) => action.type.startsWith('auth/') && action.type.endsWith('/fulfilled'),
        (state) => { state.status = 'succeeded'; }
      );
  },
});

export const { sessionChanged, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
