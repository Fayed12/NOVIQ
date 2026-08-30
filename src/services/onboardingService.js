import { supabase } from "./lib/supabaseClient";

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
            .eq("is_active", true)
            .order("sort_order", { ascending: true });

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
        const [branchesRes, hoursRes, servicesRes, resourcesRes] = await Promise.all([
            supabase.from("branches").select("*").eq("tenant_id", tenant.id).then(r => r.data || []).catch(() => []),
            supabase.from("working_hours").select("*").eq("tenant_id", tenant.id).then(r => r.data || []).catch(() => []),
            supabase.from("services").select("*").eq("tenant_id", tenant.id).then(r => r.data || []).catch(() => []),
            supabase.from("resources").select("*, resource_types(*)").eq("tenant_id", tenant.id).then(r => r.data || []).catch(() => []),
        ]);

        return {
            tenant: tenant,
            branches: branchesRes || [],
            working_hours: hoursRes || [],
            services: servicesRes || [],
            resources: resourcesRes || [],
        };
    },

    /**
     * Create or update draft tenant step data in Supabase
     */
    async upsertDraftTenant(userId, stepData) {
        if (!userId) throw new Error("User ID is required");

        // 1. Check if user already has an active draft tenant
        const { data: existingDraft } = await supabase
            .from("tenants")
            .select("id")
            .eq("owner_id", userId)
            .eq("status", "draft")
            .maybeSingle();

        if (existingDraft) {
            // Update existing draft
            const { data, error } = await supabase
                .from("tenants")
                .update({
                    ...stepData,
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
                .insert({
                    owner_id: userId,
                    status: "draft",
                    ...stepData,
                })
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
     * Check if a business slug is already taken
     */
    async checkSlugAvailability(slug, currentTenantId = null) {
        if (!slug) return false;

        let query = supabase
            .from("tenants")
            .select("id")
            .eq("slug", slug.trim().toLowerCase());

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
                tenant_id: tenantId,
                day_of_week: wh.day_of_week,
                open_time: wh.is_closed ? null : wh.open_time || "09:00",
                close_time: wh.is_closed ? null : wh.close_time || "18:00",
                is_closed: !!wh.is_closed,
            }));

            // Delete old hours for this tenant and re-insert
            await supabase.from("working_hours").delete().eq("tenant_id", tenantId);
            const { error: whErr } = await supabase
                .from("working_hours")
                .insert(formattedHours);

            if (whErr) throw whErr;
        }

        // 2. Save cancellation policy if provided
        if (cancellationPolicy) {
            const policyPayload = {
                tenant_id: tenantId,
                name: cancellationPolicy.name || "Default Cancellation Policy",
                refundable: cancellationPolicy.rule?.refundable ?? true,
                free_cancellation_hours: cancellationPolicy.rule?.free_cancellation_hours ?? 24,
                fee_percentage: cancellationPolicy.rule?.fee_percentage ?? 0,
                is_active: true,
            };

            await supabase.from("cancellation_policies").delete().eq("tenant_id", tenantId);
            const { error: cpErr } = await supabase
                .from("cancellation_policies")
                .insert(policyPayload);

            if (cpErr) throw cpErr;
        }

        return { success: true };
    },

    // Aliases for granular saves
    async saveWorkingHours(tenantId, workingHoursList) {
        return this.saveScheduleAndPolicy(tenantId, workingHoursList, null);
    },

    async saveCancellationPolicy(tenantId, cancellationPolicy) {
        return this.saveScheduleAndPolicy(tenantId, [], cancellationPolicy);
    },

    /**
     * Create starter resource and default resource_type
     */
    async addStarterResource(tenantId, { name, typeName = "Specialist", capacity = 1 }) {
        if (!tenantId) throw new Error("Tenant ID is required");

        // 1. Find or create resource_type
        let resourceTypeId = null;
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

        const { data, error } = await supabase
            .from("branches")
            .insert(rowsToInsert)
            .select("*");

        if (error) throw error;
        return data || [];
    },

    /**
     * Publish Tenant (Validates required elements and activates tenant strictly for owner)
     * Assigns user role as owner/admin in tenant_memberships and auth metadata.
     */
    async publishTenant(tenantId, userId = null) {
        if (!tenantId) throw new Error("Tenant ID is required to publish");

        // Verify services count
        const srvCheck = await supabase
            .from("services")
            .select("id", { count: "exact" })
            .eq("tenant_id", tenantId);

        const serviceCount = srvCheck.count || 0;

        if (serviceCount === 0) {
            throw new Error("Cannot publish: Business must have at least 1 active service.");
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
            .eq("id", tenantId);

        if (userId) {
            updateQuery = updateQuery.eq("owner_id", userId);
        }

        const { data, error } = await updateQuery
            .select("*, categories(*)")
            .single();

        if (error) throw error;

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
            } catch (memberErr) {
                console.warn("Non-blocking membership sync warning:", memberErr);
            }
        }

        return data;
    },
};
