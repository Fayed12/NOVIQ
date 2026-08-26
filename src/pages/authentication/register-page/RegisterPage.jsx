// local
import AuthCardWrapper from '../../../components/auth/AuthCardWrapper';
import PasswordStrengthMeter from '../../../components/auth/PasswordStrengthMeter';
import MainInput from '../../../components/ui/input/MainInput';
import MainButton from '../../../components/ui/button/MainButton';
import { registerUser, clearAuthError } from '../../../redux/slices/authSlice';
import { VALIDATION_PATTERNS, sanitizeInput } from '../../../utils/validationPatterns';
import { animateAuthEntrance, animateErrorShake } from '../../../utils/authAnimations';
import styles from './RegisterPage.module.css';

// react
import { useRef, useEffect } from 'react';

// react-router
import { Link, useNavigate } from 'react-router';

// react-redux
import { useDispatch, useSelector } from 'react-redux';

// react-hook-form
import { useForm } from 'react-hook-form';

// react-toastify
import { toast } from 'react-toastify';

// react icons
import { FiUser, FiMail, FiLock, FiAlertCircle, FiArrowRight } from 'react-icons/fi';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const cardRef = useRef(null);
  const bannerRef = useRef(null);

  const { status, error } = useSelector((state) => state.auth);
  const isLoading = status === 'loading';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
    mode: 'onChange',
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const passwordValue = watch('password', '');

  // GSAP entrance animation
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

  // Form submission handler
  const onSubmit = async (data) => {
    const sanitizedName = sanitizeInput(data.fullName);
    const sanitizedEmail = sanitizeInput(data.email);
    const password = data.password;

    try {
      const resultAction = await dispatch(
        registerUser({
          email: sanitizedEmail,
          password,
          fullName: sanitizedName,
        })
      );

      if (registerUser.fulfilled.match(resultAction)) {
        toast.success('Registration successful! Verification link dispatched.');
        navigate('/verify-email', {
          state: { email: sanitizedEmail },
          replace: true,
        });
      } else {
        const errorMsg = resultAction.payload || 'Failed to create account. Please check your details.';
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error(err);
      toast.error('An unexpected error occurred during account creation.');
    }
  };

  return (
    <AuthCardWrapper
      ref={cardRef}
      title="Create Your Account"
      subtitle="Book with confidence, or list your business in minutes."
      wide
      showBackHome
    >
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
        {error && (
          <div ref={bannerRef} className={styles.errorBanner} role="alert" data-auth-anim>
            <FiAlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div data-auth-anim>
          <MainInput
            type="text"
            id="register-fullName"
            name="fullName"
            label="Full Name"
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
              maxLength: {
                value: 60,
                message: 'Name cannot exceed 60 characters',
              },
              pattern: {
                value: VALIDATION_PATTERNS.fullName,
                message: 'Please enter a valid legal name (letters and spaces only)',
              },
              validate: (val) => {
                if (VALIDATION_PATTERNS.dangerousScript.test(val)) {
                  return 'Invalid characters or scripts detected';
                }
                return true;
              },
            })}
          />
        </div>

        <div data-auth-anim>
          <MainInput
            type="email"
            id="register-email"
            name="email"
            label="Email Address"
            placeholder="jane@company.com"
            icon={<FiMail />}
            required
            hasError={!!errors.email}
            errorMsg={errors.email?.message}
            register={register('email', {
              required: 'Email address is required',
              pattern: {
                value: VALIDATION_PATTERNS.email,
                message: 'Please enter a valid email address',
              },
              validate: (val) => {
                if (VALIDATION_PATTERNS.dangerousScript.test(val)) {
                  return 'Invalid characters or scripts detected';
                }
                return true;
              },
            })}
          />
        </div>

        <div data-auth-anim>
          <MainInput
            type="password"
            id="register-password"
            name="password"
            label="Password"
            placeholder="••••••••"
            icon={<FiLock />}
            required
            hasError={!!errors.password}
            errorMsg={errors.password?.message}
            register={register('password', {
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters long',
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
            id="register-confirmPassword"
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

        <div data-auth-anim>
          <label className={styles.termsLabel}>
            <input
              type="checkbox"
              className={styles.termsCheckbox}
              {...register('terms', {
                required: 'You must agree to the Terms of Service and Privacy Policy',
              })}
            />
            <span>
              I agree to the NOVIQ <Link to="/terms" target="_blank" className={styles.termsLink}>Terms of Service</Link> and <Link to="/privacy" target="_blank" className={styles.termsLink}>Privacy Policy</Link>
            </span>
          </label>
          {errors.terms && <p className={styles.termsError}>{errors.terms.message}</p>}
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
            {isLoading ? 'Creating Account...' : 'Claim Your Membership'}
          </MainButton>
        </div>

        <div className={styles.divider} data-auth-anim>
          <span>or</span>
        </div>

        <p className={styles.switchPrompt} data-auth-anim>
          Already have an account?
          <Link to="/login" replace className={styles.switchLink}>
            Begin Journey <FiArrowRight size={13} />
          </Link>
        </p>
      </form>
    </AuthCardWrapper>
  );
}