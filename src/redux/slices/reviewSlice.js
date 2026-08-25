import { createCrudSlice } from '../createCrudSlice';
import { reviewService } from '../../services/reviewService';

// Table: public.reviews
const { slice, thunks } = createCrudSlice('reviews', reviewService);

export const {
  realtimeUpserted: reviewsRealtimeUpserted,
  realtimeDeleted: reviewsRealtimeDeleted,
  clearSelected: clearReviewSelected,
  clearError: clearReviewError,
} = slice.actions;

export const {
  fetchAll: fetchReviews,
  fetchById: fetchReviewById,
  createItem: createReview,
  updateItem: updateReview,
  removeItem: deleteReview,
} = thunks;

export default slice.reducer;
