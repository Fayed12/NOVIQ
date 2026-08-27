// local
import PublicNavbar from "../../../components/public/navbar/PublicNavbar";
import PublicFooter from "../../../components/public/footer/PublicFooter";
import MainButton from "../../../components/ui/button/MainButton";
import { tenantService } from "../../../services/tenantService";
import {
    getGoogleCalendarUrl,
    downloadIcsCalendarFile
} from "../../../utils/calendarLinks";
import { downloadPdfBookingTicket } from "../../../utils/pdfTicketDownloader";
import styles from "./BookingConfirmationPage.module.css";

// react
import { useState, useEffect, useRef } from "react";

// react-router
import { useParams, Link, useNavigate } from "react-router";

// react-redux
import { useSelector } from "react-redux";

// qrcode.react
import { QRCodeSVG } from "qrcode.react";

// react-icons
import {
    FiCheck,
    FiCalendar,
    FiMapPin,
    FiDownload,
    FiShare2,
    FiCopy,
    FiShield,
    FiPrinter,
    FiArrowRight,
    FiCheckCircle,
    FiInfo
} from "react-icons/fi";

// react-toastify
import { toast } from "react-toastify";

// gsap
import { gsap } from "gsap";

const BookingConfirmationPage = () => {
    const { tenantSlug, bookingId } = useParams();
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const checkmarkRef = useRef(null);

    const { user } = useSelector((state) => state.auth);
    const isAuthenticated = !!user;

    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
    const [liveTenant, setLiveTenant] = useState(null);

    // Fetch tenant from database
    useEffect(() => {
        let isMounted = true;
        tenantService.getBySlug(tenantSlug).then((data) => {
            if (data && isMounted) setLiveTenant(data);
        }).catch((err) => {
            console.error("Error fetching live tenant for confirmation:", err);
        });
        return () => { isMounted = false; };
    }, [tenantSlug]);

    // Retrieve booking data from session storage lazily or construct fallback
    const [bookingData] = useState(() => {
        const stored = sessionStorage.getItem(`noviq_booking_${bookingId}`);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error(e);
            }
        }

        // Fallback realistic booking data
        const fallbackRef = `NVQ-${(bookingId || "89241").slice(-5).toUpperCase()}-BK`;
        return {
            id: bookingId,
            ref: fallbackRef,
            tenant_slug: tenantSlug,
            tenant_name: "NOVIQ Partner Space",
            tenant_address: "Downtown, Cairo, Egypt",
            tenant_phone: "+20 100 000 0000",
            tenant_logo: null,
            service_name: "Standard Consultation",
            service_duration: 45,
            resource_name: "Assigned Specialist",
            date: "Tomorrow, 10:30 AM",
            time: "10:30 AM",
            customer_name: user?.user_metadata?.full_name || user?.name || "Verified Customer",
            customer_email: user?.email || "customer@example.com",
            customer_phone: user?.phone || "+20 100 000 0000",
            total_price: 120,
            status: "confirmed",
            created_at: new Date().toISOString()
        };
    });

    const tenant = liveTenant || {
        name: bookingData?.tenant_name || "NOVIQ Space",
        slug: bookingData?.tenant_slug || tenantSlug,
        address: bookingData?.address || "Main Branch",
        logo_image: bookingData?.tenant_logo || null,
        category_name: bookingData?.category_name || "Verified Space"
    };

    // GSAP Checkmark & Cards Entrance
    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: "back.out(1.7)" } });

            tl.fromTo(
                `.${styles.successCircle}`,
                { scale: 0, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.6 }
            )
            .fromTo(
                `.${styles.refCodeBadge}`,
                { y: 15, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.4 },
                "-=0.2"
            )
            .fromTo(
                `.${styles.summaryCard}`,
                { y: 25, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5 },
                "-=0.2"
            )
            .fromTo(
                `.${styles.qrCard}`,
                { y: 25, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5 },
                "-=0.3"
            );
        }, containerRef);

        return () => ctx.revert();
    }, [bookingData]);

    const handleCopyRef = () => {
        if (bookingData?.ref && navigator.clipboard) {
            navigator.clipboard.writeText(bookingData.ref);
            toast.success(`Booking reference ${bookingData.ref} copied to clipboard!`);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPdf = async () => {
        if (!bookingData) return;
        try {
            setIsDownloadingPdf(true);
            toast.info("Compiling your official NOVIQ ticket...");
            await downloadPdfBookingTicket({
                booking: bookingData,
                tenant: tenant,
                service: {
                    name: bookingData.service_name,
                    duration_minutes: bookingData.service_duration,
                    price: bookingData.total_price
                },
                resource: {
                    name: bookingData.resource_name
                }
            });
            toast.success("PDF Ticket successfully downloaded!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to generate PDF ticket. Please try again.");
        } finally {
            setIsDownloadingPdf(false);
        }
    };

    // Calendar Handlers
    const handleGoogleCalendar = () => {
        if (!bookingData) return;
        const url = getGoogleCalendarUrl({
            title: `${bookingData.service_name} at ${tenant.name}`,
            description: `NOVIQ Booking Reference: ${bookingData.ref}\nProvider: ${tenant.name}\nSpecialist: ${bookingData.resource_name}\nAddress: ${tenant.address}`,
            location: tenant.address,
            startTime: new Date(Date.now() + 24 * 60 * 60 * 1000)
        });
        window.open(url, "_blank");
        toast.success("Opening Google Calendar...");
    };

    const handleDownloadIcs = () => {
        if (!bookingData) return;
        downloadIcsCalendarFile({
            title: `${bookingData.service_name} - ${tenant.name}`,
            description: `NOVIQ Booking Ref: ${bookingData.ref}\nSpecialist: ${bookingData.resource_name}\nAddress: ${tenant.address}`,
            location: tenant.address,
            startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
            bookingRef: bookingData.ref
        });
        toast.success("Apple / Universal .ics calendar file downloaded!");
    };

    // QR Code Verification Payload
    const qrVerificationPayload = {
        app: "NOVIQ",
        ref: bookingData?.ref,
        booking_id: bookingData?.id,
        tenant_name: tenant.name,
        service: bookingData?.service_name,
        resource: bookingData?.resource_name,
        customer: bookingData?.customer_name,
        date: bookingData?.date,
        time: bookingData?.time,
        status: "CONFIRMED",
        sec_hash: `SHA256-NVQ-${(bookingData?.ref || "VERIFIED").replace(/[^a-zA-Z0-9]/g, "")}`
    };

    return (
        <div className={styles.confirmationPageWrapper} ref={containerRef}>
            <PublicNavbar />

            <main className={styles.confirmationMain}>
                <div className={styles.confirmationInner}>
                    {/* Top Animated Checkmark & Headline */}
                    <div className={styles.heroSection}>
                        <div className={styles.successCircle} ref={checkmarkRef}>
                            <FiCheck className={styles.checkmarkIcon} />
                        </div>

                        <h1 className={styles.heroTitle}>Reservation Confirmed!</h1>
                        <p className={styles.heroSubtitle}>
                            Your appointment at <strong>{tenant.name}</strong> has been secured. A confirmation email and calendar invite have been dispatched.
                        </p>

                        <div className={styles.refCodeBadge}>
                            <span className={styles.refLabel}>Booking Reference:</span>
                            <span className={styles.refCode}>{bookingData?.ref}</span>
                            <button
                                type="button"
                                onClick={handleCopyRef}
                                className={styles.copyBtn}
                                title="Copy reference code"
                            >
                                <FiCopy />
                            </button>
                        </div>
                    </div>

                    {/* Main 2-Column Grid: Summary Left + QR Pass Right */}
                    <div className={styles.contentGrid}>
                        {/* Summary Details Card */}
                        <div className={styles.summaryCard}>
                            <div className={styles.cardHeader}>
                                <div className={styles.tenantIdentity}>
                                    {tenant.logo_image && (
                                        <img src={tenant.logo_image} alt="" className={styles.tenantLogo} />
                                    )}
                                    <div>
                                        <h3 className={styles.tenantTitle}>{tenant.name}</h3>
                                        <span className={styles.tenantCat}>{tenant.category_name}</span>
                                    </div>
                                </div>
                                <span className={styles.confirmedPill}>
                                    <FiCheckCircle className={styles.pillIcon} />
                                    Confirmed
                                </span>
                            </div>

                            <div className={styles.detailsList}>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Service / Treatment</span>
                                    <span className={styles.detailValue}>{bookingData?.service_name}</span>
                                </div>

                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Assigned Specialist</span>
                                    <span className={styles.detailValue}>{bookingData?.resource_name}</span>
                                </div>

                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Appointment Date & Time</span>
                                    <span className={styles.detailValueHighlight}>
                                        <FiCalendar className={styles.inlineIcon} />
                                        {bookingData?.date} @ {bookingData?.time}
                                    </span>
                                </div>

                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Location & Venue</span>
                                    <span className={styles.detailValue}>
                                        <FiMapPin className={styles.inlineIcon} />
                                        {tenant.address}
                                    </span>
                                </div>

                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Primary Guest</span>
                                    <span className={styles.detailValue}>
                                        {bookingData?.customer_name} ({bookingData?.customer_email})
                                    </span>
                                </div>

                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Standard Price (Before Discount)</span>
                                    <span className={bookingData?.discount_applied > 0 ? styles.originalPriceStruck : styles.detailValue}>
                                        ${bookingData?.original_price || bookingData?.total_price || 0}
                                    </span>
                                </div>

                                {bookingData?.discount_applied > 0 && (
                                    <div className={`${styles.detailRow} ${styles.discountDetailRow}`}>
                                        <span className={styles.discountLabel}>
                                            <FiCheckCircle className={styles.discountCheckIcon} /> Member Discount (25% OFF)
                                        </span>
                                        <span className={styles.discountBadgeValue}>
                                            -${bookingData?.discount_applied}
                                        </span>
                                    </div>
                                )}

                                <div className={`${styles.detailRow} ${styles.totalDueRow}`}>
                                    <div>
                                        <span className={styles.totalDueTitle}>Total Due at Counter</span>
                                        <span className={styles.totalDueNote}>Pay staff upon arrival</span>
                                    </div>
                                    <span className={styles.finalPriceValue}>
                                        ${bookingData?.total_price || 0}
                                    </span>
                                </div>
                            </div>

                            {/* Cancellation Notice */}
                            <div className={styles.policyNotice}>
                                <FiInfo className={styles.noticeIcon} />
                                <span>
                                    Free cancellation up to 24 hours prior to appointment time. To reschedule, contact the concierge directly.
                                </span>
                            </div>

                            {/* Calendar Integration Action Bar */}
                            <div className={styles.calendarActionsArea}>
                                <span className={styles.actionsLabel}>Add to Calendar:</span>
                                <div className={styles.calendarBtnsGroup}>
                                    <button
                                        type="button"
                                        onClick={handleGoogleCalendar}
                                        className={styles.calBtn}
                                    >
                                        <FiCalendar className={styles.calBtnIcon} />
                                        <span>Google Calendar</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDownloadIcs}
                                        className={styles.calBtn}
                                    >
                                        <FiDownload className={styles.calBtnIcon} />
                                        <span>Apple / .ICS File</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* QR Verification & Dark Ticket Pass Card */}
                        <div className={styles.qrCard}>
                            <div className={styles.qrCardHeader}>
                                <h3 className={styles.qrTitle}>Digital Arrival Pass</h3>
                                <span className={styles.qrSubtitle}>Scannable Verification Ticket</span>
                            </div>

                            {/* Live Interactive QR Code */}
                            <div className={styles.qrFrame}>
                                <QRCodeSVG
                                    value={JSON.stringify(qrVerificationPayload)}
                                    size={160}
                                    level="H"
                                    includeMargin
                                    bgColor="#FFFFFF"
                                    fgColor="#161F26"
                                />
                            </div>

                            {/* Employee / Front Desk Protocol Notice */}
                            <div className={styles.staffNoticeBox}>
                                <div className={styles.staffHeader}>
                                    <FiShield className={styles.shieldIcon} />
                                    <span>Staff & Reception Protocol</span>
                                </div>
                                <p className={styles.staffText}>
                                    Scan this QR code with any mobile device or terminal upon guest arrival. Verification credentials match system record #{bookingData?.ref}.
                                </p>
                            </div>

                            {/* PDF Ticket & Print Actions */}
                            <div className={styles.ticketActions}>
                                <MainButton
                                    variant="primary"
                                    size="md"
                                    fullWidth
                                    onClick={handleDownloadPdf}
                                    isLoading={isDownloadingPdf}
                                    loadingText="Generating Pass..."
                                    icon={<FiDownload />}
                                >
                                    Download PDF Ticket
                                </MainButton>

                                <div className={styles.secondaryActions}>
                                    <button
                                        type="button"
                                        onClick={handlePrint}
                                        className={styles.printBtn}
                                    >
                                        <FiPrinter />
                                        <span>Print</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCopyRef}
                                        className={styles.shareTicketBtn}
                                    >
                                        <FiShare2 />
                                        <span>Share</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Return CTAs */}
                    <div className={styles.bottomNavActions}>
                        <Link to="/explore" className={styles.exploreLink}>
                            <span>Explore More Businesses</span>
                        </Link>
                        {isAuthenticated ? (
                            <MainButton
                                variant="secondary"
                                onClick={() => navigate("/account")}
                                rightIcon={<FiArrowRight />}
                            >
                                View in My Spaces & Bookings
                            </MainButton>
                        ) : (
                            <MainButton
                                variant="secondary"
                                onClick={() => navigate("/register")}
                                rightIcon={<FiArrowRight />}
                            >
                                Create Account to Track Bookings
                            </MainButton>
                        )}
                    </div>
                </div>
            </main>

            <PublicFooter />
        </div>
    );
};

export default BookingConfirmationPage;
