// local
import LoadingPage from '../../pages/global-pages/loading-page/loadingPage';

// react-redux
import { useSelector } from 'react-redux';

// react-router
import { Navigate } from 'react-router';

// prop-types
import PropTypes from 'prop-types';

/**
 * Role-Based Access Control (RBAC) Guard.
 * Checks user global_role or tenant membership roles.
 * If user lacks required role, redirects to /403.
 */
export default function RoleRoute({
  children,
  allowedRoles = [],
  requireOwner = false,
}) {
  const { user, initialized } = useSelector((state) => state.auth);
  const { current: currentProfile } = useSelector((state) => state.profiles);
  const { items: memberships } = useSelector((state) => state.memberships);

  if (!initialized) {
    return <LoadingPage label="Verifying access permissions..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Determine user's highest role
  const globalRole = currentProfile?.global_role || user?.user_metadata?.global_role || 'customer';
  
  // If platform admin required
  if (allowedRoles.includes('admin') && globalRole !== 'admin') {
    return <Navigate to="/403" replace />;
  }

  // If specific roles specified (e.g., ['owner', 'manager', 'employee'])
  if (allowedRoles.length > 0 && !allowedRoles.includes(globalRole)) {
    const hasMembershipRole = memberships?.some((m) => allowedRoles.includes(m.role));
    if (!hasMembershipRole && globalRole !== 'admin') {
      return <Navigate to="/403" replace />;
    }
  }

  // If specific owner privilege required
  if (requireOwner) {
    const isOwner = memberships?.some((m) => m.role === 'owner') || globalRole === 'admin';
    if (!isOwner) {
      return <Navigate to="/403" replace />;
    }
  }

  return children;
}

RoleRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
  requireOwner: PropTypes.bool,
};
