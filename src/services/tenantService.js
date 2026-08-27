import { supabase } from './lib/supabaseClient';
import { createCrudService } from './baseService';

// Table: public.tenants - Supabase Database Service
const base = createCrudService('tenants');

export const tenantService = {
  ...base,

  /**
   * Fetch a single tenant from live Supabase by slug with nested relations
   * (category, services, resources, reviews)
   */
  async getBySlug(slug) {
    const { data, error } = await supabase
      .from('tenants')
      .select('*, categories(*), services(*), resources(*), reviews(*)')
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
};
