// local
import LoadingPage from '../../pages/global-pages/loading-page/loadingPage';

// react-redux
import { useSelector } from 'react-redux';

// react-router
import { Navigate, useLocation } from 'react-router';

// prop-types
import PropTypes from 'prop-types';

/**
 * Route guard for purely public entry pages (Login, Register).
 * If user is already authenticated and verified, redirects them to their dashboard or account.
 */
export default function PublicOnlyRoute({ children }) {
  const { user, initialized } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!initialized) {
    return <LoadingPage label="Loading NOVIQ..." />;
  }

  if (user) {
    const isEmailVerified = !!(user.email_confirmed_at || user.confirmed_at);
    if (!isEmailVerified) {
      return <Navigate to="/verify-email" state={{ email: user.email }} replace />;
    }
    const destination = location.state?.from?.pathname || '/account';
    return <Navigate to={destination} replace />;
  }

  return children;
}

PublicOnlyRoute.propTypes = {
  children: PropTypes.node.isRequired,
};
