// local
import PublicNavbar from "../../../components/public/navbar/PublicNavbar";
import PublicFooter from "../../../components/public/footer/PublicFooter";
import ServiceCard from "../../../components/public/cards/ServiceCard";
import MainButton from "../../../components/ui/button/MainButton";
import { tenantService } from "../../../services/tenantService";
import styles from "./TenantStorefrontPage.module.css";

// react
import { useState, useEffect, useRef } from "react";

// react-router
import { useParams, useNavigate } from "react-router";

// react-icons
import {
    FiStar,
    FiMapPin,
    FiPhone,
    FiMail,
    FiClock,
    FiCheckCircle,
    FiShield,
    FiArrowRight,
    FiCalendar,
    FiShare2,
    FiBookmark,
    FiImage,
    FiUserCheck,
    FiCompass,
    FiLoader
} from "react-icons/fi";

// react-toastify
import { toast } from "react-toastify";

// gsap
import { gsap } from "gsap";

const TenantStorefrontPage = () => {
    const { tenantSlug } = useParams();
    const navigate = useNavigate();
    const containerRef = useRef(null);

    const [liveTenant, setLiveTenant] = useState(null);
    const [liveServices, setLiveServices] = useState([]);
    const [liveResources, setLiveResources] = useState([]);
    const [liveReviews, setLiveReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeGalleryImg, setActiveGalleryImg] = useState(null);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const loadTenantData = async () => {
            setIsLoading(true);
            try {
                // Query live database for tenant with relations
                const data = await tenantService.getBySlug(tenantSlug);
                if (data && isMounted) {
                    setLiveTenant(data);
                    setLiveServices(data.services || []);
                    setLiveResources(data.resources || []);
                    setLiveReviews(data.reviews || []);
                } else if (isMounted) {
                    setLiveTenant(null);
                }
            } catch (err) {
                console.error("Error loading live tenant from database:", err);
                if (isMounted) setLiveTenant(null);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        loadTenantData();
        return () => { isMounted = false; };
    }, [tenantSlug]);

    const tenant = liveTenant || {};

    // Accent color determination
    const accentColor =
        tenant.category_slug === "clinics"
            ? "#0E7C86"
            : tenant.category_slug === "salons"
            ? "#B45309"
            : tenant.category_slug === "hotels"
            ? "#7C3AED"
            : tenant.category_slug === "fitness"
            ? "#DC2626"
            : "#1E3A8A";

    // GSAP Entrance
    useEffect(() => {
        if (!liveTenant) return;
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            tl.fromTo(
                `.${styles.heroCard}`,
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6 }
            )
            .fromTo(
                `.${styles.sectionBlock}`,
                { y: 25, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, stagger: 0.1 },
                "-=0.3"
            );
        }, containerRef);

        return () => ctx.revert();
    }, [liveTenant]);

    const handleShare = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href);
            toast.success("Storefront link copied to clipboard!");
        }
    };

    const handleToggleSave = () => {
        setIsSaved(!isSaved);
        if (!isSaved) {
            toast.success(`${tenant.name || "Space"} added to My Spaces!`);
        } else {
            toast.info(`${tenant.name || "Space"} removed from My Spaces.`);
        }
    };

    if (isLoading) {
        return (
            <div className={styles.storefrontWrapper}>
                <PublicNavbar />
                <div className={styles.loadingContainer}>
                    <FiLoader className={styles.spinner} />
                    <p>Retrieving Space Storefront...</p>
                </div>
                <PublicFooter />
            </div>
        );
    }

    if (!liveTenant || !liveTenant.name) {
        return (
            <div className={styles.storefrontWrapper}>
                <PublicNavbar />
                <div className={styles.notFoundContainer}>
                    <FiCompass className={styles.notFoundIcon} />
                    <h2>Space Storefront Not Found</h2>
                    <p>The business space you requested is not published or has been moved.</p>
                    <MainButton variant="primary" size="md" onClick={() => navigate("/explore")}>
                        Explore Available Spaces
                    </MainButton>
                </div>
                <PublicFooter />
            </div>
        );
    }

    return (
        <div
            className={styles.storefrontWrapper}
            ref={containerRef}
            style={{ "--tenant-accent": accentColor }}
        >
            <PublicNavbar />

            {/* Tenant Sticky Sub-bar */}
            <div className={styles.tenantStickyBar}>
                <div className={styles.stickyInner}>
                    <div className={styles.stickyBrand}>
                        {tenant.logo_image && (
                            <img src={tenant.logo_image} alt="" className={styles.stickyLogo} />
                        )}
                        <div>
                            <span className={styles.stickyName}>{tenant.name}</span>
                            <span className={styles.stickyCat}>{tenant.category_name}</span>
                        </div>
                    </div>

                    <div className={styles.stickyActions}>
                        <button
                            type="button"
                            onClick={handleToggleSave}
                            className={`${styles.saveBtn} ${isSaved ? styles.savedActive : ""}`}
                            title="Save to My Spaces"
                        >
                            <FiBookmark />
                            <span>{isSaved ? "Saved" : "Save"}</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleShare}
                            className={styles.shareBtn}
                            title="Share storefront"
                        >
                            <FiShare2 />
                        </button>
                        <MainButton
                            variant="primary"
                            size="sm"
                            onClick={() => navigate(`/${tenant.slug}/book`)}
                            rightIcon={<FiCalendar />}
                        >
                            Book Appointment
                        </MainButton>
                    </div>
                </div>
            </div>

            {/* Hero Cover Card */}
            <section className={styles.heroSection}>
                <div className={styles.heroInner}>
                    <div className={styles.heroCard}>
                        <div className={styles.coverWrapper}>
                            <img
                                src={tenant.cover_image}
                                alt={tenant.name}
                                className={styles.coverImage}
                            />
                            <div className={styles.coverGradient} />

                            <div className={styles.heroBadgesTop}>
                                <span className={styles.categoryPill}>
                                    {tenant.category_name}
                                </span>
                                {tenant.is_verified && (
                                    <span className={styles.verifiedBadge}>
                                        <FiCheckCircle className={styles.badgeIcon} />
                                        <span>Verified Partner</span>
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className={styles.identityRow}>
                            <div className={styles.logoAndTitle}>
                                <div className={styles.avatarFrame}>
                                    <img
                                        src={tenant.logo_image}
                                        alt={`${tenant.name} logo`}
                                        className={styles.avatarImg}
                                    />
                                </div>
                                <div className={styles.titleArea}>
                                    <h1 className={styles.tenantName}>{tenant.name}</h1>
                                    <p className={styles.tenantTagline}>{tenant.tagline}</p>
                                </div>
                            </div>

                            <div className={styles.heroRightActions}>
                                <div className={styles.ratingBox}>
                                    <div className={styles.ratingScore}>
                                        <FiStar className={styles.starFill} />
                                        <span>{(tenant.rating || 5.0).toFixed(1)}</span>
                                    </div>
                                    <span className={styles.reviewTotal}>
                                        {tenant.review_count || liveReviews.length || 0} client reviews
                                    </span>
                                </div>

                                <MainButton
                                    variant="primary"
                                    size="lg"
                                    onClick={() => navigate(`/${tenant.slug}/book`)}
                                    rightIcon={<FiArrowRight />}
                                    className={styles.primaryBookBtn}
                                >
                                    Book Now
                                </MainButton>
                            </div>
                        </div>

                        {/* Meta Highlights Strip */}
                        <div className={styles.metaStrip}>
                            <div className={styles.metaItem}>
                                <FiMapPin className={styles.stripIcon} />
                                <span>{tenant.address || tenant.city}</span>
                            </div>
                            <div className={styles.metaItem}>
                                <FiClock className={styles.stripIcon} />
                                <span>{tenant.open_hours || "Open Today"}</span>
                            </div>
                            {tenant.phone && (
                                <div className={styles.metaItem}>
                                    <FiPhone className={styles.stripIcon} />
                                    <a href={`tel:${tenant.phone}`} className={styles.metaLink}>
                                        {tenant.phone}
                                    </a>
                                </div>
                            )}
                            <div className={styles.metaItemPrice}>
                                <span className={styles.priceTierTag}>{tenant.price_range || "$$"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content Layout */}
            <main className={styles.mainLayout}>
                <div className={styles.mainInner}>
                    <div className={styles.contentColumns}>
                        {/* Left Main Content */}
                        <div className={styles.leftCol}>
                            {/* About Section */}
                            <section className={styles.sectionBlock}>
                                <h2 className={styles.blockTitle}>About Our Space</h2>
                                <p className={styles.aboutParagraph}>{tenant.description}</p>
                            </section>

                            {/* Gallery Preview (Lightbox Trigger) */}
                            {tenant.gallery && tenant.gallery.length > 0 && (
                                <section className={styles.sectionBlock}>
                                    <div className={styles.blockHeader}>
                                        <h2 className={styles.blockTitle}>Space Gallery</h2>
                                        <span className={styles.galleryCount}>
                                            <FiImage /> {tenant.gallery.length} Photos
                                        </span>
                                    </div>

                                    <div className={styles.galleryGrid}>
                                        {tenant.gallery.map((imgUrl, i) => (
                                            <div
                                                key={i}
                                                className={styles.galleryThumbWrapper}
                                                onClick={() => setActiveGalleryImg(imgUrl)}
                                            >
                                                <img
                                                    src={imgUrl}
                                                    alt={`${tenant.name} facility ${i + 1}`}
                                                    className={styles.galleryThumb}
                                                    loading="lazy"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Available Services / Treatments Section */}
                            <section className={styles.sectionBlock}>
                                <div className={styles.blockHeader}>
                                    <div>
                                        <h2 className={styles.blockTitle}>
                                            Available {tenant.service_label || "Services"}
                                        </h2>
                                        <p className={styles.blockSub}>
                                            Select a service to begin your instant booking.
                                        </p>
                                    </div>
                                </div>

                                {liveServices.length > 0 ? (
                                    <div className={styles.servicesGrid}>
                                        {liveServices.map((srv) => (
                                            <ServiceCard
                                                key={srv.id}
                                                service={srv}
                                                isSelected={false}
                                                onSelect={() => navigate(`/${tenant.slug}/book?serviceId=${srv.id}`)}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ padding: "24px", background: "var(--color-surface-white, #fff)", border: "1px dashed var(--color-border, #e2e8f0)", borderRadius: "12px", textAlign: "center", color: "var(--color-ink-600, #475569)" }}>
                                        <p style={{ margin: 0, fontSize: "14px", fontWeight: 500 }}>No active services listed currently for this space.</p>
                                    </div>
                                )}
                            </section>

                            {/* Specialists / Team Section */}
                            {liveResources && liveResources.length > 0 && (
                                <section className={styles.sectionBlock}>
                                    <h2 className={styles.blockTitle}>
                                        Our {tenant.resource_label || "Specialists"}
                                    </h2>
                                    <div className={styles.teamGrid}>
                                        {liveResources.map((res) => (
                                            <div key={res.id} className={styles.teamCard}>
                                                {res.avatar_url ? (
                                                    <img
                                                        src={res.avatar_url}
                                                        alt={res.name}
                                                        className={styles.teamAvatar}
                                                    />
                                                ) : (
                                                    <div className={styles.teamAvatarPlaceholder}>
                                                        <FiUserCheck />
                                                    </div>
                                                )}
                                                <div className={styles.teamInfo}>
                                                    <h4 className={styles.teamName}>{res.name}</h4>
                                                    <span className={styles.teamRole}>{res.role_title}</span>
                                                    {res.rating && (
                                                        <div className={styles.teamRating}>
                                                            <FiStar className={styles.starSmall} />
                                                            <span>{res.rating}</span>
                                                            {res.experience_years && (
                                                                <span className={styles.expYears}>
                                                                    • {res.experience_years} yrs exp
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Client Reviews */}
                            {liveReviews && liveReviews.length > 0 && (
                                <section className={styles.sectionBlock}>
                                    <div className={styles.blockHeader}>
                                        <h2 className={styles.blockTitle}>Client Experiences</h2>
                                        <div className={styles.reviewsRatingBadge}>
                                            <FiStar className={styles.starFill} />
                                            <span>{(tenant.rating || 5.0).toFixed(1)}</span>
                                            <span className={styles.outOf}>/ 5.0</span>
                                        </div>
                                    </div>

                                    <div className={styles.reviewsList}>
                                        {liveReviews.map((rev) => (
                                            <div key={rev.id} className={styles.reviewCard}>
                                                <div className={styles.reviewTop}>
                                                    <span className={styles.reviewerName}>{rev.user_name}</span>
                                                    <span className={styles.reviewDate}>{rev.date}</span>
                                                </div>
                                                <div className={styles.reviewStars}>
                                                    {Array.from({ length: rev.rating || 5 }).map((_, idx) => (
                                                        <FiStar key={idx} className={styles.starReview} />
                                                    ))}
                                                </div>
                                                <p className={styles.reviewComment}>{rev.comment}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Right Sticky Sidebar */}
                        <aside className={styles.rightCol}>
                            {/* Fast Booking CTA Box */}
                            <div className={styles.bookingBox}>
                                <h3 className={styles.boxTitle}>Reserve an Appointment</h3>
                                <p className={styles.boxSubtitle}>
                                    Real-time schedule check and instant verification pass.
                                </p>
                                <MainButton
                                    variant="primary"
                                    size="lg"
                                    fullWidth
                                    onClick={() => navigate(`/${tenant.slug}/book`)}
                                    rightIcon={<FiCalendar />}
                                >
                                    Proceed to Booking
                                </MainButton>

                                <div className={styles.boxFeatures}>
                                    <div className={styles.boxFeatureItem}>
                                        <FiCheckCircle className={styles.featureIcon} />
                                        <span>Instant Digital Pass with QR Code</span>
                                    </div>
                                    <div className={styles.boxFeatureItem}>
                                        <FiShield className={styles.featureIcon} />
                                        <span>No Pre-payment / Free Cancellation Options</span>
                                    </div>
                                    <div className={styles.boxFeatureItem}>
                                        <FiClock className={styles.featureIcon} />
                                        <span>Sync directly with Google Calendar & Apple</span>
                                    </div>
                                </div>
                            </div>

                            {/* Location & Working Hours Info Card */}
                            <div className={styles.infoCard}>
                                <h4 className={styles.infoCardTitle}>Location & Schedule</h4>
                                <div className={styles.infoRow}>
                                    <FiMapPin className={styles.infoIcon} />
                                    <div>
                                        <strong>Address</strong>
                                        <p>{tenant.address || tenant.city}</p>
                                    </div>
                                </div>
                                <div className={styles.infoRow}>
                                    <FiClock className={styles.infoIcon} />
                                    <div>
                                        <strong>Working Schedule</strong>
                                        <p>{tenant.open_hours || "Mon - Sat: 9:00 AM - 9:00 PM"}</p>
                                    </div>
                                </div>
                                {tenant.email && (
                                    <div className={styles.infoRow}>
                                        <FiMail className={styles.infoIcon} />
                                        <div>
                                            <strong>Direct Email</strong>
                                            <p>{tenant.email}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </aside>
                    </div>
                </div>
            </main>

            {/* Lightbox Modal for Gallery Images */}
            {activeGalleryImg && (
                <div className={styles.lightboxOverlay} onClick={() => setActiveGalleryImg(null)}>
                    <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
                        <img src={activeGalleryImg} alt="Enlarged gallery view" className={styles.lightboxImg} />
                        <button
                            type="button"
                            className={styles.closeLightbox}
                            onClick={() => setActiveGalleryImg(null)}
                        >
                            &times;
                        </button>
                    </div>
                </div>
            )}

            <PublicFooter />
        </div>
    );
};

export default TenantStorefrontPage;
