// local
import { logoutUser } from '../../../redux/slices/authSlice';
import MainButton from '../../../components/ui/button/MainButton';
import styles from './TenantDashboardBasePage.module.css';

// react-redux
import { useSelector, useDispatch } from 'react-redux';

// react-router
import { useParams, useNavigate } from 'react-router';

// react-icons
import { FiLogOut, FiBriefcase, FiUsers, FiCalendar, FiSettings } from 'react-icons/fi';

export default function TenantDashboardBasePage() {
  const { tenantSlug } = useParams();
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <div className={styles.container}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <span className={styles.badge}>NOVIQ</span>
          <h2>Business Workspace: <strong>{tenantSlug || 'Default Tenant'}</strong></h2>
        </div>
        <div className={styles.userActions}>
          <span className={styles.userEmail}>{user?.email}</span>
          <MainButton size="sm" variant="secondary" icon={<FiLogOut />} onClick={handleLogout}>
            Sign Out
          </MainButton>
        </div>
      </header>

      <main className={styles.content}>
        <div className={styles.banner}>
          <FiBriefcase className={styles.bannerIcon} />
          <div>
            <h1>Welcome to your Business Management Console</h1>
            <p>You are managing tenant <code>/{tenantSlug}</code>. Full analytics and resource operations are connected.</p>
          </div>
        </div>

        <div className={styles.statGrid}>
          <div className={styles.statCard}>
            <FiCalendar className={styles.statIcon} />
            <span className={styles.statLabel}>Today's Bookings</span>
            <span className={styles.statValue}>12</span>
          </div>
          <div className={styles.statCard}>
            <FiUsers className={styles.statIcon} />
            <span className={styles.statLabel}>Active Staff Members</span>
            <span className={styles.statValue}>5</span>
          </div>
          <div className={styles.statCard}>
            <FiSettings className={styles.statIcon} />
            <span className={styles.statLabel}>System Health</span>
            <span className={styles.statValue}>Optimal</span>
          </div>
        </div>
      </main>
    </div>
  );
}
