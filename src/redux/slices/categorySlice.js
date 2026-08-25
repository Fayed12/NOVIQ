import { createCrudSlice } from '../createCrudSlice';
import { categoryService } from '../../services/categoryService';

// Table: public.categories
const { slice, thunks } = createCrudSlice('categories', categoryService);

export const {
  realtimeUpserted: categoriesRealtimeUpserted,
  realtimeDeleted: categoriesRealtimeDeleted,
  clearSelected: clearCategorySelected,
  clearError: clearCategoryError,
} = slice.actions;

export const {
  fetchAll: fetchCategories,
  fetchById: fetchCategoryById,
  createItem: createCategory,
  updateItem: updateCategory,
  removeItem: deleteCategory,
} = thunks;

export default slice.reducer;
