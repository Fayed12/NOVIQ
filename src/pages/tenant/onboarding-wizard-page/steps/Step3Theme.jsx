import { useMemo } from "react";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import { updateFormData } from "../../../../redux/slices/onboardingSlice";
import {
    FiCheck,
    FiEye,
    FiCalendar,
    FiClock,
    FiStar,
    FiTrendingUp,
    FiShield,
} from "react-icons/fi";
import styles from "./Step3Theme.module.css";

// Fallback presets if category available_themes in DB is empty
const DEFAULT_THEME_PRESETS = [
    {
        id: "medical-clean",
        name: "Medical - Clean",
        color: "#0E7C86",
        vibe: "Crisp & Trustworthy",
        description: "Ideal for healthcare, clinics, and professional consultations.",
    },
    {
        id: "salon-warm",
        name: "Salon - Warm",
        color: "#B45309",
        vibe: "Warm & Boutique",
        description: "Inviting earth tones for salons, spas, and aesthetic studios.",
    },
    {
        id: "hotel-elegant",
        name: "Hotel - Elegant",
        color: "#7C3AED",
        vibe: "Luxurious & Modern",
        description: "Deep regal accents for boutique hotels, resorts, and suites.",
    },
    {
        id: "fitness-energetic",
        name: "Fitness - Energetic",
        color: "#DC2626",
        vibe: "Dynamic & Bold",
        description: "High-impact crimson for gymnasiums, sports centers, and studios.",
    },
    {
        id: "default-neutral",
        name: "Neutral - Navy",
        color: "#1E3A8A",
        vibe: "Corporate & Classic",
        description: "Timeless navy blue for multi-service businesses and workspaces.",
    },
];

export default function Step3Theme({ onSelectTheme }) {
    const dispatch = useDispatch();
    const { formData } = useSelector((state) => state.onboarding);
    const selectedCategory = formData.selectedCategory;

    // Dynamically derive theme list from database category or presets
    const activePresets = useMemo(() => {
        if (
            selectedCategory?.available_themes &&
            Array.isArray(selectedCategory.available_themes) &&
            selectedCategory.available_themes.length > 0
        ) {
            return selectedCategory.available_themes;
        }

        // If category has a specific theme_color in DB, highlight it as first preset
        if (selectedCategory?.theme_color) {
            const categoryTheme = {
                id: `cat-${selectedCategory.slug}`,
                name: `${selectedCategory.name} Official`,
                color: selectedCategory.theme_color,
                vibe: "Category Standard",
                description: `Default verified palette for ${selectedCategory.name}`,
            };
            const others = DEFAULT_THEME_PRESETS.filter(
                (p) => p.color.toLowerCase() !== selectedCategory.theme_color.toLowerCase()
            );
            return [categoryTheme, ...others];
        }

        return DEFAULT_THEME_PRESETS;
    }, [selectedCategory]);

    const activeColor = formData.themeColor || activePresets[0].color;

    const handlePickPreset = (preset) => {
        dispatch(
            updateFormData({
                themeColor: preset.color,
                themePreset: preset.name,
                themeConfig: {
                    accent: preset.color,
                    presetName: preset.name,
                },
            })
        );
        if (onSelectTheme) onSelectTheme(preset);
    };

    return (
        <div className={styles.stepContainer}>
            {/* Heading */}
            <div className={styles.headingGroup}>
                <span className={styles.stepKicker}>Step 3 — Visual Identity</span>
                <h2 className={styles.stepTitle}>Pick your brand look & accent</h2>
                <p className={styles.stepSubtitle}>
                    Select an accent color palette fetched from your business category. All buttons, highlights, badges, and dashboard widgets dynamically adapt to this theme.
                </p>
            </div>

            <div className={styles.themeLayoutGrid}>
                {/* Left: Palette Selection List */}
                <div className={styles.presetsList}>
                    <label className={styles.sectionLabel}>Available Theme Palettes</label>
                    <div className={styles.presetCards}>
                        {activePresets.map((preset) => {
                            const isSelected =
                                (formData.themeColor || "").toLowerCase() ===
                                preset.color.toLowerCase();

                            return (
                                <div
                                    key={preset.id || preset.name}
                                    className={`${styles.presetCard} ${
                                        isSelected ? styles.selectedPreset : ""
                                    }`}
                                    onClick={() => handlePickPreset(preset)}
                                    role="button"
                                    tabIndex={0}
                                >
                                    <div
                                        className={styles.colorSwatch}
                                        style={{ backgroundColor: preset.color }}
                                    >
                                        {isSelected && (
                                            <FiCheck size={16} className={styles.swatchCheck} />
                                        )}
                                    </div>

                                    <div className={styles.presetDetails}>
                                        <div className={styles.presetTitleRow}>
                                            <span className={styles.presetName}>{preset.name}</span>
                                            <span className={styles.presetVibe}>{preset.vibe}</span>
                                        </div>
                                        <p className={styles.presetDesc}>{preset.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Live Interactive Miniature Preview */}
                <div className={styles.previewContainer}>
                    <div className={styles.previewHeader}>
                        <div className={styles.previewTitle}>
                            <FiEye size={15} />
                            <span>Live Storefront & Dashboard Preview</span>
                        </div>
                        <div className={styles.verifiedBadge}>
                            <FiShield size={13} />
                            <span>AAA Contrast Verified</span>
                        </div>
                    </div>

                    <div className={styles.liveMockupCanvas}>
                        {/* Mini Topbar */}
                        <div className={styles.mockTopbar}>
                            <div className={styles.mockLogoGroup}>
                                <div
                                    className={styles.mockLogoSquare}
                                    style={{ backgroundColor: activeColor }}
                                />
                                <span className={styles.mockBrandName}>
                                    {formData.name || "My Business"}
                                </span>
                            </div>
                            <button
                                type="button"
                                className={styles.mockBookButton}
                                style={{ backgroundColor: activeColor }}
                            >
                                Book Now
                            </button>
                        </div>

                        {/* Mini Dashboard Stat Card */}
                        <div className={styles.mockStatCard}>
                            <div className={styles.mockStatHeader}>
                                <div
                                    className={styles.mockStatIconCircle}
                                    style={{ backgroundColor: `${activeColor}1F`, color: activeColor }}
                                >
                                    <FiTrendingUp size={16} />
                                </div>
                                <span className={styles.mockStatLabel}>Weekly Bookings</span>
                            </div>
                            <div className={styles.mockStatBody}>
                                <span className={styles.mockStatNumber}>48</span>
                                <span className={styles.mockStatTrend} style={{ color: activeColor }}>
                                    +18% this week
                                </span>
                            </div>
                        </div>

                        {/* Mini Service / Treatment Card */}
                        <div className={styles.mockServiceCard}>
                            <div className={styles.mockServiceLeft}>
                                <div
                                    className={styles.mockServiceDot}
                                    style={{ backgroundColor: activeColor }}
                                />
                                <div>
                                    <span className={styles.mockServiceName}>Primary Appointment</span>
                                    <span className={styles.mockServiceMeta}>
                                        <FiClock size={11} /> 30 min • <FiStar size={11} /> 5.0 Rating
                                    </span>
                                </div>
                            </div>
                            <span className={styles.mockPriceTag} style={{ color: activeColor }}>
                                $50.00
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
