// local
import AuthCardWrapper from '../../../components/auth/AuthCardWrapper';
import MainInput from '../../../components/ui/input/MainInput';
import MainButton from '../../../components/ui/button/MainButton';
import { requestPasswordReset } from '../../../redux/slices/authSlice';
import { VALIDATION_PATTERNS, sanitizeInput } from '../../../utils/validationPatterns';
import { animateAuthEntrance } from '../../../utils/authAnimations';
import styles from './ForgotPasswordPage.module.css';

// react
import { useState, useRef, useEffect } from 'react';

// react-router
import { Link } from 'react-router';

// react-redux
import { useDispatch, useSelector } from 'react-redux';

// react-hook-form
import { useForm } from 'react-hook-form';

// react-toastify
import { toast } from 'react-toastify';

// react icons
import { FiMail, FiArrowLeft, FiCheck, FiShield, FiSend } from 'react-icons/fi';

export default function ForgotPasswordPage() {
  const dispatch = useDispatch();
  const cardRef = useRef(null);
  
  const { user } = useSelector((state) => state.auth);
  const isAuthenticated = !!user;

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: user?.email || '',
    },
    mode: 'onTouched',
  });

  // Entrance animation
  useEffect(() => {
    const cleanup = animateAuthEntrance(cardRef.current);
    return cleanup;
  }, [isSubmitted]);

  // Form submission handler
  const onSubmit = async (data) => {
    const emailToUse = isAuthenticated ? user.email : sanitizeInput(data.email);

    setIsSending(true);
    try {
      // Dispatch reset request
      await dispatch(requestPasswordReset(emailToUse));
      // Always transition to success state to prevent email enumeration attacks
      setIsSubmitted(true);
      toast.info('Password recovery instructions dispatched.');
    } catch (err) {
      console.error(err);
      // Even on error, show the safe state for security
      setIsSubmitted(true);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AuthCardWrapper
      ref={cardRef}
      title={isSubmitted ? undefined : "Forgot Your Password?"}
      subtitle={isSubmitted ? undefined : "Enter your registered email and we'll dispatch secure recovery instructions."}
    >
      {isSubmitted ? (
        <div className={styles.successContainer}>
          <div className={styles.successIconBadge} data-auth-anim>
            <FiCheck />
          </div>

          <h2 className={styles.successTitle} data-auth-anim>Check Your Inbox</h2>

          <p className={styles.successText} data-auth-anim>
            If an active NOVIQ account exists for that email, we've dispatched password reset instructions.
            Please allow a few minutes and check your spam folder.
          </p>

          <div className={styles.backLinkWrap} data-auth-anim>
            <Link to="/login" replace className={styles.backLink}>
              <FiArrowLeft /> Return to Sign In
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
          {isAuthenticated && (
            <div className={styles.loggedInBadgeBox} data-auth-anim>
              <FiShield className={styles.loggedInBadgeIcon} />
              <span>
                You are currently signed in as <strong>{user.email}</strong>. Reset instructions will be dispatched to your account.
              </span>
            </div>
          )}

          <div data-auth-anim>
            <MainInput
              type="email"
              id="forgot-email"
              name="email"
              label="Account Email Address"
              placeholder="you@company.com"
              icon={<FiMail />}
              required
              disabled={isAuthenticated || isSending}
              hasError={!isAuthenticated && !!errors.email}
              errorMsg={errors.email?.message}
              register={register('email', {
                required: !isAuthenticated && 'Email address is required',
                pattern: {
                  value: VALIDATION_PATTERNS.email,
                  message: 'Please enter a valid email address',
                },
                validate: (val) => {
                  if (VALIDATION_PATTERNS.dangerousScript.test(val)) {
                    return 'Invalid characters detected';
                  }
                  return true;
                },
              })}
            />
          </div>

          <div className={styles.submitBtnWrap} data-auth-anim>
            <MainButton
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isSending}
              icon={<FiSend />}
            >
              {isSending ? 'Dispatching Key...' : 'Dispatch Recovery Link'}
            </MainButton>
          </div>

          <div className={styles.backLinkWrap} data-auth-anim>
            <Link to="/login" replace className={styles.backLink}>
              <FiArrowLeft /> Back to Sign In
            </Link>
          </div>
        </form>
      )}
    </AuthCardWrapper>
  );
}
