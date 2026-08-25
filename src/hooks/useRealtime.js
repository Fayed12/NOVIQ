import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { supabase } from '../services/lib/supabaseClient';

import { bookingsRealtimeUpserted, bookingsRealtimeDeleted } from '../redux/slices/bookingSlice';
import { notificationsRealtimeUpserted, notificationsRealtimeDeleted } from '../redux/slices/notificationSlice';
import { reviewsRealtimeUpserted, reviewsRealtimeDeleted } from '../redux/slices/reviewSlice';

/**
 * Single realtime hook for the whole app — call once from App.jsx or Root layout.
 * Subscribes to the three tables enabled on the `supabase_realtime`
 * publication (bookings, notifications, reviews)
 * and keeps their Redux slices in sync live, without polling.
 *
 * @param {Object} params
 * @param {string|null} params.userId - current authenticated user id (for notifications).
 * @param {string|null} params.tenantId - active tenant id, if the user is on a tenant dashboard
 *   (staff sees all bookings/reviews for their tenant). Pass null on customer-only screens.
 */
export function useRealtime({ userId, tenantId } = {}) {
  const dispatch = useDispatch();

  // --- Bookings: live for the active tenant's dashboard ("New Booking!" popup) ---
  useEffect(() => {
    if (!tenantId) return;

    const channel = supabase
      .channel(`realtime-bookings-${tenantId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings', filter: `tenant_id=eq.${tenantId}` },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            dispatch(bookingsRealtimeDeleted({ id: payload.old.id }));
          } else {
            dispatch(bookingsRealtimeUpserted(payload.new));
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [tenantId, dispatch]);

  // --- Notifications: live for the current user, on every screen ---
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`realtime-notifications-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            dispatch(notificationsRealtimeDeleted({ id: payload.old.id }));
          } else {
            dispatch(notificationsRealtimeUpserted(payload.new));
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [userId, dispatch]);

  // --- Reviews: live for the active tenant's dashboard ---
  useEffect(() => {
    if (!tenantId) return;

    const channel = supabase
      .channel(`realtime-reviews-${tenantId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reviews', filter: `tenant_id=eq.${tenantId}` },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            dispatch(reviewsRealtimeDeleted({ id: payload.old.id }));
          } else {
            dispatch(reviewsRealtimeUpserted(payload.new));
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [tenantId, dispatch]);
}

export default useRealtime;
