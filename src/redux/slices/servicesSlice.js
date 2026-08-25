import { createCrudSlice } from '../createCrudSlice';
import { servicesService } from '../../services/servicesService';

// Table: public.services
const { slice, thunks } = createCrudSlice('services', servicesService);

export const {
  realtimeUpserted: servicesRealtimeUpserted,
  realtimeDeleted: servicesRealtimeDeleted,
  clearSelected: clearServiceSelected,
  clearError: clearServiceError,
} = slice.actions;

export const {
  fetchAll: fetchServices,
  fetchById: fetchServiceById,
  createItem: createService,
  updateItem: updateService,
  removeItem: deleteService,
} = thunks;

export default slice.reducer;
