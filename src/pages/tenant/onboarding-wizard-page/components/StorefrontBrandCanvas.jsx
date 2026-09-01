// local
import { tenantMediaService } from "../../../../services/tenantMediaService";
import styles from "./StorefrontBrandCanvas.module.css";

// prop-types
import PropTypes from "prop-types";

// react
import { useState, useRef } from "react";

// react-toastify
import { toast } from "react-toastify";

// react icons
import {
    FiCamera,
    FiUploadCloud,
    FiTrash2,
    FiImage,
    FiCheckCircle,
    FiActivity,
    FiHeart,
    FiScissors,
    FiCoffee,
    FiCompass,
    FiAward,
    FiSmile,
    FiStar,
    FiShield,
    FiZap,
    FiTarget,
    FiHome,
    FiBriefcase,
    FiPlus,
    FiLifeBuoy,
    FiSun,
    FiMoon,
    FiTrendingUp,
} from "react-icons/fi";

// Map of icon names to components for fallback avatar
const ICON_MAP = {
    FiActivity,
    FiHeart,
    FiScissors,
    FiCoffee,
    FiCompass,
    FiAward,
    FiSmile,
    FiStar,
    FiShield,
    FiZap,
    FiTarget,
    FiHome,
    FiBriefcase,
    FiPlus,
    FiLifeBuoy,
    FiSun,
    FiMoon,
    FiTrendingUp,
};

