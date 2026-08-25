import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import PropTypes from "prop-types";

// Dynamic custom styling based on index.css theme variables
const getCustomStyles = () => ({
    container: (provided) => ({
        ...provided,
        width: "100%",
    }),
    control: (provided, state) => ({
        ...provided,
        backgroundColor: "var(--bg-surface)",
        borderColor: state.isFocused ? "var(--color-accent)" : "var(--border-color)",
        borderRadius: "var(--radius-md)",
        minHeight: "40px",
        height: "40px",
        boxShadow: state.isFocused ? "0 0 0 3px var(--color-accent-ring)" : "none",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-sm)",
        color: "var(--text-primary)",
        transition: "border-color var(--transition-fast), box-shadow var(--transition-base)",
        "&:hover": {
            borderColor: state.isFocused ? "var(--color-accent)" : "var(--border-color-strong)",
        },
    }),
    valueContainer: (provided) => ({
        ...provided,
        padding: "0 var(--space-md)",
        height: "100%",
        display: "flex",
        alignItems: "center",
    }),
    input: (provided) => ({
        ...provided,
        color: "var(--text-primary)",
        margin: 0,
        padding: 0,
    }),
    placeholder: (provided) => ({
        ...provided,
        color: "var(--text-muted)",
        fontSize: "var(--text-sm)",
    }),
    singleValue: (provided) => ({
        ...provided,
        color: "var(--text-primary)",
        fontSize: "var(--text-sm)",
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-lg)",
        zIndex: "var(--z-dropdown)",
        overflow: "hidden",
        marginTop: "4px",
    }),
    menuList: (provided) => ({
        ...provided,
        padding: "var(--space-xs) 0",
        backgroundColor: "var(--bg-surface)",
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected
            ? "var(--color-accent)"
            : state.isFocused
            ? "var(--bg-surface-alt)"
            : "transparent",
        color: state.isSelected
            ? "var(--text-on-accent)"
            : "var(--text-primary)",
        cursor: "pointer",
        fontSize: "var(--text-sm)",
        padding: "8px 16px",
        "&:active": {
            backgroundColor: state.isSelected ? "var(--color-accent)" : "var(--color-accent-soft)",
        },
    }),
    multiValue: (provided) => ({
        ...provided,
        backgroundColor: "var(--bg-surface-alt)",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-sm)",
    }),
    multiValueLabel: (provided) => ({
        ...provided,
        color: "var(--text-primary)",
        fontSize: "var(--text-xs)",
        padding: "2px 6px",
    }),
    multiValueRemove: (provided) => ({
        ...provided,
        color: "var(--text-muted)",
        "&:hover": {
            backgroundColor: "var(--color-danger-light)",
            color: "var(--color-danger)",
        },
    }),
    dropdownIndicator: (provided, state) => ({
        ...provided,
        color: "var(--text-muted)",
        padding: "0 var(--space-sm)",
        transition: "transform var(--transition-fast), color var(--transition-fast)",
        transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : "none",
        "&:hover": {
            color: "var(--text-primary)",
        },
    }),
    indicatorSeparator: (provided) => ({
        ...provided,
        backgroundColor: "var(--border-color)",
        margin: "8px 0",
    }),
    clearIndicator: (provided) => ({
        ...provided,
        color: "var(--text-muted)",
        padding: "0 var(--space-xs)",
        "&:hover": {
            color: "var(--color-danger)",
        },
    }),
});

const CustomSelect = ({
    options = [],
    value,
    onChange,
    isMulti = false,
    isCreatable = false,
    placeholder = "Select...",
    isDisabled = false,
    isClearable = false,
    className = "",
    label,
    errorMsg,
    hint,
    required = false,
    ...props
}) => {
    // Standardize options to { value, label } format
    const formattedOptions = options.map((opt) => {
        if (typeof opt === "string" || typeof opt === "number") {
            return { value: opt, label: String(opt) };
        }
        return opt;
    });

    // Helper to find the matched option object for the selected value
    const getOptionFromValue = (val) => {
        if (isMulti) {
            if (!val) return [];
            const valArray = Array.isArray(val) ? val : [val];
            return valArray.map((v) => {
                if (typeof v === "object" && v !== null && "value" in v) return v;
                const found = formattedOptions.find((o) => o.value === v);
                return found || { value: v, label: String(v) };
            });
        } else {
            if (val === undefined || val === null || val === "") return null;
            if (typeof val === "object" && "value" in val) return val;
            const found = formattedOptions.find((o) => o.value === val);
            return found || { value: val, label: String(val) };
        }
    };

    const selectValue = getOptionFromValue(value);

    // Call onChange with the raw values
    const handleChange = (selected) => {
        if (isMulti) {
            const values = selected ? selected.map((o) => o.value) : [];
            onChange(values);
        } else {
            onChange(selected ? selected.value : "");
        }
    };

    const SelectComponent = isCreatable ? CreatableSelect : Select;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)", width: "100%" }}>
            {label && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "var(--text-xs)",
                        fontWeight: "var(--fw-medium)",
                        color: "var(--text-primary)"
                    }}>
                        {label}
                        {required && <span style={{ color: "var(--color-danger)" }}> *</span>}
                    </label>
                    {hint && !errorMsg && (
                        <span style={{ fontSize: "var(--text-tiny)", color: "var(--text-muted)" }}>{hint}</span>
                    )}
                </div>
            )}

            <SelectComponent
                options={formattedOptions}
                value={selectValue}
                onChange={handleChange}
                isMulti={isMulti}
                placeholder={placeholder}
                isDisabled={isDisabled}
                isClearable={isClearable}
                styles={getCustomStyles()}
                className={className}
                classNamePrefix="react-select"
                {...props}
            />

            {errorMsg && (
                <p style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--color-danger)",
                    fontFamily: "var(--font-sans)",
                    marginTop: "2px"
                }} role="alert">
                    {errorMsg}
                </p>
            )}
        </div>
    );
};

CustomSelect.propTypes = {
    options: PropTypes.arrayOf(
        PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
            PropTypes.shape({
                value: PropTypes.any.isRequired,
                label: PropTypes.string.isRequired
            })
        ])
    ),
    value: PropTypes.any,
    onChange: PropTypes.func.isRequired,
    isMulti: PropTypes.bool,
    isCreatable: PropTypes.bool,
    placeholder: PropTypes.string,
    isDisabled: PropTypes.bool,
    isClearable: PropTypes.bool,
    className: PropTypes.string,
    label: PropTypes.string,
    errorMsg: PropTypes.string,
    hint: PropTypes.string,
    required: PropTypes.bool,
};

export default CustomSelect;
