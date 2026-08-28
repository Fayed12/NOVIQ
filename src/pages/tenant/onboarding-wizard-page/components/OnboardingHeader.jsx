import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router";
import { selectTheme, toggleTheme } from "../../../../redux/themeSlice";
import { FiSun, FiMoon, FiSave, FiHelpCircle, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import styles from "./OnboardingHeader.module.css";

export default function OnboardingHeader({ onSaveAndExit, isSaving }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const currentTheme = useSelector(selectTheme);
    const isDark = currentTheme === "dark";
    const { user } = useSelector((state) => state.auth);

    const logoSrc = isDark ? "/dark-logo.png" : "/light-logo.png";

    const handleHelpClick = () => {
        toast.info("Need help setting up? Contact mohamedfaye12d@gmail.com or check our documentation.", {
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

                {/* Right Actions */}
                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={handleHelpClick}
                        aria-label="Help & Guidance"
                        title="Help & Guidance"
                        disabled={isSaving}
                    >
                        <FiHelpCircle size={18} />
                    </button>

                    <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={() => dispatch(toggleTheme())}
                        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
                        title={`Switch to ${isDark ? "light" : "dark"} mode`}
                    >
                        {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
                    </button>

                    <button
                        type="button"
                        className={styles.saveExitBtn}
                        onClick={onSaveAndExit}
                        disabled={isSaving}
                    >
                        <FiSave size={15} />
                        <span>{isSaving ? "Saving..." : "Save & Exit"}</span>
                    </button>
                </div>
            </div>
        </header>
    );
}

OnboardingHeader.propTypes = {
    onSaveAndExit: PropTypes.func.isRequired,
    isSaving: PropTypes.bool,
};
