// local
import styles from "./MainButton.module.css";
import LoadingSpinner from "../loading-Spinner/loadingSpinner";

// prop-types
import PropTypes from "prop-types";

const MainButton = ({
    type = "button",
    children,
    variant = "primary",
    action,
    size = "md",
    onClick,
    clickEvent,
    disabled = false,
    isDisabled = false,
    isLoading = false,
    loadingText,
    icon,
    rightIcon,
    href,
    className = "",
    fullWidth = false,
    ...props
}) => {
    // Fallback support for old prop names
    const activeVariant = action || variant;
    const activeDisabled = disabled || isDisabled || isLoading;
    const activeClick = onClick || clickEvent;

    const buttonContent = (
        <>
            {isLoading ? (
                <>
                    <LoadingSpinner 
                        size={size === "sm" || size === "xs" ? "xs" : "sm"} 
                        color={activeVariant === "primary" || activeVariant === "danger" || activeVariant === "success" ? "white" : "primary"} 
                    />
                    <span>{loadingText || children}</span>
                </>
            ) : (
                <>
                    {icon && <span className={styles.btnIconLeft}>{icon}</span>}
                    <span className={styles.btnText}>{children}</span>
                    {rightIcon && <span className={styles.btnIconRight}>{rightIcon}</span>}
                </>
            )}
        </>
    );

    const sharedProps = {
        className: `${styles.btn} ${fullWidth ? styles.fullWidth : ""} ${className}`.trim(),
        "data-variant": activeVariant,
        "data-size": size,
        "data-loading": isLoading ? "true" : undefined,
        ...props
    };

    if (href) {
        return (
            <a 
                href={activeDisabled ? undefined : href} 
                {...sharedProps} 
                aria-disabled={activeDisabled ? "true" : undefined}
                tabIndex={activeDisabled ? -1 : undefined}
            >
                {buttonContent}
            </a>
        );
    }

    return (
        <button
            {...sharedProps}
            type={type}
            onClick={activeClick}
            disabled={activeDisabled}
        >
            {buttonContent}
        </button>
    );
};

MainButton.propTypes = {
    type: PropTypes.string,
    children: PropTypes.node,
    variant: PropTypes.oneOf(["primary", "secondary", "ghost", "outline", "danger", "success", "glass"]),
    action: PropTypes.oneOf(["primary", "secondary", "ghost", "outline", "danger", "success", "glass"]),
    size: PropTypes.oneOf(["xs", "sm", "md", "lg", "xl", "compact"]),
    onClick: PropTypes.func,
    clickEvent: PropTypes.func,
    disabled: PropTypes.bool,
    isDisabled: PropTypes.bool,
    isLoading: PropTypes.bool,
    loadingText: PropTypes.string,
    icon: PropTypes.node,
    rightIcon: PropTypes.node,
    href: PropTypes.string,
    className: PropTypes.string,
    fullWidth: PropTypes.bool,
};

export default MainButton;