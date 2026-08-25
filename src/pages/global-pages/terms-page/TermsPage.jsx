// local
import styles from "./TermsPage.module.css";
import MainButton from "../../../components/ui/button/MainButton";
import { selectTheme } from "../../../redux/themeSlice";

// react
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";

// redux
import { useSelector } from "react-redux";

// react-icons
import { FiArrowLeft, FiArrowUp, FiFileText } from "react-icons/fi";

// gsap
import { gsap } from "gsap";

const TermsPage = () => {
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
        { id: "sec-1", label: "1. Acceptance of Terms" },
        { id: "sec-2", label: "2. Account Registration" },
        { id: "sec-3", label: "3. Booking & Cancellations" },
        { id: "sec-4", label: "4. Business Tenant Terms" },
        { id: "sec-5", label: "5. Customer Code of Conduct" },
        { id: "sec-6", label: "6. Platform Availability" },
        { id: "sec-7", label: "7. Intellectual Property" },
        { id: "sec-8", label: "8. Limitation of Liability" },
        { id: "sec-9", label: "9. Governing Law & Contact" }
    ];

    const logoSrc = isDark ? "/dark-logo.png" : "/light-logo.png";

    return (
        <div ref={containerRef} className={styles.pageContainer}>
            {/* Header Navbar */}
            <header className={styles.navbar} id="terms-navbar">
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
                        <FiFileText className={styles.heroIcon} />
                    </div>
                    <h1 className={styles.pageTitle}>Terms of Service</h1>
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
                        <h2 className={styles.sectionHeading}>1. Acceptance of Terms</h2>
                        <p>
                            Welcome to NOVIQ. By accessing or using the NOVIQ software application, booking widgets, or web services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please discontinue using the platform immediately.
                        </p>
                    </section>

                    <section id="sec-2" className={styles.docSection}>
                        <h2 className={styles.sectionHeading}>2. Account Registration & Roles</h2>
                        <p>
                            To access business management or unified customer spaces, you must register an account with a valid email address. You are responsible for safeguarding your login credentials.
                        </p>
                        <p>
                            NOVIQ supports multiple user roles:
                        </p>
                        <ul>
                            <li><strong>Customers:</strong> Book, reschedule, and manage appointments across businesses.</li>
                            <li><strong>Business Owners:</strong> Set up tenants, branch locations, service menus, and staff permissions.</li>
                            <li><strong>Managers & Staff:</strong> View designated calendars, fulfill appointments, and update status codes.</li>
                        </ul>
                    </section>

                    <section id="sec-3" className={styles.docSection}>
                        <h2 className={styles.sectionHeading}>3. Booking & Cancellation Rules</h2>
                        <p>
                            Each business on NOVIQ configures their individual appointment rules, buffer times, deposit terms, and cancellation policies. When booking an appointment:
                        </p>
                        <ul>
                            <li>Customers must arrive at the scheduled time or provide timely notice within the cancellation window.</li>
                            <li>Cancellations requested outside the permitted notice window may forfeit deposits or incur late fees per the business's policy.</li>
                            <li>NOVIQ provides the booking infrastructure but is not liable for direct service disputes between businesses and clients.</li>
                        </ul>
                    </section>

                    <section id="sec-4" className={styles.docSection}>
                        <h2 className={styles.sectionHeading}>4. Business Tenant Terms</h2>
                        <p>
                            Business owners agree to accurately represent their services, working hours, licensing credentials, and pricing. Businesses must honor confirmed bookings or promptly notify customers in the event of unforeseen rescheduling.
                        </p>
                    </section>

                    <section id="sec-5" className={styles.docSection}>
                        <h2 className={styles.sectionHeading}>5. Customer Code of Conduct</h2>
                        <p>
                            Users agree not to make abusive or fake reservations, submit defamatory reviews, or attempt to circumvent security protections or rate limits on NOVIQ.
                        </p>
                    </section>

                    <section id="sec-6" className={styles.docSection}>
                        <h2 className={styles.sectionHeading}>6. Platform Availability & Uptime</h2>
                        <p>
                            While NOVIQ targets 99.9% uptime, we do not warrant uninterrupted operation during scheduled maintenance windows, emergency server upgrades, or upstream network disruptions.
                        </p>
                    </section>

                    <section id="sec-7" className={styles.docSection}>
                        <h2 className={styles.sectionHeading}>7. Intellectual Property</h2>
                        <p>
                            All software, user interface designs, trademarks, and documentation related to NOVIQ remain the exclusive intellectual property of NOVIQ Inc.
                        </p>
                    </section>

                    <section id="sec-8" className={styles.docSection}>
                        <h2 className={styles.sectionHeading}>8. Limitation of Liability</h2>
                        <p>
                            To the maximum extent permitted by applicable law, NOVIQ Inc. shall not be liable for indirect, incidental, or consequential damages resulting from missed appointments or business service issues.
                        </p>
                    </section>

                    <section id="sec-9" className={styles.docSection}>
                        <h2 className={styles.sectionHeading}>9. Governing Law & Contact</h2>
                        <p>
                            These terms shall be governed by applicable commercial laws. If you have any inquiries regarding these terms, please contact our support team at <strong>legal@noviq.app</strong>.
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

export default TermsPage;
