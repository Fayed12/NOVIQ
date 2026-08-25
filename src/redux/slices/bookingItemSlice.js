import { createCrudSlice } from '../createCrudSlice';
import { bookingItemService } from '../../services/bookingItemService';

// Table: public.booking_items
const { slice, thunks } = createCrudSlice('bookingItems', bookingItemService);

export const {
  realtimeUpserted: bookingItemsRealtimeUpserted,
  realtimeDeleted: bookingItemsRealtimeDeleted,
  clearSelected: clearBookingItemSelected,
  clearError: clearBookingItemError,
} = slice.actions;

export const {
  fetchAll: fetchBookingItems,
  fetchById: fetchBookingItemById,
  createItem: createBookingItem,
  updateItem: updateBookingItem,
  removeItem: deleteBookingItem,
} = thunks;

export default slice.reducer;
