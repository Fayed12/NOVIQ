// local
import styles from "./MainInput.module.css";

// react
import { forwardRef, useState } from "react";

// prop-types
import PropTypes from "prop-types";

// icons
import { FiEye, FiEyeOff } from "react-icons/fi";

const MainInput = forwardRef(({
    type = "text",
    name,
    id,
    placeholder,
    title,
    label,
    hint,
    size = "md",
    icon,
    rightAction,
    hasError = false,
    errorMsg = "",
    hasSuccess = false,
    disabled = false,
    register,
    className = "",
    required = false,
    ...props
}, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordField = type === "password";
    const computedType = isPasswordField ? (showPassword ? "text" : "password") : type;

    const inputId = id || name;
    const activeLabel = title || label;

    return (
        <div className={styles.wrapper}>
            {activeLabel && (
                <div className={styles.labelRow}>
                    <label className={styles.label} htmlFor={inputId}>
                        {activeLabel}
                        {required && <span className={styles.requiredStar}> *</span>}
                    </label>
                    {hint && !hasError && <span className={styles.hint}>{hint}</span>}
                </div>
            )}

            <div className={styles.inputContainer}>
                {icon && <span className={styles.inputIconLeft}>{icon}</span>}

                <input
                    id={inputId}
                    ref={ref}
                    className={`${styles.input} ${icon ? styles.hasLeftIcon : ""} ${
                        isPasswordField || rightAction ? styles.hasRightIcon : ""
                    } ${className}`.trim()}
                    type={computedType}
                    name={name}
                    placeholder={placeholder}
                    aria-label={activeLabel || placeholder}
                    aria-invalid={hasError ? "true" : undefined}
                    aria-describedby={hasError ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
                    disabled={disabled}
                    data-size={size}
                    data-error={hasError ? "true" : undefined}
                    data-success={hasSuccess ? "true" : undefined}
                    {...register}
                    {...props}
                />

                {isPasswordField && (
                    <button
                        type="button"
                        className={styles.passwordToggle}
                        onClick={() => setShowPassword((prev) => !prev)}
                        tabIndex={-1}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                )}

                {!isPasswordField && rightAction && (
                    <div className={styles.rightActionWrap}>{rightAction}</div>
                )}
            </div>

            {hasError && errorMsg && (
                <p id={`${inputId}-error`} className={styles.errorMsg} role="alert">
                    {errorMsg}
                </p>
            )}

            {hint && !activeLabel && !hasError && (
                <p id={`${inputId}-hint`} className={styles.hintMsg}>
                    {hint}
                </p>
            )}
        </div>
    );
});

MainInput.displayName = "MainInput";

MainInput.propTypes = {
    type: PropTypes.string,
    name: PropTypes.string,
    id: PropTypes.string,
    placeholder: PropTypes.string,
    title: PropTypes.string,
    label: PropTypes.string,
    hint: PropTypes.string,
    size: PropTypes.oneOf(["sm", "md", "lg"]),
    icon: PropTypes.node,
    rightAction: PropTypes.node,
    hasError: PropTypes.bool,
    errorMsg: PropTypes.string,
    hasSuccess: PropTypes.bool,
    disabled: PropTypes.bool,
    register: PropTypes.object,
    className: PropTypes.string,
    required: PropTypes.bool,
};

export default MainInput;