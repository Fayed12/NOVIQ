import { supabase } from './lib/supabaseClient';
import { createCrudService } from './baseService';

// Table: public.categories - Supabase Database Service
const base = createCrudService('categories');

export const categoryService = {
  ...base,

  /**
   * Fetch a single category from live Supabase by slug
   */
  async getBySlug(slug) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
};
