// local
import PublicNavbar from "../../../components/public/navbar/PublicNavbar";
import PublicFooter from "../../../components/public/footer/PublicFooter";
import BookingStepper from "../../../components/public/booking/BookingStepper";
import BookingCalendar from "../../../components/public/booking/BookingCalendar";
import BookingTimeSlots from "../../../components/public/booking/BookingTimeSlots";
import BookingSummaryCard from "../../../components/public/booking/BookingSummaryCard";
import ServiceCard from "../../../components/public/cards/ServiceCard";
import { tenantService } from "../../../services/tenantService";
import styles from "./BookingWidgetPage.module.css";

// react
import { useState, useEffect, useRef } from "react";

// react-router
import { useParams, useSearchParams, Link, useNavigate } from "react-router";

// react-redux
import { useSelector } from "react-redux";

// react-hook-form
import { useForm } from "react-hook-form";

// date-fns
import { addDays, format } from "date-fns";

// react-icons
import {
    FiChevronLeft,
    FiCheckCircle,
    FiUser,
    FiLock,
    FiTag,
    FiLock as FiReadonlyLock
} from "react-icons/fi";

// react-toastify
import { toast } from "react-toastify";

// gsap
import { gsap } from "gsap";

const BookingWidgetPage = () => {
    const { tenantSlug } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const stepContentRef = useRef(null);

    const { user } = useSelector((state) => state.auth);
    const isAuthenticated = !!user;

    const [liveTenant, setLiveTenant] = useState(null);
    const [isLoadingTenant, setIsLoadingTenant] = useState(true);

    // Active wizard step (1 to 4)
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedResource, setSelectedResource] = useState(null);
    const [selectedDate, setSelectedDate] = useState(addDays(new Date(), 1));
    const [selectedSlot, setSelectedSlot] = useState("10:30 AM");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch live tenant from Supabase database
    useEffect(() => {
        let isMounted = true;
        const fetchTenant = async () => {
            setIsLoadingTenant(true);
            try {
                const data = await tenantService.getBySlug(tenantSlug);
                if (data && isMounted) {
                    setLiveTenant(data);
                    const queryServiceId = searchParams.get("serviceId");
                    const initialService = queryServiceId && data.services
                        ? data.services.find((s) => s.id === queryServiceId) || data.services[0]
                        : data.services?.[0] || null;
                    setSelectedService(initialService);

                    if (data.resources && data.resources.length > 0 && !data.is_inventory_strategy) {
                        setSelectedResource(data.resources[0]);
                    }
                } else if (isMounted) {
                    setLiveTenant(null);
                }
            } catch (err) {
                console.error("Error loading live tenant for booking:", err);
                if (isMounted) setLiveTenant(null);
            } finally {
                if (isMounted) setIsLoadingTenant(false);
            }
        };

        fetchTenant();
        return () => { isMounted = false; };
    }, [tenantSlug, searchParams]);

    const tenant = liveTenant || {};
    const isInventoryStrategy = !!tenant.is_inventory_strategy;

    // React Hook Form for Step 4
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        defaultValues: {
            customerName: user?.user_metadata?.full_name || user?.name || (user?.email ? user.email.split("@")[0] : ""),
            customerEmail: user?.email || "",
            customerPhone: user?.phone || user?.user_metadata?.phone || "",
            notes: "",
            agreeTerms: true
        }
    });

    // Auto-fill and lock when authenticated
    useEffect(() => {
        if (user) {
            reset({
                customerName: user.user_metadata?.full_name || user.name || (user.email ? user.email.split("@")[0] : ""),
                customerEmail: user.email || "",
                customerPhone: user.phone || user.user_metadata?.phone || "",
                notes: "",
                agreeTerms: true
            });
        }
    }, [user, reset]);

    // GSAP Step Slide Animation
    useEffect(() => {
        if (stepContentRef.current) {
            gsap.fromTo(
                stepContentRef.current,
                { opacity: 0, x: 20 },
                { opacity: 1, x: 0, duration: 0.35, ease: "power2.out" }
            );
        }
    }, [currentStep]);

    // Accent color
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

    // Step Navigation Handlers
    const handleNextStep = () => {
        if (currentStep === 1) {
            if (!selectedService) {
                toast.warning("Please select a service before proceeding.");
                return;
            }
            if (isInventoryStrategy) {
                setCurrentStep(3); // Skip specialist step for hotels
            } else {
                setCurrentStep(2);
            }
        } else if (currentStep === 2) {
            if (!selectedResource) {
                toast.warning("Please select a specialist or resource.");
                return;
            }
            setCurrentStep(3);
        } else if (currentStep === 3) {
            if (!selectedDate || !selectedSlot) {
                toast.warning("Please choose both a date and an available time slot.");
                return;
            }
            setCurrentStep(4);
        }
    };

    const handlePrevStep = () => {
        if (currentStep === 4) {
            setCurrentStep(3);
        } else if (currentStep === 3) {
            if (isInventoryStrategy) {
                setCurrentStep(1);
            } else {
                setCurrentStep(2);
            }
        } else if (currentStep === 2) {
            setCurrentStep(1);
        }
    };

    // Form Submission & Pass Generation
    const onFinalSubmit = (formData) => {
        setIsSubmitting(true);

        const standardPrice = (selectedService?.price || 0) + Math.round((selectedService?.price || 0) * 0.08);
        const memberDiscount = isAuthenticated ? Math.round(standardPrice * 0.25) : 0;
        const finalPrice = standardPrice - memberDiscount;

        setTimeout(() => {
            const bookingId = `BK-${Date.now().toString(36).toUpperCase()}`;

            const bookingPayload = {
                id: bookingId,
                tenant_id: tenant.id,
                tenant_name: tenant.name,
                tenant_slug: tenant.slug,
                category_slug: tenant.category_slug,
                category_name: tenant.category_name,
                address: tenant.address || tenant.city,
                service_id: selectedService?.id,
                service_name: selectedService?.name,
                service_duration: selectedService?.duration_minutes,
                resource_name: selectedResource?.name || "Standard Facility",
                start_time: selectedDate
                    ? `${format(selectedDate, "yyyy-MM-dd")} ${selectedSlot}`
                    : "Confirmed Date",
                time_slot: selectedSlot,
                customer_name: formData.customerName,
                customer_email: formData.customerEmail,
                customer_phone: formData.customerPhone,
                total_price: finalPrice,
                original_price: standardPrice,
                discount_applied: memberDiscount,
                is_member: isAuthenticated,
                status: "confirmed",
                created_at: new Date().toISOString()
            };

            sessionStorage.setItem(`noviq_booking_${bookingId}`, JSON.stringify(bookingPayload));

            toast.success(
                isAuthenticated
                    ? "Booking confirmed! 25% Member Privilege discount applied."
                    : "Booking confirmed successfully!"
            );
            setIsSubmitting(false);
            navigate(`/${tenant.slug}/booking/${bookingId}`);
        }, 1200);
    };

    if (isLoadingTenant) {
        return (
            <div className={styles.bookingPageWrapper}>
                <PublicNavbar />
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16 }}>
                    <div style={{ width: 36, height: 36, border: "3px solid rgba(14, 124, 134, 0.2)", borderTopColor: "#0E7C86", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                    <p style={{ color: "var(--color-ink-600, #3A444D)", fontSize: 14 }}>Connecting to space booking engine...</p>
                </div>
                <PublicFooter />
            </div>
        );
    }

    if (!liveTenant) {
        return (
            <div className={styles.bookingPageWrapper}>
                <PublicNavbar />
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16, textAlign: "center", padding: 24 }}>
                    <h2 style={{ fontSize: 22, fontWeight: 700 }}>Space Not Found</h2>
                    <p style={{ color: "var(--color-ink-600, #3A444D)", maxWidth: 450 }}>
                        No registered business was found in the database with identifier <strong>"{tenantSlug}"</strong>.
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate("/explore")}
                        style={{ padding: "10px 20px", borderRadius: 8, background: "#0E7C86", color: "#fff", border: "none", cursor: "pointer", fontWeight: 700 }}
                    >
                        Browse All Verified Spaces
                    </button>
                </div>
                <PublicFooter />
            </div>
        );
    }

    return (
        <div
            className={styles.bookingPageWrapper}
            ref={containerRef}
            style={{ "--accent-color": accentColor }}
        >
            <PublicNavbar />

            {/* Top Navigation & Breadcrumb */}
            <div className={styles.bookingTopBar}>
                <div className={styles.topBarInner}>
                    <button
                        type="button"
                        onClick={() => {
                            if (currentStep > 1) {
                                handlePrevStep();
                            } else {
                                navigate(`/${tenant.slug || ""}`);
                            }
                        }}
                        className={styles.backBtn}
                    >
                        <FiChevronLeft />
                        <span>{currentStep > 1 ? "Previous Step" : `Back to ${tenant.name || "Space"}`}</span>
                    </button>

                    <span className={styles.secureHeaderPill}>
                        <FiLock className={styles.lockIcon} />
                        <span>Secure Booking Portal</span>
                    </span>
                </div>
            </div>

            {/* Main Booking Wizard Container */}
            <main className={styles.wizardMain}>
                <div className={styles.wizardInner}>
                    {/* Stepper Progress */}
                    <BookingStepper
                        currentStep={currentStep}
                        isInventoryStrategy={isInventoryStrategy}
                        onStepClick={(stepId) => setCurrentStep(stepId)}
                    />

                    {/* 2-Column Grid: Step Content Left + Sticky Summary Right */}
                    <div className={styles.wizardGrid}>
                        {/* Step Dynamic Content */}
                        <div className={styles.stepContentCol} ref={stepContentRef}>
                            {/* STEP 1: Select Service */}
                            {currentStep === 1 && (
                                <section className={styles.stepSection}>
                                    <div className={styles.stepHeader}>
                                        <h2 className={styles.stepTitle}>
                                            Select {tenant.service_label || "Service"}
                                        </h2>
                                        <p className={styles.stepSub}>
                                            Choose your desired treatment or reservation option.
                                        </p>
                                    </div>

                                    <div className={styles.servicesList}>
                                        {tenant.services && tenant.services.length > 0 ? (
                                            tenant.services.map((srv) => (
                                                <ServiceCard
                                                    key={srv.id}
                                                    service={srv}
                                                    isSelected={selectedService?.id === srv.id}
                                                    onSelect={(s) => setSelectedService(s)}
                                                />
                                            ))
                                        ) : (
                                            <p className={styles.emptyNotice}>No services available.</p>
                                        )}
                                    </div>
                                </section>
                            )}

                            {/* STEP 2: Select Specialist / Resource */}
                            {currentStep === 2 && !isInventoryStrategy && (
                                <section className={styles.stepSection}>
                                    <div className={styles.stepHeader}>
                                        <h2 className={styles.stepTitle}>
                                            Choose Your {tenant.resource_label || "Specialist"}
                                        </h2>
                                        <p className={styles.stepSub}>
                                            Select a certified expert or choose automatic allocation.
                                        </p>
                                    </div>

                                    <div className={styles.resourcesGrid}>
                                        {tenant.resources && tenant.resources.length > 0 ? (
                                            tenant.resources.map((res) => {
                                                const isSelected = selectedResource?.id === res.id;
                                                return (
                                                    <div
                                                        key={res.id}
                                                        className={`${styles.resourceCard} ${
                                                            isSelected ? styles.resourceSelected : ""
                                                        }`}
                                                        onClick={() => setSelectedResource(res)}
                                                    >
                                                        {res.avatar_url ? (
                                                            <img
                                                                src={res.avatar_url}
                                                                alt={res.name}
                                                                className={styles.resourceAvatar}
                                                            />
                                                        ) : (
                                                            <div className={styles.avatarPlaceholder}>
                                                                <FiUser />
                                                            </div>
                                                        )}
                                                        <div className={styles.resourceInfo}>
                                                            <h4 className={styles.resourceName}>{res.name}</h4>
                                                            <span className={styles.resourceRole}>{res.role_title}</span>
                                                        </div>
                                                        <div className={styles.selectRadio}>
                                                            {isSelected && <FiCheckCircle className={styles.radioCheck} />}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className={styles.emptyNotice}>No specialists listed.</p>
                                        )}
                                    </div>
                                </section>
                            )}

                            {/* STEP 3: Date & Available Slot */}
                            {currentStep === 3 && (
                                <section className={styles.stepSection}>
                                    <div className={styles.stepHeader}>
                                        <h2 className={styles.stepTitle}>Select Date & Time Slot</h2>
                                        <p className={styles.stepSub}>
                                            Choose your preferred appointment schedule.
                                        </p>
                                    </div>

                                    <div className={styles.calendarAndTimeGrid}>
                                        <div className={styles.calendarCol}>
                                            <BookingCalendar
                                                selectedDate={selectedDate}
                                                onDateSelect={(d) => setSelectedDate(d)}
                                            />
                                        </div>
                                        <div className={styles.timeSlotsCol}>
                                            <BookingTimeSlots
                                                selectedDate={selectedDate}
                                                selectedSlot={selectedSlot}
                                                onSlotSelect={(s) => setSelectedSlot(s)}
                                            />
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* STEP 4: Guest/Member Contact Details */}
                            {currentStep === 4 && (
                                <section className={styles.stepSection}>
                                    <div className={styles.stepHeader}>
                                        <h2 className={styles.stepTitle}>
                                            {isAuthenticated ? "Member Confirmation Details" : "Guest Contact & Details"}
                                        </h2>
                                        <p className={styles.stepSub}>
                                            {isAuthenticated
                                                ? "Your verified profile details are automatically linked to this ticket pass."
                                                : "Provide your contact details to generate your digital verification ticket pass."}
                                        </p>
                                    </div>

                                    {/* 25% Member Privilege Promo for Guests */}
                                    {!isAuthenticated ? (
                                        <div className={styles.discountPromoBanner}>
                                            <div className={styles.promoLeft}>
                                                <div className={styles.promoIconBadge}>
                                                    <FiTag />
                                                </div>
                                                <div>
                                                    <span className={styles.promoTitle}>
                                                        Get 25% OFF This Booking!
                                                    </span>
                                                    <p className={styles.promoDesc}>
                                                        Sign in or register for free to unlock an instant <strong>25% Member Discount</strong> payable to the employee at the counter.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={styles.promoActions}>
                                                <Link to={`/login?redirect=/${tenant.slug}/book`} className={styles.promoLoginBtn}>
                                                    Sign In
                                                </Link>
                                                <Link to={`/register?redirect=/${tenant.slug}/book`} className={styles.promoRegisterBtn}>
                                                    Register Free
                                                </Link>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={styles.memberVerifiedBanner}>
                                            <FiCheckCircle className={styles.verifiedIcon} />
                                            <div>
                                                <span className={styles.verifiedTitle}>
                                                    Verified NOVIQ Member Profile
                                                </span>
                                                <p className={styles.verifiedDesc}>
                                                    Your booking is automatically attached to your <strong>My Spaces</strong> account with <strong>25% Member Privilege</strong> applied.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <form
                                        id="bookingForm"
                                        onSubmit={handleSubmit(onFinalSubmit)}
                                        className={styles.contactForm}
                                    >
                                        <div className={styles.formRow}>
                                            <div className={styles.formField}>
                                                <label className={styles.fieldLabel}>
                                                    Full Name <span className={styles.requiredStar}>*</span>
                                                    {isAuthenticated && (
                                                        <span className={styles.readonlyPill}>
                                                            <FiReadonlyLock /> Locked Member Profile
                                                        </span>
                                                    )}
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="John Doe"
                                                    readOnly={isAuthenticated}
                                                    {...register("customerName", {
                                                        required: "Full name is required",
                                                        minLength: { value: 2, message: "Name is too short" }
                                                    })}
                                                    className={`${styles.formInput} ${
                                                        isAuthenticated ? styles.readonlyInput : ""
                                                    } ${errors.customerName ? styles.inputError : ""}`}
                                                />
                                                {errors.customerName && (
                                                    <span className={styles.errorText}>
                                                        {errors.customerName.message}
                                                    </span>
                                                )}
                                            </div>

                                            <div className={styles.formField}>
                                                <label className={styles.fieldLabel}>
                                                    Email Address <span className={styles.requiredStar}>*</span>
                                                    {isAuthenticated && (
                                                        <span className={styles.readonlyPill}>
                                                            <FiReadonlyLock /> Verified Email
                                                        </span>
                                                    )}
                                                </label>
                                                <input
                                                    type="email"
                                                    placeholder="john@example.com"
                                                    readOnly={isAuthenticated}
                                                    {...register("customerEmail", {
                                                        required: "Email is required",
                                                        pattern: {
                                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                            message: "Invalid email address"
                                                        }
                                                    })}
                                                    className={`${styles.formInput} ${
                                                        isAuthenticated ? styles.readonlyInput : ""
                                                    } ${errors.customerEmail ? styles.inputError : ""}`}
                                                />
                                                {errors.customerEmail && (
                                                    <span className={styles.errorText}>
                                                        {errors.customerEmail.message}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className={styles.formField}>
                                            <label className={styles.fieldLabel}>
                                                Phone Number <span className={styles.requiredStar}>*</span>
                                                {isAuthenticated && user?.phone && (
                                                    <span className={styles.readonlyPill}>
                                                        <FiReadonlyLock /> Verified Phone
                                                    </span>
                                                )}
                                            </label>
                                            <input
                                                type="tel"
                                                placeholder="+20 100 000 0000"
                                                readOnly={isAuthenticated && !!user?.phone}
                                                {...register("customerPhone", {
                                                    required: "Phone number is required"
                                                })}
                                                className={`${styles.formInput} ${
                                                    isAuthenticated && user?.phone ? styles.readonlyInput : ""
                                                } ${errors.customerPhone ? styles.inputError : ""}`}
                                            />
                                            {errors.customerPhone && (
                                                <span className={styles.errorText}>
                                                    {errors.customerPhone.message}
                                                </span>
                                            )}
                                        </div>

                                        <div className={styles.formField}>
                                            <label className={styles.fieldLabel}>
                                                Special Instructions or Notes (Optional)
                                            </label>
                                            <textarea
                                                rows="3"
                                                placeholder="Any allergies, special requirements, or questions for your provider..."
                                                {...register("notes")}
                                                className={styles.formTextarea}
                                            />
                                        </div>

                                        <div className={styles.termsRow}>
                                            <input
                                                type="checkbox"
                                                id="termsCheck"
                                                {...register("agreeTerms", {
                                                    required: "You must accept the terms"
                                                })}
                                                className={styles.checkboxInput}
                                            />
                                            <label htmlFor="termsCheck" className={styles.termsLabel}>
                                                I agree to the{" "}
                                                <Link to="/terms" target="_blank" className={styles.termsLink}>
                                                    Booking Terms
                                                </Link>{" "}
                                                and acknowledge the cancellation policy. Total payment is due upon arrival at venue.
                                            </label>
                                        </div>
                                        {errors.agreeTerms && (
                                            <span className={styles.errorText}>
                                                {errors.agreeTerms.message}
                                            </span>
                                        )}
                                    </form>
                                </section>
                            )}
                        </div>

                        {/* Sticky Booking Summary Sidebar */}
                        <div className={styles.summaryCol}>
                            <BookingSummaryCard
                                tenant={tenant}
                                service={selectedService}
                                resource={selectedResource}
                                selectedDate={selectedDate}
                                selectedSlot={selectedSlot}
                                currentStep={currentStep}
                                isSubmitting={isSubmitting}
                                isInventoryStrategy={isInventoryStrategy}
                                isAuthenticated={isAuthenticated}
                                accentColor={accentColor}
                                canProceed={
                                    currentStep === 1
                                        ? !!selectedService
                                        : currentStep === 2
                                        ? !!selectedResource
                                        : currentStep === 3
                                        ? !!selectedDate && !!selectedSlot
                                        : true
                                }
                                onConfirmClick={() => {
                                    if (currentStep < 4) {
                                        handleNextStep();
                                    } else {
                                        handleSubmit(onFinalSubmit)();
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            </main>

            <PublicFooter />
        </div>
    );
};

export default BookingWidgetPage;
