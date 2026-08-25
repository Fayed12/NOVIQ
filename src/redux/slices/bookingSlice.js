import { createCrudSlice } from '../createCrudSlice';
import { bookingService } from '../../services/bookingService';

// Table: public.bookings
const { slice, thunks } = createCrudSlice('bookings', bookingService);

export const {
  realtimeUpserted: bookingsRealtimeUpserted,
  realtimeDeleted: bookingsRealtimeDeleted,
  clearSelected: clearBookingSelected,
  clearError: clearBookingError,
} = slice.actions;

export const {
  fetchAll: fetchBookings,
  fetchById: fetchBookingById,
  createItem: createBooking,
  updateItem: updateBooking,
  removeItem: deleteBooking,
} = thunks;

export default slice.reducer;
