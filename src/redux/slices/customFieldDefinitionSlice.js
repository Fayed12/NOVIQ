import { createCrudSlice } from '../createCrudSlice';
import { customFieldDefinitionService } from '../../services/customFieldDefinitionService';

// Table: public.custom_field_definitions
const { slice, thunks } = createCrudSlice('customFieldDefinitions', customFieldDefinitionService);

export const {
  realtimeUpserted: customFieldDefinitionsRealtimeUpserted,
  realtimeDeleted: customFieldDefinitionsRealtimeDeleted,
  clearSelected: clearCustomFieldDefinitionSelected,
  clearError: clearCustomFieldDefinitionError,
} = slice.actions;

export const {
  fetchAll: fetchCustomFieldDefinitions,
  fetchById: fetchCustomFieldDefinitionById,
  createItem: createCustomFieldDefinition,
  updateItem: updateCustomFieldDefinition,
  removeItem: deleteCustomFieldDefinition,
} = thunks;

export default slice.reducer;
