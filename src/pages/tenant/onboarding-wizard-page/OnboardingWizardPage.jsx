// local
import OnboardingHeader from "./components/OnboardingHeader";
import OnboardingStepper from "./components/OnboardingStepper";
import OnboardingFooter from "./components/OnboardingFooter";
import Step1Category from "./steps/Step1Category";
import Step2BusinessInfo from "./steps/Step2BusinessInfo";
import Step3Theme from "./steps/Step3Theme";
import Step4Modules from "./steps/Step4Modules";
import Step5BookingSettings from "./steps/Step5BookingSettings";
import Step6Publish from "./steps/Step6Publish";
import {
    setStep,
    setStepCompleted,
    fetchLiveCategoriesThunk,
    loadUserDraftTenantThunk,
    saveDraftStepThunk,
    saveScheduleAndPoliciesThunk,
    saveBranchesThunk,
    publishTenantThunk,
} from "../../../redux/slices/onboardingSlice";
import styles from "./OnboardingWizardPage.module.css";

// react
import { useState, useRef, useEffect, useCallback } from "react";

// react-router
import { useNavigate, useParams } from "react-router";

// react-redux
import { useDispatch, useSelector } from "react-redux";

// react-toastify
import { toast } from "react-toastify";

// react icons
import { FiCheckCircle } from "react-icons/fi";

// gsap
import gsap from "gsap";

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
    const { stepSlug } = useParams();

    const { user } = useSelector((state) => state.auth);
    const {
        currentStep,
        formData,
        draftTenant,
        stepCompletion,
    } = useSelector((state) => state.onboarding);

    const [isSaving, setIsSaving] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [stepErrors, setStepErrors] = useState({});
    const [showCelebration, setShowCelebration] = useState(false);

    const contentContainerRef = useRef(null);
    const celebrationOverlayRef = useRef(null);

    // Step Completion Checker
    const isStepCompleted = useCallback(
        (stepNum) => {
            switch (stepNum) {
                case 1:
                    return Boolean(formData.categoryId);
                case 2:
                    return Boolean(formData.name?.trim() && formData.slug?.trim());
                case 3:
                    return Boolean(formData.themeColor);
                case 4:
                    return Boolean(formData.modules);
                case 5:
                    return Boolean(formData.workingHours && formData.workingHours.length > 0);
                case 6:
                    return Boolean(
                        formData.services &&
                        formData.services.length > 0
                    );
                default:
                    return true;
            }
        },
        [formData]
    );

    // Check if user is allowed to access target step (all previous steps must be complete)
    const canAccessStep = useCallback(
        (targetStep) => {
            if (targetStep <= 1) return true;
            for (let s = 1; s < targetStep; s++) {
                if (!isStepCompleted(s)) return false;
            }
            return true;
        },
        [isStepCompleted]
    );

    const getEarliestIncompleteStep = useCallback(() => {
        for (let s = 1; s <= 6; s++) {
            if (!isStepCompleted(s)) return s;
        }
        return 6;
    }, [isStepCompleted]);

    // 1. Sync URL subpath with Step number and guard against skipping incomplete steps
    useEffect(() => {
        if (stepSlug && STEP_ROUTES[stepSlug]) {
            const requestedStep = STEP_ROUTES[stepSlug];
            if (!canAccessStep(requestedStep)) {
                const earliest = getEarliestIncompleteStep();
                toast.warn(`Please complete Step ${earliest} first.`, {
                    toastId: `step-skip-warn-${earliest}`,
                });
                navigate(`/onboarding/${STEP_NUM_TO_ROUTE[earliest]}`, { replace: true });
            } else {
                dispatch(setStep(requestedStep));
            }
        } else if (!stepSlug) {
            navigate(`/onboarding/${STEP_NUM_TO_ROUTE[currentStep]}`, { replace: true });
        }
    }, [stepSlug, currentStep, canAccessStep, getEarliestIncompleteStep, dispatch, navigate]);

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
        } else if (currentStep === 3) {
            if (!formData.themeColor) {
                toast.warn("Please select a theme color palette to proceed", { position: "top-center" });
                return false;
            }
        } else if (currentStep === 6) {
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
                                slug: formData.slug || "my-business",
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
        if (targetStep === currentStep) return;
        if (targetStep < currentStep) {
            // Going back to review/edit previous step is always allowed
            navigate(`/onboarding/${STEP_NUM_TO_ROUTE[targetStep]}`);
        } else {
            if (!canAccessStep(targetStep)) {
                const earliest = getEarliestIncompleteStep();
                toast.warn(`Please complete Step ${earliest} before advancing to Step ${targetStep}.`, {
                    toastId: `step-click-warn-${earliest}`,
                });
                return;
            }
            navigate(`/onboarding/${STEP_NUM_TO_ROUTE[targetStep]}`);
        }
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
                            slug: formData.slug || "draft-business",
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
            console.error(err);
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

    const isCurrentStepValid = isStepCompleted(currentStep);

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
                        canAccessStep={canAccessStep}
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
                        isNextDisabled={!isCurrentStepValid}
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
