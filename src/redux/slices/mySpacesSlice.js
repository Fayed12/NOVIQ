import { createCrudSlice } from '../createCrudSlice';
import { mySpacesService } from '../../services/mySpacesService';

// Table: public.user_business_profiles
const { slice, thunks } = createCrudSlice('mySpaces', mySpacesService);

export const {
  realtimeUpserted: mySpacesRealtimeUpserted,
  realtimeDeleted: mySpacesRealtimeDeleted,
  clearSelected: clearMySpaceSelected,
  clearError: clearMySpaceError,
} = slice.actions;

export const {
  fetchAll: fetchMySpaces,
  fetchById: fetchMySpaceById,
  createItem: createMySpace,
  updateItem: updateMySpace,
  removeItem: deleteMySpace,
} = thunks;

export default slice.reducer;
