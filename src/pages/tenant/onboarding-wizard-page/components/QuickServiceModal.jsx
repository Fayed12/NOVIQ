import { useState } from "react";
import PropTypes from "prop-types";
import MainInput from "../../../../components/ui/input/MainInput";
import MainSelect from "../../../../components/ui/select/MainSelect";
import MainButton from "../../../../components/ui/button/MainButton";
import { FiCheckSquare, FiX, FiClock, FiDollarSign } from "react-icons/fi";
import styles from "./QuickServiceModal.module.css";

const DURATION_OPTIONS = [
    { value: 15, label: "15 minutes" },
    { value: 30, label: "30 minutes (Standard)" },
    { value: 45, label: "45 minutes" },
    { value: 60, label: "60 minutes (1 Hour)" },
    { value: 90, label: "90 minutes (1.5 Hours)" },
    { value: 120, label: "120 minutes (2 Hours)" },
];

const CURRENCY_OPTIONS = [
    { value: "EGP", label: "EGP - Egyptian Pound (ج.م)" },
    { value: "USD", label: "USD - US Dollar ($)" },
    { value: "EUR", label: "EUR - Euro (€)" },
    { value: "SAR", label: "SAR - Saudi Riyal (ر.س)" },
    { value: "AED", label: "AED - UAE Dirham (د.إ)" },
];

export default function QuickServiceModal({ isOpen, onClose, onSave, isLoading }) {
    const [name, setName] = useState("");
    const [duration, setDuration] = useState(DURATION_OPTIONS[1]);
    const [price, setPrice] = useState("150");
    const [currency, setCurrency] = useState(CURRENCY_OPTIONS[0]);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError("Service name is required (e.g. Consultation, Haircut, VIP Session)");
            return;
        }

        onSave({
            name: name.trim(),
            durationMinutes: duration.value,
            price: parseFloat(price) || 0,
            currency: currency.value,
        });
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.modalHeader}>
                    <div className={styles.titleGroup}>
                        <div className={styles.iconCircle}>
                            <FiCheckSquare size={20} />
                        </div>
                        <div>
                            <h3 className={styles.modalTitle}>Add Initial Service</h3>
                            <p className={styles.modalSubtitle}>
                                What treatment or service can clients book with you?
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
                        label="Service Name"
                        placeholder="e.g. General Consultation, Hair Styling, Deluxe Stay"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            setError("");
                        }}
                        error={error}
                        icon={FiCheckSquare}
                        required
                    />

                    <div className={styles.twoCol}>
                        <MainSelect
                            label="Duration"
                            options={DURATION_OPTIONS}
                            value={duration}
                            onChange={(option) => setDuration(option)}
                            icon={FiClock}
                        />

                        <MainSelect
                            label="Currency"
                            options={CURRENCY_OPTIONS}
                            value={currency}
                            onChange={(option) => setCurrency(option)}
                            icon={FiDollarSign}
                        />
                    </div>

                    <MainInput
                        label="Service Price"
                        type="number"
                        min="0"
                        step="1"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        icon={FiDollarSign}
                        placeholder="0.00"
                    />

                    {/* Shared Service Notice */}
                    <div style={{
                        padding: "10px 12px",
                        backgroundColor: "rgba(14, 124, 134, 0.08)",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "var(--color-ink-700, #2b3640)",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                    }}>
                        <span>🌐 <strong>Shared Across All Branches:</strong> This service will be bookable at all your branches (Cairo, Alex, etc.).</span>
                    </div>

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
                            Save Service
                        </MainButton>
                    </div>
                </form>
            </div>
        </div>
    );
}

QuickServiceModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
};
