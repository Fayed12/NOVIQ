import { createCrudSlice } from '../createCrudSlice';
import { cancellationPolicyService } from '../../services/cancellationPolicyService';

// Table: public.cancellation_policies
const { slice, thunks } = createCrudSlice('cancellationPolicies', cancellationPolicyService);

export const {
  realtimeUpserted: cancellationPoliciesRealtimeUpserted,
  realtimeDeleted: cancellationPoliciesRealtimeDeleted,
  clearSelected: clearCancellationPolicySelected,
  clearError: clearCancellationPolicyError,
} = slice.actions;

export const {
  fetchAll: fetchCancellationPolicies,
  fetchById: fetchCancellationPolicyById,
  createItem: createCancellationPolicy,
  updateItem: updateCancellationPolicy,
  removeItem: deleteCancellationPolicy,
} = thunks;

export default slice.reducer;
