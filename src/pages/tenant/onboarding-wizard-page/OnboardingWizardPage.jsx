import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation, useParams } from "react-router";
import {
    setStep,
    setStepCompleted,
    updateFormData,
    fetchLiveCategoriesThunk,
    loadUserDraftTenantThunk,
    saveDraftStepThunk,
    saveScheduleAndPoliciesThunk,
    saveBranchesThunk,
    publishTenantThunk,
} from "../../../redux/slices/onboardingSlice";

// Components
import OnboardingHeader from "./components/OnboardingHeader";
import OnboardingStepper from "./components/OnboardingStepper";
import OnboardingFooter from "./components/OnboardingFooter";

// Steps
import Step1Category from "./steps/Step1Category";
import Step2BusinessInfo from "./steps/Step2BusinessInfo";
import Step3Theme from "./steps/Step3Theme";
import Step4Modules from "./steps/Step4Modules";
import Step5BookingSettings from "./steps/Step5BookingSettings";
import Step6Publish from "./steps/Step6Publish";

// Icons & Toast
import { FiCheckCircle } from "react-icons/fi";
import { toast } from "react-toastify";
import gsap from "gsap";
import styles from "./OnboardingWizardPage.module.css";

const STEP_ROUTES = {
    category: 1,
    info: 2,
    theme: 3,
    modules: 4,
    "booking-settings": 5,
    publish: 6,
};

const STEP_NUM_TO_ROUTE = {
    1: "category",
    2: "info",
    3: "theme",
    4: "modules",
    5: "booking-settings",
    6: "publish",
};

