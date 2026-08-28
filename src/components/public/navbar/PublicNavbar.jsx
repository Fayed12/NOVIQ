// local
import MainButton from "../../ui/button/MainButton";
import { selectTheme, toggleTheme } from "../../../redux/themeSlice";
import styles from "./PublicNavbar.module.css";

// react
import { useState } from "react";

// react-router
import { Link, useNavigate, useLocation } from "react-router";

// react-redux
import { useSelector, useDispatch } from "react-redux";

// react-icons
import {
    FiSun,
    FiMoon,
    FiMenu,
    FiX,
    FiArrowRight
} from "react-icons/fi";

const PublicNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const currentTheme = useSelector(selectTheme);
    const { user } = useSelector((state) => state.auth);
    const isDark = currentTheme === "dark";
    const isAuthenticated = !!user;

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const logoSrc = isDark ? "/dark-logo.png" : "/light-logo.png";

    const closeMobileMenu = () => setMobileMenuOpen(false);

    return (
        <header className={styles.navbar}>
            <div className={styles.navContainer}>
                {/* Brand Logo */}
                <Link to="/" className={styles.logoLink} aria-label="NOVIQ Home">
                    <img
                        src={logoSrc}
                        alt="NOVIQ Logo"
                        className={styles.logoImage}
                    />
                </Link>

                {/* Pure Typography Desktop Navigation Links (No Icons) */}
                <nav className={styles.desktopNav}>
                    <Link
                        to="/explore"
                        className={`${styles.navLink} ${
                            location.pathname.startsWith("/explore") ? styles.activeNavLink : ""
                        }`}
                    >
                        Explore
                    </Link>
                    <Link
                        to="/welcome"
                        className={`${styles.navLink} ${
                            location.pathname === "/welcome" ? styles.activeNavLink : ""
                        }`}
                    >
                        Platform Tour
                    </Link>
                </nav>

                {/* Actions Group */}
                <div className={styles.navActions}>
                    <button
                        type="button"
                        className={styles.themeToggleBtn}
                        onClick={() => dispatch(toggleTheme())}
                        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
                        title={`Switch to ${isDark ? "light" : "dark"} mode`}
                    >
                        {isDark ? <FiSun className={styles.sunIcon} /> : <FiMoon className={styles.moonIcon} />}
                    </button>

                    <div className={styles.desktopAuthBtns}>
                        {isAuthenticated ? (
                            <>
                                <MainButton
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate("/onboarding/category")}
                                >
                                    List Business
                                </MainButton>
                                <MainButton
                                    variant="primary"
                                    size="sm"
                                    onClick={() => navigate("/account")}
                                    rightIcon={<FiArrowRight />}
                                >
                                    My Space
                                </MainButton>
                            </>
                        ) : (
                            <>
                                <MainButton
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate("/login")}
                                >
                                    Sign In
                                </MainButton>
                                <MainButton
                                    variant="primary"
                                    size="sm"
                                    onClick={() => navigate("/onboarding/category")}
                                    rightIcon={<FiArrowRight />}
                                >
                                    List Business
                                </MainButton>
                            </>
                        )}
                    </div>

                    {/* Mobile hamburger button */}
                    <button
                        type="button"
                        className={styles.hamburgerBtn}
                        onClick={() => setMobileMenuOpen((prev) => !prev)}
                        aria-label="Toggle navigation menu"
                        aria-expanded={mobileMenuOpen}
                    >
                        {mobileMenuOpen ? <FiX /> : <FiMenu />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {mobileMenuOpen && (
                <div className={styles.mobileNavOverlay}>
                    <div className={styles.mobileNavLinks}>
                        <Link
                            to="/explore"
                            className={`${styles.mobileNavLink} ${
                                location.pathname.startsWith("/explore") ? styles.activeMobileNavLink : ""
                            }`}
                            onClick={closeMobileMenu}
                        >
                            Explore Marketplace
                        </Link>
                        <Link
                            to="/welcome"
                            className={`${styles.mobileNavLink} ${
                                location.pathname === "/welcome" ? styles.activeMobileNavLink : ""
                            }`}
                            onClick={closeMobileMenu}
                        >
                            Platform Guided Tour
                        </Link>

                        <div className={styles.mobileNavAuth}>
                            {isAuthenticated ? (
                                <MainButton
                                    variant="primary"
                                    size="md"
                                    fullWidth
                                    onClick={() => {
                                        closeMobileMenu();
                                        navigate("/account");
                                    }}
                                    rightIcon={<FiArrowRight />}
                                >
                                    My Space Hub
                                </MainButton>
                            ) : (
                                <>
                                    <MainButton
                                        variant="secondary"
                                        size="md"
                                        fullWidth
                                        onClick={() => {
                                            closeMobileMenu();
                                            navigate("/login");
                                        }}
                                    >
                                        Sign In
                                    </MainButton>
                                    <MainButton
                                        variant="primary"
                                        size="md"
                                        fullWidth
                                        onClick={() => {
                                            closeMobileMenu();
                                            navigate("/register");
                                        }}
                                        rightIcon={<FiArrowRight />}
                                    >
                                        List Business — Free
                                    </MainButton>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default PublicNavbar;
