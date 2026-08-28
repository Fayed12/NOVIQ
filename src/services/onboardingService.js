import { supabase } from "./lib/supabaseClient";

/**
 * Service for Section 4 Onboarding Wizard (Become a Business Owner)
 * Interacts with live Supabase database for categories, draft tenants,
 * memberships, working hours, cancellation policies, starter resources, and services.
 */
export const onboardingService = {
    /**
     * Fetch all categories directly from the live Supabase database
     */
    async fetchLiveCategories() {
        const { data, error } = await supabase
            .from("categories")
            .select("id, name, slug, icon, icon_color, theme_color, available_themes, created_at, updated_at")
            .order("name", { ascending: true });

        if (error) throw error;
        return data || [];
    },

    /**
     * Look up an existing draft tenant owned by the user
     */
    async getDraftTenantForUser(userId) {
        if (!userId) return null;

        // Fetch draft tenant
        const { data: tenant, error: tenantError } = await supabase
            .from("tenants")
            .select("*, categories(*)")
            .eq("owner_id", userId)
            .eq("status", "draft")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (tenantError) throw tenantError;
        if (!tenant) return null;

        // Fetch associated working hours, policies, resources, services, branches
        const [hoursRes, policiesRes, resourcesRes, servicesRes, branchesRes] = await Promise.all([
            supabase
                .from("working_hours")
                .select("*")
                .eq("entity_type", "tenant")
                .eq("entity_id", tenant.id)
                .order("day_of_week", { ascending: true }),
            supabase
                .from("cancellation_policies")
                .select("*")
                .eq("tenant_id", tenant.id),
            supabase
                .from("resources")
                .select("*, resource_types(*)")
                .eq("tenant_id", tenant.id),
            supabase
                .from("services")
                .select("*")
                .eq("tenant_id", tenant.id),
            supabase
                .from("branches")
                .select("*")
                .eq("tenant_id", tenant.id)
                .is("deleted_at", null)
                .order("is_main", { ascending: false }),
        ]);

        return {
            tenant,
            workingHours: hoursRes.data || [],
            cancellationPolicies: policiesRes.data || [],
            resources: resourcesRes.data || [],
            services: servicesRes.data || [],
            branches: branchesRes.data || [],
        };
    },

    /**
     * Resolve a guaranteed unique slug across all tenants
     */
    async resolveUniqueSlug(desiredSlug, currentTenantId = null) {
        if (!desiredSlug) return `business-${Date.now()}`;

        let candidate = desiredSlug
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");

        let suffix = 1;
        let isUnique = false;

        while (!isUnique) {
            let query = supabase
                .from("tenants")
                .select("id")
                .eq("slug", candidate);

            if (currentTenantId) {
                query = query.neq("id", currentTenantId);
            }

            const { data, error } = await query.maybeSingle();
            if (error) {
                console.warn("Slug check query warning:", error.message);
                break;
            }

            if (!data) {
                isUnique = true;
            } else {
                suffix += 1;
                candidate = `${desiredSlug}-${suffix}`;
            }
        }

        return candidate;
    },

    /**
     * Upsert a draft tenant with strict owner scoping (1 admin per business draft)
     */
    async saveDraftTenant(userId, payload, existingTenantId = null) {
        if (!userId) throw new Error("User ID is required to create or save a business draft");

        // 1. Resolve unique slug without conflicting with other tenants
        const safeSlug = await this.resolveUniqueSlug(
            payload.slug || payload.name || "business",
            existingTenantId
        );

        const tenantData = {
            owner_id: userId,
            category_id: payload.category_id || null,
            name: payload.name || "My Business",
            slug: safeSlug,
            description: payload.description || null,
            phone: payload.phone || null,
            email: payload.email || null,
            address: payload.address || null,
            theme_color: payload.theme_color || "#0E7C86",
            theme_config: payload.theme_config || {},
            config: payload.config || {
                modules: {
                    bookings: true,
                    reviews: true,
                    gallery: true,
                    multi_branch: false,
                    staff_management: true,
                },
            },
            status: "draft",
        };

        let savedTenant = null;

        // 2. Check if specific tenant ID or user already has an existing draft
        let targetId = existingTenantId;
        if (!targetId) {
            const { data: existingDraft } = await supabase
                .from("tenants")
                .select("id")
                .eq("owner_id", userId)
                .eq("status", "draft")
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();

            if (existingDraft?.id) {
                targetId = existingDraft.id;
            }
        }

        if (targetId) {
            // Strictly scoped update: only updates if tenant belongs to this userId
            const { data, error } = await supabase
                .from("tenants")
                .update(tenantData)
                .eq("id", targetId)
                .eq("owner_id", userId)
                .select("*, categories(*)")
                .single();

            if (error) throw error;
            savedTenant = data;
        } else {
            // Strictly scoped insert for this owner
            const { data, error } = await supabase
                .from("tenants")
                .insert(tenantData)
                .select("*, categories(*)")
                .single();

            if (error) throw error;
            savedTenant = data;
        }

        // 3. Ensure strictly isolated owner membership in tenant_memberships
        if (savedTenant?.id) {
            const { error: memberError } = await supabase
                .from("tenant_memberships")
                .upsert(
                    {
                        user_id: userId,
                        tenant_id: savedTenant.id,
                        role: "owner",
                        permissions: { all: true },
                    },
                    { onConflict: "user_id,tenant_id" }
                );

            if (memberError) {
                console.warn("Could not upsert tenant_memberships:", memberError.message);
            }
        }

        return savedTenant;
    },

    /**
     * Save 7-day operational working hours
     */
    async saveWorkingHours(tenantId, scheduleList) {
        if (!tenantId || !Array.isArray(scheduleList)) return [];

        // Delete existing tenant hours first to ensure clean state
        await supabase
            .from("working_hours")
            .delete()
            .eq("entity_type", "tenant")
            .eq("entity_id", tenantId);

        const rowsToInsert = scheduleList.map((item) => ({
            entity_type: "tenant",
            entity_id: tenantId,
            day_of_week: item.day_of_week,
            open_time: item.is_closed ? null : item.open_time,
            close_time: item.is_closed ? null : item.close_time,
            is_closed: !!item.is_closed,
        }));

        const { data, error } = await supabase
            .from("working_hours")
            .insert(rowsToInsert)
            .select("*");

        if (error) throw error;
        return data || [];
    },

    /**
     * Save default cancellation policy
     */
    async saveCancellationPolicy(tenantId, policy) {
        if (!tenantId) return null;

        const payload = {
            tenant_id: tenantId,
            name: policy.name || "Standard Flexible Policy",
            rule: policy.rule || {
                refundable: true,
                free_cancellation_hours: 24,
                fee_percentage: 0,
            },
        };

        const { data, error } = await supabase
            .from("cancellation_policies")
            .insert(payload)
            .select("*")
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Create starter resource type + resource
     */
    async createStarterResource(tenantId, { name, typeName = "General Specialist", capacity = 1 }) {
        if (!tenantId) throw new Error("Tenant ID is required");

        // 1. Get or create resource type
        let resourceTypeId = null;
        const { data: existingType } = await supabase
            .from("resource_types")
            .select("id")
            .eq("tenant_id", tenantId)
            .limit(1)
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

    /**
     * Create starter service
     */
    async createStarterService(tenantId, { name, durationMinutes = 30, price = 50, currency = "USD" }) {
        if (!tenantId) throw new Error("Tenant ID is required");

        const { data: service, error } = await supabase
            .from("services")
            .insert({
                tenant_id: tenantId,
                name: name || "Standard Service Consultation",
                duration_minutes: durationMinutes,
                price: price,
                currency: currency,
                is_active: true,
            })
            .select("*")
            .single();

        if (error) throw error;
        return service;
    },

    /**
     * Save physical branches list to Supabase
     */
    async saveBranches(tenantId, branchList) {
        if (!tenantId || !Array.isArray(branchList)) return [];

        // Delete existing non-archived branches to avoid duplicates during onboarding
        await supabase
            .from("branches")
            .delete()
            .eq("tenant_id", tenantId);

        const rowsToInsert = branchList.map((b) => ({
            tenant_id: tenantId,
            name: b.name,
            address: b.address,
            phone: b.phone || null,
            is_main: !!b.is_main,
        }));

        if (rowsToInsert.length === 0) return [];

        const { data, error } = await supabase
            .from("branches")
            .insert(rowsToInsert)
            .select("*");

        if (error) throw error;
        return data || [];
    },

    /**
     * Publish Tenant (Validates required elements and activates tenant strictly for owner)
     */
    async publishTenant(tenantId, userId = null) {
        if (!tenantId) throw new Error("Tenant ID is required to publish");

        // Verify resources & services count
        const [resCheck, srvCheck] = await Promise.all([
            supabase.from("resources").select("id", { count: "exact" }).eq("tenant_id", tenantId),
            supabase.from("services").select("id", { count: "exact" }).eq("tenant_id", tenantId),
        ]);

        const resourceCount = resCheck.count || 0;
        const serviceCount = srvCheck.count || 0;

        if (resourceCount === 0 || serviceCount === 0) {
            throw new Error("Cannot publish: Business must have at least 1 bookable resource and 1 active service.");
        }

        let updateQuery = supabase
            .from("tenants")
            .update({ status: "published" })
            .eq("id", tenantId);

        if (userId) {
            updateQuery = updateQuery.eq("owner_id", userId);
        }

        const { data, error } = await updateQuery
            .select("*, categories(*)")
            .single();

        if (error) throw error;
        return data;
    },
};
