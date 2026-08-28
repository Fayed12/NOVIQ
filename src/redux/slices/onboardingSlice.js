import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { onboardingService } from "../../services/onboardingService";

const ONBOARDING_STORAGE_KEY = "noviq_onboarding_draft";

const defaultHours = [
    { day_of_week: 1, day_name: "Monday", open_time: "09:00", close_time: "18:00", is_closed: false },
    { day_of_week: 2, day_name: "Tuesday", open_time: "09:00", close_time: "18:00", is_closed: false },
    { day_of_week: 3, day_name: "Wednesday", open_time: "09:00", close_time: "18:00", is_closed: false },
    { day_of_week: 4, day_name: "Thursday", open_time: "09:00", close_time: "18:00", is_closed: false },
    { day_of_week: 5, day_name: "Friday", open_time: "09:00", close_time: "18:00", is_closed: false },
    { day_of_week: 6, day_name: "Saturday", open_time: "10:00", close_time: "16:00", is_closed: false },
    { day_of_week: 0, day_name: "Sunday", open_time: "09:00", close_time: "18:00", is_closed: true },
];

const loadSavedDraftLocal = () => {
    try {
        const saved = localStorage.getItem(ONBOARDING_STORAGE_KEY);
        return saved ? JSON.parse(saved) : null;
    } catch {
        return null;
    }
};

const localDraft = loadSavedDraftLocal();

const initialState = {
    currentStep: localDraft?.currentStep || 1,
    liveCategories: [],
    draftTenant: null,
    formData: {
        categoryId: localDraft?.formData?.categoryId || null,
        selectedCategory: localDraft?.formData?.selectedCategory || null,
        name: localDraft?.formData?.name || "",
        slug: localDraft?.formData?.slug || "",
        description: localDraft?.formData?.description || "",
        phone: localDraft?.formData?.phone || "",
        email: localDraft?.formData?.email || "",
        address: localDraft?.formData?.address || "",
        location: localDraft?.formData?.location || null,
        themeColor: localDraft?.formData?.themeColor || "#0E7C86",
        themePreset: localDraft?.formData?.themePreset || "Medical - Clean",
        themeConfig: localDraft?.formData?.themeConfig || {},
        modules: localDraft?.formData?.modules || {
            bookings: true,
            reviews: true,
            gallery: true,
            multi_branch: false,
            staff_management: true,
        },
        workingHours: localDraft?.formData?.workingHours || defaultHours,
        cancellationPolicy: localDraft?.formData?.cancellationPolicy || {
            name: "Standard Flexible (24h Free Cancellation)",
            rule: { refundable: true, free_cancellation_hours: 24, fee_percentage: 0 },
        },
        branches: localDraft?.formData?.branches || [],
        resources: [],
        services: [],
    },
    stepCompletion: localDraft?.stepCompletion || {
        1: false,
        2: false,
        3: false,
        4: false,
        5: false,
        6: false,
    },
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    publishedTenant: null,
};

// Async Thunks
export const fetchLiveCategoriesThunk = createAsyncThunk(
    "onboarding/fetchLiveCategories",
    async (_, { rejectWithValue }) => {
        try {
            const categories = await onboardingService.fetchLiveCategories();
            return categories;
        } catch (err) {
            return rejectWithValue(err.message || "Failed to load categories from database");
        }
    }
);

export const loadUserDraftTenantThunk = createAsyncThunk(
    "onboarding/loadUserDraftTenant",
    async (userId, { rejectWithValue }) => {
        try {
            const result = await onboardingService.getDraftTenantForUser(userId);
            return result;
        } catch (err) {
            return rejectWithValue(err.message || "Failed to restore draft tenant");
        }
    }
);

export const saveDraftStepThunk = createAsyncThunk(
    "onboarding/saveDraftStep",
    async ({ userId, stepData }, { getState, rejectWithValue }) => {
        try {
            const state = getState().onboarding;
            const existingId = state.draftTenant?.id;
            const updated = await onboardingService.saveDraftTenant(userId, stepData, existingId);
            return updated;
        } catch (err) {
            return rejectWithValue(err.message || "Failed to save draft progress");
        }
    }
);

export const saveScheduleAndPoliciesThunk = createAsyncThunk(
    "onboarding/saveScheduleAndPolicies",
    async ({ tenantId, workingHours, cancellationPolicy }, { rejectWithValue }) => {
        try {
            const [savedHours, savedPolicy] = await Promise.all([
                onboardingService.saveWorkingHours(tenantId, workingHours),
                onboardingService.saveCancellationPolicy(tenantId, cancellationPolicy),
            ]);
            return { savedHours, savedPolicy };
        } catch (err) {
            return rejectWithValue(err.message || "Failed to save operating schedule");
        }
    }
);

export const addStarterResourceThunk = createAsyncThunk(
    "onboarding/addStarterResource",
    async ({ tenantId, resourceData }, { rejectWithValue }) => {
        try {
            const res = await onboardingService.createStarterResource(tenantId, resourceData);
            return res;
        } catch (err) {
            return rejectWithValue(err.message || "Failed to create resource");
        }
    }
);

export const addStarterServiceThunk = createAsyncThunk(
    "onboarding/addStarterService",
    async ({ tenantId, serviceData }, { rejectWithValue }) => {
        try {
            const srv = await onboardingService.createStarterService(tenantId, serviceData);
            return srv;
        } catch (err) {
            return rejectWithValue(err.message || "Failed to create service");
        }
    }
);

