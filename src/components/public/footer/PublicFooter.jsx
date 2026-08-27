// local
import styles from "./PublicFooter.module.css";

// react-router
import { Link } from "react-router";

// react-icons
import { FiArrowUp } from "react-icons/fi";

const PublicFooter = () => {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <footer className={styles.footer}>
            <div className={styles.footerContainer}>
                {/* Brand Column */}
                <div className={styles.footerBrandCol}>
                    <Link to="/" className={styles.logoLink} aria-label="NOVIQ Home">
                        <img
                            src="/dark-logo.png"
                            alt="NOVIQ Logo"
                            className={styles.footerLogo}
                        />
                    </Link>
                    <p className={styles.footerTagline}>
                        The universal operating system for appointment-driven businesses. Real-time calendar synchronization, staff scheduling, multi-branch management, and automated client retention.
                    </p>
                    <div className={styles.footerStatusBadge}>
                        <span className={styles.statusDotGreen} />
                        <span>All Systems Operational</span>
                    </div>
                </div>

                {/* Verticals Column */}
                <div className={styles.footerNavGroup}>
                    <h4 className={styles.footerGroupTitle}>Explore Verticals</h4>
                    <ul className={styles.footerLinksList}>
                        <li>
                            <Link to="/explore/clinics">Medical & Clinics</Link>
                        </li>
                        <li>
                            <Link to="/explore/salons">Salons & Aesthetics</Link>
                        </li>
                        <li>
                            <Link to="/explore/hotels">Hotels & Stays</Link>
                        </li>
                        <li>
                            <Link to="/explore/fitness">Fitness & Wellness</Link>
                        </li>
                    </ul>
                </div>

                {/* Access & Hub Column */}
                <div className={styles.footerNavGroup}>
                    <h4 className={styles.footerGroupTitle}>Access & Hub</h4>
                    <ul className={styles.footerLinksList}>
                        <li>
                            <Link to="/explore">Explore Marketplace</Link>
                        </li>
                        <li>
                            <Link to="/register">Create Account</Link>
                        </li>
                        <li>
                            <Link to="/login">Sign In</Link>
                        </li>
                        <li>
                            <Link to="/account">My Space Hub</Link>
                        </li>
                        <li>
                            <Link to="/welcome">Platform Tour</Link>
                        </li>
                    </ul>
                </div>

                {/* Legal Column */}
                <div className={styles.footerNavGroup}>
                    <h4 className={styles.footerGroupTitle}>Trust & Legal</h4>
                    <ul className={styles.footerLinksList}>
                        <li>
                            <Link to="/privacy">Privacy Policy</Link>
                        </li>
                        <li>
                            <Link to="/terms">Terms of Service</Link>
                        </li>
                        <li>
                            <Link to="/offline">Network Status</Link>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Footer Bottom Bar */}
            <div className={styles.footerBottom}>
                <p>&copy; {new Date().getFullYear()} NOVIQ SaaS Platform. All rights reserved.</p>
                <div className={styles.footerLegalLinks}>
                    <Link to="/privacy">Privacy</Link>
                    <Link to="/terms">Terms</Link>
                    <button
                        type="button"
                        onClick={scrollToTop}
                        className={styles.backToTopBtn}
                        aria-label="Scroll to top"
                    >
                        <span>Top</span>
                        <FiArrowUp />
                    </button>
                </div>
            </div>
        </footer>
    );
};

export default PublicFooter;
