import { createCrudSlice } from '../createCrudSlice';
import { resourceTypeService } from '../../services/resourceTypeService';

// Table: public.resource_types
const { slice, thunks } = createCrudSlice('resourceTypes', resourceTypeService);

export const {
  realtimeUpserted: resourceTypesRealtimeUpserted,
  realtimeDeleted: resourceTypesRealtimeDeleted,
  clearSelected: clearResourceTypeSelected,
  clearError: clearResourceTypeError,
} = slice.actions;

export const {
  fetchAll: fetchResourceTypes,
  fetchById: fetchResourceTypeById,
  createItem: createResourceType,
  updateItem: updateResourceType,
  removeItem: deleteResourceType,
} = thunks;

export default slice.reducer;
