// local
import AuthCardWrapper from "../../../components/auth/AuthCardWrapper";
import AuthPortalModal from "../../../components/auth/AuthPortalModal";
import MainInput from "../../../components/ui/input/MainInput";
import MainButton from "../../../components/ui/button/MainButton";
import { loginUser, clearAuthError } from "../../../redux/slices/authSlice";
import {
    VALIDATION_PATTERNS,
    sanitizeInput,
} from "../../../utils/validationPatterns";
import {
    animateAuthEntrance,
    animateErrorShake,
} from "../../../utils/authAnimations";
import styles from "./LoginPage.module.css";

// react
import { useState, useRef, useEffect } from "react";

// react-router
import { Link, useNavigate, useLocation } from "react-router";

// react-redux
import { useDispatch, useSelector } from "react-redux";

// react-hook-form
import { useForm } from "react-hook-form";

// react-toastify
import { toast } from "react-toastify";

// react icons
import { FiMail, FiLock, FiAlertCircle, FiArrowRight } from "react-icons/fi";

const REMEMBER_ME_STORAGE_KEY = "noviq_remember_email";

export default function LoginPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const cardRef = useRef(null);
    const bannerRef = useRef(null);

    const { status, error } = useSelector((state) => state.auth);
    const isLoading = status === "loading";

    const [rememberMe, setRememberMe] = useState(() => {
        return !!localStorage.getItem(REMEMBER_ME_STORAGE_KEY);
    });
    const [showRememberModal, setShowRememberModal] = useState(false);
    const [pendingCredentials, setPendingCredentials] = useState(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            email: localStorage.getItem(REMEMBER_ME_STORAGE_KEY) || "",
            password: "",
        },
        mode: "onTouched",
    });

    // Entrance GSAP animation
    useEffect(() => {
        const cleanup = animateAuthEntrance(cardRef.current);
        return cleanup;
    }, []);

    // Clear previous errors on mount
    useEffect(() => {
        dispatch(clearAuthError());
    }, [dispatch]);

    // Shake banner on auth error
    useEffect(() => {
        if (error && bannerRef.current) {
            animateErrorShake(bannerRef.current);
        }
    }, [error]);

    const executeSignIn = async (credentials, persistSession) => {
        const sanitizedEmail = sanitizeInput(credentials.email);
        const sanitizedPassword = credentials.password;

        if (persistSession) {
            localStorage.setItem(REMEMBER_ME_STORAGE_KEY, sanitizedEmail);
        } else {
            localStorage.removeItem(REMEMBER_ME_STORAGE_KEY);
        }

        try {
            const resultAction = await dispatch(
                loginUser({
                    email: sanitizedEmail,
                    password: sanitizedPassword,
                }),
            );

            if (loginUser.fulfilled.match(resultAction)) {
                toast.success("Welcome back! Successfully authenticated.");

                // Post-login redirect calculation
                const fromPath = location.state?.from?.pathname;
                if (fromPath) {
                    navigate(fromPath, { replace: true });
                } else {
                    navigate("/account", { replace: true });
                }
            } else {
                const errorMsg =
                    resultAction.payload ||
                    "Invalid email or password credentials.";
                toast.error(errorMsg);
            }
        } catch (err) {
            console.error(err);
            toast.error("An unexpected error occurred while signing in.");
        }
    };

    // Form submission handler
    const onSubmit = (data) => {
        // If user has not checked "Remember Me", trigger the interactive portal warning modal
        if (!rememberMe) {
            setPendingCredentials(data);
            setShowRememberModal(true);
        } else {
            executeSignIn(data, true);
        }
    };

    // Handle proceed without remembering
    const handleProceedWithoutRemembering = () => {
        setShowRememberModal(false);
        if (pendingCredentials) {
            executeSignIn(pendingCredentials, false);
        }
    };

    // Handle remember and proceed
    const handleRememberAndProceed = () => {
        setShowRememberModal(false);
        setRememberMe(true);
        if (pendingCredentials) {
            executeSignIn(pendingCredentials, true);
        }
    };

    return (
        <AuthCardWrapper
            ref={cardRef}
            title="Welcome Back"
            subtitle="Sign in to manage your spaces, schedule, and operations."
            showBackHome
        >
            <form
                onSubmit={handleSubmit(onSubmit)}
                className={styles.form}
                noValidate
            >
                {error && (
                    <div
                        ref={bannerRef}
                        className={styles.errorBanner}
                        role="alert"
                        data-auth-anim
                    >
                        <FiAlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <div data-auth-anim>
                    <MainInput
                        type="email"
                        id="login-email"
                        name="email"
                        label="Email Address"
                        placeholder="you@company.com"
                        icon={<FiMail />}
                        required
                        hasError={!!errors.email}
                        errorMsg={errors.email?.message}
                        register={register("email", {
                            required: "Email address is required",
                            pattern: {
                                value: VALIDATION_PATTERNS.email,
                                message: "Please enter a valid email address",
                            },
                            validate: (value) => {
                                if (
                                    VALIDATION_PATTERNS.dangerousScript.test(
                                        value,
                                    )
                                ) {
                                    return "Invalid characters detected in email";
                                }
                                return true;
                            },
                        })}
                    />
                </div>

                <div data-auth-anim>
                    <MainInput
                        type="password"
                        id="login-password"
                        name="password"
                        label="Password"
                        placeholder="••••••••"
                        icon={<FiLock />}
                        required
                        hasError={!!errors.password}
                        errorMsg={errors.password?.message}
                        register={register("password", {
                            required: "Password is required",
                            minLength: {
                                value: 6,
                                message:
                                    "Password must be at least 6 characters",
                            },
                        })}
                    />
                </div>

                <div className={styles.optionsRow} data-auth-anim>
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            className={styles.checkboxInput}
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <span>Remember me</span>
                    </label>

                    <Link to="/forgot-password" replace className={styles.forgotLink}>
                        Forgot password?
                    </Link>
                </div>

                <div className={styles.submitBtnWrap} data-auth-anim>
                    <MainButton
                        type="submit"
                        variant="primary"
                        size="lg"
                        fullWidth
                        isLoading={isLoading}
                        icon={<FiArrowRight />}
                    >
                        {isLoading
                            ? "Unlocking Space..."
                            : "Begin Your Journey"}
                    </MainButton>
                </div>

                <div className={styles.divider} data-auth-anim>
                    <span>or</span>
                </div>

                <p className={styles.switchPrompt} data-auth-anim>
                    New to NOVIQ?
                    <Link to="/register" replace className={styles.switchLink}>
                        Claim Your Membership <FiArrowRight size={13} />
                    </Link>
                </p>
            </form>

            {/* Interactive Portal Modal for Remember Me Preference */}
            <AuthPortalModal
                isOpen={showRememberModal}
                variant="info"
                title="Stay Signed In?"
                message="You haven't selected 'Remember me'. Your session will automatically expire when you close this window. Would you like to stay remembered on this device?"
                confirmText="Remember Me & Enter"
                cancelText="Proceed Without Remembering"
                onConfirm={handleRememberAndProceed}
                onCancel={handleProceedWithoutRemembering}
            />
        </AuthCardWrapper>
    );
}
