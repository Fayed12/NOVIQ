// local
import MainButton from "../../ui/button/MainButton";
import { formatDistance } from "../../../utils/geoDistance";
import styles from "./BusinessCard.module.css";

// react-router
import { Link, useNavigate } from "react-router";

// react-icons
import {
    FiStar,
    FiMapPin,
    FiCheckCircle,
    FiArrowRight,
    FiClock,
    FiTag
} from "react-icons/fi";

const BusinessCard = ({ business, calculatedDistance = null }) => {
    const navigate = useNavigate();

    const categoryAccent =
        business.theme_color ||
        (business.category_slug === "clinics"
            ? "#0E7C86"
            : business.category_slug === "salons"
            ? "#B45309"
            : business.category_slug === "hotels"
            ? "#7C3AED"
            : business.category_slug === "fitness"
            ? "#DC2626"
            : "#1E3A8A");

    const coverSrc =
        business.cover_url ||
        business.cover_image ||
        "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80";

    const logoSrc =
        business.logo_url ||
        business.logo_image ||
        "/dark-logo.png";

    return (
        <div className={styles.businessCard} style={{ "--accent-color": categoryAccent }}>
            {/* Top Media / Cover Banner */}
            <div className={styles.coverWrapper}>
                <img
                    src={coverSrc}
                    alt={business.name}
                    className={styles.coverImage}
                    loading="lazy"
                />
                <div className={styles.coverScrim} />

                {/* Category Badge Top-Left */}
                {business.category_name && (
                    <div className={styles.categoryBadge}>
                        <FiTag className={styles.badgeIcon} />
                        <span>{business.category_name}</span>
                    </div>
                )}

                {/* Distance Badge (if calculated) */}
                {calculatedDistance !== null && (
                    <div className={styles.distanceBadge}>
                        <FiMapPin className={styles.badgeIcon} />
                        <span>{formatDistance(calculatedDistance)}</span>
                    </div>
                )}

                {/* Verified Pill */}
                {business.is_verified !== false && (
                    <div className={styles.verifiedPill} title="Verified NOVIQ Provider">
                        <FiCheckCircle className={styles.verifiedIcon} />
                    </div>
                )}

                {/* Business Avatar/Logo Badge */}
                <div className={styles.logoBadge}>
                    <img src={logoSrc} alt={`${business.name} logo`} />
                </div>
            </div>

            {/* Card Content Area */}
            <div className={styles.cardBody}>
                {/* Title & Rating */}
                <div className={styles.titleRow}>
                    <h3 className={styles.businessTitle}>
                        <Link to={`/${business.slug}`}>{business.name}</Link>
                    </h3>
                    <div className={styles.ratingBadge}>
                        <FiStar className={styles.starIcon} />
                        <span className={styles.ratingValue}>{(business.rating || 5.0).toFixed(1)}</span>
                        <span className={styles.reviewCount}>({business.review_count || 0})</span>
                    </div>
                </div>

                {/* Location / City & Price Range */}
                <div className={styles.metaRow}>
                    <FiMapPin className={styles.metaIcon} />
                    <span className={styles.cityText}>{business.city || business.address || "Egypt"}</span>
                    {business.services && business.services.length > 0 ? (
                        <span className={styles.priceTierBadge}>
                            From ${Math.min(...business.services.map((s) => s.price || 50))}
                        </span>
                    ) : (
                        <span className={styles.priceTierBadge}>{business.price_range || "$$"}</span>
                    )}
                </div>

                {/* Tagline / Brief Description */}
                <p className={styles.taglineText}>{business.tagline || business.description || "Accredited service space."}</p>

                {/* Working Hours Snapshot */}
                {business.open_hours && (
                    <div className={styles.hoursRow}>
                        <FiClock className={styles.hoursIcon} />
                        <span>{business.open_hours}</span>
                    </div>
                )}

                {/* Card Actions */}
                <div className={styles.cardActions}>
                    <Link to={`/${business.slug}`} className={styles.viewStoreLink}>
                        <span>View Details</span>
                    </Link>
                    <MainButton
                        variant="primary"
                        size="sm"
                        onClick={() => navigate(`/${business.slug}/book`)}
                        rightIcon={<FiArrowRight />}
                        className={styles.bookActionBtn}
                    >
                        Book Now
                    </MainButton>
                </div>
            </div>
        </div>
    );
};

export default BusinessCard;
