import { useEffect } from "react";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import { fetchLiveCategoriesThunk, updateFormData } from "../../../../redux/slices/onboardingSlice";
import {
    FiActivity,
    FiScissors,
    FiHome,
    FiZap,
    FiCheck,
    FiLayers,
    FiClock,
    FiGrid,
} from "react-icons/fi";
import styles from "./Step1Category.module.css";

// Dynamic icon resolver for category icons stored in DB
function getCategoryIcon(iconName, color) {
    const iconProps = { size: 26, style: { color: color || "#0e7c86" } };
    switch (iconName?.toLowerCase()) {
        case "stethoscope":
        case "clinics":
        case "medical":
            return <FiActivity {...iconProps} />;
        case "scissors":
        case "salons":
        case "beauty":
            return <FiScissors {...iconProps} />;
        case "bed":
        case "hotels":
        case "hospitality":
            return <FiHome {...iconProps} />;
        case "dumbbell":
        case "fitness":
        case "gym":
            return <FiZap {...iconProps} />;
        default:
            return <FiLayers {...iconProps} />;
    }
}

// Strategy subtitle generator based on industry
function getCategoryStrategyDetails(slug) {
    switch (slug) {
        case "clinics":
            return {
                resourceLabel: "Doctors & Specialists",
                strategy: "Sequential Appointment Slots",
                desc: "Schedule patient visits, consultations, and doctor calendars with buffer times.",
                icon: FiClock,
            };
        case "salons":
            return {
                resourceLabel: "Stylists & Treatment Chairs",
                strategy: "Multi-Service Slot Booking",
                desc: "Manage haircut appointments, spa rooms, and stylist schedules seamlessly.",
                icon: FiClock,
            };
        case "hotels":
            return {
                resourceLabel: "Rooms & Suites Inventory",
                strategy: "Inventory Pool Strategy",
                desc: "Manage room capacity, check-in/check-out dates, and hotel reservations.",
                icon: FiGrid,
            };
        case "fitness":
            return {
                resourceLabel: "Trainers & Class Studios",
                strategy: "Sequential & Capacity Sessions",
                desc: "Book personal training sessions, court times, and fitness group workouts.",
                icon: FiClock,
            };
        default:
            return {
                resourceLabel: "Bookable Resources",
                strategy: "Smart Dynamic Booking",
                desc: "Custom booking infrastructure tailored to your business operations.",
                icon: FiLayers,
            };
    }
}

export default function Step1Category({ onSelectCategory }) {
    const dispatch = useDispatch();
    const { liveCategories, formData, status } = useSelector((state) => state.onboarding);
    const selectedCategoryId = formData.categoryId;

    useEffect(() => {
        if (!liveCategories || liveCategories.length === 0) {
            dispatch(fetchLiveCategoriesThunk());
        }
    }, [dispatch, liveCategories]);

    const handleCardClick = (cat) => {
        const defaultTheme = cat.theme_color || (cat.available_themes?.[0]?.color) || "#0E7C86";
        dispatch(
            updateFormData({
                categoryId: cat.id,
                selectedCategory: cat,
                themeColor: defaultTheme,
            })
        );
        if (onSelectCategory) {
            onSelectCategory(cat);
        }
    };

    const isLoading = status === "loading" && (!liveCategories || liveCategories.length === 0);

    return (
        <div className={styles.stepContainer}>
            {/* Step Heading */}
            <div className={styles.headingGroup}>
                <span className={styles.stepKicker}>Step 1 — Business Category</span>
                <h2 className={styles.stepTitle}>What kind of business are you setting up?</h2>
                <p className={styles.stepSubtitle}>
                    Select your vertical to configure scheduling models, terminology (e.g. Doctors vs. Stylists vs. Rooms), and dashboard widgets.
                </p>
            </div>

            {/* Category Grid */}
            {isLoading ? (
                <div className={styles.loadingGrid}>
                    {[1, 2, 3, 4].map((n) => (
                        <div key={n} className={styles.skeletonCard} />
                    ))}
                </div>
            ) : (
                <div className={styles.categoriesGrid}>
                    {liveCategories.map((cat) => {
                        const isSelected = selectedCategoryId === cat.id;
                        const strategyInfo = getCategoryStrategyDetails(cat.slug);

                        return (
                            <div
                                key={cat.id}
                                className={`${styles.categoryCard} ${
                                    isSelected ? styles.selectedCard : ""
                                }`}
                                onClick={() => handleCardClick(cat)}
                                role="button"
                                tabIndex={0}
                                aria-pressed={isSelected}
                            >
                                {/* Top Badge & Check indicator */}
                                <div className={styles.cardTop}>
                                    <div
                                        className={styles.iconCircle}
                                        style={{
                                            backgroundColor: `${cat.theme_color || "#0e7c86"}18`,
                                        }}
                                    >
                                        {getCategoryIcon(cat.icon || cat.slug, cat.theme_color)}
                                    </div>
                                    <div
                                        className={`${styles.radioIndicator} ${
                                            isSelected ? styles.radioSelected : ""
                                        }`}
                                    >
                                        {isSelected && <FiCheck size={13} className={styles.checkIcon} />}
                                    </div>
                                </div>

                                {/* Category Information */}
                                <div className={styles.cardContent}>
                                    <h3 className={styles.categoryName}>{cat.name}</h3>
                                    <p className={styles.categoryDesc}>{strategyInfo.desc}</p>
                                </div>

                                {/* Strategy Tag Footer */}
                                <div className={styles.cardFooter}>
                                    <div className={styles.strategyPill}>
                                        <strategyInfo.icon size={12} />
                                        <span>{strategyInfo.strategy}</span>
                                    </div>
                                    <span className={styles.resourceBadge}>
                                        {strategyInfo.resourceLabel}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

Step1Category.propTypes = {
    onSelectCategory: PropTypes.func,
};
