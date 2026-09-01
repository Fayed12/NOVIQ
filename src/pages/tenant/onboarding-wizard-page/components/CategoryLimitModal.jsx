import PropTypes from "prop-types";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router";
import {
    FiAlertTriangle,
    FiX,
    FiExternalLink,
    FiCheckCircle,
} from "react-icons/fi";
import MainButton from "../../../../components/ui/button/MainButton";
import styles from "./CategoryLimitModal.module.css";

export default function CategoryLimitModal({
    isOpen,
    category,
    existingBusiness,
    onClose,
}) {
    const navigate = useNavigate();

    // Lock body scrolling when modal is open
    useEffect(() => {
        if (!isOpen) return;
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [isOpen]);

    // Handle Escape key to close
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen || !existingBusiness) return null;

    const categoryName = category?.name || category?.title || (typeof category === "string" ? category : "This");

    const handleGoToDashboard = () => {
        onClose();
        if (existingBusiness.slug) {
            navigate(`/${existingBusiness.slug}/dashboard`);
        } else {
            navigate("/account");
        }
    };

    return createPortal(
        <div
            className={styles.backdrop}
            onClick={onClose}
            role="presentation"
        >
            <div
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="category-limit-title"
            >
                <button
                    type="button"
                    className={styles.closeButton}
                    onClick={onClose}
                    aria-label="Close warning modal"
                >
                    <FiX size={18} />
                </button>

                <div className={styles.iconWrapper}>
                    <FiAlertTriangle size={26} />
                </div>

                <h3 id="category-limit-title" className={styles.title}>
                    Category Unavailable
                </h3>

                <p className={styles.subtitle}>
                    The{" "}
                    <span className={styles.highlightCategory}>
                        {categoryName}
                    </span>{" "}
                    category is already registered by{" "}
                    <strong>{existingBusiness.name || "an active business"}</strong>.
                    Each category is restricted to one business. You cannot proceed to the next step with this category.
                </p>

                {/* Existing Business Card */}
                <div className={styles.existingCard}>
                    <div className={styles.businessMeta}>
                        <span className={styles.businessName}>
                            {existingBusiness.name}
                        </span>
                        <span className={styles.businessSlug}>
                            noviq.app/{existingBusiness.slug || "business"}
                        </span>
                    </div>

                    <span className={styles.badgeActive}>
                        <FiCheckCircle size={13} />
                        In Use & Registered
                    </span>
                </div>

                {/* Action Buttons */}
                <div className={styles.actions}>
                    <MainButton
                        variant="secondary"
                        size="md"
                        onClick={onClose}
                    >
                        Choose Another Category
                    </MainButton>

                    <MainButton
                        variant="primary"
                        size="md"
                        onClick={handleGoToDashboard}
                        leftIcon={<FiExternalLink size={15} />}
                    >
                        Go to {existingBusiness.name}
                    </MainButton>
                </div>
            </div>
        </div>,
        document.body
    );
}

CategoryLimitModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    category: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        slug: PropTypes.string,
    }),
    existingBusiness: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        slug: PropTypes.string,
        status: PropTypes.string,
    }),
    onClose: PropTypes.func.isRequired,
};
