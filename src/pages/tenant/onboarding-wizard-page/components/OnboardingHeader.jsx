// local
import { selectTheme, toggleTheme } from "../../../../redux/themeSlice";
import styles from "./OnboardingHeader.module.css";

// prop-types
import PropTypes from "prop-types";

// react-router
import { Link } from "react-router";

// react-redux
import { useSelector, useDispatch } from "react-redux";

// react-toastify
import { toast } from "react-toastify";

// react icons
import { FiSun, FiMoon, FiSave, FiHelpCircle, FiPlus } from "react-icons/fi";

export default function OnboardingHeader({ onSaveAndExit, onReset, isSaving }) {
    const dispatch = useDispatch();
    const currentTheme = useSelector(selectTheme);
    const isDark = currentTheme === "dark";
    const { user } = useSelector((state) => state.auth);

    const logoSrc = isDark ? "/dark-logo.png" : "/light-logo.png";

    const handleHelpClick = () => {
        toast.info("Need help setting up? Contact support or check our documentation.", {
            position: "top-center",
        });
    };

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                {/* Logo */}
                <Link to="/" className={styles.logoLink} aria-label="NOVIQ Home">
                    <img src={logoSrc} alt="NOVIQ" className={styles.logoImage} />
                    <span className={styles.badge}>Home</span>
                </Link>

                {/* Center Title / User Info */}
                <div className={styles.centerSection}>
                    <span className={styles.wizardTitle}>Become a Business Owner</span>
                    {user?.email && <span className={styles.userEmail}>{user.email}</span>}
                </div>

                {/* Right Actions - Distinct Modern Controls */}
                <div className={styles.actions}>
                    {/* Utility Controls */}
                    <div className={styles.utilitiesGroup}>
                        <button
                            type="button"
                            className={styles.iconBtn}
                            onClick={handleHelpClick}
                            aria-label="Help & Guidance"
                            title="Help & Guidance"
                            disabled={isSaving}
                        >
                            <FiHelpCircle size={16} />
                        </button>

                        <button
                            type="button"
                            className={styles.iconBtn}
                            onClick={() => dispatch(toggleTheme())}
                            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
                            title={`Switch to ${isDark ? "light" : "dark"} mode`}
                        >
                            {isDark ? <FiSun size={16} /> : <FiMoon size={16} />}
                        </button>
                    </div>

                    <div className={styles.divider} aria-hidden="true" />

                    {/* New Business Distinct Pill Button */}
                    {onReset && (
                        <button
                            type="button"
                            className={styles.newBusinessBtn}
                            onClick={onReset}
                            aria-label="Start setting up a new business"
                            title="Start setting up a new business from Step 1"
                            disabled={isSaving}
                        >
                            <span className={styles.btnIconTeal}>
                                <FiPlus size={13} />
                            </span>
                            <span className={styles.btnText}>Reset & New Business</span>
                        </button>
                    )}

                    {/* Save & Exit Neutral Secondary Button */}
                    <button
                        type="button"
                        className={styles.saveExitBtn}
                        onClick={onSaveAndExit}
                        disabled={isSaving}
                        aria-label="Save draft and exit"
                        title="Save progress and exit"
                    >
                        <FiSave size={14} />
                        <span className={styles.btnText}>
                            {isSaving ? "Saving..." : "Save & Exit"}
                        </span>
                    </button>
                </div>
            </div>
        </header>
    );
}

OnboardingHeader.propTypes = {
    onSaveAndExit: PropTypes.func.isRequired,
    onReset: PropTypes.func,
    isSaving: PropTypes.bool,
};
