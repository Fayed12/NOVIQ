// local
import PublicNavbar from "../../../components/public/navbar/PublicNavbar";
import PublicFooter from "../../../components/public/footer/PublicFooter";
import CategoryCard from "../../../components/public/cards/CategoryCard";
import BusinessCard from "../../../components/public/cards/BusinessCard";
import FilterSidebar from "../../../components/public/filters/FilterSidebar";
import FilterDrawer from "../../../components/public/filters/FilterDrawer";
import NoviqSelect from "../../../components/ui/select/NoviqSelect";
import MainButton from "../../../components/ui/button/MainButton";
import { fetchCategories } from "../../../redux/slices/categorySlice";
import { fetchTenants } from "../../../redux/slices/tenantSlice";
import {
    POPULAR_CITIES,
    calculateHaversineDistanceKm,
    getCurrentBrowserPosition
} from "../../../utils/geoDistance";
import styles from "./ExplorePage.module.css";

// react
import { useState, useEffect, useRef, useMemo } from "react";

// react-router
import { useNavigate } from "react-router";

// react-redux
import { useSelector, useDispatch } from "react-redux";

// react-icons
import {
    FiSearch,
    FiMapPin,
    FiNavigation,
    FiGrid,
    FiX,
    FiFilter,
    FiCompass,
    FiStar,
    FiPlusCircle,
    FiLoader,
    FiUsers
} from "react-icons/fi";

// react-toastify
import { toast } from "react-toastify";

// gsap
import { gsap } from "gsap";

