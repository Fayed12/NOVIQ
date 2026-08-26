// local
import { logoutUser } from '../../../redux/slices/authSlice';
import MainButton from '../../../components/ui/button/MainButton';
import styles from './AccountBasePage.module.css';

// react-redux
import { useSelector, useDispatch } from 'react-redux';

// react-router
import { useNavigate } from 'react-router';

// react icons
import { FiLogOut, FiUser, FiCalendar, FiCompass, FiShield } from 'react-icons/fi';

export default function AccountBasePage() {
  const { user } = useSelector((state) => state.auth);
  const { current: profile } = useSelector((state) => state.profiles);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Member';

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.logoBadge}>N</span>
          <h2>NOVIQ Account Hub</h2>
        </div>
        <MainButton
          variant="secondary"
          size="sm"
          icon={<FiLogOut />}
          onClick={handleLogout}
        >
          Sign Out
        </MainButton>
      </header>

      <main className={styles.content}>
        <div className={styles.welcomeCard}>
          <div className={styles.avatar}>
            <FiUser />
          </div>
          <div>
            <h1>Welcome back, {displayName}!</h1>
            <p className={styles.userEmail}>{user?.email}</p>
            <span className={styles.roleBadge}>Customer Account</span>
          </div>
        </div>

        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.cardIcon}><FiCalendar /></div>
            <h3>My Bookings</h3>
            <p>View your active reservations, appointments, and booking history.</p>
            <span className={styles.statusNote}>0 upcoming bookings</span>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon}><FiCompass /></div>
            <h3>Explore Businesses</h3>
            <p>Discover clinics, salons, hotels, and luxury services on NOVIQ.</p>
            <MainButton size="sm" variant="secondary" onClick={() => navigate('/explore')}>
              Explore Marketplace
            </MainButton>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon}><FiShield /></div>
            <h3>Security & Password</h3>
            <p>Manage your login credentials, session security, and preferences.</p>
            <MainButton size="sm" variant="ghost" onClick={() => navigate('/forgot-password')}>
              Request Password Reset
            </MainButton>
          </div>
        </div>
      </main>
    </div>
  );
}
