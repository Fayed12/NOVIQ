// local
import MainButton from "../../../../components/ui/button/MainButton";
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
import { FiSun, FiMoon, FiSave, FiHelpCircle } from "react-icons/fi";

export default function OnboardingHeader({ onSaveAndExit, isSaving }) {
    const dispatch = useDispatch();
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
                    <MainButton
                        variant="ghost"
                        size="sm"
                        onClick={handleHelpClick}
                        aria-label="Help & Guidance"
                        title="Help & Guidance"
                        disabled={isSaving}
                        icon={<FiHelpCircle size={17} />}
                    />

                    <MainButton
                        variant="ghost"
                        size="sm"
                        onClick={() => dispatch(toggleTheme())}
                        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
                        title={`Switch to ${isDark ? "light" : "dark"} mode`}
                        icon={isDark ? <FiSun size={17} /> : <FiMoon size={17} />}
                    />

                    <MainButton
                        variant="outline"
                        size="sm"
                        onClick={onSaveAndExit}
                        disabled={isSaving}
                        isLoading={isSaving}
                        loadingText="Saving..."
                        icon={<FiSave size={15} />}
                    >
                        Save & Exit
                    </MainButton>
                </div>
            </div>
        </header>
    );
}

OnboardingHeader.propTypes = {
    onSaveAndExit: PropTypes.func.isRequired,
    isSaving: PropTypes.bool,
};
