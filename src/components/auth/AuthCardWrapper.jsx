// local
import { selectTheme } from '../../redux/themeSlice';
import styles from './AuthCardWrapper.module.css';

// react
import { forwardRef } from 'react';

// react-redux
import { useSelector } from 'react-redux';

// prop-types
import PropTypes from 'prop-types';

// react-router
import { Link } from 'react-router';

// icons
import { FiArrowLeft, FiHome } from 'react-icons/fi';

const AuthCardWrapper = forwardRef(({
  title,
  subtitle,
  children,
  wide = false,
  showLogo = true,
  customBadge,
  showBackHome = false,
}, ref) => {
  const currentTheme = useSelector(selectTheme);
  const isDark = currentTheme === 'dark';
  const logoSrc = isDark ? '/dark-logo.png' : '/light-logo.png';

  return (
    <div className={styles.pageWrapper}>
      {/* Decorative Orbs isolated inside an overflow: hidden container so they never cause scrollbars */}
      <div className={styles.ambientContainer} aria-hidden="true">
        <div className={styles.ambientOrb1} />
        <div className={styles.ambientOrb2} />
      </div>

      <main
        ref={ref}
        className={styles.cardContainer}
        data-wide={wide ? "true" : undefined}
      >
        {/* Back to Home Button */}
        {showBackHome && (
          <Link 
            to="/" 
            replace
            className={styles.backHomeBtn} 
            title="Back to Landing Page" 
            aria-label="Back to Landing Page"
          >
            <FiArrowLeft className={styles.backArrowIcon} />
            <FiHome className={styles.backHomeIcon} />
            <span className={styles.backHomeLabel}>Home</span>
          </Link>
        )}

        {showLogo && (
          <header className={styles.brandHeader} data-auth-anim>
            <Link to="/" replace className={styles.logoLink} aria-label="NOVIQ Home">
              <img 
                src={logoSrc} 
                alt="NOVIQ Logo" 
                className={styles.brandLogo} 
              />
            </Link>
            {customBadge && <div className={styles.customBadge}>{customBadge}</div>}
            {title && <h1 className={styles.pageTitle}>{title}</h1>}
            {subtitle && <p className={styles.pageSubtitle}>{subtitle}</p>}
          </header>
        )}

        {children}
      </main>

      <footer className={styles.footerNote}>
        <span>&copy; {new Date().getFullYear()} NOVIQ Inc.</span>
        <Link to="/terms" className={styles.footerLink}>Terms</Link>
        <span>&bull;</span>
        <Link to="/privacy" className={styles.footerLink}>Privacy</Link>
      </footer>
    </div>
  );
});

AuthCardWrapper.displayName = 'AuthCardWrapper';

AuthCardWrapper.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  children: PropTypes.node.isRequired,
  wide: PropTypes.bool,
  showLogo: PropTypes.bool,
  customBadge: PropTypes.node,
  showBackHome: PropTypes.bool,
};

export default AuthCardWrapper;
