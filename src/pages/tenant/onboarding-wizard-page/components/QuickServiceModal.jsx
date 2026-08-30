// local
import MainInput from "../../../../components/ui/input/MainInput";
import MainSelect from "../../../../components/ui/select/MainSelect";
import MainButton from "../../../../components/ui/button/MainButton";
import styles from "./QuickServiceModal.module.css";

// prop-types
import PropTypes from "prop-types";

// react
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

// react icons
import { FiCheckSquare, FiX, FiClock, FiDollarSign } from "react-icons/fi";

const DURATION_OPTIONS = [
    { value: 15, label: "15 minutes" },
    { value: 30, label: "30 minutes (Standard)" },
    { value: 45, label: "45 minutes" },
    { value: 60, label: "60 minutes (1 Hour)" },
    { value: 90, label: "90 minutes (1.5 Hours)" },
    { value: 120, label: "120 minutes (2 Hours)" },
];

const CURRENCY_OPTIONS = [
    { value: "EGP", label: "EGP - Egyptian Pound (ج.م)", symbol: "EGP" },
    { value: "USD", label: "USD - US Dollar ($)", symbol: "$" },
    { value: "EUR", label: "EUR - Euro (€)", symbol: "€" },
    { value: "SAR", label: "SAR - Saudi Riyal (ر.س)", symbol: "SAR" },
    { value: "AED", label: "AED - UAE Dirham (د.إ)", symbol: "AED" },
];

function QuickServiceModalContent({
    existingService,
    onClose,
    onSave,
    isLoading,
}) {
    const [name, setName] = useState(() => existingService?.name || "");
    const [duration, setDuration] = useState(() => {
        if (existingService?.durationMinutes || existingService?.duration_minutes) {
            const targetMin =
                existingService.durationMinutes || existingService.duration_minutes;
            return (
                DURATION_OPTIONS.find((d) => d.value === targetMin) ||
                DURATION_OPTIONS[1]
            );
        }
        return DURATION_OPTIONS[1];
    });
    const [price, setPrice] = useState(() =>
        existingService?.price !== undefined ? String(existingService.price) : "150"
    );
    const [currency, setCurrency] = useState(() => {
        if (existingService?.currency) {
            return (
                CURRENCY_OPTIONS.find(
                    (c) => c.value === existingService.currency
                ) || CURRENCY_OPTIONS[0]
            );
        }
        return CURRENCY_OPTIONS[0];
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
            setError("Service name is required (e.g. Consultation, Haircut, VIP Session)");
            return;
        }

        onSave({
            id: existingService?.id,
            name: name.trim(),
            durationMinutes: duration.value,
            price: parseFloat(price) || 0,
            currency: currency.value,
        });
    };

    const formatDurationOption = (option) => (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
            }}
        >
            <span style={{ fontWeight: 500 }}>{option.label}</span>
            <span
                style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: "4px",
                    backgroundColor: "rgba(14, 124, 134, 0.12)",
                    color: "var(--color-accent-teal, #0e7c86)",
                }}
            >
                {option.value}m
            </span>
        </div>
    );

    const formatCurrencyOption = (option) => (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
            }}
        >
            <span style={{ fontWeight: 500 }}>{option.label}</span>
            <span
                style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: "4px",
                    backgroundColor: "rgba(16, 185, 129, 0.12)",
                    color: "#10b981",
                }}
            >
                {option.symbol || option.value}
            </span>
        </div>
    );

    return (
        <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
            <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.modalHeader}>
                    <div className={styles.titleGroup}>
                        <div className={styles.iconCircle}>
                            <FiCheckSquare size={20} />
                        </div>
                        <div>
                            <h3 className={styles.modalTitle}>
                                {existingService ? `Edit Service — ${existingService.name}` : "Add Initial Service"}
                            </h3>
                            <p className={styles.modalSubtitle}>
                                What treatment or service can clients book with you?
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
                        name="serviceName"
                        label="Service Name"
                        placeholder="e.g. General Consultation, Hair Styling, Deluxe Stay"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            setError("");
                        }}
                        hasError={!!error}
                        errorMsg={error}
                        icon={<FiCheckSquare size={16} />}
                        required
                        autoFocus
                    />

                    <div className={styles.twoCol}>
                        <MainSelect
                            label="Duration"
                            options={DURATION_OPTIONS}
                            value={duration}
                            onChange={(option) => setDuration(option)}
                            icon={FiClock}
                            formatOptionLabel={formatDurationOption}
                        />

                        <MainSelect
                            label="Currency"
                            options={CURRENCY_OPTIONS}
                            value={currency}
                            onChange={(option) => setCurrency(option)}
                            icon={FiDollarSign}
                            formatOptionLabel={formatCurrencyOption}
                        />
                    </div>

                    <MainInput
                        name="servicePrice"
                        label="Service Price"
                        type="number"
                        min="0"
                        step="1"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        icon={<FiDollarSign size={16} />}
                        placeholder="0.00"
                    />

                    {/* Shared Service Notice */}
                    <div
                        style={{
                            padding: "10px 12px",
                            backgroundColor: "rgba(14, 124, 134, 0.08)",
                            borderRadius: "8px",
                            fontSize: "12px",
                            color: "var(--color-ink-700, #2b3640)",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                        }}
                    >
                        <span>
                            🌐 <strong>Shared Across All Branches:</strong> This service will be bookable at all your branches (Cairo, Alex, etc.).
                        </span>
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
                            {existingService ? "Update Service" : "Save Service"}
                        </MainButton>
                    </div>
                </form>
            </div>
        </div>
    );
}

QuickServiceModalContent.propTypes = {
    existingService: PropTypes.object,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
};

export default function QuickServiceModal({
    isOpen,
    onClose,
    onSave,
    isLoading,
    existingService,
}) {
    if (!isOpen) return null;

    const modalKey = existingService
        ? `edit-service-${existingService.id || existingService.name || "existing"}`
        : "new-service";

    return createPortal(
        <QuickServiceModalContent
            key={modalKey}
            existingService={existingService}
            onClose={onClose}
            onSave={onSave}
            isLoading={isLoading}
        />,
        document.body
    );
}

QuickServiceModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
    existingService: PropTypes.object,
};
