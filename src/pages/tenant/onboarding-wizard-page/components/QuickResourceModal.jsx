// local
import MainInput from "../../../../components/ui/input/MainInput";
import MainSelect from "../../../../components/ui/select/MainSelect";
import MainButton from "../../../../components/ui/button/MainButton";
import styles from "./QuickResourceModal.module.css";

// prop-types
import PropTypes from "prop-types";

// react
import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";

// react icons
import { FiUserCheck, FiX, FiLayers, FiUsers, FiMapPin } from "react-icons/fi";

const RESOURCE_TYPE_OPTIONS = [
    { value: "Specialist / Doctor", label: "Specialist / Practitioner (Doctor, Consultant)" },
    { value: "Stylist / Artist", label: "Stylist / Specialist (Stylist, Therapist)" },
    { value: "Room / Suite", label: "Facility / Space (Room, Bed, Suite)" },
    { value: "Equipment / Station", label: "Equipment / Station (Chair, Court, Studio)" },
];

function QuickResourceModalContent({
    existingResource,
    onClose,
    onSave,
    isLoading,
    branches = [],
}) {
    const branchOptions = useMemo(() => {
        const list = [{ value: "all", label: "Stationed across All Branches" }];
        branches.forEach((b) => {
            list.push({
                value: b.id,
                label: `${b.name} — ${b.cityName || b.name}`,
                branchData: b,
            });
        });
        return list;
    }, [branches]);

    const [name, setName] = useState(() => existingResource?.name || "");
    const [selectedType, setSelectedType] = useState(() => {
        if (existingResource?.typeName) {
            return (
                RESOURCE_TYPE_OPTIONS.find(
                    (opt) => opt.value === existingResource.typeName
                ) || RESOURCE_TYPE_OPTIONS[0]
            );
        }
        return RESOURCE_TYPE_OPTIONS[0];
    });
    const [capacity, setCapacity] = useState(() =>
        String(existingResource?.capacity || 1)
    );
    const [selectedBranch, setSelectedBranch] = useState(() => {
        if (existingResource?.branchId) {
            return (
                branchOptions.find(
                    (b) => b.value === existingResource.branchId
                ) || branchOptions[0]
            );
        }
        return branchOptions[0];
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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError("Resource name is required (e.g., Dr. Sarah, VIP Chair, Room 101)");
            return;
        }

        onSave({
            id: existingResource?.id,
            name: name.trim(),
            typeName: selectedType.value,
            capacity: parseInt(capacity, 10) || 1,
            branchId: selectedBranch?.value === "all" ? null : selectedBranch?.value,
            branchName: selectedBranch?.label,
        });
    };

    return (
        <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
            <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.modalHeader}>
                    <div className={styles.titleGroup}>
                        <div className={styles.iconCircle}>
                            <FiUserCheck size={20} />
                        </div>
                        <div>
                            <h3 className={styles.modalTitle}>
                                {existingResource ? `Edit Resource — ${existingResource.name}` : "Add Bookable Resource"}
                            </h3>
                            <p className={styles.modalSubtitle}>
                                Who or what can clients book at your business?
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
                        name="resourceName"
                        label="Resource Name"
                        placeholder="e.g. Dr. Ahmed Tarek, Master Chair 1, Deluxe Suite"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            setError("");
                        }}
                        hasError={!!error}
                        errorMsg={error}
                        icon={<FiUserCheck size={16} />}
                        required
                        autoFocus
                    />

                    <MainSelect
                        label="Resource Category / Type"
                        options={RESOURCE_TYPE_OPTIONS}
                        value={selectedType}
                        onChange={(option) => setSelectedType(option)}
                        icon={FiLayers}
                    />

                    {branches.length > 1 && (
                        <MainSelect
                            label="Operating Branch Assignment"
                            options={branchOptions}
                            value={selectedBranch}
                            onChange={(option) => setSelectedBranch(option)}
                            icon={FiMapPin}
                            helperText="Assign this resource to a specific branch location or all branches"
                        />
                    )}

                    <MainInput
                        name="resourceCapacity"
                        label="Capacity (Simultaneous clients)"
                        type="number"
                        min="1"
                        max="100"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        icon={<FiUsers size={16} />}
                        helperText="Usually 1 for individual specialists or rooms"
                    />

                    {/* Actions */}
                    <div className={styles.modalActions}>
                        <MainButton variant="ghost" size="md" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </MainButton>
                        <MainButton
                            variant="primary"
                            size="md"
                            type="submit"
                            loading={isLoading}
                        >
                            {existingResource ? "Update Resource" : "Save Resource"}
                        </MainButton>
                    </div>
                </form>
            </div>
        </div>
    );
}

QuickResourceModalContent.propTypes = {
    existingResource: PropTypes.object,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
    branches: PropTypes.array,
};

export default function QuickResourceModal({
    isOpen,
    onClose,
    onSave,
    isLoading,
    branches = [],
    existingResource,
}) {
    if (!isOpen) return null;

    const modalKey = existingResource
        ? `edit-resource-${existingResource.id || existingResource.name || "existing"}`
        : "new-resource";

    return createPortal(
        <QuickResourceModalContent
            key={modalKey}
            existingResource={existingResource}
            onClose={onClose}
            onSave={onSave}
            isLoading={isLoading}
            branches={branches}
        />,
        document.body
    );
}

QuickResourceModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
    branches: PropTypes.array,
    existingResource: PropTypes.object,
};
