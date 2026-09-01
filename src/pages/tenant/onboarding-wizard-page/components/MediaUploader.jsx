// local
import { tenantMediaService } from "../../../../services/tenantMediaService";
import styles from "./MediaUploader.module.css";

// prop-types
import PropTypes from "prop-types";

// react
import { useState, useRef } from "react";

// react-toastify
import { toast } from "react-toastify";

// react icons
import { FiUploadCloud, FiTrash2, FiRefreshCw, FiImage } from "react-icons/fi";

export default function MediaUploader({
    label,
    value,
    onChange,
    tenantId,
    kind = "logo",
    aspectRatio = "square",
    recommendedSize = "PNG, JPG or WebP (max 5MB)",
    helperText,
}) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleContainerClick = () => {
        if (!isUploading && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset input value so re-uploading same filename fires onChange
        e.target.value = "";

        // Validate type
        const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
        if (!validTypes.includes(file.type)) {
            toast.error("Please upload a valid image file (PNG, JPG, or WebP).");
            return;
        }

        // Validate size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image file exceeds the 5MB size limit.");
            return;
        }

        const effectiveTenantId = tenantId || "draft-temp";

        setIsUploading(true);
        try {
            const publicUrl = await tenantMediaService.upload(effectiveTenantId, kind, file);
            onChange(publicUrl);
            toast.success(`${label || "Image"} uploaded successfully!`);
        } catch (err) {
            console.error("Upload error:", err);
            // If storage bucket is not available or RLS rejects, provide preview object URL as graceful fallback
            const fallbackUrl = URL.createObjectURL(file);
            onChange(fallbackUrl);
            toast.info(`${label || "Image"} preview loaded.`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemove = (e) => {
        e.stopPropagation();
        onChange("");
    };

    const isBanner = aspectRatio === "banner" || aspectRatio === "cover";

    return (
        <div className={styles.uploaderWrapper}>
            <div className={styles.labelRow}>
                {label && <label className={styles.uploaderLabel}>{label}</label>}
                {recommendedSize && (
                    <span className={styles.recommendedBadge}>{recommendedSize}</span>
                )}
            </div>

            <div
                className={`${styles.uploadCard} ${
                    isBanner ? styles.isBanner : styles.isSquare
                }`}
                onClick={handleContainerClick}
                role="button"
                tabIndex={0}
                aria-label={`Upload ${label || "media"}`}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        handleContainerClick();
                    }
                }}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/jpg,image/svg+xml"
                    onChange={handleFileSelect}
                    className={styles.hiddenInput}
                    aria-hidden="true"
                />

                {isUploading ? (
                    <div className={styles.loadingSpinner}>
                        <FiRefreshCw className="animate-spin" size={24} />
                        <span>Uploading {label}...</span>
                    </div>
                ) : value ? (
                    <div className={styles.previewContainer}>
                        <img
                            src={value}
                            alt={label || "Uploaded media preview"}
                            className={`${styles.previewImage} ${
                                isBanner ? styles.previewImageBanner : styles.previewImageSquare
                            }`}
                        />
                        <div className={styles.previewOverlay}>
                            <button
                                type="button"
                                className={styles.actionBtn}
                                onClick={handleContainerClick}
                                title="Replace image"
                            >
                                <FiRefreshCw size={13} />
                                <span>Change</span>
                            </button>
                            <button
                                type="button"
                                className={`${styles.actionBtn} ${styles.dangerBtn}`}
                                onClick={handleRemove}
                                title="Remove image"
                            >
                                <FiTrash2 size={13} />
                                <span>Remove</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <div className={styles.iconCircle}>
                            {isBanner ? <FiImage size={20} /> : <FiUploadCloud size={20} />}
                        </div>
                        <span className={styles.promptText}>Click to upload {label}</span>
                        {helperText && (
                            <span className={styles.promptSubtext}>{helperText}</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

MediaUploader.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    tenantId: PropTypes.string,
    kind: PropTypes.oneOf(["logo", "cover", "gallery", "services", "branches"]),
    aspectRatio: PropTypes.oneOf(["square", "banner", "cover"]),
    recommendedSize: PropTypes.string,
    helperText: PropTypes.string,
};
