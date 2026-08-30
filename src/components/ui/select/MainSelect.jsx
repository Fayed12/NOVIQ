import Select from "react-select";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { selectTheme } from "../../../redux/themeSlice";
import styles from "./MainSelect.module.css";

/**
 * Modern NOVIQ React Select wrapper
 * Supports Ink & Cream palette, Dark/Light modes, Icons, Custom Option layouts, and validation states.
 */
export default function MainSelect({
    label,
    name,
    options = [],
    value,
    onChange,
    placeholder = "Select an option...",
    isSearchable = true,
    isClearable = false,
    isDisabled = false,
    isLoading = false,
    error,
    helperText,
    icon: Icon,
    className = "",
    formatOptionLabel,
    menuPlacement = "auto",
    menuPortalTarget = typeof document !== "undefined" ? document.body : null,
    menuPosition = "fixed",
    maxMenuHeight = 280,
}) {
    const currentTheme = useSelector(selectTheme);
    const isDark = currentTheme === "dark";

    // Dynamic styles tailored to NOVIQ Design Tokens
    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            backgroundColor: isDark ? "var(--color-ink-800, #1f2a33)" : "var(--color-white, #ffffff)",
            borderColor: error
                ? "var(--color-danger, #dc2626)"
                : state.isFocused
                ? "var(--color-accent-teal, #0e7c86)"
                : isDark
                ? "var(--color-ink-700, #2b3640)"
                : "var(--color-border, #e4e1d9)",
            borderRadius: "8px",
            minHeight: "44px",
            boxShadow: state.isFocused
                ? `0 0 0 3px ${error ? "rgba(220, 38, 38, 0.15)" : "rgba(14, 124, 134, 0.15)"}`
                : "none",
            "&:hover": {
                borderColor: error
                    ? "var(--color-danger, #dc2626)"
                    : state.isFocused
                    ? "var(--color-accent-teal, #0e7c86)"
                    : isDark
                    ? "var(--color-ink-600, #3a444d)"
                    : "var(--color-ink-300, #8b939a)",
            },
            paddingLeft: Icon ? "36px" : "4px",
            cursor: isDisabled ? "not-allowed" : "pointer",
            transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            fontSize: "14px",
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: isDark ? "var(--color-ink-900, #161f26)" : "var(--color-white, #ffffff)",
            borderColor: isDark ? "var(--color-ink-700, #2b3640)" : "var(--color-border, #e4e1d9)",
            borderRadius: "10px",
            boxShadow: isDark
                ? "0 16px 48px rgba(0, 0, 0, 0.7)"
                : "0 16px 48px rgba(22, 31, 38, 0.18)",
            border: `1px solid ${isDark ? "#2b3640" : "#e4e1d9"}`,
            zIndex: 10000000,
            overflow: "hidden",
            padding: "6px",
        }),
        menuPortal: (provided) => ({
            ...provided,
            zIndex: 10000000,
            pointerEvents: "auto",
        }),
        menuList: (provided) => ({
            ...provided,
            padding: "2px",
            maxHeight: `${maxMenuHeight}px`,
            "::-webkit-scrollbar": {
                width: "6px",
            },
            "::-webkit-scrollbar-track": {
                background: "transparent",
            },
            "::-webkit-scrollbar-thumb": {
                background: isDark ? "#3a444d" : "#cbd5e1",
                borderRadius: "3px",
            },
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? isDark
                    ? "rgba(14, 124, 134, 0.3)"
                    : "rgba(14, 124, 134, 0.12)"
                : state.isFocused
                ? isDark
                    ? "rgba(255, 255, 255, 0.08)"
                    : "rgba(243, 242, 238, 0.95)"
                : "transparent",
            color: state.isSelected
                ? isDark
                    ? "#5eead4"
                    : "#0e7c86"
                : isDark
                ? "#f3f2ee"
                : "#161f26",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: state.isSelected ? "600" : "400",
            cursor: "pointer",
            padding: "10px 12px",
            transition: "background 0.15s ease",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            margin: "2px 0",
            "&:active": {
                backgroundColor: isDark ? "rgba(14, 124, 134, 0.4)" : "rgba(14, 124, 134, 0.2)",
            },
        }),
        singleValue: (provided) => ({
            ...provided,
            color: isDark ? "#f3f2ee" : "#161f26",
            fontSize: "14px",
            fontWeight: "500",
        }),
        input: (provided) => ({
            ...provided,
            color: isDark ? "#f3f2ee" : "#161f26",
        }),
        placeholder: (provided) => ({
            ...provided,
            color: isDark ? "#8b939a" : "#8b939a",
            fontSize: "14px",
        }),
        indicatorSeparator: () => ({
            display: "none",
        }),
        dropdownIndicator: (provided, state) => ({
            ...provided,
            color: state.isFocused
                ? isDark
                    ? "#5eead4"
                    : "#0e7c86"
                : isDark
                ? "#8b939a"
                : "#8b939a",
            transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
            padding: "8px",
            "&:hover": {
                color: isDark ? "#f3f2ee" : "#161f26",
            },
        }),
        clearIndicator: (provided) => ({
            ...provided,
            color: isDark ? "#8b939a" : "#8b939a",
            cursor: "pointer",
            "&:hover": {
                color: isDark ? "#ef4444" : "#dc2626",
            },
        }),
    };

    return (
        <div className={`${styles.selectGroup} ${className}`}>
            {label && (
                <label htmlFor={name} className={styles.label}>
                    {label}
                </label>
            )}

            <div className={styles.selectWrapper}>
                {Icon && (
                    <div className={styles.leadingIcon}>
                        <Icon size={18} />
                    </div>
                )}

                <Select
                    inputId={name}
                    name={name}
                    options={options}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    isSearchable={isSearchable}
                    isClearable={isClearable}
                    isDisabled={isDisabled}
                    isLoading={isLoading}
                    styles={customStyles}
                    formatOptionLabel={formatOptionLabel}
                    menuPlacement={menuPlacement}
                    menuPortalTarget={menuPortalTarget}
                    menuPosition={menuPosition}
                    maxMenuHeight={maxMenuHeight}
                />
            </div>

            {error ? (
                <span className={styles.errorText}>{error}</span>
            ) : helperText ? (
                <span className={styles.helperText}>{helperText}</span>
            ) : null}
        </div>
    );
}

MainSelect.propTypes = {
    label: PropTypes.node,
    name: PropTypes.string,
    options: PropTypes.array,
    value: PropTypes.any,
    onChange: PropTypes.func,
    placeholder: PropTypes.string,
    isSearchable: PropTypes.bool,
    isClearable: PropTypes.bool,
    isDisabled: PropTypes.bool,
    isLoading: PropTypes.bool,
    error: PropTypes.string,
    helperText: PropTypes.string,
    icon: PropTypes.elementType,
    className: PropTypes.string,
    formatOptionLabel: PropTypes.func,
    menuPlacement: PropTypes.string,
    menuPortalTarget: PropTypes.any,
    menuPosition: PropTypes.string,
    maxMenuHeight: PropTypes.number,
};
