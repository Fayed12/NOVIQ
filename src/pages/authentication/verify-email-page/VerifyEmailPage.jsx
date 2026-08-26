// local
import AuthCardWrapper from '../../../components/auth/AuthCardWrapper';
import MainButton from '../../../components/ui/button/MainButton';
import { resendVerificationEmail, logoutUser } from '../../../redux/slices/authSlice';
import { authService } from '../../../services/authService';
import { maskEmail } from '../../../utils/validationPatterns';
import { animateAuthEntrance, animateFloatingBadge } from '../../../utils/authAnimations';
import styles from './VerifyEmailPage.module.css';

// react
import { useState, useEffect, useRef } from 'react';

// react-router
import { useLocation, useNavigate } from 'react-router';

// react-redux
import { useDispatch, useSelector } from 'react-redux';

// react-toastify
import { toast } from 'react-toastify';

// react icons
import { FiMail, FiRefreshCw, FiLogOut, FiCheckCircle } from 'react-icons/fi';


const RESEND_COOLDOWN_SECONDS = 45;

export default function VerifyEmailPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const cardRef = useRef(null);
  const badgeRef = useRef(null);

  const { user } = useSelector((state) => state.auth);
  
  // Prefer email from router state or authenticated session
  const targetEmail = location.state?.email || user?.email || '';

  const [countdown, setCountdown] = useState(RESEND_COOLDOWN_SECONDS);
  const [isSending, setIsSending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // Derived state avoids synchronous setState inside effect
  const isUserVerified = isVerified || Boolean(user?.email_confirmed_at || user?.confirmed_at);

  // GSAP animations
  useEffect(() => {
    const cleanupEntrance = animateAuthEntrance(cardRef.current);
    const cleanupFloat = animateFloatingBadge(badgeRef.current);
    return () => {
      cleanupEntrance?.();
      cleanupFloat?.();
    };
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Polling / listening for verification state change
  useEffect(() => {
    // If already verified, schedule redirect
    if (user?.email_confirmed_at || user?.confirmed_at) {
      const redirectTimer = setTimeout(() => {
        navigate('/account', { replace: true });
      }, 1500);
      return () => clearTimeout(redirectTimer);
    }

    // Subscribe to auth events (e.g. user confirmed email in another window)
    const unsubscribe = authService.onAuthStateChange((event, session) => {
      if (session?.user?.email_confirmed_at || session?.user?.confirmed_at) {
        setIsVerified(true);
        toast.success('Email confirmed! Unlocking your NOVIQ space...');
        setTimeout(() => {
          navigate('/account', { replace: true });
        }, 1500);
      }
    });

    return unsubscribe;
  }, [user, navigate]);

  // Handle resend verification email
  const handleResend = async () => {
    if (countdown > 0 || isSending) return;
    
    if (!targetEmail) {
      toast.error('No email address provided for verification.');
      return;
    }

    setIsSending(true);
    try {
      const actionResult = await dispatch(resendVerificationEmail(targetEmail));
      if (resendVerificationEmail.fulfilled.match(actionResult)) {
        toast.success('Verification email dispatched! Please check your inbox.');
        setCountdown(RESEND_COOLDOWN_SECONDS);
      } else {
        toast.error(actionResult.payload || 'Failed to resend email. Please try again later.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Unexpected error while resending verification.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSignOut = async () => {
    await dispatch(logoutUser());
    navigate('/login', { replace: true });
  };

  return (
    <AuthCardWrapper ref={cardRef} showLogo={true}>
      <div className={styles.container}>
        {isUserVerified ? (
          <div className={styles.successVerifiedCard} data-auth-anim>
            <div className={styles.successBadge}>
              <FiCheckCircle />
            </div>
            <h2 className={styles.title}>Email Verified!</h2>
            <p className={styles.instruction}>
              Your account is fully verified. Launching your NOVIQ space...
            </p>
          </div>
        ) : (
          <>
            <div ref={badgeRef} className={styles.mailBadgeWrap} data-auth-anim>
              <div className={styles.pulseRing} />
              <FiMail />
            </div>

            <h2 className={styles.title} data-auth-anim>Check Your Inbox</h2>

            <p className={styles.instruction} data-auth-anim>
              We've dispatched a secure activation link to:
              <br />
              <span className={styles.emailHighlight}>
                {targetEmail ? maskEmail(targetEmail) : 'your email address'}
              </span>
            </p>

            <div className={styles.actionBox} data-auth-anim>
              <MainButton
                variant="primary"
                size="md"
                onClick={handleResend}
                disabled={countdown > 0 || isSending}
                isLoading={isSending}
                icon={<FiRefreshCw className={isSending ? 'spin-icon' : ''} />}
                className={styles.resendBtn}
              >
                {countdown > 0
                  ? `Resend Key in ${countdown}s`
                  : 'Resend Verification Key'}
              </MainButton>

              {countdown > 0 && (
                <p className={styles.countdownNote}>
                  Link active. You can request a fresh key when the timer expires.
                </p>
              )}
            </div>

            <div className={styles.wrongEmailWrap} data-auth-anim>
              <MainButton
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                icon={<FiLogOut />}
                className={styles.signOutBtn}
              >
                Wrong email? Sign out and restart
              </MainButton>
            </div>
          </>
        )}
      </div>
    </AuthCardWrapper>
  );
}