// local
import {
    fetchLiveCategoriesThunk,
    fetchUsedCategoriesThunk,
    fetchUserOwnedTenantsThunk,
    updateFormData,
} from "../../../../redux/slices/onboardingSlice";
import MainButton from "../../../../components/ui/button/MainButton";
import CategoryLimitModal from "../components/CategoryLimitModal";
import styles from "./Step1Category.module.css";

// prop-types
import PropTypes from "prop-types";

// react
import { useEffect, useState } from "react";

// react-redux
import { useSelector, useDispatch } from "react-redux";

// react icons
import {
    FiActivity,
    FiScissors,
    FiHome,
    FiZap,
    FiCheck,
    FiLayers,
    FiClock,
    FiGrid,
    FiAlertCircle,
    FiRefreshCw,
    FiLock,
    FiAlertTriangle,
} from "react-icons/fi";

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
    const {
        liveCategories,
        formData,
        status,
        error,
        userOwnedTenants,
        usedCategories,
        draftTenant,
    } = useSelector((state) => state.onboarding);
    const { user } = useSelector((state) => state.auth);
    const selectedCategoryId = formData.categoryId;
    const [conflictingCategory, setConflictingCategory] = useState(null);

    useEffect(() => {
        if (status === "idle" && (!liveCategories || liveCategories.length === 0)) {
            dispatch(fetchLiveCategoriesThunk());
        }
        dispatch(fetchUsedCategoriesThunk());
        if (user?.id) {
            dispatch(fetchUserOwnedTenantsThunk(user.id));
        }
    }, [dispatch, liveCategories, status, user?.id]);

    // Check if category has an active business registered in Supabase
    const findCategoryConflict = (catId) => {
        if (!catId) return null;
        // 1. Check in usedCategories (all active registered businesses across platform)
        const inUsed = (usedCategories || []).find(
            (item) =>
                item.category_id === catId &&
                item.id !== draftTenant?.id &&
                item.status !== "draft" &&
                item.status !== "deleted"
        );
        if (inUsed) return inUsed;

        // 2. Also check in userOwnedTenants
        const inUserOwned = (userOwnedTenants || []).find(
            (item) =>
                item.category_id === catId &&
                item.id !== draftTenant?.id &&
                item.status !== "deleted"
        );
        return inUserOwned || null;
    };

    const activeConflict = selectedCategoryId ? findCategoryConflict(selectedCategoryId) : null;

    const handleCardClick = (cat) => {
        // Check if category is already used
        const existingBusiness = findCategoryConflict(cat.id);

        if (existingBusiness) {
            setConflictingCategory({
                category: cat,
                business: existingBusiness,
            });
            if (onSelectCategory) {
                onSelectCategory(cat, existingBusiness);
            }
            return;
        }

        // Resolve raw color/slug into guaranteed valid hex code
        const rawTheme =
            cat.theme_color ||
            (typeof cat.available_themes?.[0] === "string"
                ? cat.available_themes[0]
                : cat.available_themes?.[0]?.color) ||
            "#0E7C86";

        let defaultTheme = rawTheme;
        if (defaultTheme.includes("medical") || defaultTheme.includes("clinic")) {
            defaultTheme = "#0E7C86";
        } else if (defaultTheme.includes("salon") || defaultTheme.includes("beauty")) {
            defaultTheme = "#B45309";
        } else if (defaultTheme.includes("hotel") || defaultTheme.includes("hospitality")) {
            defaultTheme = "#7C3AED";
        } else if (defaultTheme.includes("fitness") || defaultTheme.includes("gym")) {
            defaultTheme = "#DC2626";
        } else if (!/^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(defaultTheme)) {
            defaultTheme = defaultTheme.startsWith("#") ? defaultTheme : `#${defaultTheme}`;
            if (!/^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(defaultTheme)) {
                defaultTheme = "#0E7C86";
            }
        }

        dispatch(
            updateFormData({
                categoryId: cat.id,
                selectedCategory: cat,
                themeColor: defaultTheme,
            }),
        );
        if (onSelectCategory) {
            onSelectCategory(cat, null);
        }
    };

    const isLoading =
        status === "loading" &&
        (!liveCategories || liveCategories.length === 0);

    const isError =
        status === "failed" &&
        (!liveCategories || liveCategories.length === 0);

    return (
        <div className={styles.stepContainer}>
            {/* Step Heading */}
            <div className={styles.headingGroup}>
                <span className={styles.stepKicker}>
                    Step 1 — Business Category
                </span>
                <h2 className={styles.stepTitle}>
                    What kind of business are you setting up?
                </h2>
                <p className={styles.stepSubtitle}>
                    Select your vertical to configure scheduling models,
                    terminology (e.g. Doctors vs. Stylists vs. Rooms), and
                    dashboard widgets.
                </p>
            </div>

            {/* Error Banner with Retry */}
            {isError && (
                <div className={styles.errorBox}>
                    <FiAlertCircle size={28} className={styles.errorIcon} />
                    <div>
                        <p className={styles.errorTitle}>Failed to load business categories</p>
                        <p className={styles.errorMessage}>{error || "Unable to reach categories catalog."}</p>
                    </div>
                    <MainButton
                        size="sm"
                        variant="secondary"
                        icon={<FiRefreshCw />}
                        onClick={() => dispatch(fetchLiveCategoriesThunk())}
                    >
                        Retry Loading Categories
                    </MainButton>
                </div>
            )}

            {/* Prominent Warning Banner if Currently Selected Category is in Use */}
            {activeConflict && (
                <div className={styles.activeConflictBanner} role="alert">
                    <div className={styles.conflictBannerHeader}>
                        <FiAlertTriangle className={styles.conflictBannerIcon} size={22} />
                        <div>
                            <h4 className={styles.conflictBannerTitle}>
                                Category Already in Use: {activeConflict.categories?.name || "Selected Vertical"}
                            </h4>
                            <p className={styles.conflictBannerText}>
                                A registered business (<strong>{activeConflict.name}</strong>) is already operating in this category. You cannot proceed to the next step with an in-use category. Please select another available category below.
                            </p>
                        </div>
                    </div>
                    <MainButton
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                            setConflictingCategory({
                                category: activeConflict.categories || { name: activeConflict.name },
                                business: activeConflict,
                            })
                        }
                    >
                        View Warning
                    </MainButton>
                </div>
            )}

            {/* Category Grid */}
            {isLoading ? (
                <div className={styles.loadingGrid}>
                    {[1, 2, 3, 4].map((n) => (
                        <div key={n} className={styles.skeletonCard} />
                    ))}
                </div>
            ) : !isError && (
                <div className={styles.categoriesGrid}>
                    {liveCategories.map((cat) => {
                        const isSelected = selectedCategoryId === cat.id;
                        const strategyInfo = getCategoryStrategyDetails(
                            cat.slug,
                        );

                        // Check if category is used
                        const conflict = findCategoryConflict(cat.id);

                        return (
                            <div
                                key={cat.id}
                                className={`${styles.categoryCard} ${
                                    isSelected ? styles.selectedCard : ""
                                } ${conflict ? styles.usedCard : ""}`}
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
                                        {getCategoryIcon(
                                            cat.icon || cat.slug,
                                            cat.theme_color,
                                        )}
                                    </div>

                                    {conflict ? (
                                        <div
                                            className={styles.usedBadge}
                                            title={`Already used by ${conflict.name}`}
                                        >
                                            <FiLock size={12} />
                                            <span>In Use ({conflict.name})</span>
                                        </div>
                                    ) : (
                                        <div
                                            className={`${styles.radioIndicator} ${
                                                isSelected
                                                    ? styles.radioSelected
                                                    : ""
                                            }`}
                                        >
                                            {isSelected && (
                                                <FiCheck
                                                    size={13}
                                                    className={styles.checkIcon}
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Category Information */}
                                <div className={styles.cardContent}>
                                    <h3 className={styles.categoryName}>
                                        {cat.name}
                                    </h3>
                                    <p className={styles.categoryDesc}>
                                        {strategyInfo.desc}
                                    </p>
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

            {/* Warning Modal when user attempts to create duplicate business in same category */}
            <CategoryLimitModal
                isOpen={Boolean(conflictingCategory)}
                category={conflictingCategory?.category}
                existingBusiness={conflictingCategory?.business}
                onClose={() => setConflictingCategory(null)}
            />
        </div>
    );
}

Step1Category.propTypes = {
    onSelectCategory: PropTypes.func,
};
