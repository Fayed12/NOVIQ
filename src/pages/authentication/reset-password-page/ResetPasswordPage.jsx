// local
import AuthCardWrapper from '../../../components/auth/AuthCardWrapper';
import AuthPortalModal from '../../../components/auth/AuthPortalModal';
import PasswordStrengthMeter from '../../../components/auth/PasswordStrengthMeter';
import MainInput from '../../../components/ui/input/MainInput';
import MainButton from '../../../components/ui/button/MainButton';
import { resetPassword, logoutUser } from '../../../redux/slices/authSlice';
import { authService } from '../../../services/authService';
import { animateAuthEntrance } from '../../../utils/authAnimations';
import styles from './ResetPasswordPage.module.css';

// react
import { useState, useRef, useEffect } from 'react';

// react-router
import { Link, useNavigate, useSearchParams } from 'react-router';

// react-redux
import { useDispatch, useSelector } from 'react-redux';

// react-hook-form
import { useForm } from 'react-hook-form';

// react-toastify
import { toast } from 'react-toastify';

// react icons
import { FiLock, FiAlertTriangle, FiArrowLeft, FiShield, FiRefreshCw } from 'react-icons/fi';


export default function ResetPasswordPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const cardRef = useRef(null);
  const { user } = useSelector((state) => state.auth);
  const isAuthenticated = !!user;

  const [hasValidToken, setHasValidToken] = useState(true);
  const [isVerifyingToken, setIsVerifyingToken] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [pendingPassword, setPendingPassword] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const passwordValue = watch('password', '');

  // Verify recovery token or session on mount
  useEffect(() => {
    async function checkRecoverySession() {
      try {
        // Supabase recovery token in URL hash or query, or active session
        const session = await authService.getSession();
        const hash = window.location.hash;
        const type = searchParams.get('type');
        
        // If there's an active session or a recovery hash/type
        if (session || hash.includes('type=recovery') || type === 'recovery') {
          setHasValidToken(true);
        } else {
          // If neither session nor recovery tokens present
          setHasValidToken(false);
        }
      } catch (err) {
        console.error(err);
        setHasValidToken(false);
      } finally {
        setIsVerifyingToken(false);
      }
    }

    checkRecoverySession();
  }, [searchParams]);

  // Entrance animation
  useEffect(() => {
    const cleanup = animateAuthEntrance(cardRef.current);
    return cleanup;
  }, [hasValidToken, isVerifyingToken]);

  const executePasswordReset = async (newPassword) => {
    setIsSubmitting(true);
    try {
      const resultAction = await dispatch(resetPassword(newPassword));

      if (resetPassword.fulfilled.match(resultAction)) {
        toast.success('Password updated successfully! All previous sessions terminated.');
        
        // Ensure user is signed out cleanly and directed to login
        await dispatch(logoutUser());
        navigate('/login', { replace: true });
      } else {
        toast.error(resultAction.payload || 'Failed to update password. Link may have expired.');
        setHasValidToken(false);
      }
    } catch (err) {
      console.error(err);
      toast.error('An unexpected error occurred while resetting password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = (data) => {
    // If the user is currently logged in, prompt with portal modal warning about session logout
    if (isAuthenticated) {
      setPendingPassword(data.password);
      setShowWarningModal(true);
    } else {
      executePasswordReset(data.password);
    }
  };

  const handleConfirmReset = () => {
    setShowWarningModal(false);
    if (pendingPassword) {
      executePasswordReset(pendingPassword);
    }
  };

  return (
    <AuthCardWrapper
      ref={cardRef}
      title={hasValidToken ? "Set A New Password" : "Link Expired"}
      subtitle={hasValidToken ? "Choose a strong password to secure your NOVIQ account." : undefined}
    >
      {isVerifyingToken ? (
        <div className={styles.expiredContainer} data-auth-anim>
          <FiRefreshCw className="spin-icon" size={32} color="#0284C7" />
          <p className={styles.expiredText}>Validating security key...</p>
        </div>
      ) : !hasValidToken ? (
        <div className={styles.expiredContainer} data-auth-anim>
          <div className={styles.warningIconBadge}>
            <FiAlertTriangle />
          </div>

          <h2 className={styles.expiredTitle}>This Link Has Expired</h2>
          <p className={styles.expiredText}>
            For your security, password reset links expire after 1 hour or immediately after first use.
          </p>

          <div className={styles.actionBtnWrap}>
            <MainButton
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => navigate('/forgot-password', { replace: true })}
              icon={<FiRefreshCw />}
            >
              Request A New Link
            </MainButton>
          </div>

          <div className={styles.backLinkWrap}>
            <Link to="/login" replace className={styles.backLink}>
              <FiArrowLeft /> Back to Sign In
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
          <div data-auth-anim>
            <MainInput
              type="password"
              id="reset-password"
              name="password"
              label="New Password"
              placeholder="••••••••"
              icon={<FiLock />}
              required
              hasError={!!errors.password}
              errorMsg={errors.password?.message}
              register={register('password', {
                required: 'New password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
                validate: {
                  hasUpper: (v) => /[A-Z]/.test(v) || 'Must contain an uppercase letter',
                  hasLower: (v) => /[a-z]/.test(v) || 'Must contain a lowercase letter',
                  hasNumber: (v) => /[0-9]/.test(v) || 'Must contain a number',
                  hasSpecial: (v) => /[^A-Za-z0-9]/.test(v) || 'Must contain a special character',
                },
              })}
            />
            <PasswordStrengthMeter password={passwordValue} showRules={true} />
          </div>

          <div data-auth-anim>
            <MainInput
              type="password"
              id="reset-confirmPassword"
              name="confirmPassword"
              label="Confirm New Password"
              placeholder="••••••••"
              icon={<FiLock />}
              required
              hasError={!!errors.confirmPassword}
              errorMsg={errors.confirmPassword?.message}
              register={register('confirmPassword', {
                required: 'Please confirm your new password',
                validate: (val) => {
                  if (val !== passwordValue) {
                    return 'Passwords do not match';
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
              isLoading={isSubmitting}
              icon={<FiShield />}
            >
              {isSubmitting ? 'Securing Account...' : 'Solidify New Password'}
            </MainButton>
          </div>

          <div className={styles.backLinkWrap} data-auth-anim>
            <Link to="/login" replace className={styles.backLink}>
              <FiArrowLeft /> Back to Login
            </Link>
          </div>
        </form>
      )}

      {/* Warning Portal Modal for Logged-In Password Reset */}
      <AuthPortalModal
        isOpen={showWarningModal}
        variant="warning"
        title="Security Invalidation Warning"
        message="Updating your password will immediately terminate all active sessions across all devices. You will be signed out and redirected to log in with your new password."
        confirmText="Confirm & Update Password"
        cancelText="Cancel"
        onConfirm={handleConfirmReset}
        onCancel={() => setShowWarningModal(false)}
        isLoading={isSubmitting}
      />
    </AuthCardWrapper>
  );
}