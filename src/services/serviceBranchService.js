import { supabase } from './lib/supabaseClient';

/**
 * Service for the service_branches junction table.
 * Ensures services and branches for a tenant are fully synchronized so all branches
 * offer the tenant's complete catalog of services by default.
 */
export const serviceBranchService = {
  /** All branches a given service is currently offered at. */
  async getBranchesForService(serviceId) {
    const { data, error } = await supabase
      .from('service_branches')
      .select('branch_id, branches(id, name, is_main)')
      .eq('service_id', serviceId);
    if (error) throw error;
    return data;
  },

  /** All services currently offered at a given branch. */
  async getServicesForBranch(branchId) {
    const { data, error } = await supabase
      .from('service_branches')
      .select('service_id, services(id, name, price, duration_minutes)')
      .eq('branch_id', branchId);
    if (error) throw error;
    return data;
  },

  /** Opt a service OUT of one specific branch without affecting others. */
  async unlinkServiceFromBranch(serviceId, branchId) {
    const { error } = await supabase
      .from('service_branches')
      .delete()
      .eq('service_id', serviceId)
      .eq('branch_id', branchId);
    if (error) throw error;
  },

  /** Link or re-link a service to a specific branch. */
  async linkServiceToBranch(serviceId, branchId) {
    if (!serviceId || !branchId) throw new Error("Service ID and Branch ID are required.");

    // Security Verification: Ensure Service and Branch belong to the same tenant entity
    const [{ data: srv }, { data: brn }] = await Promise.all([
      supabase.from('services').select('tenant_id').eq('id', serviceId).maybeSingle(),
      supabase.from('branches').select('tenant_id').eq('id', branchId).maybeSingle(),
    ]);

    if (!srv || !brn || srv.tenant_id !== brn.tenant_id) {
      throw new Error("Security Violation: Service and Branch must belong to the same business entity.");
    }

    const { data, error } = await supabase
      .from('service_branches')
      .upsert(
        { service_id: serviceId, branch_id: branchId },
        { onConflict: 'service_id,branch_id', ignoreDuplicates: true }
      )
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  /** Connect a service to all operating branches of a tenant. */
  async linkServiceToAllBranches(serviceId, tenantId) {
    if (!serviceId || !tenantId) return [];

    const { data: branches, error: bErr } = await supabase
      .from('branches')
      .select('id')
      .eq('tenant_id', tenantId);

    if (bErr) throw bErr;
    if (!branches || branches.length === 0) return [];

    const rows = branches.map((b) => ({
      service_id: serviceId,
      branch_id: b.id,
    }));

    const { data, error } = await supabase
      .from('service_branches')
      .upsert(rows, { onConflict: 'service_id,branch_id', ignoreDuplicates: true })
      .select();

    if (error) throw error;
    return data || [];
  },

  /** Connect a newly created branch to all existing services of a tenant. */
  async linkBranchToAllServices(branchId, tenantId) {
    if (!branchId || !tenantId) return [];

    const { data: services, error: sErr } = await supabase
      .from('services')
      .select('id')
      .eq('tenant_id', tenantId);

    if (sErr) throw sErr;
    if (!services || services.length === 0) return [];

    const rows = services.map((s) => ({
      service_id: s.id,
      branch_id: branchId,
    }));

    const { data, error } = await supabase
      .from('service_branches')
      .upsert(rows, { onConflict: 'service_id,branch_id', ignoreDuplicates: true })
      .select();

    if (error) throw error;
    return data || [];
  },

  /** Complete bidirectional sync ensuring every service is linked to every branch for a tenant. */
  async syncAllServicesAndBranches(tenantId) {
    if (!tenantId) return;

    try {
      const [bRes, sRes] = await Promise.all([
        supabase.from('branches').select('id').eq('tenant_id', tenantId),
        supabase.from('services').select('id').eq('tenant_id', tenantId),
      ]);

      if (bRes.error || sRes.error) return;
      const branches = bRes.data || [];
      const services = sRes.data || [];

      if (branches.length === 0 || services.length === 0) return;

      const rows = [];
      for (const s of services) {
        for (const b of branches) {
          rows.push({ service_id: s.id, branch_id: b.id });
        }
      }

      await supabase
        .from('service_branches')
        .upsert(rows, { onConflict: 'service_id,branch_id', ignoreDuplicates: true });
    } catch (err) {
      console.warn('Non-blocking service_branches sync warning:', err);
    }
  },
};
