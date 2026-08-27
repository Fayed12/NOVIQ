// local
import styles from "./ServiceCard.module.css";

// react-icons
import { FiClock, FiCheck, FiArrowRight, FiInfo } from "react-icons/fi";

const ServiceCard = ({
    service,
    isSelected = false,
    onSelect,
    showBookButton = true,
    accentColor = "#0E7C86"
}) => {
    return (
        <div
            className={`${styles.serviceCard} ${isSelected ? styles.selectedCard : ""}`}
            style={{ "--accent-color": accentColor }}
            onClick={() => onSelect && onSelect(service)}
        >
            {/* Optional Thumbnail */}
            {service.image_url && (
                <div className={styles.thumbnailWrapper}>
                    <img src={service.image_url} alt={service.name} className={styles.thumbnail} />
                </div>
            )}

            <div className={styles.cardContent}>
                {/* Header Row */}
                <div className={styles.headerRow}>
                    <h4 className={styles.serviceTitle}>{service.name}</h4>
                    <div className={styles.priceTag}>
                        ${service.price}
                    </div>
                </div>

                {/* Duration & Policy Meta */}
                <div className={styles.metaRow}>
                    <span className={styles.durationBadge}>
                        <FiClock className={styles.metaIcon} />
                        {service.duration_minutes >= 60
                            ? `${service.duration_minutes / 60} hr${service.duration_minutes > 60 ? "s" : ""}`
                            : `${service.duration_minutes} mins`}
                    </span>
                    {service.cancellation_policy && (
                        <span className={styles.policyBadge} title={service.cancellation_policy}>
                            <FiInfo className={styles.metaIcon} />
                            Flexible Terms
                        </span>
                    )}
                </div>

                {/* Description */}
                {service.description && (
                    <p className={styles.descriptionText}>{service.description}</p>
                )}

                {/* Selection / Action Row */}
                {showBookButton && (
                    <div className={styles.actionRow}>
                        <button
                            type="button"
                            className={`${styles.selectBtn} ${isSelected ? styles.selectedBtn : ""}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onSelect) onSelect(service);
                            }}
                        >
                            {isSelected ? (
                                <>
                                    <FiCheck className={styles.btnIcon} />
                                    <span>Selected</span>
                                </>
                            ) : (
                                <>
                                    <span>Select Service</span>
                                    <FiArrowRight className={styles.btnIcon} />
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServiceCard;
