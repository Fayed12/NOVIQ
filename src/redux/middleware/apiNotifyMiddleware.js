import { createListenerMiddleware, isRejectedWithValue } from '@reduxjs/toolkit';

/**
 * Cross-cutting middleware for every slice built from createCrudSlice.js.
 * Centralizes two things every slice would otherwise duplicate:
 *   1. Error surfacing - any rejected action gets logged and can be wired
 *      to a toast/snackbar system here in one place.
 *   2. Key domain events - e.g. a booking being created can trigger a
 *      local notification without every component needing to know about it.
 *
 * Wire this into store.js via prepend(apiNotifyMiddleware.middleware).
 */
export const apiNotifyMiddleware = createListenerMiddleware();

// 1. Global error handling for every async thunk from every slice.
apiNotifyMiddleware.startListening({
  matcher: isRejectedWithValue,
  effect: async (action) => {
    // Replace with your toast/snackbar library of choice.
    console.error('[API ERROR]', action.type, action.payload);
  },
});

// 2. Example domain event: booking created -> surface a local toast.
apiNotifyMiddleware.startListening({
  type: 'bookings/create/fulfilled',
  effect: async (action) => {
    console.info('[Booking created]', action.payload);
  },
});

// 3. Example domain event: review created -> could trigger a "thank you" UI.
apiNotifyMiddleware.startListening({
  type: 'reviews/create/fulfilled',
  effect: async (action) => {
    console.info('[Review submitted]', action.payload);
  },
});
