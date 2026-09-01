// local
import MainButton from "../../../../components/ui/button/MainButton";
import { updateFormData } from "../../../../redux/slices/onboardingSlice";
import styles from "./Step3Theme.module.css";

// prop-types
import PropTypes from "prop-types";

// react
import { useState, useMemo, useEffect } from "react";

// react-redux
import { useSelector, useDispatch } from "react-redux";

// react-toastify
import { toast } from "react-toastify";

// react icons
import {
    FiCheck,
    FiClock,
    FiStar,
    FiTrendingUp,
    FiShield,
    FiLock,
    FiAward,
    FiSliders,
    FiActivity,
    FiScissors,
    FiHome,
    FiZap,
    FiLayers,
    FiCheckCircle,
    FiAlertTriangle,
    FiEdit3,
} from "react-icons/fi";

// Color mapping for category slugs and preset IDs
const PRESET_COLOR_MAP = {
    "medical-clean": "#0E7C86",
    "salon-warm": "#B45309",
    "hotel-elegant": "#7C3AED",
    "fitness-energetic": "#DC2626",
    "corporate-navy": "#1E3A8A",
    "emerald-fresh": "#059669",
    "clinics": "#0E7C86",
    "salons": "#B45309",
    "hotels": "#7C3AED",
    "fitness": "#DC2626",
    "medical": "#0E7C86",
    "beauty": "#B45309",
    "hospitality": "#7C3AED",
    "gym": "#DC2626",
};

// Fallback presets if category available_themes in DB is empty
const DEFAULT_THEME_PRESETS = [
    {
        id: "medical-clean",
        name: "Medical — Clean Teal",
        color: "#0E7C86",
        secondary: "#14B8A6",
        vibe: "Crisp & Trustworthy",
        description:
            "Clinical precision and calm reassurance for healthcare clinics, dental studios, and wellness centers.",
        tag: "Healthcare Recommended",
    },
    {
        id: "salon-warm",
        name: "Salon — Warm Amber",
        color: "#B45309",
        secondary: "#F59E0B",
        vibe: "Warm & Boutique",
        description:
            "Inviting earth tones and golden hues for aesthetic salons, luxury spas, and beauty lounges.",
        tag: "Beauty & Spa Recommended",
    },
    {
        id: "hotel-elegant",
        name: "Hotel — Regal Violet",
        color: "#7C3AED",
        secondary: "#A78BFA",
        vibe: "Luxurious & Modern",
        description:
            "High-contrast royal purple accents for boutique hotels, resorts, and premium hospitality suites.",
        tag: "Hospitality Recommended",
    },
    {
        id: "fitness-energetic",
        name: "Fitness — Bold Crimson",
        color: "#DC2626",
        secondary: "#F87171",
        vibe: "Dynamic & Bold",
        description:
            "High-impact athletic crimson for sports gymnasiums, fitness clubs, and training studios.",
        tag: "Sports & Fitness Recommended",
    },
    {
        id: "corporate-navy",
        name: "Corporate — Classic Navy",
        color: "#1E3A8A",
        secondary: "#3B82F6",
        vibe: "Corporate & Confident",
        description:
            "Authoritative deep ocean navy for consultancy offices, professional workspaces, and legal services.",
        tag: "Professional Classic",
    },
    {
        id: "emerald-fresh",
        name: "Eco — Fresh Emerald",
        color: "#059669",
        secondary: "#34D399",
        vibe: "Organic & Fresh",
        description:
            "Natural vibrant green for nutrition practices, physical therapy, and outdoor recreation.",
        tag: "Wellness & Eco",
    },
];

const POPULAR_SWATCHES = [
    "#0E7C86",
    "#0284C7",
    "#1E3A8A",
    "#7C3AED",
    "#B45309",
    "#DC2626",
    "#059669",
    "#D97706",
    "#4338CA",
    "#BE185D",
];

/**
 * Resolves any string (preset ID, slug, hex code with or without #) into a valid hex color string.
 */
