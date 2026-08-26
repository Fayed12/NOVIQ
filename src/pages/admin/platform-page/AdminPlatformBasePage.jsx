// local
import { logoutUser } from '../../../redux/slices/authSlice';
import MainButton from '../../../components/ui/button/MainButton';
import styles from './AdminPlatformBasePage.module.css';

// react-redux
import { useSelector, useDispatch } from 'react-redux';

// react-router
import { useNavigate } from 'react-router';

// react icons
import { FiLogOut, FiShield, FiDatabase, FiServer, FiLock } from 'react-icons/fi';

export default function AdminPlatformBasePage() {
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
          <span className={styles.adminBadge}><FiLock /> Admin</span>
          <h2>NOVIQ Platform Command Center</h2>
        </div>
        <div className={styles.userActions}>
          <span className={styles.userEmail}>{user?.email}</span>
          <MainButton size="sm" variant="secondary" icon={<FiLogOut />} onClick={handleLogout}>
            Exit Console
          </MainButton>
        </div>
      </header>

      <main className={styles.content}>
        <div className={styles.headerBox}>
          <h1>Platform Administration</h1>
          <p>Restricted area for platform administrators. Security audit active.</p>
        </div>

        <div className={styles.grid}>
          <div className={styles.card}>
            <FiShield className={styles.cardIcon} />
            <h3>Tenants Registry</h3>
            <p>Monitor all registered business tenants across vertical categories.</p>
          </div>
          <div className={styles.card}>
            <FiDatabase className={styles.cardIcon} />
            <h3>System Metrics</h3>
            <p>PostgreSQL 17 connection pool and RLS policy telemetry.</p>
          </div>
          <div className={styles.card}>
            <FiServer className={styles.cardIcon} />
            <h3>Auth Audit Logs</h3>
            <p>Real-time security events and session refresh statistics.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