export const saveBranchesThunk = createAsyncThunk(
    "onboarding/saveBranches",
    async ({ tenantId, branches }, { rejectWithValue }) => {
        try {
            const res = await onboardingService.saveBranches(tenantId, branches);
            return res;
        } catch (err) {
            return rejectWithValue(err.message || "Failed to save branches");
        }
    }
);

export const publishTenantThunk = createAsyncThunk(
    "onboarding/publishTenant",
    async ({ tenantId, userId }, { rejectWithValue }) => {
        try {
            const published = await onboardingService.publishTenant(tenantId, userId);
            return published;
        } catch (err) {
            return rejectWithValue(err.message || "Failed to publish business");
        }
    }
);

const onboardingSlice = createSlice({
    name: "onboarding",
    initialState,
    reducers: {
        setStep: (state, action) => {
            state.currentStep = action.payload;
            try {
                localStorage.setItem(
                    ONBOARDING_STORAGE_KEY,
                    JSON.stringify({
                        currentStep: state.currentStep,
                        formData: state.formData,
                        stepCompletion: state.stepCompletion,
                    })
                );
            } catch {
                // Ignore storage error
            }
        },
        updateFormData: (state, action) => {
            state.formData = { ...state.formData, ...action.payload };
            try {
                localStorage.setItem(
                    ONBOARDING_STORAGE_KEY,
                    JSON.stringify({
                        currentStep: state.currentStep,
                        formData: state.formData,
                        stepCompletion: state.stepCompletion,
                    })
                );
            } catch {
                // Ignore storage error
            }
        },
        setStepCompleted: (state, action) => {
            const { step, completed = true } = action.payload;
            state.stepCompletion[step] = completed;
            try {
                localStorage.setItem(
                    ONBOARDING_STORAGE_KEY,
                    JSON.stringify({
                        currentStep: state.currentStep,
                        formData: state.formData,
                        stepCompletion: state.stepCompletion,
                    })
                );
            } catch {
                // Ignore storage error
            }
        },
        clearOnboardingError: (state) => {
            state.error = null;
        },
        resetOnboarding: (state) => {
            localStorage.removeItem(ONBOARDING_STORAGE_KEY);
            return {
                ...initialState,
                currentStep: 1,
                liveCategories: state.liveCategories,
            };
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch live categories
            .addCase(fetchLiveCategoriesThunk.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchLiveCategoriesThunk.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.liveCategories = action.payload;
                // If user has a categoryId, auto-link selectedCategory
                if (state.formData.categoryId) {
                    const match = action.payload.find((c) => c.id === state.formData.categoryId);
                    if (match) state.formData.selectedCategory = match;
                }
            })
            .addCase(fetchLiveCategoriesThunk.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })

            // Load user draft tenant
            .addCase(loadUserDraftTenantThunk.fulfilled, (state, action) => {
                if (action.payload?.tenant) {
                    const t = action.payload.tenant;
                    state.draftTenant = t;
                    state.formData.categoryId = t.category_id || state.formData.categoryId;
                    state.formData.selectedCategory = t.categories || state.formData.selectedCategory;
                    state.formData.name = t.name || state.formData.name;
                    state.formData.slug = t.slug || state.formData.slug;
                    state.formData.description = t.description || state.formData.description;
                    state.formData.phone = t.phone || state.formData.phone;
                    state.formData.email = t.email || state.formData.email;
                    state.formData.address = t.address || state.formData.address;
                    state.formData.themeColor = t.theme_color || state.formData.themeColor;
                    state.formData.themeConfig = t.theme_config || state.formData.themeConfig;
                    if (t.config?.modules) {
                        state.formData.modules = { ...state.formData.modules, ...t.config.modules };
                    }
                    if (action.payload.resources?.length > 0) {
                        state.formData.resources = action.payload.resources;
                    }
                    if (action.payload.services?.length > 0) {
                        state.formData.services = action.payload.services;
                    }
                    if (action.payload.branches?.length > 0) {
                        state.formData.branches = action.payload.branches;
                    }
                }
            })

            // Save branches
            .addCase(saveBranchesThunk.fulfilled, (state, action) => {
                state.formData.branches = action.payload;
            })

            // Save draft step
            .addCase(saveDraftStepThunk.fulfilled, (state, action) => {
                state.draftTenant = action.payload;
            })

            // Add starter resource
            .addCase(addStarterResourceThunk.fulfilled, (state, action) => {
                state.formData.resources.push(action.payload);
            })

            // Add starter service
            .addCase(addStarterServiceThunk.fulfilled, (state, action) => {
                state.formData.services.push(action.payload);
            })

            // Publish tenant
            .addCase(publishTenantThunk.pending, (state) => {
                state.status = "loading";
            })
            .addCase(publishTenantThunk.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.publishedTenant = action.payload;
                localStorage.removeItem(ONBOARDING_STORAGE_KEY);
            })
            .addCase(publishTenantThunk.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            });
    },
});

export const {
    setStep,
    updateFormData,
    setStepCompleted,
    clearOnboardingError,
    resetOnboarding,
} = onboardingSlice.actions;

export default onboardingSlice.reducer;
