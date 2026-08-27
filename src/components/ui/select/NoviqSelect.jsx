// local
import { selectTheme } from "../../../redux/themeSlice";

// react-redux
import { useSelector } from "react-redux";

// react-select
import Select from "react-select";

/**
 * NOVIQ Universal React-Select Component
 * Features perfect prefix icon positioning inside the control box and zIndex 999999 body portaling.
 */
const NoviqSelect = ({
    options = [],
    value,
    onChange,
    placeholder = "Select...",
    isSearchable = true,
    isClearable = false,
    isDisabled = false,
    className = "",
    prefixIcon = null,
    menuPlacement = "auto",
    ...props
}) => {
    const currentTheme = useSelector(selectTheme);
    const isDark = currentTheme === "dark";

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
            borderColor: state.isFocused
                ? "#0E7C86"
                : isDark
                ? "#334155"
                : "#E4E1D9",
            borderRadius: "8px",
            minHeight: "44px",
            height: "44px",
            boxShadow: state.isFocused ? "0 0 0 2px rgba(14, 124, 134, 0.2)" : "none",
            "&:hover": {
                borderColor: "#0E7C86",
            },
            cursor: "pointer",
            fontSize: "13.5px",
            fontWeight: "500",
            paddingLeft: prefixIcon ? "32px" : "6px",
            position: "relative",
            transition: "all 0.2s ease",
        }),
        menuPortal: (base) => ({
            ...base,
            zIndex: 999999,
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: isDark ? "#161F26" : "#FFFFFF",
            borderColor: isDark ? "#24303B" : "#E4E1D9",
            borderWidth: "1px",
            borderStyle: "solid",
            borderRadius: "10px",
            boxShadow: isDark
                ? "0 14px 40px rgba(0, 0, 0, 0.6)"
                : "0 14px 40px rgba(22, 31, 38, 0.15)",
            zIndex: 999999,
            overflow: "hidden",
            padding: "6px",
        }),
        menuList: (provided) => ({
            ...provided,
            padding: "2px",
            maxHeight: "240px",
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? "#0E7C86"
                : state.isFocused
                ? isDark
                    ? "#1E293B"
                    : "#F3F2EE"
                : "transparent",
            color: state.isSelected
                ? "#FFFFFF"
                : isDark
                ? "#F3F2EE"
                : "#161F26",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: state.isSelected ? "700" : "500",
            cursor: "pointer",
            padding: "9px 12px",
            transition: "all 0.15s ease",
            "&:active": {
                backgroundColor: "#0E7C86",
                color: "#FFFFFF",
            },
        }),
        singleValue: (provided) => ({
            ...provided,
            color: isDark ? "#F3F2EE" : "#161F26",
            fontSize: "13.5px",
            fontWeight: "600",
        }),
        placeholder: (provided) => ({
            ...provided,
            color: isDark ? "#64748B" : "#8B939A",
            fontSize: "13.5px",
        }),
        input: (provided) => ({
            ...provided,
            color: isDark ? "#F3F2EE" : "#161F26",
            fontSize: "13.5px",
        }),
        dropdownIndicator: (provided, state) => ({
            ...provided,
            color: state.isFocused ? "#0E7C86" : isDark ? "#64748B" : "#8B939A",
            "&:hover": {
                color: "#0E7C86",
            },
            padding: "8px",
        }),
        indicatorSeparator: () => ({
            display: "none",
        }),
    };

    return (
        <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "center" }}>
            {prefixIcon && (
                <span
                    style={{
                        position: "absolute",
                        left: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        zIndex: 3,
                        pointerEvents: "none",
                        color: "#0E7C86",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "17px",
                    }}
                >
                    {prefixIcon}
                </span>
            )}
            <div style={{ width: "100%" }}>
                <Select
                    options={options}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    isSearchable={isSearchable}
                    isClearable={isClearable}
                    isDisabled={isDisabled}
                    styles={customStyles}
                    menuPlacement={menuPlacement}
                    menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                    className={className}
                    {...props}
                />
            </div>
        </div>
    );
};

export default NoviqSelect;
