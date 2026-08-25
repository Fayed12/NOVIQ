import { createCrudSlice } from '../createCrudSlice';
import { membershipService } from '../../services/membershipService';

// Table: public.tenant_memberships
const { slice, thunks } = createCrudSlice('memberships', membershipService);

export const {
  realtimeUpserted: membershipsRealtimeUpserted,
  realtimeDeleted: membershipsRealtimeDeleted,
  clearSelected: clearMembershipSelected,
  clearError: clearMembershipError,
} = slice.actions;

export const {
  fetchAll: fetchMemberships,
  fetchById: fetchMembershipById,
  createItem: createMembership,
  updateItem: updateMembership,
  removeItem: deleteMembership,
} = thunks;

export default slice.reducer;