export default function StorefrontBrandCanvas({
    businessName,
    businessSlug,
    categoryName,
    themeColor = "#0E7C86",
    iconName = "FiActivity",
    logoUrl,
    coverUrl,
    tenantId,
    onChangeLogo,
    onChangeCover,
}) {
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [isUploadingCover, setIsUploadingCover] = useState(false);
    const [isDraggingCover, setIsDraggingCover] = useState(false);

    const logoInputRef = useRef(null);
    const coverInputRef = useRef(null);

    const FallbackIconComponent = ICON_MAP[iconName] || FiActivity;

    // Validate and process file
    const validateImageFile = (file) => {
        const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
        if (!validTypes.includes(file.type)) {
            toast.error("Please upload a valid image file (PNG, JPG, or WebP).");
            return false;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image file exceeds the 5MB size limit.");
            return false;
        }
        return true;
    };

    // Upload Handler for Logo
    const handleLogoSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !validateImageFile(file)) return;
        e.target.value = "";

        const effectiveTenantId = tenantId || "draft-temp";
        setIsUploadingLogo(true);
        try {
            const publicUrl = await tenantMediaService.upload(effectiveTenantId, "logo", file);
            onChangeLogo(publicUrl);
            toast.success("Business logo updated successfully!");
        } catch (err) {
            console.error("Logo upload fallback:", err);
            const fallbackUrl = URL.createObjectURL(file);
            onChangeLogo(fallbackUrl);
            toast.info("Logo preview loaded.");
        } finally {
            setIsUploadingLogo(false);
        }
    };

    // Upload Handler for Cover
    const handleCoverSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !validateImageFile(file)) return;
        e.target.value = "";

        const effectiveTenantId = tenantId || "draft-temp";
        setIsUploadingCover(true);
        try {
            const publicUrl = await tenantMediaService.upload(effectiveTenantId, "cover", file);
            onChangeCover(publicUrl);
            toast.success("Cover banner updated successfully!");
        } catch (err) {
            console.error("Cover upload fallback:", err);
            const fallbackUrl = URL.createObjectURL(file);
            onChangeCover(fallbackUrl);
            toast.info("Cover banner preview loaded.");
        } finally {
            setIsUploadingCover(false);
        }
    };

    // Drag & Drop Cover Support
    const handleCoverDrop = async (e) => {
        e.preventDefault();
        setIsDraggingCover(false);
        const file = e.dataTransfer.files?.[0];
        if (!file || !validateImageFile(file)) return;

        const effectiveTenantId = tenantId || "draft-temp";
        setIsUploadingCover(true);
        try {
            const publicUrl = await tenantMediaService.upload(effectiveTenantId, "cover", file);
            onChangeCover(publicUrl);
            toast.success("Cover banner uploaded!");
        } catch (err) {
            console.error("Cover drop fallback:", err);
            const fallbackUrl = URL.createObjectURL(file);
            onChangeCover(fallbackUrl);
            toast.info("Cover preview loaded.");
        } finally {
            setIsUploadingCover(false);
        }
    };

    return (
        <div className={styles.canvasContainer}>
            {/* Hidden File Inputs */}
            <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/jpg"
                style={{ display: "none" }}
                onChange={handleLogoSelect}
            />
            <input
                ref={coverInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/jpg"
                style={{ display: "none" }}
                onChange={handleCoverSelect}
            />

            {/* Live Storefront Showcase Card */}
            <div className={styles.showcaseCard}>
                {/* 1. Panoramic Cover Banner */}
                <div
                    className={`${styles.coverArea} ${isDraggingCover ? styles.coverDragging : ""}`}
                    style={{
                        backgroundColor: `${themeColor}15`,
                    }}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingCover(true);
                    }}
                    onDragLeave={() => setIsDraggingCover(false)}
                    onDrop={handleCoverDrop}
                >
                    {coverUrl ? (
                        <div className={styles.coverImageWrapper}>
                            <img
                                src={coverUrl}
                                alt="Storefront cover banner"
                                className={styles.coverImage}
                            />
                            <div className={styles.coverGradientOverlay} />
                        </div>
                    ) : (
                        <div
                            className={styles.coverPlaceholderMesh}
                            style={{
                                background: `radial-gradient(ellipse at 80% 20%, ${themeColor}35 0%, transparent 60%), linear-gradient(135deg, ${themeColor}20 0%, rgba(15, 23, 42, 0.4) 100%)`,
                            }}
                        >
                            <div className={styles.meshPattern} />
                            <div className={styles.meshHint}>
                                <FiImage size={24} className={styles.meshHintIcon} />
                                <span>Drag & drop cover banner or click button to upload</span>
                            </div>
                        </div>
                    )}

                    {/* Floating Cover Action Buttons */}
                    <div className={styles.coverActions}>
                        <button
                            type="button"
                            className={styles.coverActionBtn}
                            onClick={() => coverInputRef.current?.click()}
                            disabled={isUploadingCover}
                            title="Upload 1200×400 banner image"
                        >
                            <FiCamera size={14} />
                            <span>
                                {isUploadingCover
                                    ? "Uploading..."
                                    : coverUrl
                                    ? "Change Cover"
                                    : "Add Cover Banner"}
                            </span>
                        </button>

                        {coverUrl && (
                            <button
                                type="button"
                                className={`${styles.coverActionBtn} ${styles.coverRemoveBtn}`}
                                onClick={() => onChangeCover("")}
                                title="Remove cover photo"
                            >
                                <FiTrash2 size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* 2. Floating Avatar & Metadata Bar */}
                <div className={styles.metaRow}>
                    {/* Overlapping Brand Logo Avatar */}
                    <div className={styles.avatarWrapper}>
                        <div
                            className={styles.avatarCard}
                            onClick={() => !isUploadingLogo && logoInputRef.current?.click()}
                            role="button"
                            tabIndex={0}
                            title="Click to upload custom brand logo (500×500)"
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    logoInputRef.current?.click();
                                }
                            }}
                        >
                            {logoUrl ? (
                                <img
                                    src={logoUrl}
                                    alt="Brand Logo"
                                    className={styles.avatarImage}
                                />
                            ) : (
                                <div
                                    className={styles.avatarFallback}
                                    style={{
                                        background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)`,
                                    }}
                                >
                                    <FallbackIconComponent size={34} color="#ffffff" />
                                </div>
                            )}

                            {/* Camera overlay indicator */}
                            <div className={styles.avatarCameraBadge}>
                                <FiCamera size={13} />
                            </div>

                            {isUploadingLogo && (
                                <div className={styles.avatarLoadingSpinner}>
                                    <div className={styles.spinner} />
                                </div>
                            )}
                        </div>

                        {logoUrl && (
                            <button
                                type="button"
                                className={styles.logoRemoveSmall}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChangeLogo("");
                                }}
                                title="Remove custom logo"
                            >
                                <FiTrash2 size={11} />
                            </button>
                        )}
                    </div>

                    {/* Storefront Identity Details */}
                    <div className={styles.identityDetails}>
                        <div className={styles.titleRow}>
                            <h4 className={styles.businessDisplayName}>
                                {businessName?.trim() || "Your Business Name"}
                            </h4>
                            <span className={styles.previewTag}>
                                <FiCheckCircle size={12} />
                                Live Storefront Preview
                            </span>
                        </div>

                        <div className={styles.subMetaRow}>
                            <div className={styles.slugBadge}>
                                <span className={styles.slugDomain}>noviq.app/</span>
                                <span className={styles.slugPath}>
                                    {businessSlug?.trim() || "storefront"}
                                </span>
                            </div>

                            {categoryName && (
                                <span className={styles.categoryPill}>
                                    {categoryName}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. Quick Upload Controls & Format Specs */}
                <div className={styles.specsFooter}>
                    <div className={styles.specItem}>
                        <div className={styles.specIconCircle}>
                            <FiUploadCloud size={14} />
                        </div>
                        <div className={styles.specTexts}>
                            <span className={styles.specTitle}>Brand Logo</span>
                            <span className={styles.specMeta}>500×500 PNG / JPG (Square)</span>
                        </div>
                        <button
                            type="button"
                            className={styles.specActionBtn}
                            onClick={() => logoInputRef.current?.click()}
                            disabled={isUploadingLogo}
                        >
                            {logoUrl ? "Replace Logo" : "Upload Logo"}
                        </button>
                    </div>

                    <div className={styles.specDivider} />

                    <div className={styles.specItem}>
                        <div className={styles.specIconCircle}>
                            <FiImage size={14} />
                        </div>
                        <div className={styles.specTexts}>
                            <span className={styles.specTitle}>Cover Header</span>
                            <span className={styles.specMeta}>1200×400 JPG / WebP (Wide Banner)</span>
                        </div>
                        <button
                            type="button"
                            className={styles.specActionBtn}
                            onClick={() => coverInputRef.current?.click()}
                            disabled={isUploadingCover}
                        >
                            {coverUrl ? "Replace Cover" : "Upload Cover"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

StorefrontBrandCanvas.propTypes = {
    businessName: PropTypes.string,
    businessSlug: PropTypes.string,
    categoryName: PropTypes.string,
    themeColor: PropTypes.string,
    iconName: PropTypes.string,
    logoUrl: PropTypes.string,
    coverUrl: PropTypes.string,
    tenantId: PropTypes.string,
    onChangeLogo: PropTypes.func.isRequired,
    onChangeCover: PropTypes.func.isRequired,
};
