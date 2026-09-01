// local
import QuickBranchModal from "../components/QuickBranchModal";
import StorefrontBrandCanvas from "../components/StorefrontBrandCanvas";
import MainInput from "../../../../components/ui/input/MainInput";
import MainSelect from "../../../../components/ui/select/MainSelect";
import MainButton from "../../../../components/ui/button/MainButton";
import { updateFormData } from "../../../../redux/slices/onboardingSlice";
import {
    EGYPTIAN_CITIES,
    getSortedEgyptianCitiesByLocation,
} from "../../../../utils/egyptianCities";
import styles from "./Step2BusinessInfo.module.css";

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
    FiBriefcase,
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
    FiGrid,
    FiMail,
    FiPhone,
    FiMapPin,
    FiNavigation,
    FiHome,
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiCheckCircle,
    FiLifeBuoy,
    FiSun,
    FiMoon,
    FiTrendingUp,
} from "react-icons/fi";

const FOUR_CATEGORIES = [
    { id: "all", label: "All Categories", icon: FiGrid },
    { id: "clinics", label: "Clinics & Medical", icon: FiActivity },
    { id: "salons", label: "Beauty & Salons", icon: FiScissors },
    { id: "hotels", label: "Hotels & Lodging", icon: FiHome },
    { id: "fitness", label: "Fitness & Gym", icon: FiZap },
];

const BUSINESS_ICON_PRESETS = [
    // 1. Clinics & Healthcare
    {
        id: "FiActivity",
        label: "Medical Pulse",
        category: "clinics",
        categoryLabel: "Clinics",
        icon: FiActivity,
    },
    {
        id: "FiHeart",
        label: "Healthcare",
        category: "clinics",
        categoryLabel: "Clinics",
        icon: FiHeart,
    },
    {
        id: "FiShield",
        label: "Clinic Care",
        category: "clinics",
        categoryLabel: "Clinics",
        icon: FiShield,
    },
    {
        id: "FiPlus",
        label: "Emergency & Care",
        category: "clinics",
        categoryLabel: "Clinics",
        icon: FiPlus,
    },
    {
        id: "FiLifeBuoy",
        label: "Wellness Support",
        category: "clinics",
        categoryLabel: "Clinics",
        icon: FiLifeBuoy,
    },

    // 2. Beauty & Salons
    {
        id: "FiScissors",
        label: "Hair & Styling",
        category: "salons",
        categoryLabel: "Salons",
        icon: FiScissors,
    },
    {
        id: "FiSmile",
        label: "Spa & Facial",
        category: "salons",
        categoryLabel: "Salons",
        icon: FiSmile,
    },
    {
        id: "FiStar",
        label: "Luxury Salon",
        category: "salons",
        categoryLabel: "Salons",
        icon: FiStar,
    },
    {
        id: "FiSun",
        label: "Glow & Beauty",
        category: "salons",
        categoryLabel: "Salons",
        icon: FiSun,
    },

    // 3. Hotels & Hospitality
    {
        id: "FiHome",
        label: "Suites & Rooms",
        category: "hotels",
        categoryLabel: "Hotels",
        icon: FiHome,
    },
    {
        id: "FiCoffee",
        label: "Lounge & Stay",
        category: "hotels",
        categoryLabel: "Hotels",
        icon: FiCoffee,
    },
    {
        id: "FiCompass",
        label: "Resort & Travel",
        category: "hotels",
        categoryLabel: "Hotels",
        icon: FiCompass,
    },
    {
        id: "FiMoon",
        label: "Night Stays",
        category: "hotels",
        categoryLabel: "Hotels",
        icon: FiMoon,
    },

    // 4. Fitness & Gym
    {
        id: "FiZap",
        label: "Power & Cardio",
        category: "fitness",
        categoryLabel: "Fitness",
        icon: FiZap,
    },
    {
        id: "FiAward",
        label: "Gym & Strength",
        category: "fitness",
        categoryLabel: "Fitness",
        icon: FiAward,
    },
    {
        id: "FiTarget",
        label: "Studio & Goals",
        category: "fitness",
        categoryLabel: "Fitness",
        icon: FiTarget,
    },
    {
        id: "FiTrendingUp",
        label: "Performance",
        category: "fitness",
        categoryLabel: "Fitness",
        icon: FiTrendingUp,
    },
];

