// local
import MainButton from "../../ui/button/MainButton";
import styles from "./BookingSummaryCard.module.css";

// react-router
import { Link } from "react-router";

// date-fns
import { format } from "date-fns";

// react-icons
import {
    FiCalendar,
    FiClock,
    FiUser,
    FiShield,
    FiArrowRight,
    FiCheckCircle,
    FiMapPin,
    FiPercent,
    FiTag
} from "react-icons/fi";

const BookingSummaryCard = ({
    tenant,
    service,
    resource,
    selectedDate,
    selectedSlot,
    onConfirmClick,
    currentStep = 1,
    isSubmitting = false,
    canProceed = true,
    isInventoryStrategy = false,
    isAuthenticated = false,
    accentColor = "#0E7C86"
}) => {
    const servicePrice = service ? service.price : 0;
    const taxesAndFees = service ? Math.round(servicePrice * 0.08) : 0;
    const standardTotal = servicePrice + taxesAndFees;

    // 25% Member Privilege Discount
    const memberDiscount = isAuthenticated ? Math.round(standardTotal * 0.25) : 0;
    const finalDueAtVenue = standardTotal - memberDiscount;

    return (
        <div className={styles.summaryCard} style={{ "--accent-color": accentColor }}>
            {/* Header: Business Identity */}
            <div className={styles.tenantHeader}>
                {tenant.logo_image && (
                    <img src={tenant.logo_image} alt={tenant.name} className={styles.tenantLogo} />
                )}
                <div>
                    <h3 className={styles.tenantName}>{tenant.name}</h3>
                    <span className={styles.tenantCategory}>{tenant.category_name}</span>
                </div>
            </div>

            <hr className={styles.summaryDivider} />

            {/* Selected Booking Items */}
            <div className={styles.itemsList}>
                {/* 1. Service Item */}
                <div className={styles.summaryRow}>
                    <div className={styles.rowLabelGroup}>
                        <span className={styles.rowTitle}>
                            {service ? service.name : "No service chosen"}
                        </span>
                        {service && (
                            <span className={styles.rowSub}>
                                <FiClock className={styles.inlineIcon} />
                                {service.duration_minutes} mins duration
                            </span>
                        )}
                    </div>
                    <span className={styles.rowPrice}>
                        {service ? `$${service.price}` : "--"}
                    </span>
                </div>

                {/* 2. Specialist / Resource Item (if not inventory) */}
                {!isInventoryStrategy && (
                    <div className={styles.summaryRow}>
                        <div className={styles.rowLabelGroup}>
                            <span className={styles.rowTitle}>Assigned Specialist</span>
                            <span className={styles.rowSub}>
                                <FiUser className={styles.inlineIcon} />
                                {resource ? resource.name : "Auto-allocated upon selection"}
                            </span>
                        </div>
                        <span className={styles.includedBadge}>Included</span>
                    </div>
                )}

                {/* 3. Date & Time Item */}
                <div className={styles.summaryRow}>
                    <div className={styles.rowLabelGroup}>
                        <span className={styles.rowTitle}>Appointment Slot</span>
                        <span className={styles.rowSub}>
                            <FiCalendar className={styles.inlineIcon} />
                            {selectedDate
                                ? `${format(selectedDate, "EEE, MMM d, yyyy")} @ ${
                                    selectedSlot || "Choose time"
                                }`
                                : "Choose date & time"}
                        </span>
                    </div>
                </div>

                {/* 4. Location Item */}
                <div className={styles.summaryRow}>
                    <div className={styles.rowLabelGroup}>
                        <span className={styles.rowTitle}>Location</span>
                        <span className={styles.rowSub}>
                            <FiMapPin className={styles.inlineIcon} />
                            {tenant.city || tenant.address || "Main Branch"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Member Discount Incentive for Guests */}
            {!isAuthenticated ? (
                <div className={styles.memberIncentiveBox}>
                    <div className={styles.incentiveHeader}>
                        <FiTag className={styles.incentiveIcon} />
                        <span className={styles.incentiveTitle}>Member Privilege: 25% OFF</span>
                    </div>
                    <p className={styles.incentiveText}>
                        Create a free NOVIQ account to get <strong>25% OFF (${Math.round(standardTotal * 0.25)} saving)</strong> on your total bill at the venue!
                    </p>
                    <Link to="/register" className={styles.incentiveLink}>
                        <span>Register & Unlock 25% Off</span>
                        <FiArrowRight />
                    </Link>
                </div>
            ) : (
                <div className={styles.memberAppliedBox}>
                    <FiCheckCircle className={styles.appliedIcon} />
                    <span>25% NOVIQ Member Privilege Applied</span>
                </div>
            )}

            <hr className={styles.summaryDivider} />

            {/* Price Calculations */}
            <div className={styles.priceBreakdown}>
                <div className={styles.priceRow}>
                    <span>Service Subtotal</span>
                    <span>${servicePrice}</span>
                </div>
                <div className={styles.priceRow}>
                    <span>Estimated Taxes & Platform Fee</span>
                    <span>${taxesAndFees}</span>
                </div>

                {isAuthenticated && (
                    <div className={`${styles.priceRow} ${styles.discountRow}`}>
                        <span className={styles.discountLabel}>
                            <FiPercent /> Member Discount (25% OFF)
                        </span>
                        <span className={styles.discountValue}>-${memberDiscount}</span>
                    </div>
                )}

                <div className={`${styles.priceRow} ${styles.totalRow}`}>
                    <div>
                        <span>Total Due at Counter</span>
                        <span className={styles.payNote}>Pay employee upon arrival</span>
                    </div>
                    <div className={styles.totalAmountGroup}>
                        {isAuthenticated && (
                            <span className={styles.struckOriginal}>${standardTotal}</span>
                        )}
                        <span className={styles.totalValue}>${finalDueAtVenue}</span>
                    </div>
                </div>
            </div>

            {/* Security Guarantee Pill */}
            <div className={styles.securityPill}>
                <FiShield className={styles.securityIcon} />
                <span>Instant Confirmation · Digital QR Verification</span>
            </div>

            {/* Action CTA */}
            <div className={styles.actionArea}>
                <MainButton
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={onConfirmClick}
                    disabled={!canProceed || isSubmitting}
                    isLoading={isSubmitting}
                    rightIcon={currentStep === 4 ? <FiCheckCircle /> : <FiArrowRight />}
                >
                    {currentStep === 4 ? "Confirm Booking & Pass" : "Next Step"}
                </MainButton>
            </div>
        </div>
    );
};

export default BookingSummaryCard;
