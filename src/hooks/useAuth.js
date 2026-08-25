import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { authService } from '../services/authService';
import { sessionChanged } from '../redux/slices/authSlice';

/**
 * Call once, at the root of the app (App.jsx). Initializes the session on
 * mount and keeps it in sync via Supabase's onAuthStateChange for the
 * lifetime of the app — every other component reads auth state from
 * Redux (`state.auth`) via `useSelector`, not from this hook directly.
 *
 * Replaces the manual `supabase.auth.getSession()` + `onAuthStateChange`
 * useEffect that used to live inline in App.jsx.
 */
export function useAuth() {
  const dispatch = useDispatch();
  const { user, session, initialized } = useSelector((state) => state.auth);

  useEffect(() => {
    // Initial check on load/refresh.
    authService.getSession().then((session) => {
      dispatch(sessionChanged({ session }));
    });

    // Live updates: SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED,
    // PASSWORD_RECOVERY (this last one fires when a user lands on
    // /reset-password?token=... from the emailed link — PAGE 11).
    const unsubscribe = authService.onAuthStateChange((_event, session) => {
      dispatch(sessionChanged({ session }));
    });

    return unsubscribe;
  }, [dispatch]);

  return {
    user,
    session,
    isAuthenticated: !!user,
    isInitialized: initialized, // gate routing on this to avoid a login-flash on page reload
  };
}

export default useAuth;
