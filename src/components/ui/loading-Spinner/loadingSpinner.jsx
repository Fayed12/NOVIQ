// local
import styles from "./loadingSpinner.module.css";

// prop-types
import PropTypes from "prop-types";

const LoadingSpinner = ({
    size = "md",
    color = "primary",
    label = "",
    className = "",
}) => {
    return (
        <span
            className={`${styles.wrap} ${className}`.trim()}
            role="status"
            aria-label={label || "Loading..."}
            aria-live="polite"
        >
            <span
                className={styles.spinner}
                data-size={size}
                data-color={color}
            />
            {label && (
                <span className={styles.label} aria-hidden="true">
                    {label}
                </span>
            )}
        </span>
    );
};

LoadingSpinner.propTypes = {
    size: PropTypes.oneOf(["xs", "sm", "md", "lg", "xl"]),
    color: PropTypes.oneOf(["primary", "info", "danger", "warning", "white", "neutral"]),
    label: PropTypes.string,
    className: PropTypes.string,
};

export default LoadingSpinner;
