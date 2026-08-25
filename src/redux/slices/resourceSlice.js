import { createCrudSlice } from '../createCrudSlice';
import { resourceService } from '../../services/resourceService';

// Table: public.resources
const { slice, thunks } = createCrudSlice('resources', resourceService);

export const {
  realtimeUpserted: resourcesRealtimeUpserted,
  realtimeDeleted: resourcesRealtimeDeleted,
  clearSelected: clearResourceSelected,
  clearError: clearResourceError,
} = slice.actions;

export const {
  fetchAll: fetchResources,
  fetchById: fetchResourceById,
  createItem: createResource,
  updateItem: updateResource,
  removeItem: deleteResource,
} = thunks;

export default slice.reducer;
