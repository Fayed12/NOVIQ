// local
import MainButton from "../../../../components/ui/button/MainButton";
import styles from "./ResetConfirmModal.module.css";

// prop-types
import PropTypes from "prop-types";

// react
import { useEffect } from "react";
import { createPortal } from "react-dom";

// react icons
import { FiPlus, FiX, FiCheckCircle, FiRotateCcw } from "react-icons/fi";

export default function ResetConfirmModal({ isOpen, onClose, onConfirm, isResetting = false }) {
    // Lock body scroll and listen for Escape key when modal is open
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div
            className={styles.overlay}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-modal-title"
        >
            <div
                className={styles.modalCard}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className={styles.modalHeader}>
                    <div className={styles.titleGroup}>
                        <div className={styles.iconCircle}>
                            <FiPlus size={22} />
                        </div>
                        <div>
                            <h3 id="reset-modal-title" className={styles.modalTitle}>
                                Set Up a New Business?
                            </h3>
                            <p className={styles.modalSubtitle}>
                                Start onboarding from Step 1
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        className={styles.closeBtn}
                        onClick={onClose}
                        aria-label="Close dialog"
                    >
                        <FiX size={18} />
                    </button>
                </div>

                {/* Body with clear explanatory points */}
                <div className={styles.modalBody}>
                    <div className={styles.infoCard}>
                        <FiRotateCcw size={18} className={`${styles.itemIcon} ${styles.itemIconWarm}`} />
                        <div className={styles.cardContent}>
                            <span className={styles.itemTitle}>Fresh Business Configuration</span>
                            <span className={styles.itemDesc}>
                                Clears the current wizard inputs (name, slug, category, hours) so you can start configuring a brand-new business from Step 1.
                            </span>
                        </div>
                    </div>

                    <div className={styles.infoCard}>
                        <FiCheckCircle size={18} className={`${styles.itemIcon} ${styles.itemIconGreen}`} />
                        <div className={styles.cardContent}>
                            <span className={styles.itemTitle}>Existing Businesses Are Safe</span>
                            <span className={styles.itemDesc}>
                                Any businesses you have already published remain live, safe, and untouched in your account.
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className={styles.modalActions}>
                    <MainButton
                        variant="secondary"
                        size="sm"
                        onClick={onClose}
                        disabled={isResetting}
                    >
                        Keep Current Draft
                    </MainButton>
                    <MainButton
                        variant="primary"
                        size="sm"
                        icon={<FiPlus />}
                        onClick={onConfirm}
                        isLoading={isResetting}
                        loadingText="Starting..."
                    >
                        Start New Business
                    </MainButton>
                </div>
            </div>
        </div>,
        document.body
    );
}

ResetConfirmModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    isResetting: PropTypes.bool,
};
