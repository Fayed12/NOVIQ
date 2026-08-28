import { useState, useMemo } from "react";
import PropTypes from "prop-types";
import MainInput from "../../../../components/ui/input/MainInput";
import MainSelect from "../../../../components/ui/select/MainSelect";
import MainButton from "../../../../components/ui/button/MainButton";
import { FiUserCheck, FiX, FiLayers, FiUsers, FiMapPin } from "react-icons/fi";
import styles from "./QuickResourceModal.module.css";

const RESOURCE_TYPE_OPTIONS = [
    { value: "Specialist / Doctor", label: "Specialist / Practitioner (Doctor, Consultant)" },
    { value: "Stylist / Artist", label: "Stylist / Specialist (Stylist, Therapist)" },
    { value: "Room / Suite", label: "Facility / Space (Room, Bed, Suite)" },
    { value: "Equipment / Station", label: "Equipment / Station (Chair, Court, Studio)" },
];

export default function QuickResourceModal({
    isOpen,
    onClose,
    onSave,
    isLoading,
    branches = [],
}) {
    const [name, setName] = useState("");
    const [selectedType, setSelectedType] = useState(RESOURCE_TYPE_OPTIONS[0]);
    const [capacity, setCapacity] = useState("1");
    const [error, setError] = useState("");

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

    const [selectedBranch, setSelectedBranch] = useState(branchOptions[0]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError("Resource name is required (e.g., Dr. Sarah, VIP Chair, Room 101)");
            return;
        }

        onSave({
            name: name.trim(),
            typeName: selectedType.value,
            capacity: parseInt(capacity, 10) || 1,
            branchId: selectedBranch?.value === "all" ? null : selectedBranch?.value,
            branchName: selectedBranch?.label,
        });
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.modalHeader}>
                    <div className={styles.titleGroup}>
                        <div className={styles.iconCircle}>
                            <FiUserCheck size={20} />
                        </div>
                        <div>
                            <h3 className={styles.modalTitle}>Add Bookable Resource</h3>
                            <p className={styles.modalSubtitle}>
                                Who or what can clients book at your business?
                            </p>
                        </div>
                    </div>
                    <button type="button" className={styles.closeBtn} onClick={onClose}>
                        <FiX size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className={styles.formBody}>
                    <MainInput
                        label="Resource Name"
                        placeholder="e.g. Dr. Ahmed Tarek, Master Chair 1, Deluxe Suite"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            setError("");
                        }}
                        error={error}
                        icon={FiUserCheck}
                        required
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
                        label="Capacity (Simultaneous clients)"
                        type="number"
                        min="1"
                        max="100"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        icon={FiUsers}
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
                            Save Resource
                        </MainButton>
                    </div>
                </form>
            </div>
        </div>
    );
}

QuickResourceModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
    branches: PropTypes.array,
};
