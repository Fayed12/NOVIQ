import { createCrudSlice } from '../createCrudSlice';
import { tenantService } from '../../services/tenantService';

// Table: public.tenants
const { slice, thunks } = createCrudSlice('tenants', tenantService);

export const {
  realtimeUpserted: tenantsRealtimeUpserted,
  realtimeDeleted: tenantsRealtimeDeleted,
  clearSelected: clearTenantSelected,
  clearError: clearTenantError,
} = slice.actions;

export const {
  fetchAll: fetchTenants,
  fetchById: fetchTenantById,
  createItem: createTenant,
  updateItem: updateTenant,
  removeItem: deleteTenant,
} = thunks;

export default slice.reducer;
