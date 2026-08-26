// local
import LoadingPage from '../../pages/global-pages/loading-page/loadingPage';

// react-redux
import { useSelector } from 'react-redux';

// react-router
import { Navigate, useLocation } from 'react-router';

// prop-types
import PropTypes from 'prop-types';

/**
 * Route guard requiring active authentication and verified email.
 * - If auth is initializing -> shows LoadingPage.
 * - If not authenticated -> redirects to /login (preserving location).
 * - If email is not confirmed -> redirects to /verify-email (unless requireVerified is false).
 */
export default function ProtectedRoute({ children, requireVerified = true }) {
  const { user, initialized } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!initialized) {
    return <LoadingPage label="Verifying security credentials..." />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check email verification status
  const isEmailVerified = !!(user.email_confirmed_at || user.confirmed_at);
  if (requireVerified && !isEmailVerified) {
    return <Navigate to="/verify-email" state={{ email: user.email }} replace />;
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requireVerified: PropTypes.bool,
};
