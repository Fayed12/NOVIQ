// local
import AuthCardWrapper from '../../../components/auth/AuthCardWrapper';
import PasswordStrengthMeter from '../../../components/auth/PasswordStrengthMeter';
import MainInput from '../../../components/ui/input/MainInput';
import MainButton from '../../../components/ui/button/MainButton';
import { fetchInviteDetails, acceptInviteThunk } from '../../../redux/slices/inviteSlice';
import { registerUser } from '../../../redux/slices/authSlice';
import { VALIDATION_PATTERNS, sanitizeInput } from '../../../utils/validationPatterns';
import { animateAuthEntrance } from '../../../utils/authAnimations';
import styles from './AcceptInvitePage.module.css';

// react
import { useRef, useEffect } from 'react';

// react-router
import { Link, useNavigate, useSearchParams } from 'react-router';

// react-redux
import { useDispatch, useSelector } from 'react-redux';

// react-hook-form
import { useForm } from 'react-hook-form';

// react-toastify
import { toast } from 'react-toastify';

// react icons
import { FiUserCheck, FiLock, FiAlertTriangle, FiArrowLeft, FiUser, FiBriefcase, FiRefreshCw } from 'react-icons/fi';

export default function AcceptInvitePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const cardRef = useRef(null);
  
  const { user } = useSelector((state) => state.auth);
  const { currentInvite, status, acceptStatus } = useSelector((state) => state.invites);
  
  const isLoading = status === 'loading' || acceptStatus === 'loading';
  const isExistingAccount = !!(user && currentInvite && user.email === currentInvite.email);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const passwordValue = watch('password', '');

  // Fetch invite details on load
  useEffect(() => {
    if (token) {
      dispatch(fetchInviteDetails(token));
    }
  }, [token, dispatch]);

  // Entrance animation
  useEffect(() => {
    const cleanup = animateAuthEntrance(cardRef.current);
    return cleanup;
  }, [currentInvite, status]);

  const handleAcceptForExistingUser = async () => {
    if (!token) return;
    try {
      const resultAction = await dispatch(acceptInviteThunk(token));
      if (acceptInviteThunk.fulfilled.match(resultAction)) {
        toast.success(`You have successfully joined ${currentInvite.tenant_name || 'the team'}!`);
        navigate('/account', { replace: true });
      } else {
        toast.error(resultAction.payload || 'Failed to accept invitation.');
      }
    } catch (err) {
      console.error(err);
      toast.error('An unexpected error occurred while joining team.');
    }
  };

  const onSubmitNewUser = async (data) => {
    if (!token || !currentInvite) return;

    const sanitizedName = sanitizeInput(data.fullName);
    const password = data.password;

    try {
      // Step 1: Create auth user
      const regAction = await dispatch(
        registerUser({
          email: currentInvite.email,
          password,
          fullName: sanitizedName,
        })
      );

      if (registerUser.fulfilled.match(regAction)) {
        // Step 2: Accept invite
        const acceptAction = await dispatch(acceptInviteThunk(token));
        if (acceptInviteThunk.fulfilled.match(acceptAction)) {
          toast.success(`Welcome to ${currentInvite.tenant_name || 'NOVIQ'}! Staff seat confirmed.`);
          navigate('/account', { replace: true });
        } else {
          toast.warning('Account created. Please sign in to verify invite status.');
          navigate('/login', { replace: true });
        }
      } else {
        toast.error(regAction.payload || 'Failed to initialize account.');
      }
    } catch (err) {
      console.error(err);
      toast.error('An unexpected error occurred.');
    }
  };

  const isInvalid = !token || (!isLoading && (!currentInvite || currentInvite.is_valid === false));

  return (
    <AuthCardWrapper
      ref={cardRef}
      title={isInvalid ? undefined : "You're Invited"}
      subtitle={isInvalid ? undefined : "Join the workspace team to manage operations and schedules."}
      wide
    >
      {isLoading && !currentInvite ? (
        <div className={styles.invalidContainer} data-auth-anim>
          <FiRefreshCw className="spin-icon" size={32} color="#0284C7" />
          <p className={styles.invalidText}>Verifying invitation credentials...</p>
        </div>
      ) : isInvalid ? (
        <div className={styles.invalidContainer} data-auth-anim>
          <div className={styles.warningBadge}>
            <FiAlertTriangle />
          </div>

          <h2 className={styles.invalidTitle}>Invalid or Expired Invitation</h2>
          <p className={styles.invalidText}>
            This invitation link is no longer valid, has expired, or was already claimed.
            Please reach out to your business administrator to request a new invite.
          </p>

          <div className={styles.backLinkWrap}>
            <Link to="/login" replace className={styles.backLink}>
              <FiArrowLeft /> Return to Sign In
            </Link>
          </div>
        </div>
      ) : (
        <div>
          {/* Detailed Sender & Workspace Header Info */}
          <div className={styles.inviteHeaderBox} data-auth-anim>
            <div className={styles.businessRow}>
              <div className={styles.businessAvatar}>
                <FiBriefcase />
              </div>
              <div className={styles.businessMeta}>
                <h3 className={styles.businessName}>
                  {currentInvite?.tenant_name || 'NOVIQ Business Workspace'}
                </h3>
                <span className={styles.roleBadge}>
                  Role: {currentInvite?.role || 'Staff Member'}
                </span>
              </div>
            </div>

            <p className={styles.inviteReason}>
              You have been designated to manage appointments, resources, and customer bookings for <strong>{currentInvite?.tenant_name}</strong>.
            </p>

            <p className={styles.senderNote}>
              Invited account: <strong>{currentInvite?.email}</strong>
            </p>
          </div>

          {isExistingAccount ? (
            <div data-auth-anim>
              <div className={styles.existingUserNotice}>
                You are currently signed in with this email. Click below to instantly activate your staff membership.
              </div>

              <div className={styles.submitBtnWrap}>
                <MainButton
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleAcceptForExistingUser}
                  isLoading={isLoading}
                  icon={<FiUserCheck />}
                >
                  {isLoading ? 'Activating Seat...' : `Accept & Join ${currentInvite.tenant_name || 'Team'}`}
                </MainButton>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmitNewUser)} className={styles.form} noValidate>
              <div data-auth-anim>
                <MainInput
                  type="text"
                  id="invite-name"
                  name="fullName"
                  label="Your Full Name"
                  placeholder="Jane Doe"
                  icon={<FiUser />}
                  required
                  hasError={!!errors.fullName}
                  errorMsg={errors.fullName?.message}
                  register={register('fullName', {
                    required: 'Full name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters',
                    },
                    pattern: {
                      value: VALIDATION_PATTERNS.fullName,
                      message: 'Please enter a valid legal name',
                    },
                  })}
                />
              </div>

              <div data-auth-anim>
                <MainInput
                  type="password"
                  id="invite-password"
                  name="password"
                  label="Create Password"
                  placeholder="••••••••"
                  icon={<FiLock />}
                  required
                  hasError={!!errors.password}
                  errorMsg={errors.password?.message}
                  register={register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                    validate: {
                      hasUpper: (v) => /[A-Z]/.test(v) || 'Must contain at least 1 uppercase letter',
                      hasLower: (v) => /[a-z]/.test(v) || 'Must contain at least 1 lowercase letter',
                      hasNumber: (v) => /[0-9]/.test(v) || 'Must contain at least 1 number',
                      hasSpecial: (v) => /[^A-Za-z0-9]/.test(v) || 'Must contain at least 1 special character',
                    },
                  })}
                />
                <PasswordStrengthMeter password={passwordValue} showRules={true} />
              </div>

              <div data-auth-anim>
                <MainInput
                  type="password"
                  id="invite-confirmPassword"
                  name="confirmPassword"
                  label="Confirm Password"
                  placeholder="••••••••"
                  icon={<FiLock />}
                  required
                  hasError={!!errors.confirmPassword}
                  errorMsg={errors.confirmPassword?.message}
                  register={register('confirmPassword', {
                    required: 'Please confirm your password',
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
                  isLoading={isLoading}
                  icon={<FiUserCheck />}
                >
                  {isLoading ? 'Claiming Seat...' : 'Claim Your Staff Seat'}
                </MainButton>
              </div>
            </form>
          )}

          <div className={styles.backLinkWrap} data-auth-anim>
            <Link to="/login" replace className={styles.backLink}>
              <FiArrowLeft /> Already have an account? Sign in
            </Link>
          </div>
        </div>
      )}
    </AuthCardWrapper>
  );
}