function resolveValidHex(input, fallback = "#0E7C86") {
    if (!input) return fallback;
    const str = String(input).trim();

    // 1. Strip leading # to check known preset key or slug
    const normalizedKey = str.replace(/^#/, "").toLowerCase();
    if (PRESET_COLOR_MAP[normalizedKey]) {
        return PRESET_COLOR_MAP[normalizedKey];
    }

    // 2. Check if it's already a valid hex code (e.g. #0E7C86 or #FFF)
    if (/^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(str)) {
        return str;
    }

    // 3. Hex without # (e.g. 0E7C86)
    if (/^([0-9A-F]{3}|[0-9A-F]{6})$/i.test(str)) {
        return `#${str}`;
    }

    // 4. Check if key is contained in any known preset
    for (const [key, color] of Object.entries(PRESET_COLOR_MAP)) {
        if (normalizedKey.includes(key) || key.includes(normalizedKey)) {
            return color;
        }
    }

    // 5. Check in default theme presets list
    const foundPreset = DEFAULT_THEME_PRESETS.find(
        (p) =>
            p.id.toLowerCase() === normalizedKey ||
            p.name.toLowerCase().includes(normalizedKey),
    );
    if (foundPreset) return foundPreset.color;

    return fallback;
}

function normalizePreset(item, index = 0) {
    if (!item) return DEFAULT_THEME_PRESETS[0];

    // If item is a string (e.g. "medical-clean", "#medical-clean", or "#0E7C86")
    if (typeof item === "string") {
        const resolvedHex = resolveValidHex(
            item,
            DEFAULT_THEME_PRESETS[index % DEFAULT_THEME_PRESETS.length]?.color || "#0E7C86",
        );
        const itemKey = item.replace(/^#/, "").toLowerCase();
        const found = DEFAULT_THEME_PRESETS.find(
            (p) => p.id === itemKey || p.color.toLowerCase() === resolvedHex.toLowerCase(),
        );

        if (found) {
            return { ...found };
        }

        return {
            id: `theme-custom-${index}`,
            name: `Theme Palette ${index + 1}`,
            color: resolvedHex,
            secondary: resolvedHex,
            vibe: "Curated Style",
            description: `Category optimized color accent (${resolvedHex})`,
            tag: "Category Standard",
        };
    }

    // If item is an object
    const rawColor = item.color || item.hex || item.primary || item.value || item.id || "#0E7C86";
    const resolvedColor = resolveValidHex(rawColor, "#0E7C86");
    const rawSecondary = item.secondary || resolvedColor;
    const resolvedSecondary = resolveValidHex(rawSecondary, resolvedColor);

    const matchingDefault = DEFAULT_THEME_PRESETS.find(
        (p) => p.id === item.id || p.color.toLowerCase() === resolvedColor.toLowerCase(),
    );

    const name = item.name || item.title || item.label || matchingDefault?.name || `Palette ${index + 1}`;
    const id = item.id || item.slug || matchingDefault?.id || `theme-${index}`;
    const vibe = item.vibe || item.subtitle || matchingDefault?.vibe || "Curated Accent";
    const description = item.description || matchingDefault?.description || `Modern brand palette with ${resolvedColor}`;
    const tag = item.tag || matchingDefault?.tag || "Verified Palette";

    return { id, name, color: resolvedColor, secondary: resolvedSecondary, vibe, description, tag };
}

export default function Step3Theme({ onSelectTheme }) {
    const dispatch = useDispatch();
    const { formData, liveCategories } = useSelector((state) => state.onboarding);

    // Resolve selected category safely from formData or liveCategories list
    const selectedCategory = useMemo(() => {
        if (formData.selectedCategory) return formData.selectedCategory;
        if (formData.categoryId && Array.isArray(liveCategories)) {
            return liveCategories.find((c) => c.id === formData.categoryId) || null;
        }
        return null;
    }, [formData.selectedCategory, formData.categoryId, liveCategories]);

    // Guarantee activeColor is always a real hex color (never a slug)
    const activeColor = useMemo(() => {
        return resolveValidHex(formData.themeColor, "#0E7C86");
    }, [formData.themeColor]);

    const [customHex, setCustomHex] = useState(activeColor);
    const [prevThemeColor, setPrevThemeColor] = useState(formData.themeColor);
    const [selectedSlot, setSelectedSlot] = useState("11:00 AM");
    const [selectedServiceId, setSelectedServiceId] = useState(1);

    // Sync customHex when formData.themeColor changes
    if (formData.themeColor !== prevThemeColor) {
        setPrevThemeColor(formData.themeColor);
        setCustomHex(activeColor);
    }

    // Auto-repair invalid non-hex slug format in Redux formData.themeColor
    useEffect(() => {
        if (formData.themeColor) {
            const valid = resolveValidHex(formData.themeColor, "#0E7C86");

            // If Redux stored an invalid non-hex string like "medical-clean" or "#medical-clean", repair it immediately
            if (formData.themeColor !== valid) {
                dispatch(
                    updateFormData({
                        themeColor: valid,
                        themePreset: "Category Palette",
                        themeConfig: {
                            accent: valid,
                            secondary: valid,
                            presetName: "Category Palette",
                        },
                    }),
                );
            }
        }
    }, [formData.themeColor, dispatch]);

    // Dynamically derive theme list from database category or presets
    const activePresets = useMemo(() => {
        let themesFromDb = selectedCategory?.available_themes;
        if (typeof themesFromDb === "string") {
            try {
                themesFromDb = JSON.parse(themesFromDb);
            } catch {
                themesFromDb = null;
            }
        }

        if (Array.isArray(themesFromDb) && themesFromDb.length > 0) {
            return themesFromDb.map((theme, i) => normalizePreset(theme, i));
        }

        // If category has a specific theme_color in DB, highlight it as first preset
        if (selectedCategory?.theme_color) {
            const catColor = resolveValidHex(selectedCategory.theme_color, "#0E7C86");

            const categoryTheme = {
                id: `cat-${selectedCategory.slug || "official"}`,
                name: `${selectedCategory.name || "Category"} Official`,
                color: catColor,
                secondary: catColor,
                vibe: "Category Standard",
                description: `Verified standard color scheme tailored for ${selectedCategory.name || "this vertical"}.`,
                tag: "Category Standard",
            };
            const others = DEFAULT_THEME_PRESETS.filter(
                (p) =>
                    String(p.color || "").toLowerCase() !==
                    catColor.toLowerCase(),
            );
            return [categoryTheme, ...others];
        }

        return DEFAULT_THEME_PRESETS;
    }, [selectedCategory]);

    // Apply a preset
    const handlePickPreset = (preset) => {
        const hex = resolveValidHex(preset.color, "#0E7C86");
        setCustomHex(hex);
        dispatch(
            updateFormData({
                themeColor: hex,
                themePreset: preset.name || "Custom Palette",
                themeConfig: {
                    accent: hex,
                    secondary: resolveValidHex(preset.secondary, hex),
                    presetName: preset.name || "Custom Palette",
                },
            }),
        );
        if (onSelectTheme) onSelectTheme(preset);
    };

    // Apply custom hex value with robust validation & formatting
    const applyCustomHex = (rawHex) => {
        let cleanHex = (rawHex || customHex || "").trim();
        if (!cleanHex) return;

        // Resolve slug or hex
        const validHex = resolveValidHex(cleanHex, null);

        if (validHex && /^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(validHex)) {
            setCustomHex(validHex);
            dispatch(
                updateFormData({
                    themeColor: validHex,
                    themePreset: "Custom Brand Accent",
                    themeConfig: {
                        accent: validHex,
                        secondary: validHex,
                        presetName: "Custom Brand Accent",
                    },
                }),
            );
            toast.success(`Theme color updated to ${validHex.toUpperCase()}`, {
                toastId: "custom-theme-applied",
                autoClose: 1500,
            });
        } else {
            toast.warn("Please enter a valid hex color code (e.g. #0E7C86 or #10B981)", {
                toastId: "invalid-hex-warn",
                autoClose: 2500,
            });
        }
    };

    const handleCustomHexChange = (e) => {
        const val = e.target.value;
        setCustomHex(val);

        // Auto apply if complete 7-character hex with # or 6-char without #
        let formatted = val.trim();
        if (!formatted.startsWith("#") && formatted.length === 6) {
            formatted = `#${formatted}`;
        }
        if (/^#([0-9A-F]{6})$/i.test(formatted)) {
            dispatch(
                updateFormData({
                    themeColor: formatted,
                    themePreset: "Custom Brand Accent",
                    themeConfig: {
                        accent: formatted,
                        secondary: formatted,
                        presetName: "Custom Brand Accent",
                    },
                }),
            );
        }
    };

    const handleColorPickerChange = (e) => {
        const val = e.target.value;
        const valid = resolveValidHex(val, "#0E7C86");
        setCustomHex(valid);
        dispatch(
            updateFormData({
                themeColor: valid,
                themePreset: "Custom Color",
                themeConfig: {
                    accent: valid,
                    secondary: valid,
                    presetName: "Custom Color",
                },
            }),
        );
    };

    // Category-tailored service data for the interactive mockup
    const serviceMockData = useMemo(() => {
        const catSlug = selectedCategory?.slug?.toLowerCase() || "";
        if (catSlug.includes("clinic") || catSlug.includes("med")) {
            return {
                icon: FiActivity,
                categoryTag: "Healthcare & Clinic",
                primary: {
                    id: 1,
                    name: "Specialist Medical Consultation",
                    provider: "Dr. Sarah Jenkins • Senior Specialist",
                    duration: "45 mins",
                    rating: "4.9",
                    reviewCount: 128,
                    price: "450 EGP",
                    badge: "Most Booked",
                    features: ["In-Clinic & Video", "Instant Confirmation"],
                },
                secondary: {
                    id: 2,
                    name: "Comprehensive Health Screening",
                    duration: "60 mins",
                    price: "750 EGP",
                },
            };
        }
        if (catSlug.includes("salon") || catSlug.includes("beauty")) {
            return {
                icon: FiScissors,
                categoryTag: "Salon & Beauty Lounge",
                primary: {
                    id: 1,
                    name: "Signature Styling, Wash & Treatment",
                    provider: "Alex Rivera • Master Stylist",
                    duration: "60 mins",
                    rating: "5.0",
                    reviewCount: 94,
                    price: "350 EGP",
                    badge: "Trending Choice",
                    features: ["Organic Products", "Complimentary Refreshment"],
                },
                secondary: {
                    id: 2,
                    name: "Express Cut & Blow-Dry",
                    duration: "30 mins",
                    price: "200 EGP",
                },
            };
        }
        if (catSlug.includes("hotel") || catSlug.includes("hospitality")) {
            return {
                icon: FiHome,
                categoryTag: "Boutique Hotel & Suites",
                primary: {
                    id: 1,
                    name: "Deluxe Ocean-View King Suite",
                    provider: "Wing B • Private Balcony & Breakfast",
                    duration: "Per Night",
                    rating: "4.8",
                    reviewCount: 210,
                    price: "1,400 EGP",
                    badge: "Top Rated",
                    features: ["Free High-Speed Wi-Fi", "Free Cancellation (24h)"],
                },
                secondary: {
                    id: 2,
                    name: "Executive Penthouse Suite",
                    duration: "Per Night",
                    price: "2,600 EGP",
                },
            };
        }
        if (catSlug.includes("fitness") || catSlug.includes("gym")) {
            return {
                icon: FiZap,
                categoryTag: "Athletic & Fitness Club",
                primary: {
                    id: 1,
                    name: "1-on-1 Guided Strength & Conditioning",
                    provider: "Coach Marcus • Certified Head Trainer",
                    duration: "50 mins",
                    rating: "4.9",
                    reviewCount: 86,
                    price: "300 EGP",
                    badge: "High Energy",
                    features: ["Custom Workout Plan", "Locker & Towel Service"],
                },
                secondary: {
                    id: 2,
                    name: "HIIT Small Group Class Slot",
                    duration: "45 mins",
                    price: "150 EGP",
                },
            };
        }
        return {
            icon: FiLayers,
            categoryTag: selectedCategory?.name || "Professional Services",
            primary: {
                id: 1,
                name: formData.name
                    ? `${formData.name} Primary Consultation`
                    : "Standard Consultation & Service Slot",
                provider: "Dedicated Verified Specialist",
                duration: "45 mins",
                rating: "4.9",
                reviewCount: 52,
                price: "350 EGP",
                badge: "Recommended",
                features: ["Instant Booking", "Full Schedule Flexibility"],
            },
            secondary: {
                id: 2,
                name: "Quick Follow-Up Review Session",
                duration: "25 mins",
                price: "180 EGP",
            },
        };
    }, [selectedCategory, formData.name]);

    const isCustomActive = useMemo(() => {
        return !activePresets.some(
            (p) => String(p.color).toLowerCase() === String(activeColor).toLowerCase(),
        );
    }, [activePresets, activeColor]);

    const ServiceCategoryIcon = serviceMockData.icon;

    return (
        <div className={styles.stepContainer}>
            {/* Heading */}
            <div className={styles.headingGroup}>
                <span className={styles.stepKicker}>
                    Step 3 — Visual Identity
                </span>
                <h2 className={styles.stepTitle}>
                    Pick your brand look & accent
                </h2>
                <p className={styles.stepSubtitle}>
                    Select a vibrant accent color palette tailored to your
                    business category. All buttons, highlights, badges, and
                    dashboard widgets dynamically adapt to this theme.
                </p>
            </div>

            <div className={styles.themeLayoutGrid}>
                {/* Left: Palette Selection List & Custom Color */}
                <div className={styles.presetsList}>
                    <div className={styles.sectionHeader}>
                        <label className={styles.sectionLabel}>
                            Available Theme Palettes
                        </label>
                        <span className={styles.curatedBadge}>
                            <FiAward size={12} />
                            {selectedCategory?.name
                                ? `Curated for ${selectedCategory.name}`
                                : "Verified Presets"}
                        </span>
                    </div>

                    <div className={styles.presetCards}>
                        {activePresets.map((preset) => {
                            const isSelected =
                                String(activeColor).toLowerCase() ===
                                String(preset.color || "").toLowerCase();

                            return (
                                <div
                                    key={preset.id || preset.name}
                                    className={`${styles.presetCard} ${
                                        isSelected ? styles.selectedPreset : ""
                                    }`}
                                    onClick={() => handlePickPreset(preset)}
                                    role="button"
                                    tabIndex={0}
                                    style={{
                                        borderColor: isSelected
                                            ? preset.color
                                            : undefined,
                                    }}
                                >
                                    {/* Swatch with multi-shade visual */}
                                    <div
                                        className={styles.colorSwatch}
                                        style={{
                                            backgroundColor: preset.color,
                                        }}
                                    >
                                        {isSelected ? (
                                            <FiCheck
                                                size={18}
                                                className={styles.swatchCheck}
                                            />
                                        ) : (
                                            <span
                                                className={styles.swatchDot}
                                                style={{
                                                    backgroundColor:
                                                        preset.secondary ||
                                                        preset.color,
                                                }}
                                            />
                                        )}
                                    </div>

                                    <div className={styles.presetDetails}>
                                        <div className={styles.presetTitleRow}>
                                            <div
                                                className={
                                                    styles.presetNameGroup
                                                }
                                            >
                                                <span
                                                    className={
                                                        styles.presetName
                                                    }
                                                >
                                                    {preset.name}
                                                </span>
                                                {preset.tag && (
                                                    <span
                                                        className={
                                                            styles.presetTag
                                                        }
                                                    >
                                                        {preset.tag}
                                                    </span>
                                                )}
                                            </div>
                                            <span className={styles.presetVibe}>
                                                {preset.vibe}
                                            </span>
                                        </div>
                                        <p className={styles.presetDesc}>
                                            {preset.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Custom Brand Accent Picker Card */}
                    <div
                        className={`${styles.customColorCard} ${
                            isCustomActive ? styles.customCardActive : ""
                        }`}
                        style={{
                            borderColor: isCustomActive ? activeColor : undefined,
                        }}
                    >
                        <div className={styles.customColorHeader}>
                            <div className={styles.customTitleGroup}>
                                <div
                                    className={styles.customIconWrap}
                                    style={{
                                        backgroundColor: `${activeColor}18`,
                                        color: activeColor,
                                    }}
                                >
                                    <FiSliders size={16} />
                                </div>
                                <div>
                                    <div className={styles.customTitleRow}>
                                        <span className={styles.customTitle}>
                                            Custom Brand Accent
                                        </span>
                                        {isCustomActive && (
                                            <span
                                                className={styles.activeCustomBadge}
                                                style={{
                                                    backgroundColor: `${activeColor}15`,
                                                    color: activeColor,
                                                    borderColor: `${activeColor}33`,
                                                }}
                                            >
                                                <FiCheck size={11} /> Applied Custom
                                            </span>
                                        )}
                                    </div>
                                    <span className={styles.customSubtitle}>
                                        Have an existing brand guide? Enter any hex code or pick from the spectrum.
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.colorInputRow}>
                            <div className={styles.colorPickerWrapper}>
                                <input
                                    type="color"
                                    value={activeColor}
                                    onChange={handleColorPickerChange}
                                    className={styles.nativeColorPicker}
                                    title="Choose custom color"
                                    aria-label="Choose custom color"
                                />
                                <div
                                    className={styles.colorPickerPreview}
                                    style={{ backgroundColor: activeColor }}
                                />
                            </div>

                            <div className={styles.hexInputWrapper}>
                                <span className={styles.hexPrefix}>HEX</span>
                                <input
                                    type="text"
                                    value={customHex}
                                    onChange={handleCustomHexChange}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            applyCustomHex(customHex);
                                        }
                                    }}
                                    placeholder="#0E7C86"
                                    className={styles.hexInput}
                                    maxLength={7}
                                    aria-label="Hex color value"
                                />
                            </div>

                            {/* Explicit Apply Check Button */}
                            <button
                                type="button"
                                className={styles.applyHexBtn}
                                onClick={() => applyCustomHex(customHex)}
                                style={{
                                    backgroundColor: activeColor,
                                    boxShadow: `0 2px 8px ${activeColor}44`,
                                }}
                                title="Apply this hex color"
                                aria-label="Apply custom theme color"
                            >
                                <FiCheck size={14} />
                                <span>Apply</span>
                            </button>

                            <div className={styles.quickChipsList}>
                                {POPULAR_SWATCHES.map((swatch) => {
                                    const isCurrent =
                                        String(activeColor).toLowerCase() ===
                                        String(swatch).toLowerCase();
                                    return (
                                        <button
                                            key={swatch}
                                            type="button"
                                            className={`${styles.quickChip} ${
                                                isCurrent
                                                    ? styles.quickChipActive
                                                    : ""
                                            }`}
                                            style={{ backgroundColor: swatch }}
                                            onClick={() =>
                                                handlePickPreset({
                                                    color: swatch,
                                                    name: "Quick Brand Accent",
                                                })
                                            }
                                            title={`Select ${swatch}`}
                                            aria-label={`Select ${swatch}`}
                                        >
                                            {isCurrent && (
                                                <FiCheck
                                                    size={11}
                                                    color="#fff"
                                                />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Live Interactive Storefront & Booking Mockup */}
                <div className={styles.previewContainer}>
                    {/* Realistic Browser Frame Header */}
                    <div className={styles.browserTopbar}>
                        <div className={styles.windowDots}>
                            <span className={styles.dotClose} />
                            <span className={styles.dotMin} />
                            <span className={styles.dotMax} />
                        </div>

                        <div className={styles.browserUrlBar}>
                            <FiLock size={11} className={styles.urlLockIcon} />
                            <span className={styles.urlText}>
                                noviq.io/{formData.slug || "your-business"}
                            </span>
                        </div>

                        <div className={styles.liveIndicator}>
                            <span
                                className={styles.liveDotPulse}
                                style={{ backgroundColor: activeColor }}
                            />
                            <span className={styles.liveText}>
                                Live Preview
                            </span>
                        </div>
                    </div>

                    {/* Warm Warning Style MVP Preview Disclaimer Banner */}
                    <div className={styles.mvpDisclaimerBanner}>
                        <div className={styles.mvpBannerIconWrap}>
                            <FiAlertTriangle size={15} />
                        </div>
                        <div className={styles.mvpBannerContent}>
                            <div className={styles.mvpBannerHeaderRow}>
                                <span className={styles.mvpBannerTitle}>
                                    MVP Prototype Preview
                                </span>
                                <span className={styles.mvpBadge}>
                                    <FiEdit3 size={10} /> Customizable in Dashboard
                                </span>
                            </div>
                            <p className={styles.mvpBannerDesc}>
                                This live preview demonstrates your active brand accent and interactive booking components. The complete public storefront layout, banners, and services are fully customizable after launch.
                            </p>
                        </div>
                    </div>

                    {/* Live Storefront Mockup Canvas */}
                    <div className={styles.liveMockupCanvas}>
                        {/* Mini Storefront Topbar */}
                        <div className={styles.mockStorefrontHeader}>
                            <div className={styles.mockLogoGroup}>
                                <div
                                    className={styles.mockLogoSquare}
                                    style={{
                                        backgroundColor: activeColor,
                                        boxShadow: `0 4px 12px ${activeColor}44`,
                                    }}
                                >
                                    <span>
                                        {formData.name
                                            ? formData.name
                                                  .charAt(0)
                                                  .toUpperCase()
                                            : "N"}
                                    </span>
                                </div>
                                <div className={styles.mockBrandInfo}>
                                    <span className={styles.mockBrandName}>
                                        {formData.name || "My Business"}
                                    </span>
                                    <span className={styles.mockCategoryPill}>
                                        {selectedCategory?.name ||
                                            "Verified Business"}
                                    </span>
                                </div>
                            </div>
                            <MainButton
                                size="xs"
                                variant="primary"
                                style={{
                                    backgroundColor: activeColor,
                                    boxShadow: `0 2px 8px ${activeColor}55`,
                                }}
                            >
                                Book Now
                            </MainButton>
                        </div>

                        {/* Mini Dashboard Stat Card */}
                        <div className={styles.mockStatCard}>
                            <div className={styles.mockStatHeader}>
                                <div
                                    className={styles.mockStatIconCircle}
                                    style={{
                                        backgroundColor: `${activeColor}1F`,
                                        color: activeColor,
                                    }}
                                >
                                    <FiTrendingUp size={15} />
                                </div>
                                <div>
                                    <span className={styles.mockStatLabel}>
                                        Weekly Bookings
                                    </span>
                                    <div className={styles.mockStatBody}>
                                        <span className={styles.mockStatValue}>
                                            24 slots filled
                                        </span>
                                        <span
                                            className={styles.mockStatTrend}
                                            style={{ color: activeColor }}
                                        >
                                            +18% this week
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.mockProgressBarTrack}>
                                <div
                                    className={styles.mockProgressBarFill}
                                    style={{
                                        width: "68%",
                                        backgroundColor: activeColor,
                                    }}
                                />
                            </div>
                        </div>

                        {/* Redesigned Rich Modern Service Card */}
                        <div className={styles.mockSectionHeader}>
                            <span className={styles.mockSectionTitle}>
                                Featured Services
                            </span>
                            <span className={styles.mockSectionSubtitle}>
                                Client Booking Card
                            </span>
                        </div>

                        {/* Primary Service Card */}
                        <div
                            className={`${styles.modernServiceCard} ${
                                selectedServiceId === 1 ? styles.modernServiceCardSelected : ""
                            }`}
                            onClick={() => setSelectedServiceId(1)}
                            style={{
                                borderColor: selectedServiceId === 1 ? `${activeColor}88` : undefined,
                                boxShadow: selectedServiceId === 1 ? `0 6px 20px ${activeColor}18` : undefined,
                            }}
                        >
                            <div className={styles.serviceCardTopRow}>
                                <div className={styles.serviceHeaderLeft}>
                                    <div
                                        className={styles.serviceEmblem}
                                        style={{
                                            backgroundColor: `${activeColor}15`,
                                            color: activeColor,
                                            borderColor: `${activeColor}30`,
                                        }}
                                    >
                                        <ServiceCategoryIcon size={18} />
                                    </div>
                                    <div className={styles.serviceTitleGroup}>
                                        <div className={styles.serviceBadgeRow}>
                                            <span className={styles.serviceCategoryName}>
                                                {serviceMockData.categoryTag}
                                            </span>
                                            <span
                                                className={styles.serviceBadgeFeatured}
                                                style={{
                                                    backgroundColor: `${activeColor}15`,
                                                    color: activeColor,
                                                }}
                                            >
                                                {serviceMockData.primary.badge}
                                            </span>
                                        </div>
                                        <h4 className={styles.serviceName}>
                                            {serviceMockData.primary.name}
                                        </h4>
                                        <span className={styles.serviceProvider}>
                                            {serviceMockData.primary.provider}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Service Meta Chips Row */}
                            <div className={styles.serviceMetaRow}>
                                <div className={styles.metaPill}>
                                    <FiClock size={12} className={styles.metaIcon} />
                                    <span>{serviceMockData.primary.duration}</span>
                                </div>
                                <div className={styles.metaPill}>
                                    <FiStar size={12} className={styles.starIcon} />
                                    <span>
                                        <strong>{serviceMockData.primary.rating}</strong> ({serviceMockData.primary.reviewCount})
                                    </span>
                                </div>
                                {serviceMockData.primary.features.slice(0, 1).map((feat, idx) => (
                                    <div key={idx} className={styles.metaPillSuccess}>
                                        <FiCheckCircle size={11} style={{ color: activeColor }} />
                                        <span>{feat}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Service Card Footer (Price & Selection Action) */}
                            <div className={styles.serviceCardFooter}>
                                <div className={styles.servicePriceBlock}>
                                    <span className={styles.priceAmount}>
                                        {serviceMockData.primary.price}
                                    </span>
                                    <span className={styles.priceUnit}>
                                        per session
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    className={`${styles.serviceSelectBtn} ${
                                        selectedServiceId === 1 ? styles.serviceSelectBtnActive : ""
                                    }`}
                                    style={{
                                        backgroundColor: selectedServiceId === 1 ? activeColor : `${activeColor}12`,
                                        color: selectedServiceId === 1 ? "#ffffff" : activeColor,
                                        borderColor: `${activeColor}40`,
                                        boxShadow: selectedServiceId === 1 ? `0 2px 10px ${activeColor}44` : undefined,
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedServiceId(1);
                                    }}
                                >
                                    {selectedServiceId === 1 ? (
                                        <>
                                            <FiCheck size={13} />
                                            <span>Selected</span>
                                        </>
                                    ) : (
                                        <span>Select Service</span>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Secondary Compact Service Sample */}
                        <div
                            className={`${styles.compactServiceRow} ${
                                selectedServiceId === 2 ? styles.compactServiceRowActive : ""
                            }`}
                            onClick={() => setSelectedServiceId(2)}
                            style={{
                                borderColor: selectedServiceId === 2 ? activeColor : undefined,
                            }}
                        >
                            <div className={styles.compactServiceLeft}>
                                <div
                                    className={styles.compactRadio}
                                    style={{
                                        borderColor: selectedServiceId === 2 ? activeColor : undefined,
                                        backgroundColor: selectedServiceId === 2 ? activeColor : undefined,
                                    }}
                                >
                                    {selectedServiceId === 2 && <FiCheck size={10} color="#fff" />}
                                </div>
                                <div className={styles.compactInfo}>
                                    <span className={styles.compactName}>
                                        {serviceMockData.secondary.name}
                                    </span>
                                    <span className={styles.compactMeta}>
                                        <FiClock size={10} /> {serviceMockData.secondary.duration}
                                    </span>
                                </div>
                            </div>
                            <span className={styles.compactPrice}>
                                {serviceMockData.secondary.price}
                            </span>
                        </div>

                        {/* Mini Interactive Time Slots Sample */}
                        <div className={styles.mockSlotsSection}>
                            <div className={styles.slotsTitleRow}>
                                <span className={styles.mockSlotsTitle}>
                                    Available Time Slots
                                </span>
                                <span className={styles.slotsTodayBadge}>
                                    Today, Available
                                </span>
                            </div>
                            <div className={styles.mockSlotsGrid}>
                                {[
                                    "09:30 AM",
                                    "11:00 AM",
                                    "02:30 PM",
                                    "04:15 PM",
                                ].map((slot) => {
                                    const isChosen = selectedSlot === slot;
                                    return (
                                        <button
                                            key={slot}
                                            type="button"
                                            onClick={() =>
                                                setSelectedSlot(slot)
                                            }
                                            className={`${styles.mockSlotBtn} ${
                                                isChosen
                                                    ? styles.mockSlotBtnActive
                                                    : ""
                                            }`}
                                            style={{
                                                backgroundColor: isChosen
                                                    ? activeColor
                                                    : undefined,
                                                borderColor: isChosen
                                                    ? activeColor
                                                    : undefined,
                                                boxShadow: isChosen
                                                    ? `0 2px 8px ${activeColor}44`
                                                    : undefined,
                                            }}
                                        >
                                            {slot}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Trust Guarantee Mini Note */}
                        <div className={styles.mockTrustBadge}>
                            <FiShield
                                size={13}
                                style={{ color: activeColor }}
                            />
                            <span>
                                Powered by NOVIQ Business Platform • Instant Confirmation
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

Step3Theme.propTypes = {
    onSelectTheme: PropTypes.func,
};
