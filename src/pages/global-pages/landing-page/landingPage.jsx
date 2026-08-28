// react
import { useState, useEffect, useRef } from "react";

// react-router
import { Link, useNavigate } from "react-router";

// redux
import { useSelector, useDispatch } from "react-redux";
import { selectTheme, toggleTheme } from "../../../redux/themeSlice";

// ui components
import MainButton from "../../../components/ui/button/MainButton";

// icons
import {
    FiSun,
    FiMoon,
    FiMenu,
    FiX,
    FiCheckCircle,
    FiTrendingUp,
    FiShield,
    FiArrowRight,
    FiChevronDown,
    FiLayers,
    FiUsers,
    FiMapPin,
    FiBell,
    FiCpu,
    FiZap,
    FiActivity,
    FiScissors,
    FiHome as FiHotel,
    FiHeart,
    FiCheck,
    FiCompass
} from "react-icons/fi";

// gsap
import { gsap } from "gsap";

// styles
import styles from "./landingPage.module.css";

const LandingPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const currentTheme = useSelector(selectTheme);
    const { user } = useSelector((state) => state.auth);
    const isDark = currentTheme === "dark";
    const isAuthenticated = !!user;

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [openFaqIndex, setOpenFaqIndex] = useState(0);
    const [activeIndustry, setActiveIndustry] = useState("medical");
    const [activeSection, setActiveSection] = useState("");

    // Active Section Scroll Spy Observer
    useEffect(() => {
        const sections = ["about", "features", "industries", "how-it-works", "faq"];
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            {
                rootMargin: "-20% 0px -70% 0px",
                threshold: 0
            }
        );

        sections.forEach((id) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    // Refs for GSAP animations
    const containerRef = useRef(null);
    const heroRef = useRef(null);

    // GSAP Opening Entrance Animation
    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            tl.fromTo(
                `.${styles.heroBadge}`,
                { y: -20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, clearProps: "transform" }
            )
            .fromTo(
                `.${styles.heroTitle}`,
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.7, clearProps: "transform" }
            )
            .fromTo(
                `.${styles.heroSubtitle}`,
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, clearProps: "transform" }
            )
            .fromTo(
                `.${styles.heroActions}`,
                { y: 15, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, clearProps: "transform" }
            )
            .fromTo(
                `.${styles.heroFeaturePills}`,
                { y: 10, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.4, clearProps: "transform" }
            )
            .fromTo(
                `.${styles.featureCard}`,
                { y: 25, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, clearProps: "transform" },
                "-=0.2"
            );
        }, containerRef);

        return () => ctx.revert();
    }, []);

    const industries = {
        medical: {
            name: "Medical & Clinics",
            badge: "Sequential Slot Engine",
            icon: <FiHeart />,
            color: "#0E7C86",
            resourceLabel: "Doctors & Specialists",
            serviceLabel: "Consultations & Procedures",
            capacityType: "Time-Slot Buffer Scheduling",
            features: [
                "Doctor-specific working hours with custom break buffer rules",
                "Patient medical notes and confidential history tracking",
                "Automated intake confirmation & SMS reminder pings",
                "Emergency overbooking buffer controls for urgent triage"
            ],
            metric1: "0",
            metric1Label: "Avg Consultation",
            metric2: "0",
            metric2Label: "On-Time Arrival"
        },
        salon: {
            name: "Salons & Wellness",
            badge: "Multi-Stylist Matrix",
            icon: <FiScissors />,
            color: "#B45309",
            resourceLabel: "Stylists & Therapists",
            serviceLabel: "Treatments & Packages",
            capacityType: "Multi-Resource Assignment",
            features: [
                "Individual stylist calendars with distinct commission profiles",
                "Service add-on stacking (Haircut + Colour + Blow-dry)",
                "Visual chair utilization & salon occupancy tracking",
                "Client preference cards with formula & styling archives"
            ],
            metric1: "0",
            metric1Label: "Avg Session",
            metric2: "0",
            metric2Label: "Client Satisfaction"
        },
        hotel: {
            name: "Boutique Hospitality",
            badge: "Inventory Pool Engine",
            icon: <FiHotel />,
            color: "#7C3AED",
            resourceLabel: "Suites & Rooms",
            serviceLabel: "Nightly Stays & Packages",
            capacityType: "Date-Range Inventory Pools",
            features: [
                "Dynamic room night pricing with seasonal rate rules",
                "Check-in & Check-out buffer windows for housekeeping",
                "Add-on packages (Spa access, Airport shuttle, Dining)",
                "Automated digital check-in receipts and access codes"
            ],
            metric1: "0",
            metric1Label: "Weekend Occupancy",
            metric2: "0",
            metric2Label: "Avg Stay Duration"
        },
        fitness: {
            name: "Fitness & Studios",
            badge: "Capacity & Class Engine",
            icon: <FiActivity />,
            color: "#DC2626",
            resourceLabel: "Trainers & Studio Spaces",
            serviceLabel: "Classes & Private Training",
            capacityType: "Group Capacity Headcount",
            features: [
                "Class roster headcount caps with automated waitlist queues",
                "Personal trainer 1-on-1 performance session booking",
                "Membership tier validation and class credit deduction",
                "Instant cancellation slot re-opening to waitlisted members"
            ],
            metric1: "0",
            metric1Label: "Capacity Filled",
            metric2: "0",
            metric2Label: "Waitlist Re-fill"
        }
    };

    const currentInd = industries[activeIndustry];

    const faqs = [
        {
            q: "How does NOVIQ handle different business types in one platform?",
            a: "NOVIQ operates on a Horizontal Core + Vertical Configuration paradigm. Rather than forcing you into rigid templates, NOVIQ's strategy plugins adapt automatically: running Sequential Slot calculations for healthcare and salons, Inventory Pools for hospitality, or Group Capacity engines for fitness."
        },
        {
            q: "Can I manage multiple branches and staff members?",
            a: "Yes! NOVIQ natively supports multi-branch operations. Business Owners can create unlimited branches, assign staff with granular RBAC permissions (Owner, Manager, Staff), and view aggregated revenue analytics across all locations."
        },
        {
            q: "How do customer accounts and guest bookings work?",
            a: "Customers can book instantly as guests with zero friction, receiving confirmation links via SMS/email. If they choose to create an account, all their appointments across different NOVIQ businesses automatically sync in their unified 'My Spaces' hub."
        },
        {
            q: "Is my business data secure and isolated?",
            a: "Completely. NOVIQ is built on enterprise PostgreSQL architecture with Row-Level Security (RLS). Every tenant's data, customer records, and financial analytics are isolated at the database level."
        },
        {
            q: "How long does it take to set up and go live?",
            a: "Our interactive 6-step onboarding wizard allows you to configure your category, services, staff, and policies in under 5 minutes. Your public storefront and booking widget are published instantly."
        },
        {
            q: "Can I embed the NOVIQ booking widget on my existing website?",
            a: "Yes. You can use your dedicated NOVIQ storefront URL, or embed our lightweight, responsive booking widget directly into any WordPress, Webflow, React, or custom website."
        }
    ];

    const logoSrc = isDark ? "/dark-logo.png" : "/light-logo.png";
    const footerLogo = isDark ? "/light-logo.png" : "/dark-logo.png";

    return (
        <div ref={containerRef} className={styles.landingWrapper}>
            {/* ── STICKY NAVBAR ──────────────────────────────────────── */}
            <header className={styles.navbar}>
                <div className={styles.navContainer}>
                    <Link to="/" className={styles.logoLink} aria-label="NOVIQ Home">
                        <img 
                            src={logoSrc} 
                            alt="NOVIQ Logo" 
                            className={styles.logoImage} 
                        />
                    </Link>

                    <nav className={styles.desktopNav}>
                        <Link to="/explore" className={styles.navLink}>
                            Explore
                        </Link>
                        <a 
                            href="#about" 
                            className={`${styles.navLink} ${activeSection === "about" ? styles.activeNavLink : ""}`}
                        >
                            About
                        </a>
                        <a 
                            href="#features" 
                            className={`${styles.navLink} ${activeSection === "features" ? styles.activeNavLink : ""}`}
                        >
                            Features
                        </a>
                        <a 
                            href="#industries" 
                            className={`${styles.navLink} ${activeSection === "industries" ? styles.activeNavLink : ""}`}
                        >
                            Industries
                        </a>
                        <a 
                            href="#how-it-works" 
                            className={`${styles.navLink} ${activeSection === "how-it-works" ? styles.activeNavLink : ""}`}
                        >
                            How It Works
                        </a>
                        <a 
                            href="#faq" 
                            className={`${styles.navLink} ${activeSection === "faq" ? styles.activeNavLink : ""}`}
                        >
                            FAQ
                        </a>
                    </nav>

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
                                <MainButton
                                    variant="primary"
                                    size="sm"
                                    onClick={() => navigate("/account")}
                                    rightIcon={<FiArrowRight />}
                                >
                                    My Space
                                </MainButton>
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
                                        onClick={() => navigate("/register")}
                                        rightIcon={<FiArrowRight />}
                                    >
                                        Claim Membership
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
                                className={styles.mobileNavLink}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Explore Marketplace
                            </Link>
                            <a 
                                href="#about" 
                                className={`${styles.mobileNavLink} ${activeSection === "about" ? styles.activeMobileNavLink : ""}`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                About
                            </a>
                            <a 
                                href="#features" 
                                className={`${styles.mobileNavLink} ${activeSection === "features" ? styles.activeMobileNavLink : ""}`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Features
                            </a>
                            <a 
                                href="#industries" 
                                className={`${styles.mobileNavLink} ${activeSection === "industries" ? styles.activeMobileNavLink : ""}`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Industries
                            </a>
                            <a 
                                href="#how-it-works" 
                                className={`${styles.mobileNavLink} ${activeSection === "how-it-works" ? styles.activeMobileNavLink : ""}`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                How It Works
                            </a>
                            <a 
                                href="#faq" 
                                className={`${styles.mobileNavLink} ${activeSection === "faq" ? styles.activeMobileNavLink : ""}`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                FAQ
                            </a>
                            
                            <div className={styles.mobileNavAuth}>
                                {isAuthenticated ? (
                                    <MainButton
                                        variant="primary"
                                        size="md"
                                        fullWidth
                                        onClick={() => {
                                            setMobileMenuOpen(false);
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
                                                setMobileMenuOpen(false);
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
                                                setMobileMenuOpen(false);
                                                navigate("/register");
                                            }}
                                            rightIcon={<FiArrowRight />}
                                        >
                                            Claim Membership — Free
                                        </MainButton>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* ── FULL WIDTH CENTERED HERO SECTION ────────────────────── */}
            <section ref={heroRef} className={styles.heroSection}>
                <div className={styles.heroGlowBackdrop} aria-hidden="true" />
                <div className={styles.heroGridLines} aria-hidden="true" />

                <div className={styles.heroContainer}>
                    <div className={styles.heroContent}>
                        <div className={styles.heroBadge}>
                            <FiZap className={styles.heroBadgeZap} />
                            <span>The Next-Generation Universal Booking OS</span>
                        </div>

                        <h1 className={styles.heroTitle}>
                            The Intelligent Operating System for <span className={styles.accentGradientText}>Appointment-Driven</span> Businesses.
                        </h1>

                        <p className={styles.heroSubtitle}>
                            Eliminate double-bookings, missed calls, and disjointed tools. NOVIQ unifies real-time calendar synchronization, staff scheduling, multi-branch management, and automated client retention into one adaptive platform.
                        </p>

                        <div className={styles.heroActions}>
                            <MainButton
                                variant="primary"
                                size="xl"
                                onClick={() => navigate("/onboarding/category")}
                                rightIcon={<FiArrowRight />}
                            >
                                Launch Your Business — Free
                            </MainButton>
                            <MainButton
                                variant="secondary"
                                size="xl"
                                onClick={() => navigate("/explore")}
                                icon={<FiCompass />}
                            >
                                Explore Businesses
                            </MainButton>
                        </div>

                        <div className={styles.heroFeaturePills}>
                            <div className={styles.featurePill}>
                                <FiCheckCircle className={styles.pillIcon} />
                                <span>No credit card required</span>
                            </div>
                            <div className={styles.featurePill}>
                                <FiCheckCircle className={styles.pillIcon} />
                                <span>Multi-tenant Postgres RLS</span>
                            </div>
                            <div className={styles.featurePill}>
                                <FiCheckCircle className={styles.pillIcon} />
                                <span>5-minute guided setup</span>
                            </div>
                        </div>

                        {/* Customer Ticket & Digital Pass Booking Hint Banner */}
                        <div className={styles.ticketHintBanner}>
                            <div className={styles.ticketHintLeft}>
                                <div className={styles.ticketHintIconBadge}>
                                    <FiCheckCircle />
                                </div>
                                <div className={styles.ticketHintText}>
                                    <span className={styles.ticketHintTag}>Public Discovery & Ticket Passes</span>
                                    <p className={styles.ticketHintTitle}>
                                        Looking to book an appointment or reserve a ticket pass? Explore verified spaces in Egypt and receive your instant digital QR pass.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => navigate("/explore")}
                                className={styles.ticketHintBtn}
                            >
                                <span>Explore & Book Passes</span>
                                <FiArrowRight />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── ABOUT US & OUR MISSION SECTION ─────────────────────── */}
            <section id="about" className={styles.aboutSection}>
                <div className={styles.sectionHeader}>
                    <div className={styles.sectionBadge}>Our Philosophy & Mission</div>
                    <h2 className={styles.sectionTitle}>Why We Engineered NOVIQ</h2>
                    <p className={styles.sectionSubtitle}>
                        Appointment-driven businesses have long been constrained by rigid software designed for only one vertical. NOVIQ breaks that barrier with an adaptive, unified scheduling architecture.
                    </p>
                </div>

                <div className={styles.aboutPillarsGrid}>
                    <div className={styles.aboutCard}>
                        <div className={styles.aboutCardIconWrap}>
                            <FiLayers />
                        </div>
                        <h3 className={styles.aboutCardTitle}>Universal Strategy Engine</h3>
                        <p className={styles.aboutCardDesc}>
                            Instead of rigid code branching, NOVIQ abstracts booking into universal <strong>Bookable Resources</strong> and <strong>Time Slots</strong>. Healthcare, salons, hotels, and fitness operate on the same rock-solid orchestrator with vertical configuration.
                        </p>
                    </div>

                    <div className={styles.aboutCard}>
                        <div className={styles.aboutCardIconWrap}>
                            <FiUsers />
                        </div>
                        <h3 className={styles.aboutCardTitle}>Unified Client "My Spaces"</h3>
                        <p className={styles.aboutCardDesc}>
                            Customers shouldn't need 10 different accounts for their doctor, hairstylist, and hotel reservations. NOVIQ provides customers with a consolidated hub to book, reschedule, and review all their appointments in one place.
                        </p>
                    </div>

                    <div className={styles.aboutCard}>
                        <div className={styles.aboutCardIconWrap}>
                            <FiShield />
                        </div>
                        <h3 className={styles.aboutCardTitle}>Enterprise-Grade Isolation</h3>
                        <p className={styles.aboutCardDesc}>
                            Built on PostgreSQL Row-Level Security (RLS) with full tenant isolation, transactional ACID slot locks, and real-time WebSocket syncing to guarantee zero double-bookings or data leakages.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── BALANCED 3x2 FEATURE GRID ──────────────────────────── */}
            <section id="features" className={styles.featuresSection}>
                <div className={styles.sectionHeader}>
                    <div className={styles.sectionBadge}>Platform Capabilities</div>
                    <h2 className={styles.sectionTitle}>Engineered for Operational Mastery</h2>
                    <p className={styles.sectionSubtitle}>
                        Everything your business needs to scale appointments, coordinate team schedules, and elevate customer experiences.
                    </p>
                </div>

                <div className={styles.featuresGrid}>
                    {/* Card 1: Dynamic Strategy */}
                    <div className={styles.featureCard}>
                        <div className={styles.featureCardHeader}>
                            <div className={styles.featureIcon}>
                                <FiCpu />
                            </div>
                            <span className={styles.featurePill}>Algorithm Engine</span>
                        </div>
                        <h3 className={styles.featureTitle}>Sequential Slots & Pools</h3>
                        <p className={styles.featureDesc}>
                            Seamlessly handles discrete 15/30/60-minute appointment slots with buffer windows, as well as date-range inventory capacity pooling.
                        </p>
                    </div>

                    {/* Card 2: Multi-Branch */}
                    <div className={styles.featureCard}>
                        <div className={styles.featureCardHeader}>
                            <div className={styles.featureIcon}>
                                <FiMapPin />
                            </div>
                            <span className={styles.featurePill}>Multi-Location</span>
                        </div>
                        <h3 className={styles.featureTitle}>Multi-Branch Operations</h3>
                        <p className={styles.featureDesc}>
                            Manage flagship hubs and regional branches from a single unified login with location-specific working hours and staff assignments.
                        </p>
                    </div>

                    {/* Card 3: RBAC Staff Permissions */}
                    <div className={styles.featureCard}>
                        <div className={styles.featureCardHeader}>
                            <div className={styles.featureIcon}>
                                <FiUsers />
                            </div>
                            <span className={styles.featurePill}>Role Security</span>
                        </div>
                        <h3 className={styles.featureTitle}>Granular Staff Roles</h3>
                        <p className={styles.featureDesc}>
                            Separate access for Owners, Branch Managers, and Employees. Staff members get direct access to their assigned resource calendars.
                        </p>
                    </div>

                    {/* Card 4: Automated Retention & Notifications */}
                    <div className={styles.featureCard}>
                        <div className={styles.featureCardHeader}>
                            <div className={styles.featureIcon}>
                                <FiBell />
                            </div>
                            <span className={styles.featurePill}>Retention</span>
                        </div>
                        <h3 className={styles.featureTitle}>Automated Communications</h3>
                        <p className={styles.featureDesc}>
                            Instant booking confirmation receipts, calendar event invites, and automated pre-appointment SMS/email reminders.
                        </p>
                    </div>

                    {/* Card 5: Real-Time Analytics */}
                    <div className={styles.featureCard}>
                        <div className={styles.featureCardHeader}>
                            <div className={styles.featureIcon}>
                                <FiTrendingUp />
                            </div>
                            <span className={styles.featurePill}>Intelligence</span>
                        </div>
                        <h3 className={styles.featureTitle}>Occupancy & Revenue Analytics</h3>
                        <p className={styles.featureDesc}>
                            Track capacity utilization, employee booking volume, revenue pacing, and no-show statistics with exportable reporting dashboards.
                        </p>
                    </div>

                    {/* Card 6: Database Security */}
                    <div className={styles.featureCard}>
                        <div className={styles.featureCardHeader}>
                            <div className={styles.featureIcon}>
                                <FiShield />
                            </div>
                            <span className={styles.featurePill}>Architecture</span>
                        </div>
                        <h3 className={styles.featureTitle}>Postgres RLS Isolation</h3>
                        <p className={styles.featureDesc}>
                            Row-Level Security on every table ensures strict multi-tenant boundary enforcement and complete compliance across your ecosystem.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── INTERACTIVE INDUSTRY VERTICAL SHOWCASE ─────────────── */}
            <section id="industries" className={styles.industriesSection}>
                <div className={styles.sectionHeader}>
                    <div className={styles.sectionBadge}>Tailored Verticals</div>
                    <h2 className={styles.sectionTitle}>Built to Adapt to Your Industry</h2>
                    <p className={styles.sectionSubtitle}>
                        Discover how NOVIQ dynamically reconfigures terminology, booking models, and dashboard metrics for your specific business.
                    </p>
                </div>

                <div className={styles.industriesContainer}>
                    {/* Industry Selector Tabs */}
                    <div className={styles.industryTabsRow}>
                        {Object.keys(industries).map((key) => {
                            const ind = industries[key];
                            const isActive = activeIndustry === key;
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    className={`${styles.industryTabButton} ${isActive ? styles.activeIndustryTab : ""}`}
                                    onClick={() => setActiveIndustry(key)}
                                >
                                    <span className={styles.tabIcon}>{ind.icon}</span>
                                    <span>{ind.name}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Active Industry Showcase Card */}
                    <div className={styles.industryDetailCard}>
                        <div className={styles.industryLeftCol}>
                            <div className={styles.indBadgeRow}>
                                <span className={styles.indBadge} style={{ backgroundColor: `${currentInd.color}20`, color: currentInd.color }}>
                                    {currentInd.badge}
                                </span>
                            </div>

                            <h3 className={styles.indTitle}>{currentInd.name}</h3>
                            
                            <div className={styles.indVocabularyMatrix}>
                                <div className={styles.vocabItem}>
                                    <span className={styles.vocabKey}>Resource Model:</span>
                                    <span className={styles.vocabVal}>{currentInd.resourceLabel}</span>
                                </div>
                                <div className={styles.vocabItem}>
                                    <span className={styles.vocabKey}>Service Catalog:</span>
                                    <span className={styles.vocabVal}>{currentInd.serviceLabel}</span>
                                </div>
                                <div className={styles.vocabItem}>
                                    <span className={styles.vocabKey}>Scheduling Type:</span>
                                    <span className={styles.vocabVal}>{currentInd.capacityType}</span>
                                </div>
                            </div>

                            <ul className={styles.indFeaturesList}>
                                {currentInd.features.map((feat, idx) => (
                                    <li key={idx}>
                                        <FiCheck className={styles.checkBullet} style={{ color: currentInd.color }} />
                                        <span>{feat}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className={styles.indMetricsBox}>
                                <div className={styles.indMetricItem}>
                                    <span className={styles.indMetricValue} style={{ color: currentInd.color }}>{currentInd.metric1}</span>
                                    <span className={styles.indMetricLabel}>{currentInd.metric1Label}</span>
                                </div>
                                <div className={styles.indMetricItem}>
                                    <span className={styles.indMetricValue} style={{ color: currentInd.color }}>{currentInd.metric2}</span>
                                    <span className={styles.indMetricLabel}>{currentInd.metric2Label}</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.industryRightCol}>
                            <div className={styles.industryWidgetSimulation}>
                                <div className={styles.widgetHeaderSim}>
                                    <span className={styles.widgetDot} />
                                    <span>Storefront Preview • {currentInd.name}</span>
                                </div>
                                <div className={styles.widgetBodySim}>
                                    <div className={styles.simBanner} style={{ borderColor: currentInd.color }}>
                                        <div className={styles.simIconCircle} style={{ color: currentInd.color, backgroundColor: `${currentInd.color}15` }}>
                                            {currentInd.icon}
                                        </div>
                                        <div>
                                            <h4>Instant Live Availability</h4>
                                            <p>Configured for {currentInd.resourceLabel}</p>
                                        </div>
                                    </div>
                                    
                                    <div className={styles.simSlotPreview}>
                                        <div className={styles.simSlotPill}>✓ 1-Click Client Booking</div>
                                        <div className={styles.simSlotPill}>✓ Automated Reminder SMS</div>
                                        <div className={styles.simSlotPill}>✓ Real-Time Calendar Sync</div>
                                        <div className={styles.simSlotPill}>✓ Multi-Branch Routing</div>
                                    </div>

                                    <MainButton
                                        variant="primary"
                                        size="md"
                                        fullWidth
                                        onClick={() => navigate("/register")}
                                        rightIcon={<FiArrowRight />}
                                    >
                                        Start Your {currentInd.name} Storefront
                                    </MainButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS: 3-STEP JOURNEY ───────────────────────── */}
            <section id="how-it-works" className={styles.howItWorksSection}>
                <div className={styles.sectionHeader}>
                    <div className={styles.sectionBadge}>Frictionless Deployment</div>
                    <h2 className={styles.sectionTitle}>Live in 3 Simple Steps</h2>
                    <p className={styles.sectionSubtitle}>
                        From registration to receiving your first confirmed appointment in under five minutes.
                    </p>
                </div>

                <div className={styles.stepsContainer}>
                    <div className={styles.stepCard}>
                        <div className={styles.stepNumberBadge}>01</div>
                        <h3 className={styles.stepTitle}>Configure & Onboard</h3>
                        <p className={styles.stepDesc}>
                            Choose your business category (Clinic, Salon, Hotel, Fitness). Set your operating hours, branch locations, and staff assignments in the guided wizard.
                        </p>
                    </div>

                    <div className={styles.stepCard}>
                        <div className={styles.stepNumberBadge}>02</div>
                        <h3 className={styles.stepTitle}>Publish & Embed</h3>
                        <p className={styles.stepDesc}>
                            Get a dedicated public booking storefront and an embeddable widget code snippet to seamlessly integrate into your existing website or social channels.
                        </p>
                    </div>

                    <div className={styles.stepCard}>
                        <div className={styles.stepNumberBadge}>03</div>
                        <h3 className={styles.stepTitle}>Orchestrate & Grow</h3>
                        <p className={styles.stepDesc}>
                            Accept real-time bookings, let clients self-manage appointments, eliminate no-shows with automated reminders, and analyze revenue metrics.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── PLATFORM STATS COUNTER ─────────────────────────────── */}
            <section className={styles.statsSection}>
                <div className={styles.statsContainer}>
                    <div className={styles.statItem}>
                        <div className={styles.statNumber}>0</div>
                        <div className={styles.statLabel}>Active Businesses</div>
                    </div>
                    <div className={styles.statItem}>
                        <div className={styles.statNumber}>0</div>
                        <div className={styles.statLabel}>Appointments Orchestrated</div>
                    </div>
                    <div className={styles.statItem}>
                        <div className={styles.statNumber}>0</div>
                        <div className={styles.statLabel}>System Uptime SLA</div>
                    </div>
                    <div className={styles.statItem}>
                        <div className={styles.statNumber}>0</div>
                        <div className={styles.statLabel}>Average No-Show Drop</div>
                    </div>
                </div>
            </section>

            {/* ── FAQ ACCORDION SECTION ──────────────────────────────── */}
            <section id="faq" className={styles.faqSection}>
                <div className={styles.sectionHeader}>
                    <div className={styles.sectionBadge}>Clear Answers</div>
                    <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
                    <p className={styles.sectionSubtitle}>
                        Have questions before getting started? Find all the details on how NOVIQ functions below.
                    </p>
                </div>

                <div className={styles.faqContainer}>
                    {faqs.map((faq, idx) => {
                        const isOpen = openFaqIndex === idx;
                        return (
                            <div
                                key={idx}
                                className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ""}`}
                            >
                                <button
                                    type="button"
                                    className={styles.faqQuestionBtn}
                                    onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                                    aria-expanded={isOpen}
                                >
                                    <span>{faq.q}</span>
                                    <FiChevronDown className={styles.faqChevron} />
                                </button>
                                <div className={styles.faqAnswerWrapper}>
                                    <div className={styles.faqAnswerInner}>
                                        <div className={styles.faqAnswer}>
                                            <p>{faq.a}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ── HIGH-CONVERTING CTA BANNER ─────────────────────────── */}
            <section className={styles.ctaBannerSection}>
                <div className={styles.ctaBannerGlow} aria-hidden="true" />
                <div className={styles.ctaBannerContainer}>
                    <h2 className={styles.ctaBannerTitle}>
                        Ready to Transform Your Business Operations?
                    </h2>
                    <p className={styles.ctaBannerSubtitle}>
                        Join modern clinics, salons, hotels, and studios using NOVIQ. Set up your live booking engine in under 5 minutes.
                    </p>
                    <div className={styles.ctaBannerButtons}>
                        <MainButton
                            variant="primary"
                            size="xl"
                            onClick={() => navigate(isAuthenticated ? "/account" : "/register")}
                            rightIcon={<FiArrowRight />}
                        >
                            {isAuthenticated ? "Enter Account Hub" : "Get Started for Free"}
                        </MainButton>
                        <MainButton
                            variant="secondary"
                            size="xl"
                            onClick={() => navigate(isAuthenticated ? "/account" : "/login")}
                        >
                            {isAuthenticated ? "Manage Bookings" : "Sign In to Space"}
                        </MainButton>
                    </div>
                </div>
            </section>

            {/* ── MODERN & PROFESSIONAL FOOTER ───────────────────────── */}
            <footer className={styles.footer}>
                <div className={styles.footerContainer}>
                    <div className={styles.footerBrandCol}>
                        <img 
                            src={footerLogo} 
                            alt="NOVIQ Logo" 
                            className={styles.footerLogo} 
                        />
                        <p className={styles.footerTagline}>
                            The universal operating system for appointment-driven businesses. High-performance scheduling, staff orchestration, and multi-tenant management.
                        </p>
                        <div className={styles.footerStatusBadge}>
                            <span className={styles.statusDotGreen} />
                            <span>All Systems Operational</span>
                        </div>
                    </div>

                    <div className={styles.footerNavGroup}>
                        <h4 className={styles.footerGroupTitle}>Platform</h4>
                        <ul className={styles.footerLinksList}>
                            <li><a href="#about">About NOVIQ</a></li>
                            <li><a href="#features">Capabilities</a></li>
                            <li><a href="#industries">Industry Solutions</a></li>
                            <li><a href="#how-it-works">How It Works</a></li>
                            <li><a href="#faq">Support & FAQ</a></li>
                        </ul>
                    </div>

                    <div className={styles.footerNavGroup}>
                        <h4 className={styles.footerGroupTitle}>Access</h4>
                        <ul className={styles.footerLinksList}>
                            <li><Link to="/register">Create Account</Link></li>
                            <li><Link to="/login">Sign In</Link></li>
                            <li><Link to="/welcome">Platform Tour</Link></li>
                            <li><Link to="/offline">Network Status</Link></li>
                        </ul>
                    </div>

                    <div className={styles.footerNavGroup}>
                        <h4 className={styles.footerGroupTitle}>Legal</h4>
                        <ul className={styles.footerLinksList}>
                            <li><Link to="/privacy">Privacy Policy</Link></li>
                            <li><Link to="/terms">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                <div className={styles.footerBottom}>
                    <p>© {new Date().getFullYear()} NOVIQ SaaS Platform. All rights reserved.</p>
                    <div className={styles.footerLegalLinks}>
                        <Link to="/privacy">Privacy Policy</Link>
                        <span>•</span>
                        <Link to="/terms">Terms of Service</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;