export default function OnboardingWizardPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { stepSlug } = useParams();

    const { user } = useSelector((state) => state.auth);
    const {
        currentStep,
        formData,
        draftTenant,
        stepCompletion,
        status,
        publishedTenant,
    } = useSelector((state) => state.onboarding);

    const [isSaving, setIsSaving] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [stepErrors, setStepErrors] = useState({});
    const [showCelebration, setShowCelebration] = useState(false);

    const contentContainerRef = useRef(null);
    const celebrationOverlayRef = useRef(null);

    // 1. Sync URL subpath with Step number
    useEffect(() => {
        if (stepSlug && STEP_ROUTES[stepSlug]) {
            dispatch(setStep(STEP_ROUTES[stepSlug]));
        } else if (!stepSlug) {
            // Default to step 1 route
            navigate(`/onboarding/${STEP_NUM_TO_ROUTE[currentStep]}`, { replace: true });
        }
    }, [stepSlug, currentStep, dispatch, navigate]);

    // 2. On Mount: Fetch categories & restore user draft tenant from Supabase
    useEffect(() => {
        dispatch(fetchLiveCategoriesThunk());
        if (user?.id) {
            dispatch(loadUserDraftTenantThunk(user.id));
        }
    }, [dispatch, user?.id]);

    // 3. GSAP Step Transition Animation
    useEffect(() => {
        if (contentContainerRef.current) {
            gsap.fromTo(
                contentContainerRef.current,
                { opacity: 0, y: 16 },
                { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
            );
        }
    }, [currentStep]);

    // Validate active step before moving forward
    const validateCurrentStep = () => {
        const errors = {};
        if (currentStep === 1) {
            if (!formData.categoryId) {
                toast.warn("Please select a business category to proceed", { position: "top-center" });
                return false;
            }
        } else if (currentStep === 2) {
            if (!formData.name?.trim()) {
                errors.name = "Business name is required";
            }
            if (!formData.slug?.trim()) {
                errors.slug = "Storefront URL slug is required";
            }
            if (Object.keys(errors).length > 0) {
                setStepErrors(errors);
                toast.error("Please fill in all required business details", { position: "top-center" });
                return false;
            }
        } else if (currentStep === 6) {
            if (!formData.resources || formData.resources.length === 0) {
                toast.error("Please add at least 1 bookable resource (Doctor/Stylist/Room)", {
                    position: "top-center",
                });
                return false;
            }
            if (!formData.services || formData.services.length === 0) {
                toast.error("Please add at least 1 bookable service (Treatment/Consultation)", {
                    position: "top-center",
                });
                return false;
            }
        }
        setStepErrors({});
        return true;
    };

    // Handle Next Step / Action
    const handleNext = async () => {
        if (!validateCurrentStep()) return;

        setIsSaving(true);
        try {
            // Persist draft to Supabase if user is authenticated
            if (user?.id) {
                if (currentStep <= 4) {
                    const savedDraft = await dispatch(
                        saveDraftStepThunk({
                            userId: user.id,
                            stepData: {
                                category_id: formData.categoryId,
                                name: formData.name || "My Business",
                                slug: formData.slug || `draft-${Date.now()}`,
                                description: formData.description,
                                phone: formData.phone,
                                email: formData.email,
                                address: formData.address,
                                theme_color: formData.themeColor,
                                theme_config: formData.themeConfig,
                                config: { modules: formData.modules },
                            },
                        })
                    ).unwrap();

                    // Persist branches to Supabase whenever branches are configured
                    if (
                        (savedDraft?.id || draftTenant?.id) &&
                        formData.branches?.length > 0
                    ) {
                        await dispatch(
                            saveBranchesThunk({
                                tenantId: savedDraft?.id || draftTenant.id,
                                branches: formData.branches,
                            })
                        ).unwrap();
                    }
                } else if (currentStep === 5 && draftTenant?.id) {
                    await dispatch(
                        saveScheduleAndPoliciesThunk({
                            tenantId: draftTenant.id,
                            workingHours: formData.workingHours,
                            cancellationPolicy: formData.cancellationPolicy,
                        })
                    ).unwrap();
                }
            }

            dispatch(setStepCompleted({ step: currentStep, completed: true }));

            if (currentStep < 6) {
                const nextStep = currentStep + 1;
                navigate(`/onboarding/${STEP_NUM_TO_ROUTE[nextStep]}`);
            } else if (currentStep === 6) {
                // Final Step: Publish business!
                await handlePublish();
            }
        } catch (err) {
            toast.error(err || "Error saving progress. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            const prevStep = currentStep - 1;
            navigate(`/onboarding/${STEP_NUM_TO_ROUTE[prevStep]}`);
        }
    };

    const handleStepClick = (targetStep) => {
        navigate(`/onboarding/${STEP_NUM_TO_ROUTE[targetStep]}`);
    };

    // Save & Exit handler (stores draft and redirects to /account)
    const handleSaveAndExit = async () => {
        setIsSaving(true);
        try {
            if (user?.id) {
                await dispatch(
                    saveDraftStepThunk({
                        userId: user.id,
                        stepData: {
                            category_id: formData.categoryId,
                            name: formData.name || "Draft Business",
                            slug: formData.slug || `draft-${Date.now()}`,
                            description: formData.description,
                            phone: formData.phone,
                            email: formData.email,
                            address: formData.address,
                            theme_color: formData.themeColor,
                            theme_config: formData.themeConfig,
                            config: { modules: formData.modules },
                        },
                    })
                ).unwrap();
            }
            toast.success("Progress saved! You can resume onboarding anytime from your account.");
            navigate("/account");
        } catch (err) {
            toast.error("Could not save online draft, saved locally instead.");
            navigate("/account");
        } finally {
            setIsSaving(false);
        }
    };

    // Final Publish Execution
    const handlePublish = async () => {
        if (!draftTenant?.id) {
            toast.error("Draft tenant not found. Please refresh and try again.");
            return;
        }

        setIsPublishing(true);
        try {
            const published = await dispatch(
                publishTenantThunk({
                    tenantId: draftTenant.id,
                    userId: user?.id,
                })
            ).unwrap();
            setShowCelebration(true);

            // GSAP celebration intro
            setTimeout(() => {
                if (celebrationOverlayRef.current) {
                    gsap.fromTo(
                        celebrationOverlayRef.current,
                        { opacity: 0, scale: 0.9 },
                        { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" }
                    );
                }
            }, 50);

            // Redirect to Tenant Dashboard after celebration
            setTimeout(() => {
                const targetSlug = published?.slug || formData.slug || "dashboard";
                toast.success(`Congratulations! "${formData.name}" is now live!`, {
                    position: "top-center",
                });
                navigate(`/${targetSlug}/dashboard`);
            }, 2500);
        } catch (err) {
            toast.error(err || "Failed to publish business. Please ensure all items are fulfilled.");
        } finally {
            setIsPublishing(false);
        }
    };

    // Render active step component
    const renderActiveStep = () => {
        switch (currentStep) {
            case 1:
                return <Step1Category onSelectCategory={() => setStepErrors({})} />;
            case 2:
                return (
                    <Step2BusinessInfo
                        errors={stepErrors}
                        onFieldChange={() => setStepErrors({})}
                    />
                );
            case 3:
                return <Step3Theme />;
            case 4:
                return <Step4Modules />;
            case 5:
                return <Step5BookingSettings />;
            case 6:
                return <Step6Publish onPublish={handlePublish} isPublishing={isPublishing} />;
            default:
                return <Step1Category />;
        }
    };

    return (
        <div className={styles.wizardPageWrapper}>
            {/* Header */}
            <OnboardingHeader onSaveAndExit={handleSaveAndExit} isSaving={isSaving} />

            {/* Main Content Area */}
            <main className={styles.mainContainer}>
                <div className={styles.wizardCard}>
                    {/* Stepper */}
                    <OnboardingStepper
                        currentStep={currentStep}
                        onStepClick={handleStepClick}
                        stepCompletion={stepCompletion}
                    />

                    {/* Step Body */}
                    <div ref={contentContainerRef} className={styles.stepContentArea}>
                        {renderActiveStep()}
                    </div>

                    {/* Navigation Footer */}
                    <OnboardingFooter
                        currentStep={currentStep}
                        totalSteps={6}
                        onBack={handleBack}
                        onNext={handleNext}
                        isLoading={isSaving || isPublishing}
                    />
                </div>
            </main>

            {/* Full-Screen Calm Celebration Overlay */}
            {showCelebration && (
                <div className={styles.celebrationOverlay}>
                    <div ref={celebrationOverlayRef} className={styles.celebrationCard}>
                        <div className={styles.celebrationIconCircle}>
                            <FiCheckCircle size={48} />
                        </div>
                        <h2 className={styles.celebrationTitle}>Your Business is Live!</h2>
                        <p className={styles.celebrationSubtitle}>
                            "{formData.name}" is now published and open for bookings on NOVIQ. Launching your management console...
                        </p>
                        <div className={styles.loadingProgressBar}>
                            <div className={styles.loadingProgressSweep} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
