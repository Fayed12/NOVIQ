import { createCrudSlice } from '../createCrudSlice';
import { branchService } from '../../services/branchService';

// Table: public.branches
const { slice, thunks } = createCrudSlice('branches', branchService);

export const {
  realtimeUpserted: branchesRealtimeUpserted,
  realtimeDeleted: branchesRealtimeDeleted,
  clearSelected: clearBranchSelected,
  clearError: clearBranchError,
} = slice.actions;

export const {
  fetchAll: fetchBranches,
  fetchById: fetchBranchById,
  createItem: createBranch,
  updateItem: updateBranch,
  removeItem: deleteBranch,
} = thunks;

export default slice.reducer;
