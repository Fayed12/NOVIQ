import { createCrudSlice } from '../createCrudSlice';
import { notificationService } from '../../services/notificationService';

// Table: public.notifications
const { slice, thunks } = createCrudSlice('notifications', notificationService);

export const {
  realtimeUpserted: notificationsRealtimeUpserted,
  realtimeDeleted: notificationsRealtimeDeleted,
  clearSelected: clearNotificationSelected,
  clearError: clearNotificationError,
} = slice.actions;

export const {
  fetchAll: fetchNotifications,
  fetchById: fetchNotificationById,
  createItem: createNotification,
  updateItem: updateNotification,
  removeItem: deleteNotification,
} = thunks;

export default slice.reducer;
