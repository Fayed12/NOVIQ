import { createCrudSlice } from '../createCrudSlice';
import { customFieldValueService } from '../../services/customFieldValueService';

// Table: public.custom_field_values
const { slice, thunks } = createCrudSlice('customFieldValues', customFieldValueService);

export const {
  realtimeUpserted: customFieldValuesRealtimeUpserted,
  realtimeDeleted: customFieldValuesRealtimeDeleted,
  clearSelected: clearCustomFieldValueSelected,
  clearError: clearCustomFieldValueError,
} = slice.actions;

export const {
  fetchAll: fetchCustomFieldValues,
  fetchById: fetchCustomFieldValueById,
  createItem: createCustomFieldValue,
  updateItem: updateCustomFieldValue,
  removeItem: deleteCustomFieldValue,
} = thunks;

export default slice.reducer;
