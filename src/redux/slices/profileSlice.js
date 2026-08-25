import { createCrudSlice } from '../createCrudSlice';
import { profileService } from '../../services/profileService';

// Table: public.profiles
const { slice, thunks } = createCrudSlice('profiles', profileService);

export const {
  realtimeUpserted: profilesRealtimeUpserted,
  realtimeDeleted: profilesRealtimeDeleted,
  clearSelected: clearProfileSelected,
  clearError: clearProfileError,
} = slice.actions;

export const {
  fetchAll: fetchProfiles,
  fetchById: fetchProfileById,
  createItem: createProfile,
  updateItem: updateProfile,
  removeItem: deleteProfile,
} = thunks;

export default slice.reducer;
