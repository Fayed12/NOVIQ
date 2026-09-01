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

const DEFAULT_FORM_DATA = {
    categoryId: null,
    selectedCategory: null,
    name: "",
    slug: "",
    description: "",
    phone: "",
    email: "",
    address: "",
    location: null,
    icon: "FiBriefcase",
    iconColor: "#0E7C86",
    logoUrl: "",
    coverUrl: "",
    themeColor: "#0E7C86",
    themePreset: "Medical - Clean",
    themeConfig: {},
    modules: {
        bookings: true,
        reviews: true,
        gallery: true,
        multi_branch: false,
        staff_management: true,
    },
    workingHours: defaultHours,
    cancellationPolicy: {
        name: "Standard Flexible (24h Free Cancellation)",
        rule: { refundable: true, free_cancellation_hours: 24, fee_percentage: 0 },
    },
    cancellationPolicyId: null,
    branches: [],
    resources: [],
    services: [],
};

const DEFAULT_STEP_COMPLETION = {
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
};

const initialState = {
    currentStep: localDraft?.currentStep || 1,
    liveCategories: [],
    draftTenant: null,
    formData: {
        ...DEFAULT_FORM_DATA,
        ...(localDraft?.formData || {}),
        modules: {
            ...DEFAULT_FORM_DATA.modules,
            ...(localDraft?.formData?.modules || {}),
        },
        workingHours: localDraft?.formData?.workingHours || defaultHours,
        cancellationPolicy: localDraft?.formData?.cancellationPolicy || DEFAULT_FORM_DATA.cancellationPolicy,
        branches: localDraft?.formData?.branches || [],
        resources: [],
        services: [],
    },
    stepCompletion: localDraft?.stepCompletion || { ...DEFAULT_STEP_COMPLETION },
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    publishedTenant: null,
    userOwnedTenants: [],
    usedCategories: [],
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

export const fetchUsedCategoriesThunk = createAsyncThunk(
    "onboarding/fetchUsedCategories",
    async (_, { rejectWithValue }) => {
        try {
            const tenants = await onboardingService.fetchUsedCategories();
            return tenants;
        } catch (err) {
            return rejectWithValue(err.message || "Failed to load used categories");
        }
    }
);

export const fetchUserOwnedTenantsThunk = createAsyncThunk(
    "onboarding/fetchUserOwnedTenants",
    async (userId, { rejectWithValue }) => {
        try {
            const tenants = await onboardingService.getUserOwnedTenants(userId);
            return tenants;
        } catch (err) {
            return rejectWithValue(err.message || "Failed to load user businesses");
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
            try {
                localStorage.removeItem(ONBOARDING_STORAGE_KEY);
            } catch {
                // Ignore storage error
            }
            state.currentStep = 1;
            state.draftTenant = null;
            state.publishedTenant = null;
            state.error = null;
            state.status = "idle";
            state.formData = {
                ...DEFAULT_FORM_DATA,
                workingHours: defaultHours.map((h) => ({ ...h })),
                cancellationPolicy: {
                    name: "Standard Flexible (24h Free Cancellation)",
                    rule: { refundable: true, free_cancellation_hours: 24, fee_percentage: 0 },
                },
                branches: [],
                resources: [],
                services: [],
            };
            state.stepCompletion = { ...DEFAULT_STEP_COMPLETION };
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
            // Fetch user owned tenants
            .addCase(fetchUserOwnedTenantsThunk.fulfilled, (state, action) => {
                state.userOwnedTenants = action.payload || [];
            })

            // Fetch used categories across platform
            .addCase(fetchUsedCategoriesThunk.fulfilled, (state, action) => {
                state.usedCategories = action.payload || [];
            })

            // Load user draft tenant
            .addCase(loadUserDraftTenantThunk.fulfilled, (state, action) => {
                const t = action.payload?.tenant || (action.payload?.id ? action.payload : null);
                if (t) {
                    state.draftTenant = t;
                    state.formData.categoryId = t.category_id || state.formData.categoryId;
                    state.formData.selectedCategory = t.categories || state.formData.selectedCategory;
                    state.formData.name = t.name || state.formData.name;
                    state.formData.slug = t.slug || state.formData.slug;
                    state.formData.description = t.description || state.formData.description;
                    state.formData.phone = t.phone || state.formData.phone;
                    state.formData.email = t.email || state.formData.email;
                    state.formData.address = t.address || state.formData.address;
                    state.formData.location = t.location || state.formData.location;
                    state.formData.icon = t.icon || state.formData.icon;
                    state.formData.iconColor = t.icon_color || state.formData.iconColor;
                    state.formData.logoUrl = t.logo_url || state.formData.logoUrl;
                    state.formData.coverUrl = t.cover_url || state.formData.coverUrl;
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
                    if (action.payload.cancellation_policy) {
                        state.formData.cancellationPolicy = action.payload.cancellation_policy;
                        state.formData.cancellationPolicyId = action.payload.cancellation_policy.id;
                    }
                } else {
                    // No draft tenant exists in Supabase for user
                    // Clear stale draftTenant or publishedTenant so user starts fresh
                    if (state.draftTenant?.status === "published" || state.publishedTenant) {
                        state.draftTenant = null;
                        state.publishedTenant = null;
                    }
                }
            })

            // Save schedule & policy
            .addCase(saveScheduleAndPoliciesThunk.fulfilled, (state, action) => {
                if (action.payload?.savedPolicy) {
                    const policy = action.payload.savedPolicy;
                    state.formData.cancellationPolicy = policy;
                    state.formData.cancellationPolicyId = policy.id;

                    // Automatically propagate the updated policy ID to all configured services
                    if (state.formData.services?.length > 0) {
                        state.formData.services = state.formData.services.map((srv) => ({
                            ...srv,
                            cancellation_policy_id: policy.id,
                            cancellationPolicyId: policy.id,
                        }));
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

            // Add/update starter service
            .addCase(addStarterServiceThunk.fulfilled, (state, action) => {
                if (action.payload) {
                    const existingIndex = state.formData.services.findIndex(
                        (s) => s.id === action.payload.id
                    );
                    if (existingIndex >= 0) {
                        state.formData.services[existingIndex] = action.payload;
                    } else {
                        state.formData.services.push(action.payload);
                    }
                }
            })

            // Publish tenant
            .addCase(publishTenantThunk.pending, (state) => {
                state.status = "loading";
            })
            .addCase(publishTenantThunk.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.publishedTenant = action.payload;
                state.draftTenant = null;
                try {
                    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
                } catch {
                    // Ignore storage error
                }
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
