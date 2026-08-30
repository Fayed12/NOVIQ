// local
import MainInput from "../../../../components/ui/input/MainInput";
import MainSelect from "../../../../components/ui/select/MainSelect";
import MainButton from "../../../../components/ui/button/MainButton";
import { EGYPTIAN_CITIES } from "../../../../utils/egyptianCities";
import styles from "./QuickBranchModal.module.css";

// prop-types
import PropTypes from "prop-types";

// react
import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";

// react-redux
import { useSelector } from "react-redux";

// react icons
import { FiMapPin, FiX, FiPhone, FiCompass, FiHome } from "react-icons/fi";

// Helper to resolve city ID from branch data
function resolveBranchCityId(branch, defaultCityId = "cairo") {
    if (!branch) return defaultCityId;
    if (branch.cityId) return branch.cityId;
    if (branch.city_id) return branch.city_id;

    if (branch.cityName) {
        const found = EGYPTIAN_CITIES.find(
            (c) =>
                c.name.toLowerCase() === String(branch.cityName).toLowerCase() ||
                c.arabicName === branch.arabicName
        );
        if (found) return found.id;
    }

    return defaultCityId;
}

// Inner Modal Form with fresh state initialized on mount
function QuickBranchModalContent({
    existingBranch,
    onClose,
    onSave,
    isLoading,
    formData,
}) {
    const defaultCityId = formData?.location?.cityId || EGYPTIAN_CITIES[0].id;
    const defaultPhone = formData?.phone || "";

    // Form inputs state directly populated from existingBranch
    const [name, setName] = useState(() => {
        if (!existingBranch) return "";
        return (
            existingBranch.name ||
            existingBranch.branch_name ||
            existingBranch.title ||
            ""
        );
    });

    const [selectedCityId, setSelectedCityId] = useState(() => {
        return resolveBranchCityId(existingBranch, defaultCityId);
    });

    const [address, setAddress] = useState(() => {
        if (existingBranch) {
            return (
                existingBranch.address ||
                existingBranch.street ||
                ""
            );
        }
        return formData?.address || "";
    });

    const [phone, setPhone] = useState(() => {
        if (existingBranch) {
            return (
                existingBranch.phone ||
                existingBranch.telephone ||
                ""
            );
        }
        return defaultPhone;
    });

    const [error, setError] = useState("");

    // Lock body scrolling when modal is open
    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, []);

    // Close on Escape key press
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && onClose && !isLoading) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose, isLoading]);

    const cityOptions = useMemo(() => {
        return EGYPTIAN_CITIES.map((c) => ({
            value: c.id,
            label: `${c.name} (${c.arabicName}) — ${c.region}`,
            cityData: c,
        }));
    }, []);

    const currentCityOption = useMemo(() => {
        return (
            cityOptions.find((opt) => opt.value === selectedCityId) ||
            cityOptions[0]
        );
    }, [cityOptions, selectedCityId]);

    const isMain = existingBranch?.is_main || false;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError("Branch name is required (e.g. New Cairo Branch, Alexandria Clinic)");
            return;
        }

        const branchId =
            existingBranch?.id ||
            (typeof crypto !== "undefined" && crypto.randomUUID
                ? crypto.randomUUID()
                : `branch-${Math.random().toString(36).slice(2, 9)}`);

        const city = currentCityOption?.cityData || EGYPTIAN_CITIES[0];

        onSave({
            id: branchId,
            name: name.trim(),
            cityId: city.id,
            cityName: city.name,
            arabicName: city.arabicName,
            region: city.region,
            lat: city.lat,
            lng: city.lng,
            address: address.trim() || `${city.name}, Egypt`,
            phone: phone.trim(),
            is_main: isMain,
        });
    };

    // Custom rich rendering for Egyptian City options in dropdown
    const formatCityOption = (option) => (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                gap: "8px",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontWeight: 600 }}>
                    {option.cityData?.name || option.label}
                </span>
                <span style={{ fontSize: "12px", opacity: 0.7 }}>
                    ({option.cityData?.arabicName})
                </span>
            </div>
            {option.cityData?.region && (
                <span
                    style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: "4px",
                        backgroundColor: "rgba(14, 124, 134, 0.12)",
                        color: "var(--color-accent-teal, #0e7c86)",
                        whiteSpace: "nowrap",
                    }}
                >
                    {option.cityData.region}
                </span>
            )}
        </div>
    );

    return (
        <div
            className={styles.overlay}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className={styles.modalCard}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className={styles.modalHeader}>
                    <div className={styles.titleGroup}>
                        <div className={styles.iconCircle}>
                            <FiMapPin size={20} />
                        </div>
                        <div>
                            <h3 className={styles.modalTitle}>
                                {existingBranch
                                    ? `Edit Branch — ${existingBranch.name || "Location"}`
                                    : "Add Physical Operating Branch"}
                            </h3>
                            <p className={styles.modalSubtitle}>
                                {existingBranch
                                    ? "Update physical location and contact details for this branch."
                                    : "Configure an additional physical location for client bookings."}
                            </p>
                        </div>
                    </div>
                    <MainButton
                        variant="ghost"
                        size="xs"
                        onClick={onClose}
                        aria-label="Close modal"
                        icon={<FiX size={18} />}
                    />
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className={styles.formBody}>
                    <MainInput
                        name="branchName"
                        label="Branch Name / Location Title"
                        placeholder="e.g. Nasr City Branch, Marina Plaza Suite"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            setError("");
                        }}
                        hasError={!!error}
                        errorMsg={error}
                        icon={<FiHome size={16} />}
                        required
                        autoFocus
                    />

                    <MainSelect
                        label="Egyptian City / Governorate"
                        options={cityOptions}
                        value={currentCityOption}
                        onChange={(opt) => setSelectedCityId(opt.value)}
                        icon={FiCompass}
                        isSearchable
                        formatOptionLabel={formatCityOption}
                        menuPlacement="auto"
                    />

                    <MainInput
                        name="branchAddress"
                        label="Street Address & Details"
                        placeholder="e.g. 12 Abbas El-Akkad St., 3rd Floor"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        icon={<FiMapPin size={16} />}
                    />

                    <MainInput
                        name="branchPhone"
                        label="Branch Phone Number"
                        type="tel"
                        placeholder="+20 10 9876 5432"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        icon={<FiPhone size={16} />}
                    />

                    {/* Actions */}
                    <div className={styles.modalActions}>
                        <MainButton
                            variant="ghost"
                            size="md"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </MainButton>
                        <MainButton
                            variant="primary"
                            size="md"
                            type="submit"
                            loading={isLoading}
                        >
                            {existingBranch ? "Update Branch" : "Save Branch"}
                        </MainButton>
                    </div>
                </form>
            </div>
        </div>
    );
}

QuickBranchModalContent.propTypes = {
    existingBranch: PropTypes.object,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
    formData: PropTypes.object,
};

export default function QuickBranchModal({
    isOpen,
    onClose,
    onSave,
    isLoading,
    existingBranch,
}) {
    const { formData } = useSelector((state) => state.onboarding || {});

    if (!isOpen) return null;

    const modalKey = existingBranch
        ? `edit-branch-${existingBranch.id || existingBranch.name || "existing"}`
        : "new-branch";

    return createPortal(
        <QuickBranchModalContent
            key={modalKey}
            existingBranch={existingBranch}
            onClose={onClose}
            onSave={onSave}
            isLoading={isLoading}
            formData={formData}
        />,
        document.body
    );
}

QuickBranchModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
    existingBranch: PropTypes.object,
};
