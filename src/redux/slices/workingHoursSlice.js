import { createCrudSlice } from '../createCrudSlice';
import { workingHoursService } from '../../services/workingHoursService';

// Table: public.working_hours
const { slice, thunks } = createCrudSlice('workingHours', workingHoursService);

export const {
  realtimeUpserted: workingHoursRealtimeUpserted,
  realtimeDeleted: workingHoursRealtimeDeleted,
  clearSelected: clearWorkingHourSelected,
  clearError: clearWorkingHourError,
} = slice.actions;

export const {
  fetchAll: fetchWorkingHours,
  fetchById: fetchWorkingHourById,
  createItem: createWorkingHour,
  updateItem: updateWorkingHour,
  removeItem: deleteWorkingHour,
} = thunks;

export default slice.reducer;
