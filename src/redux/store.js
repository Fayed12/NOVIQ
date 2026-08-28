import { configureStore } from '@reduxjs/toolkit';
import { apiNotifyMiddleware } from './middleware/apiNotifyMiddleware';

import themeReducer from './themeSlice';
import authReducer from './slices/authSlice';
import inviteReducer from './slices/inviteSlice';
import profileReducer from './slices/profileSlice';
import categoryReducer from './slices/categorySlice';
import tenantReducer from './slices/tenantSlice';
import membershipReducer from './slices/membershipSlice';
import mySpacesReducer from './slices/mySpacesSlice';
import branchReducer from './slices/branchSlice';
import resourceTypeReducer from './slices/resourceTypeSlice';
import resourceReducer from './slices/resourceSlice';
import cancellationPolicyReducer from './slices/cancellationPolicySlice';
import servicesReducer from './slices/servicesSlice';
import workingHoursReducer from './slices/workingHoursSlice';
import bookingReducer from './slices/bookingSlice';
import bookingItemReducer from './slices/bookingItemSlice';
import customFieldDefinitionReducer from './slices/customFieldDefinitionSlice';
import customFieldValueReducer from './slices/customFieldValueSlice';
import reviewReducer from './slices/reviewSlice';
import notificationReducer from './slices/notificationSlice';
import onboardingReducer from './slices/onboardingSlice';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    auth: authReducer,
    invites: inviteReducer,
    profiles: profileReducer,
    categories: categoryReducer,
    tenants: tenantReducer,
    memberships: membershipReducer,
    mySpaces: mySpacesReducer,
    branches: branchReducer,
    resourceTypes: resourceTypeReducer,
    resources: resourceReducer,
    cancellationPolicies: cancellationPolicyReducer,
    services: servicesReducer,
    workingHours: workingHoursReducer,
    bookings: bookingReducer,
    bookingItems: bookingItemReducer,
    customFieldDefinitions: customFieldDefinitionReducer,
    customFieldValues: customFieldValueReducer,
    reviews: reviewReducer,
    notifications: notificationReducer,
    onboarding: onboardingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(apiNotifyMiddleware.middleware),
});

export default store;
