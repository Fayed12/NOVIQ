// local
import styles from "./PrivacyPage.module.css";
import MainButton from "../../../components/ui/button/MainButton";
import { selectTheme } from "../../../redux/themeSlice";

// react
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";

// redux
import { useSelector } from "react-redux";

// react-icons
import { FiArrowLeft, FiArrowUp, FiShield } from "react-icons/fi";

// gsap
import { gsap } from "gsap";

const PrivacyPage = () => {
    const navigate = useNavigate();
    const currentTheme = useSelector(selectTheme);
    const isDark = currentTheme === "dark";

    const [activeSection, setActiveSection] = useState("sec-1");
    const [showScrollTop, setShowScrollTop] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        window.scrollTo(0, 0);

        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);

            const sections = [
                "sec-1", "sec-2", "sec-3", "sec-4", "sec-5", "sec-6", "sec-7", "sec-8", "sec-9"
            ];
            
            for (const sectionId of sections) {
                const el = document.getElementById(sectionId);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    if (rect.top >= 0 && rect.top <= 150) {
                        setActiveSection(sectionId);
                        break;
                    } else if (rect.top < 0 && rect.bottom > 150) {
                        setActiveSection(sectionId);
                        break;
                    }
                }
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            tl.fromTo(
                `.${styles.navbar}`,
                { opacity: 0, y: -20 },
                { opacity: 1, y: 0, duration: 0.5, clearProps: "transform" }
            );

            tl.fromTo(
                `.${styles.iconWrapper}`,
                { opacity: 0, scale: 0.5 },
                { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.5)" },
                "-=0.3"
            );

            tl.fromTo(
                [`.${styles.pageTitle}`, `.${styles.pageSubtitle}`],
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.6, stagger: 0.15 },
                "-=0.4"
            );

            tl.fromTo(
                `.${styles.tocCard}`,
                { opacity: 0, x: -30 },
                { opacity: 1, x: 0, duration: 0.6 },
                "-=0.4"
            );

            tl.fromTo(
                `.${styles.docSection}`,
                { opacity: 0, y: 25 },
                { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 },
                "-=0.5"
            );
        }, containerRef);

        return () => ctx.revert();
    }, []);

    const scrollToSection = (id) => {
        const el = document.getElementById(id);
        if (el) {
            const offset = 90;
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = el.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
            setActiveSection(id);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const tocItems = [
        { id: "sec-1", label: "1. Information Collection" },
        { id: "sec-2", label: "2. How We Use Data" },
        { id: "sec-3", label: "3. Sharing and Disclosures" },
        { id: "sec-4", label: "4. Data Security" },
        { id: "sec-5", label: "5. Cookies & Storage" },
        { id: "sec-6", label: "6. Data Retention" },
        { id: "sec-7", label: "7. Children's Privacy" },
        { id: "sec-8", label: "8. Your Rights & Choices" },
        { id: "sec-9", label: "9. Updates & Contact Info" }
    ];

    const logoSrc = isDark ? "/dark-logo.png" : "/light-logo.png";

    return (
        <div ref={containerRef} className={styles.pageContainer}>
            {/* Header Navbar */}
            <header className={styles.navbar} id="privacy-navbar">
                <div className={styles.navLogo} onClick={() => navigate("/")} role="button" tabIndex={0}>
                    <img 
                        src={logoSrc} 
                        alt="NOVIQ Logo" 
                        className={styles.logoImg} 
                    />
                </div>
                <div className={styles.navActions}>
                    <MainButton
                        onClick={() => navigate("/")}
                        variant="ghost"
                        size="sm"
                        icon={<FiArrowLeft />}
                    >
                        Back to Home
                    </MainButton>
                </div>
            </header>

            {/* Hero Header */}
            <section className={styles.heroSection}>
                <div className={styles.heroGlow} aria-hidden="true" />
                <div className={styles.heroContent}>
                    <div className={styles.iconWrapper}>
                        <FiShield className={styles.heroIcon} />
                    </div>
                    <h1 className={styles.pageTitle}>Privacy Policy</h1>
                    <p className={styles.pageSubtitle}>
                        Effective August 2026 • NOVIQ Booking Platform
                    </p>
                </div>
            </section>

            {/* Main Content Layout */}
            <main className={styles.contentLayout}>
                {/* Sticky Left Sidebar (TOC) */}
                <aside className={styles.sidebar}>
                    <div className={styles.tocCard}>
                        <h2 className={styles.tocTitle}>Table of Contents</h2>
                        <nav className={styles.tocNav}>
                            {tocItems.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    className={`${styles.tocLink} ${activeSection === item.id ? styles.activeTocLink : ""}`}
                                    onClick={() => scrollToSection(item.id)}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Right Document Sections */}
                <article className={styles.documentBody}>
                    <section id="sec-1" className={styles.docSection}>
                        <h2 className={styles.sectionHeading}>1. Information Collection</h2>
                        <p>
                            NOVIQ respects your personal privacy. We collect information necessary to manage booking appointments, coordinate service schedules, and provide multi-tenant business dashboards.
                        </p>
                        <p>
                            We collect personal data directly when you:
                        </p>
                        <ul>
                            <li>Register an account as a customer, employee, or business owner.</li>
                            <li>Book appointments online (name, email, phone number, booking notes).</li>
                            <li>Configure business hours, branches, services, or team assignments.</li>
                            <li>Submit ratings, feedback, or customer support inquiries.</li>
                        </ul>
                    </section>

                    <section id="sec-2" className={styles.docSection}>
                        <h2 className={styles.sectionHeading}>2. How We Use Data</h2>
                        <p>
                            NOVIQ utilizes collected data strictly for:
                        </p>
                        <ul>
                            <li>Processing and confirming appointments in real-time.</li>
                            <li>Dispatching automated SMS and email reminders.</li>
                            <li>Enabling multi-branch schedule coordination and staff availability management.</li>
                            <li>Maintaining platform reliability, preventing fraudulent bookings, and securing accounts.</li>
                        </ul>
                    </section>

                    <section id="sec-3" className={styles.docSection}>
                        <h2 className={styles.sectionHeading}>3. Sharing and Disclosures</h2>
                        <p>
                            We never sell personal information to advertising brokers. Information is shared only with:
                        </p>
                        <ul>
                            <li><strong>Selected Business Providers:</strong> The specific business you book with receives your appointment contact information.</li>
                            <li><strong>Authorized Infrastructure Providers:</strong> Secure database, cloud hosting, and transactional email services.</li>
                            <li><strong>Legal Compliance:</strong> When required by enforceable statutory obligations.</li>
                        </ul>
                    </section>

                    <section id="sec-4" className={styles.docSection}>
                        <h2 className={styles.sectionHeading}>4. Data Security</h2>
                        <p>
                            We employ modern industry standards including TLS/HTTPS encryption in transit, AES-256 database encryption at rest, and PostgreSQL Row-Level Security (RLS) policies guaranteeing tenant isolation.
                        </p>
                    </section>

                    <section id="sec-5" className={styles.docSection}>
                        <h2 className={styles.sectionHeading}>5. Cookies & Local Storage</h2>
                        <p>
                            We utilize essential browser storage strictly for session persistence, active theme selection (light/dark mode), and user preferences. No cross-site advertising trackers are installed.
                        </p>
                    </section>

                    <section id="sec-6" className={styles.docSection}>
                        <h2 className={styles.sectionHeading}>6. Data Retention</h2>
                        <p>
                            Appointment logs and customer records are retained while your account remains active or as required by commercial regulations. Inactive guest records are purged following statutory expiration periods.
                        </p>
                    </section>

                    <section id="sec-7" className={styles.docSection}>
                        <h2 className={styles.sectionHeading}>7. Children's Privacy</h2>
                        <p>
                            The NOVIQ platform is designed for commercial business booking and is not directed at children under the age of 16. We do not knowingly collect personal data from minors without parental authorization.
                        </p>
                    </section>

                    <section id="sec-8" className={styles.docSection}>
                        <h2 className={styles.sectionHeading}>8. Your Rights & Choices</h2>
                        <p>
                            You have the right to request a copy of your personal data, rectify inaccuracies, or delete your account records at any time through Account Settings or by reaching out to support.
                        </p>
                    </section>

                    <section id="sec-9" className={styles.docSection}>
                        <h2 className={styles.sectionHeading}>9. Updates & Contact Info</h2>
                        <p>
                            For inquiries regarding this privacy policy or data protection, please contact our support team at <strong>support@noviq.app</strong>.
                        </p>
                    </section>
                </article>
            </main>

            {/* Scroll to top floating button */}
            {showScrollTop && (
                <button
                    type="button"
                    className={styles.scrollTopBtn}
                    onClick={scrollToTop}
                    aria-label="Scroll back to top"
                >
                    <FiArrowUp />
                </button>
            )}
        </div>
    );
};

export default PrivacyPage;
