import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

/**
 * Generic CRUD slice factory. Each per-table slice file configures this
 * with the table's service + a Redux name, then re-exports the thunks
 * under table-specific names (e.g. fetchTenants, createTenant).
 *
 * Pairs with apiNotifyMiddleware.js, which listens for any action matching
 * slice name across every slice built from this factory - that's the
 * "middleware in the slice" behavior: errors and key events are handled
 * centrally instead of being duplicated in each slice file.
 */
export function createCrudSlice(name, service) {
  const fetchAll = createAsyncThunk(`${name}/fetchAll`, async (params, { rejectWithValue }) => {
    try {
      return await service.getAll(params);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  });

  const fetchById = createAsyncThunk(`${name}/fetchById`, async (id, { rejectWithValue }) => {
    try {
      return await service.getById(id);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  });

  const createItem = createAsyncThunk(`${name}/create`, async (payload, { rejectWithValue }) => {
    try {
      return await service.create(payload);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  });

  const updateItem = createAsyncThunk(`${name}/update`, async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      return await service.update(id, payload);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  });

  const removeItem = createAsyncThunk(`${name}/remove`, async (id, { rejectWithValue }) => {
    try {
      return await service.remove(id);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  });

  const upsert = (state, row) => {
    const idx = state.items.findIndex((i) => i.id === row.id);
    if (idx >= 0) state.items[idx] = row;
    else state.items.unshift(row);
  };

  const slice = createSlice({
    name,
    initialState: {
      items: [],
      selected: null,
      status: 'idle', // idle | loading | succeeded | failed
      error: null,
    },
    reducers: {
      // Driven by the realtime hook (useRealtime.js), not by API calls.
      realtimeUpserted(state, action) {
        upsert(state, action.payload);
      },
      realtimeDeleted(state, action) {
        state.items = state.items.filter((i) => i.id !== action.payload.id);
      },
      clearSelected(state) {
        state.selected = null;
      },
      clearError(state) {
        state.error = null;
      },
    },
    extraReducers: (builder) => {
      builder
        .addCase(fetchAll.pending, (state) => {
          state.status = 'loading';
        })
        .addCase(fetchAll.fulfilled, (state, action) => {
          state.status = 'succeeded';
          state.items = action.payload;
        })
        .addCase(fetchById.fulfilled, (state, action) => {
          state.selected = action.payload;
        })
        .addCase(createItem.fulfilled, (state, action) => {
          state.items.unshift(action.payload);
        })
        .addCase(updateItem.fulfilled, (state, action) => {
          upsert(state, action.payload);
        })
        .addCase(removeItem.fulfilled, (state, action) => {
          state.items = state.items.filter((i) => i.id !== action.payload);
        })
        .addMatcher(
          (action) => action.type.startsWith(`${name}/`) && action.type.endsWith('/rejected'),
          (state, action) => {
            state.status = 'failed';
            state.error = action.payload ?? action.error?.message ?? 'Unknown error';
          }
        );
    },
  });

  return { slice, thunks: { fetchAll, fetchById, createItem, updateItem, removeItem } };
}
