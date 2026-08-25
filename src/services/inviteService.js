import { supabase } from './lib/supabaseClient';

/**
 * Handles the tenant-invite flow: staff sending invites from the Team page
 * (03-pages.md §3.6) and the public Accept Invite page (07-pages-and-features.md
 * §2, PAGE 12). Deliberately NOT built on `createCrudService` like the other
 * table services — reading/accepting an invite by token has to go through
 * the security-definer RPCs from migration `010_tenant_invites`, not a
 * direct `.from('tenant_invites')` select, so an unauthenticated visitor
 * can never browse the invites table.
 */
export const inviteService = {
  // ---- Staff-side (Team page, requires auth + tenant_staff RLS) ----

  /** Creates a new invite. `resourceId` is optional — pass it when inviting
   *  someone to be assigned to a specific Doctor/Stylist/Room resource. */
  async createInvite({ tenantId, email, role, resourceId, invitedBy }) {
    const { data, error } = await supabase
      .from('tenant_invites')
      .insert({
        tenant_id: tenantId,
        email,
        role,
        resource_id: resourceId ?? null,
        invited_by: invitedBy,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /** Lists all invites for a tenant (Team page — pending/accepted/expired). */
  async listInvitesForTenant(tenantId) {
    const { data, error } = await supabase
      .from('tenant_invites')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  /** Revokes a pending invite (e.g. invited the wrong person). */
  async revokeInvite(inviteId) {
    const { data, error } = await supabase
      .from('tenant_invites')
      .update({ status: 'revoked' })
      .eq('id', inviteId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /** Extends an invite's expiry by 7 days and flips it back to pending —
   *  use when a staff member clicks "Resend" on an expired invite.
   *  NOTE: this only updates the DB row; actually re-sending the email
   *  requires a Supabase Edge Function or your own email provider — wire
   *  that call in alongside this one when you build it. */
  async resendInvite(inviteId) {
    const { data, error } = await supabase
      .from('tenant_invites')
      .update({ status: 'pending', expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() })
      .eq('id', inviteId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // ---- Public-side (Accept Invite page, PAGE 12 — via RPC, no direct table access) ----

  /**
   * Looks up an invite by its token. Safe to call while signed out — the
   * `get_invite_details` RPC only ever returns tenant_name/role/email/
   * is_valid, never the raw invites table.
   */
  async getInviteDetails(token) {
    const { data, error } = await supabase.rpc('get_invite_details', { p_token: token });
    if (error) throw error;
    return data?.[0] ?? null; // { tenant_id, tenant_name, role, email, is_valid }
  },

  /**
   * Accepts an invite. Must be called AFTER the user is authenticated
   * (either just signed up or just signed in with the invited email) —
   * the `accept_invite` RPC checks `auth.uid()`'s email against the
   * invite's email server-side and creates the `tenant_memberships` row.
   */
  async acceptInvite(token) {
    const { error } = await supabase.rpc('accept_invite', { p_token: token });
    if (error) throw error;
  },
};