const ExplorePage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const containerRef = useRef(null);

    // Redux State - Live Database
    const categoriesState = useSelector((state) => state.categories);
    const tenantsState = useSelector((state) => state.tenants);

    // Fetch Live Data from Supabase
    useEffect(() => {
        dispatch(fetchCategories());
        dispatch(fetchTenants());
    }, [dispatch]);

    // Live Database Categories
    const categories = useMemo(() => {
        if (!categoriesState.items || categoriesState.items.length === 0) {
            return [];
        }
        const rawTenants = tenantsState.items || [];
        return categoriesState.items.map((cat, idx) => {
            const defaultColors = ["#0E7C86", "#B45309", "#7C3AED", "#DC2626", "#1E3A8A", "#16A34A"];
            const color = cat.available_themes?.primary || cat.theme_color || cat.icon_color || defaultColors[idx % defaultColors.length];
            const tenantCount = rawTenants.filter(
                (t) => t.category_id === cat.id || t.category_slug === cat.slug || t.type_id === cat.id
            ).length;
            return {
                id: cat.id,
                name: cat.name,
                slug: cat.slug || cat.name.toLowerCase().replace(/\s+/g, "-"),
                description: cat.description,
                icon: cat.icon,
                theme_color: color,
                business_count: tenantCount
            };
        });
    }, [categoriesState.items, tenantsState.items]);

    // Search and Filter States
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCity, setSelectedCity] = useState("");
    const [minRating, setMinRating] = useState(0);
    const [selectedCapacity, setSelectedCapacity] = useState(0);
    const [openNowOnly, setOpenNowOnly] = useState(false);
    const [maxDistanceKm, setMaxDistanceKm] = useState(50);
    const [userCoordinates, setUserCoordinates] = useState(null);
    const [isNearMeActive, setIsNearMeActive] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

    // City options for react-select
    const cityOptions = useMemo(() => {
        return POPULAR_CITIES.map((c) => ({
            value: c.name.startsWith("All") ? "" : c.name,
            label: c.name
        }));
    }, []);

    const currentCityOption = cityOptions.find((opt) => opt.value === selectedCity) || cityOptions[0];

    // GSAP Opening Entrance Animation
    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            tl.fromTo(
                `.${styles.heroBadge}`,
                { y: -15, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5 }
            )
            .fromTo(
                `.${styles.heroTitle}`,
                { y: 25, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6 },
                "-=0.3"
            )
            .fromTo(
                `.${styles.searchCard}`,
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5 },
                "-=0.2"
            );
        }, containerRef);

        return () => ctx.revert();
    }, []);

    // Handle Geolocation "Near Me" GPS Trigger
    const handleNearMeTrigger = async () => {
        if (isNearMeActive) {
            setIsNearMeActive(false);
            setUserCoordinates(null);
            toast.info("GPS proximity filtering deactivated.");
            return;
        }

        try {
            setIsLocating(true);
            const coords = await getCurrentBrowserPosition();
            setUserCoordinates(coords);
            setIsNearMeActive(true);
            toast.success("Location acquired! Displaying nearest spaces.");
        } catch (err) {
            toast.error(err.message || "Failed to retrieve your GPS location.");
        } finally {
            setIsLocating(false);
        }
    };

    // Reset All Filters
    const handleResetFilters = () => {
        setSearchQuery("");
        setSelectedCity("");
        setMinRating(0);
        setSelectedCapacity(0);
        setOpenNowOnly(false);
        setMaxDistanceKm(50);
        setIsNearMeActive(false);
        setUserCoordinates(null);
        toast.info("All discovery filters have been reset.");
    };

    // Filter & Calculate Distances for Live Tenants
    const filteredBusinesses = useMemo(() => {
        const rawTenants = tenantsState.items || [];
        return rawTenants.map((b) => {
            let distance = null;
            if (userCoordinates && b.latitude && b.longitude) {
                distance = calculateHaversineDistanceKm(
                    userCoordinates.latitude,
                    userCoordinates.longitude,
                    b.latitude,
                    b.longitude
                );
            }
            return { ...b, calculatedDistance: distance };
        }).filter((b) => {
            // Text search
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchName = (b.name || "").toLowerCase().includes(q);
                const matchCat = (b.category_name || "").toLowerCase().includes(q);
                const matchDesc = (b.description || "").toLowerCase().includes(q);
                const matchCity = (b.city || "").toLowerCase().includes(q);
                const matchAddress = (b.address || "").toLowerCase().includes(q);
                if (!matchName && !matchCat && !matchDesc && !matchCity && !matchAddress) return false;
            }

            // City filter
            if (selectedCity && !selectedCity.startsWith("All")) {
                const bCity = (b.city || b.address || "").toLowerCase();
                if (!bCity.includes(selectedCity.toLowerCase())) return false;
            }

            // Rating score filter
            if (minRating > 0 && (b.rating || 0) < minRating) {
                return false;
            }

            // Capacity / Headcount filter
            if (selectedCapacity > 0 && b.capacity && b.capacity < selectedCapacity) {
                return false;
            }

            // Proximity filter
            if (isNearMeActive && b.calculatedDistance !== null) {
                if (b.calculatedDistance > maxDistanceKm) return false;
            }

            return true;
        }).sort((a, b) => {
            if (isNearMeActive && a.calculatedDistance !== null && b.calculatedDistance !== null) {
                return a.calculatedDistance - b.calculatedDistance;
            }
            return (b.rating || 0) - (a.rating || 0);
        });
    }, [tenantsState.items, searchQuery, selectedCity, minRating, selectedCapacity, isNearMeActive, maxDistanceKm, userCoordinates]);

    const isSearching = !!searchQuery || !!selectedCity || minRating > 0 || selectedCapacity > 0 || isNearMeActive;
    const isLoadingCategories = categoriesState.status === "loading";
    const isLoadingTenants = tenantsState.status === "loading";

    return (
        <div className={styles.explorePageWrapper} ref={containerRef}>
            <PublicNavbar />

            {/* Hero Search Banner */}
            <section className={styles.searchHero}>
                <div className={styles.heroInner}>
                    <div className={styles.heroBadge}>
                        <FiCompass className={styles.badgeIcon} />
                        <span>NOVIQ Egypt Marketplace Hub</span>
                    </div>

                    <h1 className={styles.heroTitle}>
                        Find & Reserve Top-Rated Spaces Across Egypt
                    </h1>

                    <p className={styles.heroSubtitle}>
                        Discover accredited specialist clinics, master salons, boutique hotels, and premium wellness spaces with instant real-time confirmation.
                    </p>

                    {/* Unified 3-Part Search Card */}
                    <div className={styles.searchCard}>
                        {/* 1. Keyword Search Input */}
                        <div className={styles.inputGroup}>
                            <FiSearch className={styles.inputIcon} />
                            <input
                                type="text"
                                placeholder="Search by name, specialist, or service..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={styles.textInput}
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery("")}
                                    className={styles.clearBtn}
                                    aria-label="Clear search"
                                >
                                    <FiX />
                                </button>
                            )}
                        </div>

                        {/* 2. City / District Select */}
                        <div className={styles.locationGroup}>
                            <NoviqSelect
                                options={cityOptions}
                                value={currentCityOption}
                                onChange={(selected) => setSelectedCity(selected ? selected.value : "")}
                                placeholder="All Egypt Cities..."
                                prefixIcon={<FiMapPin />}
                                isSearchable={true}
                            />
                        </div>

                        {/* 3. GPS "Near Me" Action Button */}
                        <button
                            type="button"
                            onClick={handleNearMeTrigger}
                            disabled={isLocating}
                            className={`${styles.nearMeAction} ${isNearMeActive ? styles.nearMeActive : ""}`}
                            title="Find businesses nearest to your current GPS coordinates"
                        >
                            <FiNavigation className={`${styles.navIcon} ${isLocating ? styles.spinIcon : ""}`} />
                            <span>
                                {isLocating
                                    ? "Locating..."
                                    : isNearMeActive
                                    ? "GPS Active"
                                    : "Near Me (GPS)"}
                            </span>
                        </button>
                    </div>

                    {/* Active Filter Indicators */}
                    {isSearching && (
                        <div className={styles.activeFiltersRow}>
                            <span className={styles.filterSummary}>
                                Active filters:
                            </span>
                            {searchQuery && (
                                <span className={styles.filterPill}>
                                    "{searchQuery}"
                                    <button onClick={() => setSearchQuery("")}><FiX /></button>
                                </span>
                            )}
                            {selectedCity && (
                                <span className={styles.filterPill}>
                                    {selectedCity}
                                    <button onClick={() => setSelectedCity("")}><FiX /></button>
                                </span>
                            )}
                            {minRating > 0 && (
                                <span className={styles.filterPill}>
                                    <FiStar style={{ color: "#F59E0B" }} /> {minRating}+ Score
                                    <button onClick={() => setMinRating(0)}><FiX /></button>
                                </span>
                            )}
                            {selectedCapacity > 0 && (
                                <span className={styles.filterPill}>
                                    <FiUsers /> {selectedCapacity}+ Guests
                                    <button onClick={() => setSelectedCapacity(0)}><FiX /></button>
                                </span>
                            )}
                            {isNearMeActive && (
                                <span className={styles.filterPill}>
                                    GPS Distance (&le; {maxDistanceKm}km)
                                    <button onClick={() => setIsNearMeActive(false)}><FiX /></button>
                                </span>
                            )}
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className={styles.clearAllBtn}
                            >
                                Clear All
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* Browse by Industry Vertical Section (Live Database Categories) */}
            <section className={styles.categorySection}>
                <div className={styles.sectionInner}>
                    <div className={styles.sectionHeader}>
                        <div>
                            <div className={styles.sectionPill}>
                                <FiGrid className={styles.pillIcon} />
                                <span>Industry Verticals</span>
                            </div>
                            <h2 className={styles.sectionTitle}>Browse by Industry Vertical</h2>
                        </div>
                        <p className={styles.sectionSub}>
                            Adaptive scheduling engines built for specialized business domains.
                        </p>
                    </div>

                    {isLoadingCategories ? (
                        <div className={styles.loadingBox}>
                            <FiLoader className={styles.spinIcon} />
                            <span>Loading industry categories from database...</span>
                        </div>
                    ) : categories.length > 0 ? (
                        <div className={styles.categoryGrid}>
                            {categories.map((category) => (
                                <div key={category.id} className={styles.categoryGridItem}>
                                    <CategoryCard category={category} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.emptyCategoriesBox}>
                            <p>No categories configured in database yet.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Featured & Top-Rated Spaces Section */}
            <section className={styles.resultsSection}>
                <div className={styles.sectionInner}>
                    <div className={styles.resultsLayout}>
                        {/* Desktop Sticky Filter Sidebar */}
                        <div className={styles.desktopSidebar}>
                            <FilterSidebar
                                selectedCity={selectedCity}
                                onCityChange={setSelectedCity}
                                minRating={minRating}
                                onRatingChange={setMinRating}
                                selectedCapacity={selectedCapacity}
                                onCapacityChange={setSelectedCapacity}
                                openNowOnly={openNowOnly}
                                onOpenNowToggle={setOpenNowOnly}
                                maxDistanceKm={maxDistanceKm}
                                onDistanceChange={setMaxDistanceKm}
                                isNearMeActive={isNearMeActive}
                                onNearMeClick={handleNearMeTrigger}
                                onResetFilters={handleResetFilters}
                            />
                        </div>

                        {/* Results Column */}
                        <div className={styles.resultsContent}>
                            <div className={styles.resultsHeader}>
                                <div>
                                    <h3 className={styles.resultsCountTitle}>
                                        {isSearching ? "Filtered Search Results" : "Featured & Top-Rated Spaces"}
                                    </h3>
                                    <span className={styles.resultsSubtitle}>
                                        {filteredBusinesses.length} {filteredBusinesses.length === 1 ? "space" : "spaces"} available
                                    </span>
                                </div>

                                {/* Mobile Filter Trigger */}
                                <button
                                    type="button"
                                    onClick={() => setMobileFilterOpen(true)}
                                    className={styles.mobileFilterBtn}
                                >
                                    <FiFilter />
                                    <span>Filter ({filteredBusinesses.length})</span>
                                </button>
                            </div>

                            {isLoadingTenants ? (
                                <div className={styles.loadingBox}>
                                    <FiLoader className={styles.spinIcon} />
                                    <span>Loading verified businesses...</span>
                                </div>
                            ) : filteredBusinesses.length > 0 ? (
                                <div className={styles.businessGrid}>
                                    {filteredBusinesses.map((b) => (
                                        <div key={b.id} className={styles.businessGridItem}>
                                            <BusinessCard
                                                business={b}
                                                calculatedDistance={b.calculatedDistance}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                /* Clean High-Aesthetic Empty State for 0 Tenants */
                                <div className={styles.emptyTenantsCard}>
                                    <div className={styles.emptyIconCircle}>
                                        <FiCompass className={styles.emptyBigIcon} />
                                    </div>
                                    <h4 className={styles.emptyCardTitle}>
                                        {isSearching ? "No Spaces Match Your Search" : "No Verified Spaces Listed Yet"}
                                    </h4>
                                    <p className={styles.emptyCardText}>
                                        {isSearching
                                            ? "Try clearing filters or broadening your search terms to discover providers."
                                            : "Be the first business owner to launch and showcase your space on the NOVIQ marketplace."}
                                    </p>
                                    <div className={styles.emptyCardActions}>
                                        {isSearching ? (
                                            <MainButton
                                                variant="secondary"
                                                size="md"
                                                onClick={handleResetFilters}
                                                icon={<FiX />}
                                            >
                                                Reset Filters
                                            </MainButton>
                                        ) : (
                                            <MainButton
                                                variant="primary"
                                                size="md"
                                                onClick={() => navigate("/register")}
                                                icon={<FiPlusCircle />}
                                            >
                                                List Your Business on NOVIQ
                                            </MainButton>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Mobile Filter Drawer */}
            <FilterDrawer
                isOpen={mobileFilterOpen}
                onClose={() => setMobileFilterOpen(false)}
                totalResultsCount={filteredBusinesses.length}
                filterProps={{
                    selectedCity,
                    onCityChange: setSelectedCity,
                    minRating,
                    onRatingChange: setMinRating,
                    selectedCapacity,
                    onCapacityChange: setSelectedCapacity,
                    openNowOnly,
                    onOpenNowToggle: setOpenNowOnly,
                    maxDistanceKm,
                    onDistanceChange: setMaxDistanceKm,
                    isNearMeActive,
                    onNearMeClick: handleNearMeTrigger,
                    onResetFilters: handleResetFilters
                }}
            />

            <PublicFooter />
        </div>
    );
};

export default ExplorePage;