// Helper to sanitize slug from business name
function generateSlug(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export default function Step2BusinessInfo({ errors = {}, onFieldChange }) {
    const dispatch = useDispatch();
    const { formData, draftTenant } = useSelector((state) => state.onboarding);
    const branches = useMemo(() => formData.branches || [], [formData.branches]);

    const [isLocating, setIsLocating] = useState(false);
    const [cityList, setCityList] = useState(EGYPTIAN_CITIES);

    // Resolve active platform category from Step 1
    const activeCategorySlug = useMemo(() => {
        const slug = formData.selectedCategory?.slug?.toLowerCase();
        if (slug) {
            if (slug.includes("clinic") || slug.includes("medical")) return "clinics";
            if (slug.includes("salon") || slug.includes("beauty")) return "salons";
            if (slug.includes("hotel") || slug.includes("hospitality")) return "hotels";
            if (slug.includes("fitness") || slug.includes("gym")) return "fitness";
        }
        return "all";
    }, [formData.selectedCategory]);

    const [iconCategoryFilter, setIconCategoryFilter] = useState(() => {
        return activeCategorySlug !== "all" ? activeCategorySlug : "all";
    });

    // Auto-select initial industry icon if user hasn't explicitly customized it
    useEffect(() => {
        if (!formData.icon || formData.icon === "FiBriefcase") {
            let defaultCategoryIcon = "FiActivity";
            if (activeCategorySlug === "salons") defaultCategoryIcon = "FiScissors";
            else if (activeCategorySlug === "hotels") defaultCategoryIcon = "FiHome";
            else if (activeCategorySlug === "fitness") defaultCategoryIcon = "FiZap";

            dispatch(updateFormData({ icon: defaultCategoryIcon }));
        }
    }, [activeCategorySlug, formData.icon, dispatch]);

    const filteredIcons = useMemo(() => {
        if (iconCategoryFilter === "all") return BUSINESS_ICON_PRESETS;
        return BUSINESS_ICON_PRESETS.filter(
            (item) => item.category === iconCategoryFilter
        );
    }, [iconCategoryFilter]);

    const currentEmblem = useMemo(() => {
        return (
            BUSINESS_ICON_PRESETS.find((item) => item.id === formData.icon) ||
            BUSINESS_ICON_PRESETS[0]
        );
    }, [formData.icon]);

    // Modal state for adding secondary branch
    const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState(null);

    // Prepare React Select options for Egyptian Cities
    const cityOptions = useMemo(() => {
        return cityList.map((c) => ({
            value: c.id,
            label: `${c.name} (${c.arabicName}) — ${c.region}${
                c.distanceKm !== undefined ? ` • ~${c.distanceKm} km away` : ""
            }`,
            cityData: c,
        }));
    }, [cityList]);

    // Selected city object for React Select
    const currentCityOption = useMemo(() => {
        if (!formData.location?.cityId) {
            // Default to Cairo if none selected
            const defaultCity = EGYPTIAN_CITIES[0];
            return {
                value: defaultCity.id,
                label: `${defaultCity.name} (${defaultCity.arabicName}) — ${defaultCity.region}`,
                cityData: defaultCity,
            };
        }
        return (
            cityOptions.find((opt) => opt.value === formData.location.cityId) ||
            cityOptions[0]
        );
    }, [cityOptions, formData.location]);

    // Ensure Main/HQ branch is kept in sync with Step 2 inputs
    useEffect(() => {
        const city = currentCityOption.cityData;
        const existingMain = branches.find((b) => b.is_main);
        const otherBranches = branches.filter((b) => !b.is_main);

        const mainBranchData = {
            id: existingMain?.id || "branch-main-hq",
            name: `${formData.name || "Main"} HQ Branch`,
            cityId: city.id,
            cityName: city.name,
            arabicName: city.arabicName,
            region: city.region,
            lat: city.lat,
            lng: city.lng,
            address: formData.address || `${city.name}, Egypt`,
            phone: formData.phone || "",
            is_main: true,
        };

        const isMainSame =
            existingMain &&
            existingMain.name === mainBranchData.name &&
            existingMain.cityId === mainBranchData.cityId &&
            existingMain.address === mainBranchData.address &&
            existingMain.phone === mainBranchData.phone;

        if (!isMainSame) {
            const allBranches = [mainBranchData, ...otherBranches];
            const shouldEnableMulti = allBranches.length > 1;
            const updatedModules = {
                ...(formData.modules || {}),
                multi_branch: shouldEnableMulti ? true : formData.modules?.multi_branch || false,
            };

            dispatch(
                updateFormData({
                    branches: allBranches,
                    modules: updatedModules,
                })
            );
        }
    }, [
        formData.name,
        formData.address,
        formData.phone,
        formData.modules,
        currentCityOption,
        branches,
        dispatch,
    ]);

    const handleNameChange = (e) => {
        const newName = e.target.value;
        const autoSlug = generateSlug(newName);
        dispatch(
            updateFormData({
                name: newName,
                slug: autoSlug,
            })
        );
        if (onFieldChange) onFieldChange("name", newName);
    };

    const handleSlugChange = (e) => {
        const sanitized = generateSlug(e.target.value);
        dispatch(updateFormData({ slug: sanitized }));
        if (onFieldChange) onFieldChange("slug", sanitized);
    };

    const handleCitySelect = (selectedOption) => {
        const city = selectedOption.cityData;
        const newLocation = {
            cityId: city.id,
            cityName: city.name,
            arabicName: city.arabicName,
            region: city.region,
            lat: city.lat,
            lng: city.lng,
        };

        dispatch(
            updateFormData({
                location: newLocation,
                address: formData.address || `${city.name}, Egypt`,
            })
        );
        if (onFieldChange) onFieldChange("location", newLocation);
    };

    // Geolocation trigger to calculate proximity to nearest Egyptian city
    const handleDetectLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const userLat = pos.coords.latitude;
                const userLng = pos.coords.longitude;

                // Sort all Egyptian cities by distance
                const sorted = getSortedEgyptianCitiesByLocation(userLat, userLng);
                setCityList(sorted);

                // Auto-select the closest Egyptian city
                const nearest = sorted[0];
                if (nearest) {
                    const nearestLocation = {
                        cityId: nearest.id,
                        cityName: nearest.name,
                        arabicName: nearest.arabicName,
                        region: nearest.region,
                        lat: nearest.lat,
                        lng: nearest.lng,
                        userDistanceKm: nearest.distanceKm,
                    };

                    dispatch(
                        updateFormData({
                            location: nearestLocation,
                            address: `${nearest.name}, Egypt`,
                        })
                    );

                    toast.success(
                        `Nearest Egyptian city detected: ${nearest.name} (~${nearest.distanceKm} km)!`,
                        { position: "top-center" }
                    );
                }
                setIsLocating(false);
            },
            (err) => {
                console.error("Geolocation error:", err);
                setIsLocating(false);
                toast.warn(
                    "Location permission denied or unavailable. Please select your Egyptian city manually.",
                    { position: "top-center" }
                );
            },
            { enableHighAccuracy: true, timeout: 8000 }
        );
    };

    // Branch management methods
    const handleSaveSecondaryBranch = (branchData) => {
        const updatedBranches = editingBranch
            ? branches.map((b) => (b.id === editingBranch.id ? { ...b, ...branchData } : b))
            : [...branches, branchData];

        if (editingBranch) {
            toast.success(`Branch "${branchData.name}" updated!`);
        } else {
            toast.success(`New branch "${branchData.name}" added!`);
        }

        dispatch(
            updateFormData({
                branches: updatedBranches,
                modules: {
                    ...(formData.modules || {}),
                    multi_branch: true,
                },
            })
        );

        setIsBranchModalOpen(false);
        setEditingBranch(null);
    };

    const handleDeleteBranch = (branchId) => {
        const branchToDelete = branches.find((b) => b.id === branchId);
        if (branchToDelete?.is_main) {
            toast.warn("The primary HQ branch cannot be deleted.");
            return;
        }
        const updated = branches.filter((b) => b.id !== branchId);
        dispatch(
            updateFormData({
                branches: updated,
                modules: {
                    ...(formData.modules || {}),
                    multi_branch: updated.length > 1,
                },
            })
        );
        toast.info("Branch removed");
    };

    return (
        <div className={styles.stepContainer}>
            {/* Step Heading */}
            <div className={styles.headingGroup}>
                <span className={styles.stepKicker}>Step 2 — Business Info & Branches</span>
                <h2 className={styles.stepTitle}>Tell us about your business & branches</h2>
                <p className={styles.stepSubtitle}>
                    Configure your brand identity and set up your physical operating branches (e.g. Cairo HQ, Alexandria Branch). All branches share the same service catalog!
                </p>
            </div>

            <div className={styles.formGrid}>
                {/* Business Name */}
                <MainInput
                    label="Business Name"
                    placeholder="e.g. Horizon Medical Centers, Royal Glamour Salon"
                    value={formData.name || ""}
                    onChange={handleNameChange}
                    error={errors.name}
                    icon={FiBriefcase}
                    required
                />

                {/* Live URL Slug Preview */}
                <div className={styles.slugGroup}>
                    <label className={styles.fieldLabel}>Storefront Web Link</label>
                    <div className={styles.slugInputWrapper}>
                        <span className={styles.slugPrefix}>noviq.io/</span>
                        <input
                            type="text"
                            className={styles.slugField}
                            value={formData.slug || ""}
                            onChange={handleSlugChange}
                            placeholder="business-slug"
                        />
                    </div>
                    <span className={styles.fieldHint}>
                        Your clients will book directly through this unique public link.
                    </span>
                </div>

                {/* Description / Bio */}
                <div className={styles.textareaGroup}>
                    <div className={styles.labelWithCounter}>
                        <label className={styles.fieldLabel}>Short Tagline & Bio</label>
                        <span className={styles.charCounter}>
                            {(formData.description || "").length}/160
                        </span>
                    </div>
                    <textarea
                        className={styles.textarea}
                        rows={3}
                        maxLength={160}
                        placeholder="Brief overview of your services, medical team, or salon expertise..."
                        value={formData.description || ""}
                        onChange={(e) =>
                            dispatch(updateFormData({ description: e.target.value }))
                        }
                    />
                </div>

                {/* Contact Email & Phone */}
                <div className={styles.twoCol}>
                    <MainInput
                        label="Public Business Email"
                        type="email"
                        placeholder="info@mybusiness.com"
                        value={formData.email || ""}
                        onChange={(e) =>
                            dispatch(updateFormData({ email: e.target.value }))
                        }
                        error={errors.email}
                        icon={FiMail}
                    />

                    <MainInput
                        label="Contact Phone Number"
                        type="tel"
                        placeholder="+20 10 1234 5678"
                        value={formData.phone || ""}
                        onChange={(e) =>
                            dispatch(updateFormData({ phone: e.target.value }))
                        }
                        icon={FiPhone}
                    />
                </div>

                {/* Brand Visuals & Media (Interactive Live Storefront Canvas) */}
                <div className={styles.mediaSection}>
                    <div className={styles.mediaHeader}>
                        <div>
                            <h3 className={styles.sectionHeading}>Brand Identity & Media Showcase</h3>
                            <p className={styles.sectionSubtitle}>
                                Upload your brand logo and header cover photo. Preview how your storefront hero appears to prospective customers.
                            </p>
                        </div>
                    </div>

                    <StorefrontBrandCanvas
                        businessName={formData.name}
                        businessSlug={formData.slug}
                        categoryName={formData.selectedCategory?.name}
                        themeColor={formData.themeColor || "#0E7C86"}
                        iconName={formData.icon || "FiActivity"}
                        logoUrl={formData.logoUrl || ""}
                        coverUrl={formData.coverUrl || ""}
                        tenantId={draftTenant?.id}
                        onChangeLogo={(url) => dispatch(updateFormData({ logoUrl: url }))}
                        onChangeCover={(url) => dispatch(updateFormData({ coverUrl: url }))}
                    />
                </div>

                {/* Business Icon & Emblem Studio */}
                <div className={styles.iconSection}>
                    <div className={styles.iconSectionHeader}>
                        <div className={styles.titleWithActivePreview}>
                            <h3 className={styles.sectionHeading}>Business Icon & Emblem</h3>
                            {currentEmblem && (
                                <span className={styles.activeEmblemBadge}>
                                    Active: <strong>{currentEmblem.label}</strong>
                                </span>
                            )}
                        </div>
                        <p className={styles.sectionSubtitle}>
                            Choose an emblem crafted for your industry. This icon and theme color will cascade to your branches, booking badges, and services.
                        </p>
                    </div>

                    {/* Category Filter Tabs */}
                    <div className={styles.iconFilterTabs} role="tablist" aria-label="Filter icons by category">
                        {FOUR_CATEGORIES.map((cat) => {
                            const isActive = iconCategoryFilter === cat.id;
                            const isUserIndustry = cat.id !== "all" && activeCategorySlug === cat.id;
                            const CatIcon = cat.icon;
                            return (
                                <button
                                    key={cat.id}
                                    type="button"
                                    role="tab"
                                    aria-selected={isActive}
                                    className={`${styles.filterTab} ${
                                        isActive ? styles.filterTabActive : ""
                                    }`}
                                    onClick={() => setIconCategoryFilter(cat.id)}
                                >
                                    <CatIcon size={14} />
                                    <span>{cat.label}</span>
                                    {isUserIndustry && (
                                        <span className={styles.industryTag}>Your Category</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className={styles.iconGrid}>
                        {filteredIcons.map((item) => {
                            const isSelected = (formData.icon || "FiActivity") === item.id;
                            const IconComponent = item.icon;
                            const activeTheme = formData.iconColor || formData.themeColor || "#0E7C86";
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    className={`${styles.iconOptionCard} ${
                                        isSelected ? styles.iconOptionSelected : ""
                                    }`}
                                    onClick={() => dispatch(updateFormData({ icon: item.id }))}
                                    aria-label={`Select ${item.label} icon (${item.categoryLabel})`}
                                >
                                    {isSelected && (
                                        <div className={styles.iconSelectedCheck}>
                                            <FiCheckCircle size={13} />
                                        </div>
                                    )}
                                    <div
                                        className={styles.iconSquircle}
                                        style={{
                                            backgroundColor: isSelected ? activeTheme : `${activeTheme}14`,
                                            color: isSelected ? "#ffffff" : activeTheme,
                                        }}
                                    >
                                        <IconComponent size={24} />
                                    </div>
                                    <span className={styles.iconLabel}>{item.label}</span>
                                    <span className={styles.iconCategoryBadge}>{item.categoryLabel}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Main HQ Location & Geolocation Section */}
                <div className={styles.locationCard}>
                    <div className={styles.locationHeader}>
                        <div className={styles.locationTitleGroup}>
                            <FiMapPin className={styles.locationIcon} />
                            <div>
                                <h4 className={styles.locationTitle}>
                                    Primary / Headquarters Location (Egypt)
                                </h4>
                                <p className={styles.locationDesc}>
                                    Set your main operating headquarters location for marketplace discovery.
                                </p>
                            </div>
                        </div>

                        <MainButton
                            variant="secondary"
                            size="sm"
                            onClick={handleDetectLocation}
                            loading={isLocating}
                            leftIcon={<FiNavigation />}
                        >
                            {isLocating ? "Locating..." : "Find Nearest City (GPS)"}
                        </MainButton>
                    </div>

                    {/* Egyptian City React-Select */}
                    <MainSelect
                        label="Select Egyptian City / Governorate (HQ)"
                        options={cityOptions}
                        value={currentCityOption}
                        onChange={handleCitySelect}
                        icon={FiCompass}
                        isSearchable
                    />

                    {/* Physical Street Address */}
                    <MainInput
                        label="HQ Street Address / District"
                        placeholder="e.g. 45 El-Tahrir St., Dokki, Giza"
                        value={formData.address || ""}
                        onChange={(e) =>
                            dispatch(updateFormData({ address: e.target.value }))
                        }
                        icon={FiMapPin}
                    />

                    {/* Map Coordinates Preview Card */}
                    <div className={styles.mapPinPreview}>
                        <div className={styles.mapCanvasMock}>
                            <div className={styles.mapRadarPulse} />
                            <div className={styles.mapPinIcon}>
                                <FiMapPin size={24} />
                            </div>
                            <div className={styles.mapOverlayInfo}>
                                <span className={styles.mapCityText}>
                                    {currentCityOption?.cityData?.name || "Cairo"},{" "}
                                    {currentCityOption?.cityData?.arabicName || "مصر"}
                                </span>
                                <span className={styles.mapCoordsText}>
                                    Lat: {currentCityOption?.cityData?.lat?.toFixed(4)}, Lng:{" "}
                                    {currentCityOption?.cityData?.lng?.toFixed(4)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Physical Operating Branches Manager in Step 2 */}
                <div className={styles.branchesCard}>
                    <div className={styles.branchesHeaderRow}>
                        <div className={styles.branchesTitleGroup}>
                            <FiHome className={styles.branchesIcon} />
                            <div>
                                <h4 className={styles.branchesTitle}>
                                    Physical Operating Branches ({branches.length})
                                </h4>
                                <p className={styles.branchesSubtitle}>
                                    Add your secondary branches (e.g. Alexandria, Mansoura). All branches automatically share the same unified service menu!
                                </p>
                            </div>
                        </div>

                        <MainButton
                            variant="primary"
                            size="sm"
                            onClick={() => {
                                setEditingBranch(null);
                                setIsBranchModalOpen(true);
                            }}
                            leftIcon={<FiPlus />}
                        >
                            Add Another Branch
                        </MainButton>
                    </div>

                    {/* Unified Services Architecture Badge */}
                    <div className={styles.sharedServicesCallout}>
                        <FiCheckCircle size={16} className={styles.calloutCheck} />
                        <span>
                            <strong>Unified Service Architecture:</strong> Every branch you add (Cairo, Alexandria, etc.) will automatically offer the full catalog of services you define in Step 6.
                        </span>
                    </div>

                    {/* Branches List */}
                    <div className={styles.branchCardsList}>
                        {branches.map((branch) => (
                            <div key={branch.id} className={styles.branchItemCard}>
                                <div className={styles.branchItemLeft}>
                                    <div className={styles.branchPinBadge}>
                                        <FiMapPin size={16} />
                                    </div>
                                    <div className={styles.branchItemDetails}>
                                        <div className={styles.branchNameRow}>
                                            <span className={styles.branchName}>{branch.name}</span>
                                            {branch.is_main && (
                                                <span className={styles.mainBranchPill}>
                                                    <FiHome size={10} /> Primary HQ
                                                </span>
                                            )}
                                        </div>
                                        <span className={styles.branchAddressText}>
                                            {branch.address} • {branch.cityName} ({branch.arabicName})
                                        </span>
                                        {branch.phone && (
                                            <span className={styles.branchPhoneText}>
                                                Tel: {branch.phone}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.branchItemActions}>
                                    {!branch.is_main && (
                                        <>
                                            <MainButton
                                                variant="ghost"
                                                size="xs"
                                                onClick={() => {
                                                    setEditingBranch(branch);
                                                    setIsBranchModalOpen(true);
                                                }}
                                                title="Edit Branch"
                                                aria-label="Edit Branch"
                                                icon={<FiEdit2 size={14} />}
                                            />
                                            <MainButton
                                                variant="danger"
                                                size="xs"
                                                onClick={() => handleDeleteBranch(branch.id)}
                                                title="Remove Branch"
                                                aria-label="Remove Branch"
                                                icon={<FiTrash2 size={14} />}
                                            />
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Branch Modal */}
            <QuickBranchModal
                isOpen={isBranchModalOpen}
                onClose={() => {
                    setIsBranchModalOpen(false);
                    setEditingBranch(null);
                }}
                onSave={handleSaveSecondaryBranch}
                existingBranch={editingBranch}
            />
        </div>
    );
}

Step2BusinessInfo.propTypes = {
    errors: PropTypes.object,
    onFieldChange: PropTypes.func,
};
