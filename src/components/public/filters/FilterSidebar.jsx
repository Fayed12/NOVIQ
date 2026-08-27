// local
import NoviqSelect from "../../ui/select/NoviqSelect";
import { POPULAR_CITIES } from "../../../utils/geoDistance";
import styles from "./FilterSidebar.module.css";

// react-icons
import {
    FiMapPin,
    FiStar,
    FiClock,
    FiRotateCcw,
    FiNavigation,
    FiUsers,
    FiSliders
} from "react-icons/fi";

const RATING_NUMBERS = [
    { value: 0, label: "All" },
    { value: 3.5, label: "3.5+" },
    { value: 4.0, label: "4.0+" },
    { value: 4.5, label: "4.5+" },
    { value: 4.8, label: "4.8+" }
];

const CAPACITY_NUMBERS = [
    { value: 0, label: "Any" },
    { value: 1, label: "1 Person" },
    { value: 2, label: "2 People" },
    { value: 4, label: "3–5 Group" },
    { value: 6, label: "6+ Large" }
];

const FilterSidebar = ({
    selectedCity = "",
    onCityChange,
    minRating = 0,
    onRatingChange,
    selectedCapacity = 0,
    onCapacityChange = () => {},
    openNowOnly = false,
    onOpenNowToggle,
    maxDistanceKm = 50,
    onDistanceChange,
    isNearMeActive = false,
    onNearMeClick,
    onResetFilters
}) => {
    const cityOptions = POPULAR_CITIES.map((c) => ({
        value: c.name.startsWith("All") ? "" : c.name,
        label: c.name
    }));

    const currentCityOption = cityOptions.find((opt) => opt.value === selectedCity) || cityOptions[0];

    const activeFilterCount =
        (selectedCity ? 1 : 0) +
        (minRating > 0 ? 1 : 0) +
        (selectedCapacity > 0 ? 1 : 0) +
        (openNowOnly ? 1 : 0) +
        (isNearMeActive ? 1 : 0);

    return (
        <aside className={styles.sidebarCard}>
            {/* Header */}
            <div className={styles.sidebarHeader}>
                <div className={styles.headerLeft}>
                    <div className={styles.filterIconCircle}>
                        <FiSliders />
                    </div>
                    <div className={styles.headerTextGroup}>
                        <h3 className={styles.headerTitle}>Filters</h3>
                        <span className={styles.headerSub}>
                            {activeFilterCount > 0
                                ? `${activeFilterCount} active`
                                : "Location & rating"}
                        </span>
                    </div>
                </div>

                {activeFilterCount > 0 && (
                    <button
                        type="button"
                        onClick={onResetFilters}
                        className={styles.resetBtn}
                        title="Reset all filters"
                        aria-label="Reset all filters"
                    >
                        <FiRotateCcw className={styles.resetIcon} />
                    </button>
                )}
            </div>

            {/* Filter Section 1: City & Governorate */}
            <div className={styles.filterBlock}>
                <label className={styles.blockLabel}>
                    <FiMapPin className={styles.labelIcon} />
                    <span>Location in Egypt</span>
                </label>

                <div className={styles.selectContainer}>
                    <NoviqSelect
                        options={cityOptions}
                        value={currentCityOption}
                        onChange={(selected) => onCityChange(selected ? selected.value : "")}
                        placeholder="All Egypt Governorates..."
                        isSearchable={true}
                    />
                </div>

                {/* GPS Near Me Action */}
                <button
                    type="button"
                    onClick={onNearMeClick}
                    className={`${styles.gpsActionBtn} ${isNearMeActive ? styles.gpsActive : ""}`}
                >
                    <FiNavigation className={styles.gpsIcon} />
                    <span>{isNearMeActive ? "GPS Proximity Active" : "Find Nearest to My GPS"}</span>
                </button>

                {/* Distance Range Slider if GPS is active */}
                {isNearMeActive && (
                    <div className={styles.distanceSliderWrap}>
                        <div className={styles.sliderHeader}>
                            <span className={styles.sliderLabel}>Radius Limit:</span>
                            <span className={styles.sliderNumber}>{maxDistanceKm} km</span>
                        </div>
                        <input
                            type="range"
                            min="5"
                            max="100"
                            step="5"
                            value={maxDistanceKm}
                            onChange={(e) => onDistanceChange(Number(e.target.value))}
                            className={styles.rangeSlider}
                        />
                    </div>
                )}
            </div>

            {/* Filter Section 2: Minimum Rating Numbers */}
            <div className={styles.filterBlock}>
                <label className={styles.blockLabel}>
                    <FiStar className={styles.labelIcon} />
                    <span>Customer Rating Score</span>
                </label>

                <div className={styles.numericGrid}>
                    {RATING_NUMBERS.map((r) => {
                        const isSelected = minRating === r.value;
                        return (
                            <button
                                key={r.value}
                                type="button"
                                className={`${styles.numericChip} ${isSelected ? styles.chipActive : ""}`}
                                onClick={() => onRatingChange(r.value)}
                            >
                                {r.value > 0 && <FiStar className={styles.starSmall} />}
                                <span>{r.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Filter Section 3: Capacity / Number of Guests */}
            <div className={styles.filterBlock}>
                <label className={styles.blockLabel}>
                    <FiUsers className={styles.labelIcon} />
                    <span>Capacity / Party Size</span>
                </label>

                <div className={styles.numericPillsList}>
                    {CAPACITY_NUMBERS.map((c) => {
                        const isSelected = selectedCapacity === c.value;
                        return (
                            <button
                                key={c.value}
                                type="button"
                                className={`${styles.capacityPill} ${isSelected ? styles.capacityActive : ""}`}
                                onClick={() => onCapacityChange(c.value)}
                            >
                                <span>{c.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Filter Section 4: Open Now Only Toggle */}
            <div className={styles.filterBlockLast}>
                <label className={styles.toggleContainer}>
                    <div className={styles.toggleLeft}>
                        <div className={styles.clockIconWrap}>
                            <FiClock />
                        </div>
                        <div>
                            <span className={styles.toggleTitle}>Open Now Only</span>
                            <span className={styles.toggleSubtitle}>Show currently open spaces</span>
                        </div>
                    </div>
                    <input
                        type="checkbox"
                        checked={openNowOnly}
                        onChange={(e) => onOpenNowToggle(e.target.checked)}
                        className={styles.toggleCheckbox}
                    />
                </label>
            </div>
        </aside>
    );
};

export default FilterSidebar;
