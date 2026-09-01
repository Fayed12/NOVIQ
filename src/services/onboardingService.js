import { supabase } from "./lib/supabaseClient";
import { serviceBranchService } from "./serviceBranchService";

/**
 * Reserved system route keywords that businesses may NOT claim as URL slugs.
 * Prevents route hijacking, phishing, and subpath collision.
 */
export const RESERVED_SLUGS = new Set([
    "admin",
    "platform",
    "login",
    "register",
    "onboarding",
    "account",
    "explore",
    "welcome",
    "privacy",
    "terms",
    "offline",
    "api",
    "auth",
    "dashboard",
    "booking",
    "bookings",
    "services",
    "branches",
    "static",
    "assets",
    "public",
    "403",
    "404",
    "help",
    "support",
    "noviq",
    "verify-email",
    "forgot-password",
    "reset-password",
    "accept-invite",
]);

/**
 * Onboarding Data Service
 * Interacts with Supabase tables: categories, tenants, working_hours, cancellation_policies, branches, services, resources, tenant_memberships
 */
export const onboardingService = {
    /**
     * Fetch all active business categories from Supabase
     */
    async getCategories() {
        const { data, error } = await supabase
            .from("categories")
            .select("*")
            .order("created_at", { ascending: true });

        if (error) throw error;
        return data || [];
    },

    // Alias for getCategories
    async fetchLiveCategories() {
        return this.getCategories();
    },

    /**
     * Load existing draft tenant for the authenticated user (status = 'draft')
     */
    async getDraftTenantForUser(userId) {
        if (!userId) return null;

        const { data: tenant, error } = await supabase
            .from("tenants")
            .select("*, categories(*)")
            .eq("owner_id", userId)
            .eq("status", "draft")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error || !tenant) return null;

        // Fetch related entities in parallel with individual error protection
        const [branchesRes, hoursRes, servicesRes, resourcesRes, policyRes] = await Promise.all([
            supabase.from("branches").select("*").eq("tenant_id", tenant.id).then(r => r.data || []).catch(() => []),
            supabase.from("working_hours").select("*").eq("entity_type", "tenant").eq("entity_id", tenant.id).then(r => r.data || []).catch(() => []),
            supabase.from("services").select("*").eq("tenant_id", tenant.id).then(r => r.data || []).catch(() => []),
            supabase.from("resources").select("*, resource_types(*)").eq("tenant_id", tenant.id).then(r => r.data || []).catch(() => []),
            supabase.from("cancellation_policies").select("*").eq("tenant_id", tenant.id).maybeSingle().then(r => r.data || null).catch(() => null),
        ]);

        return {
            tenant: tenant,
            branches: branchesRes || [],
            working_hours: hoursRes || [],
            services: servicesRes || [],
            resources: resourcesRes || [],
            cancellation_policy: policyRes || null,
        };
    },

    /**
     * Fetch active businesses owned by the user (to enforce one business per category)
     */
    async getUserOwnedTenants(userId) {
        try {
            if (!userId) {
                const { data } = await supabase.auth.getUser();
                userId = data?.user?.id;
            }

            let query = supabase
                .from("tenants")
                .select("id, name, slug, category_id, status, owner_id, categories(id, name, slug)")
                .neq("status", "deleted");

            if (userId) {
                query = query.eq("owner_id", userId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        } catch (err) {
            console.warn("Failed to fetch user owned tenants:", err);
            return [];
        }
    },

    /**
     * Fetch all active registered businesses to check which categories are used
     */
    async fetchUsedCategories() {
        try {
            const { data, error } = await supabase
                .from("tenants")
                .select("id, name, slug, category_id, status, owner_id, categories(id, name, slug)")
                .neq("status", "deleted");

            if (error) throw error;
            return data || [];
        } catch (err) {
            console.warn("Failed to fetch used categories:", err);
            return [];
        }
    },

    /**
     * Create or update draft tenant step data in Supabase
     */
    async upsertDraftTenant(userId, stepData) {
        if (!userId) throw new Error("User ID is required");

        // 1. Enforce strict single-business-per-category rule for owners
        const categoryId = stepData.categoryId || stepData.category_id;
        if (categoryId) {
            const { data: existingOwned } = await supabase
                .from("tenants")
                .select("id, name, status, categories(name)")
                .eq("owner_id", userId)
                .eq("category_id", categoryId)
                .neq("status", "deleted")
                .neq("status", "draft")
                .maybeSingle();

            if (existingOwned) {
                const catName = existingOwned.categories?.name || "this";
                throw new Error(
                    `You already own an active business (${existingOwned.name}) in the ${catName} category. Owners are permitted one business per category.`
                );
            }
        }

        // 2. Check if user already has an active draft tenant
        const { data: existingDraft } = await supabase
            .from("tenants")
            .select("id")
            .eq("owner_id", userId)
            .eq("status", "draft")
            .maybeSingle();

        // Format location safely for PostGIS geography(Point, 4326)
        let locationGeom = null;
        if (stepData.location) {
            if (typeof stepData.location === "string" && stepData.location.startsWith("POINT")) {
                locationGeom = stepData.location;
            } else {
                const lat = stepData.location.lat ?? stepData.lat;
                const lng = stepData.location.lng ?? stepData.lng;
                if (lat != null && lng != null && !isNaN(Number(lat)) && !isNaN(Number(lng))) {
                    locationGeom = `POINT(${Number(lng)} ${Number(lat)})`;
                }
            }
        }

        // 3. Security: Whitelist allowed fields to completely prevent Mass Assignment
        const allowedFields = [
            "category_id",
            "name",
            "slug",
            "description",
            "phone",
            "email",
            "address",
            "icon",
            "icon_color",
            "theme_color",
            "theme_config",
            "config",
            "logo_url",
            "cover_url",
        ];

        const sanitizedStepData = {
            location: locationGeom,
        };

        for (const key of allowedFields) {
            if (stepData[key] !== undefined) {
                sanitizedStepData[key] = stepData[key];
            }
        }

        if (stepData.categoryId && !sanitizedStepData.category_id) {
            sanitizedStepData.category_id = stepData.categoryId;
        }

        // Security: Validate URL slug if present against reserved keywords and path traversal
        if (sanitizedStepData.slug) {
            const normalizedSlug = String(sanitizedStepData.slug).trim().toLowerCase();
            if (RESERVED_SLUGS.has(normalizedSlug)) {
                throw new Error(`The URL slug "${normalizedSlug}" is a reserved system keyword. Please choose another.`);
            }
            const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
            if (!slugRegex.test(normalizedSlug) || normalizedSlug.length < 2 || normalizedSlug.length > 50) {
                throw new Error("Invalid URL slug format. Use 2-50 lowercase alphanumeric characters and single hyphens.");
            }
            sanitizedStepData.slug = normalizedSlug;
        }

        // Text bounds enforcement
        if (sanitizedStepData.name) {
            sanitizedStepData.name = String(sanitizedStepData.name).trim().substring(0, 100);
        }
        if (sanitizedStepData.description) {
            sanitizedStepData.description = String(sanitizedStepData.description).trim().substring(0, 1000);
        }
        if (sanitizedStepData.phone) {
            sanitizedStepData.phone = String(sanitizedStepData.phone).trim().substring(0, 30);
        }
        if (sanitizedStepData.email) {
            sanitizedStepData.email = String(sanitizedStepData.email).trim().substring(0, 100);
        }
        if (sanitizedStepData.address) {
            sanitizedStepData.address = String(sanitizedStepData.address).trim().substring(0, 255);
        }

        // Security: Enforce immutable status and ownership
        sanitizedStepData.owner_id = userId;
        sanitizedStepData.status = "draft";

        if (existingDraft) {
            // Update existing draft
            const { data, error } = await supabase
                .from("tenants")
                .update({
                    ...sanitizedStepData,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", existingDraft.id)
                .select("*, categories(*)")
                .single();

            if (error) throw error;
            return data;
        } else {
            // Insert new draft tenant
            const { data, error } = await supabase
                .from("tenants")
                .insert(sanitizedStepData)
                .select("*, categories(*)")
                .single();

            if (error) throw error;
            return data;
        }
    },

    // Alias for upsertDraftTenant
    async saveDraftTenant(userId, stepData) {
        return this.upsertDraftTenant(userId, stepData);
    },

    /**
     * Check if a business slug is already taken (with reserved keywords and regex validation)
     */
    async checkSlugAvailability(slug, currentTenantId = null) {
        if (!slug || typeof slug !== "string") return false;
        const normalized = slug.trim().toLowerCase();

        // 1. Reserved system route keywords defense
        if (RESERVED_SLUGS.has(normalized)) {
            return false;
        }

        // 2. Strict slug pattern regex (no path traversal, no script tags, no special chars)
        const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
        if (!slugRegex.test(normalized) || normalized.length < 2 || normalized.length > 50) {
            return false;
        }

        let query = supabase
            .from("tenants")
            .select("id")
            .eq("slug", normalized);

        if (currentTenantId) {
            query = query.neq("id", currentTenantId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return !data || data.length === 0;
    },

    /**
     * Save weekly working hours and cancellation policy to Supabase
     */
    async saveScheduleAndPolicy(tenantId, workingHoursList = [], cancellationPolicy = null) {
        if (!tenantId) throw new Error("Tenant ID is required");

        // 1. Upsert Working Hours (7 days)
        if (workingHoursList.length > 0) {
            const formattedHours = workingHoursList.map((wh) => ({
                entity_type: "tenant",
                entity_id: tenantId,
                day_of_week: wh.day_of_week,
                open_time: wh.is_closed ? null : wh.open_time || "09:00",
                close_time: wh.is_closed ? null : wh.close_time || "18:00",
                is_closed: !!wh.is_closed,
            }));

            // Delete old hours for this tenant and re-insert
            await supabase
                .from("working_hours")
                .delete()
                .eq("entity_type", "tenant")
                .eq("entity_id", tenantId);

            const { error: whErr } = await supabase
                .from("working_hours")
                .insert(formattedHours);

            if (whErr) throw whErr;
        }

        // 2. Save cancellation policy strictly as single policy per tenant
        let savedPolicy = null;
        if (cancellationPolicy) {
            const policyPayload = {
                name: cancellationPolicy.name || cancellationPolicy.title || "Default Cancellation Policy",
                rule: cancellationPolicy.rule || {
                    refundable: cancellationPolicy.refundable ?? true,
                    free_cancellation_hours: cancellationPolicy.free_cancellation_hours ?? 24,
                    fee_percentage: cancellationPolicy.fee_percentage ?? 0,
                },
            };

            const { data: existingPolicy } = await supabase
                .from("cancellation_policies")
                .select("id")
                .eq("tenant_id", tenantId)
                .maybeSingle();

            if (existingPolicy) {
                // Update single existing policy in-place to preserve FK relations
                const { data, error: cpErr } = await supabase
                    .from("cancellation_policies")
                    .update({
                        ...policyPayload,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", existingPolicy.id)
                    .select("*")
                    .single();

                if (cpErr) throw cpErr;
                savedPolicy = data;
            } else {
                // Insert initial policy
                const { data, error: cpErr } = await supabase
                    .from("cancellation_policies")
                    .insert({
                        tenant_id: tenantId,
                        ...policyPayload,
                    })
                    .select("*")
                    .single();

                if (cpErr) throw cpErr;
                savedPolicy = data;
            }

            // Propagate & synchronize active policy ID to all existing tenant services in Supabase
            if (savedPolicy?.id) {
                try {
                    await supabase
                        .from("services")
                        .update({ cancellation_policy_id: savedPolicy.id })
                        .eq("tenant_id", tenantId);
                } catch (syncErr) {
                    console.warn("Non-blocking services policy sync warning:", syncErr);
                }
            }
        }

        return { success: true, savedPolicy };
    },

    // Aliases for granular saves
    async saveWorkingHours(tenantId, workingHoursList) {
        return this.saveScheduleAndPolicy(tenantId, workingHoursList, null);
    },

    async saveCancellationPolicy(tenantId, cancellationPolicy) {
        return this.saveScheduleAndPolicy(tenantId, [], cancellationPolicy);
    },

    /**
     * Safely remove cancellation policy for tenant without breaking foreign keys
     */
    async removeCancellationPolicy(tenantId) {
        if (!tenantId) throw new Error("Tenant ID is required");

        // 1. Detach policy reference from all tenant services first to prevent foreign key errors
        await supabase
            .from("services")
            .update({ cancellation_policy_id: null })
            .eq("tenant_id", tenantId);

        // 2. Delete the policy record
        const { error } = await supabase
            .from("cancellation_policies")
            .delete()
            .eq("tenant_id", tenantId);

        if (error) throw error;
        return { success: true };
    },

    /**
     * Create starter resource and default resource_type
     */
    async addStarterResource(tenantId, { name, typeName = "Specialist", capacity = 1 }) {
        if (!tenantId) throw new Error("Tenant ID is required");

        // 1. Find or create resource_type
        let resourceTypeId;
        const { data: existingType } = await supabase
            .from("resource_types")
            .select("id")
            .eq("tenant_id", tenantId)
            .eq("name", typeName)
            .maybeSingle();

        if (existingType) {
            resourceTypeId = existingType.id;
        } else {
            const { data: newType, error: typeErr } = await supabase
                .from("resource_types")
                .insert({
                    tenant_id: tenantId,
                    name: typeName,
                    availability_strategy: "sequential",
                    is_bookable: true,
                })
                .select("id")
                .single();

            if (typeErr) throw typeErr;
            resourceTypeId = newType.id;
        }

        // 2. Create resource
        const { data: resource, error: resErr } = await supabase
            .from("resources")
            .insert({
                tenant_id: tenantId,
                type_id: resourceTypeId,
                name: name || "Main Specialist / Room",
                capacity: capacity || 1,
                is_active: true,
                metadata: {},
            })
            .select("*, resource_types(*)")
            .single();

        if (resErr) throw resErr;
        return resource;
    },

    // Alias
    async createStarterResource(tenantId, resourceData) {
        return this.addStarterResource(tenantId, resourceData);
    },

    /**
     * Create or update service with duplicate name validation and full metadata
     */
    async saveService(tenantId, serviceData) {
        if (!tenantId) throw new Error("Tenant ID is required");
        const trimmedName = (serviceData.name || "").trim();
        if (!trimmedName) throw new Error("Service name is required");

        // Case-insensitive duplicate name check in Supabase
        let query = supabase
            .from("services")
            .select("id, name")
            .eq("tenant_id", tenantId)
            .ilike("name", trimmedName);

        if (serviceData.id && !String(serviceData.id).startsWith("srv-")) {
            query = query.neq("id", serviceData.id);
        }

        const { data: existingDupes } = await query;
        if (existingDupes && existingDupes.length > 0) {
            throw new Error(`A service with the name "${trimmedName}" already exists for this business.`);
        }

        // Auto-resolve cancellation policy ID for tenant if not explicitly provided
        let policyId = serviceData.cancellationPolicyId || serviceData.cancellation_policy_id || null;
        if (!policyId) {
            const { data: tenantPolicy } = await supabase
                .from("cancellation_policies")
                .select("id")
                .eq("tenant_id", tenantId)
                .maybeSingle();
            if (tenantPolicy?.id) {
                policyId = tenantPolicy.id;
            }
        }

        // Fetch tenant brand details to provide intelligent fallbacks for icon, theme, and description
        const { data: tenantRow } = await supabase
            .from("tenants")
            .select("name, icon, icon_color, theme_color, logo_url, cover_url")
            .eq("id", tenantId)
            .maybeSingle();

        const payload = {
            tenant_id: tenantId,
            name: trimmedName,
            description: serviceData.description
                ? String(serviceData.description).trim()
                : `Professional ${trimmedName} offered by ${tenantRow?.name || "our team"}.`,
            duration_minutes: serviceData.durationMinutes || serviceData.duration_minutes || 30,
            price: serviceData.price !== undefined ? parseFloat(serviceData.price) : 0,
            currency: serviceData.currency || "EGP",
            cancellation_policy_id: policyId,
            icon: serviceData.icon || tenantRow?.icon || "FiActivity",
            icon_color: serviceData.iconColor || serviceData.icon_color || tenantRow?.icon_color || "#0E7C86",
            theme_color: serviceData.themeColor || serviceData.theme_color || tenantRow?.theme_color || "#0E7C86",
            image_url: serviceData.imageUrl || serviceData.image_url || tenantRow?.logo_url || tenantRow?.cover_url || null,
            is_active: true,
        };

        let savedService;
        if (serviceData.id && !String(serviceData.id).startsWith("srv-")) {
            const { data, error } = await supabase
                .from("services")
                .update({ ...payload, updated_at: new Date().toISOString() })
                .eq("id", serviceData.id)
                .select("*")
                .single();

            if (error) throw error;
            savedService = data;
        } else {
            const { data, error } = await supabase
                .from("services")
                .insert(payload)
                .select("*")
                .single();

            if (error) throw error;
            savedService = data;
        }

        // Automatically connect this service with ALL operating branches of this tenant
        if (savedService?.id) {
            await serviceBranchService.linkServiceToAllBranches(savedService.id, tenantId);
        }

        return savedService;
    },

    // Alias for compatibility
    async createStarterService(tenantId, serviceData) {
        return this.saveService(tenantId, serviceData);
    },

    /**
     * Save physical branches list to Supabase with location and styling
     */
    async saveBranches(tenantId, branchList) {
        if (!tenantId || !Array.isArray(branchList)) return [];

        // Delete existing non-archived branches to avoid duplicates during onboarding
        await supabase
            .from("branches")
            .delete()
            .eq("tenant_id", tenantId);

        // Fetch tenant fallback styling to prevent empty icons or colors
        const { data: tenantBrand } = await supabase
            .from("tenants")
            .select("icon, icon_color, theme_color, phone, address, location")
            .eq("id", tenantId)
            .maybeSingle();

        const rowsToInsert = branchList.map((b) => {
            // PostGIS geometry column expects POINT(longitude latitude) or null
            let geomPoint = null;
            const lat = b.location?.lat ?? b.lat ?? b.cityData?.lat;
            const lng = b.location?.lng ?? b.lng ?? b.cityData?.lng;
            if (lat != null && lng != null && !isNaN(Number(lat)) && !isNaN(Number(lng))) {
                geomPoint = `POINT(${Number(lng)} ${Number(lat)})`;
            } else if (typeof b.location === "string" && b.location.startsWith("POINT")) {
                geomPoint = b.location;
            } else if (b.is_main && tenantBrand?.location) {
                geomPoint = tenantBrand.location;
            }

            return {
                tenant_id: tenantId,
                name: b.name,
                address: b.address || tenantBrand?.address || null,
                phone: b.phone || tenantBrand?.phone || null,
                location: geomPoint,
                icon: b.icon || tenantBrand?.icon || "FiHome",
                icon_color: b.icon_color || b.iconColor || tenantBrand?.icon_color || "#0E7C86",
                theme_color: b.theme_color || b.themeColor || tenantBrand?.theme_color || "#0E7C86",
                is_main: !!b.is_main,
            };
        });

        const { data, error } = await supabase
            .from("branches")
            .insert(rowsToInsert)
            .select("*");

        if (error) throw error;

        // Auto-connect all branches with all services for this tenant
        await serviceBranchService.syncAllServicesAndBranches(tenantId);

        return data || [];
    },

    /**
     * Publish Tenant (Validates required elements and activates tenant strictly for owner)
     * Assigns user role as owner/admin in tenant_memberships and auth metadata.
     */
    async publishTenant(tenantId, userId) {
        if (!tenantId) throw new Error("Tenant ID is required to publish");
        if (!userId) throw new Error("User ID is required to publish");

        // Security check: verify user does not already own an active published business in this category
        const { data: currentTenant } = await supabase
            .from("tenants")
            .select("id, category_id, categories(name)")
            .eq("id", tenantId)
            .single();

        if (currentTenant?.category_id) {
            const { data: existingActive } = await supabase
                .from("tenants")
                .select("id, name, categories(name)")
                .eq("owner_id", userId)
                .eq("category_id", currentTenant.category_id)
                .eq("status", "published")
                .neq("id", tenantId)
                .maybeSingle();

            if (existingActive) {
                const catName = existingActive.categories?.name || "this";
                throw new Error(
                    `Publish denied: You already operate an active business ("${existingActive.name}") in the ${catName} category. Platform rules restrict owners to one active business per category.`
                );
            }
        }

        // Guarantee all services and branches are fully linked tenant-wide
        await serviceBranchService.syncAllServicesAndBranches(tenantId);

        // Verify services count
        const srvCheck = await supabase
            .from("services")
            .select("id", { count: "exact" })
            .eq("tenant_id", tenantId);

        const serviceCount = srvCheck.count || 0;

        if (serviceCount === 0) {
            throw new Error("Cannot publish: Business must have at least 1 active service.");
        }

        // Ensure default cancellation policy exists
        const { data: existingPolicy } = await supabase
            .from("cancellation_policies")
            .select("id")
            .eq("tenant_id", tenantId)
            .maybeSingle();

        let policyId = existingPolicy?.id;
        if (!policyId) {
            try {
                const { data: newPolicy } = await supabase
                    .from("cancellation_policies")
                    .insert({
                        tenant_id: tenantId,
                        name: "Standard Flexible (24h Free Cancellation)",
                        rule: { refundable: true, free_cancellation_hours: 24, fee_percentage: 0 },
                    })
                    .select("id")
                    .single();
                if (newPolicy) policyId = newPolicy.id;
            } catch (policyErr) {
                console.warn("Auto-seeding policy non-blocking warning:", policyErr);
            }
        }

        // Auto-seed default specialist resource if none exists so data integrity is preserved
        const resCheck = await supabase
            .from("resources")
            .select("id", { count: "exact" })
            .eq("tenant_id", tenantId);

        if (!resCheck.count || resCheck.count === 0) {
            try {
                await this.addStarterResource(tenantId, {
                    name: "Lead Practitioner / Team",
                    typeName: "Specialist",
                    capacity: 1,
                });
            } catch (seedErr) {
                console.warn("Auto-seeding default resource non-blocking warning:", seedErr);
            }
        }

        let updateQuery = supabase
            .from("tenants")
            .update({ status: "published" })
            .eq("id", tenantId)
            .eq("owner_id", userId);

        const { data, error } = await updateQuery
            .select("*, categories(*)")
            .single();

        if (error) throw error;

        // Guarantee all services are linked to the tenant's active cancellation policy
        const { data: tenantPolicy } = await supabase
            .from("cancellation_policies")
            .select("id")
            .eq("tenant_id", tenantId)
            .maybeSingle();

        if (tenantPolicy?.id) {
            await supabase
                .from("services")
                .update({ cancellation_policy_id: tenantPolicy.id })
                .eq("tenant_id", tenantId)
                .is("cancellation_policy_id", null);
        }

        // Register user as tenant owner & admin in tenant_memberships and auth user metadata
        if (userId && data?.id) {
            try {
                // 1. Upsert membership into tenant_memberships
                await supabase.from("tenant_memberships").upsert(
                    {
                        tenant_id: data.id,
                        user_id: userId,
                        role: "owner",
                    },
                    { onConflict: "tenant_id, user_id" }
                );

                // 2. Update user metadata for instant client-side role recognition & dashboard routing
                await supabase.auth.updateUser({
                    data: {
                        role: "owner",
                        tenant_id: data.id,
                        tenant_slug: data.slug,
                    },
                });

                // 3. Update profiles table: update last_login and updated_at
                await supabase
                    .from("profiles")
                    .update({
                        last_login: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", userId);
            } catch (memberErr) {
                console.warn("Non-blocking membership/profile sync warning:", memberErr);
            }
        }

        return data;
    },
};
