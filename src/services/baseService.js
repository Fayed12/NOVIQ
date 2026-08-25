import { supabase } from './lib/supabaseClient';

/**
 * Generic CRUD + Realtime service factory for a single Supabase table.
 * Every per-table service file (e.g. tenantService.js) is a thin wrapper
 * around this — same shape everywhere, so components never need to know
 * which table they're calling.
 *
 * @param {string} table - Postgres table name in the `public` schema.
 * @param {string} defaultSelect - default `select()` string (supports FK joins, e.g. '*, tenant:tenants(name)').
 */
export function createCrudService(table, defaultSelect = '*') {
  return {
    table,

    async getAll({ select = defaultSelect, filters = {}, orderBy, ascending = true, limit } = {}) {
      let query = supabase.from(table).select(select);
      Object.entries(filters).forEach(([col, val]) => {
        query = query.eq(col, val);
      });
      if (orderBy) query = query.order(orderBy, { ascending });
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },

    async getById(id, { select = defaultSelect } = {}) {
      const { data, error } = await supabase.from(table).select(select).eq('id', id).single();
      if (error) throw error;
      return data;
    },

    async create(payload) {
      const { data, error } = await supabase.from(table).insert(payload).select().single();
      if (error) throw error;
      return data;
    },

    async update(id, payload) {
      const { data, error } = await supabase.from(table).update(payload).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },

    async remove(id) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      return id;
    },

    /**
     * Subscribes to Postgres changes on this table.
     * Returns an unsubscribe function — always call it in a useEffect cleanup.
     */
    subscribe(event, callback, filter) {
      const channel = supabase
        .channel(`${table}-changes-${Math.random().toString(36).slice(2)}`)
        .on(
          'postgres_changes',
          { event, schema: 'public', table, ...(filter ? { filter } : {}) },
          callback
        )
        .subscribe();
      return () => supabase.removeChannel(channel);
    },
  };
}
