import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { inviteService } from '../../services/inviteService';

/**
 * Two audiences share this slice:
 *  - Team page (staff, authenticated): createInviteThunk, fetchTenantInvites,
 *    revokeInviteThunk, resendInviteThunk.
 *  - Accept Invite page (public, PAGE 12): fetchInviteDetails, acceptInviteThunk.
 * Kept separate from membershipSlice.js on purpose — invites are a
 * token/email workflow with their own states (pending/accepted/expired/
 * revoked), not a simple CRUD resource like an established membership.
 */

export const fetchInviteDetails = createAsyncThunk(
  'invites/fetchDetails',
  async (token, { rejectWithValue }) => {
    try {
      return await inviteService.getInviteDetails(token);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const acceptInviteThunk = createAsyncThunk(
  'invites/accept',
  async (token, { rejectWithValue }) => {
    try {
      await inviteService.acceptInvite(token);
      return token;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchTenantInvites = createAsyncThunk(
  'invites/fetchForTenant',
  async (tenantId, { rejectWithValue }) => {
    try {
      return await inviteService.listInvitesForTenant(tenantId);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createInviteThunk = createAsyncThunk(
  'invites/create',
  async (payload, { rejectWithValue }) => {
    try {
      return await inviteService.createInvite(payload);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const revokeInviteThunk = createAsyncThunk(
  'invites/revoke',
  async (inviteId, { rejectWithValue }) => {
    try {
      return await inviteService.revokeInvite(inviteId);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const resendInviteThunk = createAsyncThunk(
  'invites/resend',
  async (inviteId, { rejectWithValue }) => {
    try {
      return await inviteService.resendInvite(inviteId);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const inviteSlice = createSlice({
  name: 'invites',
  initialState: {
    items: [],           // this tenant's invites, for the Team page table
    currentInvite: null,   // the invite being looked at on /accept-invite
    status: 'idle',
    acceptStatus: 'idle',   // separate status so "accepting" doesn't clobber the list view's loading state
    error: null,
  },
  reducers: {
    clearCurrentInvite(state) {
      state.currentInvite = null;
      state.acceptStatus = 'idle';
    },
    clearInviteError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInviteDetails.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchInviteDetails.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentInvite = action.payload;
      })
      .addCase(fetchInviteDetails.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.currentInvite = null;
      })

      .addCase(acceptInviteThunk.pending, (state) => { state.acceptStatus = 'loading'; })
      .addCase(acceptInviteThunk.fulfilled, (state) => { state.acceptStatus = 'succeeded'; })
      .addCase(acceptInviteThunk.rejected, (state, action) => {
        state.acceptStatus = 'failed';
        state.error = action.payload;
      })

      .addCase(fetchTenantInvites.fulfilled, (state, action) => { state.items = action.payload; })
      .addCase(createInviteThunk.fulfilled, (state, action) => { state.items.unshift(action.payload); })
      .addCase(revokeInviteThunk.fulfilled, (state, action) => {
        const idx = state.items.findIndex((i) => i.id === action.payload.id);
        if (idx >= 0) state.items[idx] = action.payload;
      })
      .addCase(resendInviteThunk.fulfilled, (state, action) => {
        const idx = state.items.findIndex((i) => i.id === action.payload.id);
        if (idx >= 0) state.items[idx] = action.payload;
      })

      .addMatcher(
        (action) => action.type.startsWith('invites/') && action.type.endsWith('/rejected'),
        (state, action) => { state.error = action.payload; }
      );
  },
});

export const { clearCurrentInvite, clearInviteError } = inviteSlice.actions;
export default inviteSlice.reducer;
