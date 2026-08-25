import { supabase } from './lib/supabaseClient';

/**
 * Wraps Supabase Auth (`supabase.auth`) for every flow used across the
 * Auth pages (07-pages-and-features.md §2): Login, Register, Verify Email,
 * Forgot Password, Reset Password.
 *
 * This is NOT a table-backed CRUD service like the others in this folder —
 * `auth.users` is managed by Supabase Auth directly, not queried via
 * `.from()`. The `profiles` row is auto-created by the `handle_new_user`
 * DB trigger the moment `signUp` succeeds (see
 * 05-supabase-implementation-guide.md §2) — this service never touches
 * `profiles` directly; use `profileService.js` for that.
 */
export const authService = {
  /**
   * PAGE 08 — Register. Creates the `auth.users` row and sends a
   * verification email. `fullName` is stored as auth user metadata AND
   * copied into `profiles.full_name` by the trigger.
   */
  async signUp({ email, password, fullName }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/verify-email`,
      },
    });
    if (error) throw error;
    return data; // { user, session }
  },

  /** PAGE 07 — Login. */
  async signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data; // { user, session }
  },

  /** Signs the current user out of this device/tab only. */
  async signOut() {
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    if (error) throw error;
  },

  /**
   * Signs the current user out of every OTHER active session. Called after
   * a successful password reset (PAGE 11) as a security measure — see
   * 07-pages-and-features.md §2, PAGE 11.
   */
  async signOutOtherSessions() {
    const { error } = await supabase.auth.signOut({ scope: 'others' });
    if (error) throw error;
  },

  /** Returns the current session (or null). Cheap — reads from local storage
   *  first, only hits the network if the token needs refreshing. */
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  /** Returns the current authenticated user (or null). Always verifies
   *  against the Supabase Auth server (safer than trusting a cached JWT
   *  for anything security-sensitive). */
  async getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  /**
   * Subscribes to auth state changes: SIGNED_IN, SIGNED_OUT,
   * TOKEN_REFRESHED, USER_UPDATED, PASSWORD_RECOVERY.
   * Returns an unsubscribe function — always call it in a useEffect cleanup.
   * (Consumed by `useAuth.js`, not meant to be called directly from components.)
   */
  onAuthStateChange(callback) {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
    return () => data.subscription.unsubscribe();
  },

  /**
   * PAGE 09 — Email Verification: resend the confirmation link.
   * UI-layer cooldown (45s / max 3 per hour) lives in the component per
   * 06-uiux-design-spec.md Page 09 — Supabase also rate-limits server-side
   * as a backstop.
   */
  async resendVerificationEmail(email) {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: `${window.location.origin}/verify-email` },
    });
    if (error) throw error;
  },

  /**
   * PAGE 10 — Forgot Password: sends the reset email.
   * IMPORTANT: the UI must always show the same success state regardless
   * of whether this resolves or rejects (see 07-pages-and-features.md §2,
   * PAGE 10) — this prevents leaking which emails have accounts. Catch the
   * error in the component for logging only, never surface it to the user.
   */
  async sendPasswordResetEmail(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  },

  /**
   * PAGE 11 — Reset Password: sets a new password. Must be called while
   * the recovery session from the emailed link is active — Supabase sets
   * this automatically once the user lands on `/reset-password?token=...`
   * and the client picks up the `PASSWORD_RECOVERY` auth event.
   */
  async updatePassword(newPassword) {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return data.user;
  },

  /** Settings → Security (PAGE 17): change password while already logged in. */
  async changePassword(newPassword) {
    return this.updatePassword(newPassword);
  },

  /**
   * Updates auth-level user metadata (e.g. full_name at the auth.users
   * level). Profile fields like phone/avatar_url live in the `profiles`
   * table — use `profileService.js` for those instead.
   */
  async updateUserMetadata(metadata) {
    const { data, error } = await supabase.auth.updateUser({ data: metadata });
    if (error) throw error;
    return data.user;
  },
};
