// local
import PublicNavbar from "../../../components/public/navbar/PublicNavbar";
import PublicFooter from "../../../components/public/footer/PublicFooter";
import BusinessCard from "../../../components/public/cards/BusinessCard";
import FilterSidebar from "../../../components/public/filters/FilterSidebar";
import FilterDrawer from "../../../components/public/filters/FilterDrawer";
import NoviqSelect from "../../../components/ui/select/NoviqSelect";
import MainButton from "../../../components/ui/button/MainButton";
import { fetchCategories } from "../../../redux/slices/categorySlice";
import { fetchTenants } from "../../../redux/slices/tenantSlice";
import { fetchServices } from "../../../redux/slices/servicesSlice";
import {
    calculateHaversineDistanceKm,
    getCurrentBrowserPosition
} from "../../../utils/geoDistance";
import styles from "./CategoryPage.module.css";

// react
import { useState, useEffect, useRef, useMemo } from "react";

// react-router
import { useParams, Link, useNavigate } from "react-router";

// react-redux
import { useSelector, useDispatch } from "react-redux";

// react-icons
import {
    FiChevronRight,
    FiFilter,
    FiSearch,
    FiStar,
    FiCompass,
    FiGrid,
    FiPlusCircle,
    FiLoader,
} from "react-icons/fi";

// react-toastify
import { toast } from "react-toastify";

// gsap
import { gsap } from "gsap";

const SORT_OPTIONS = [
    { value: "rating", label: "Highest Rated" },
    { value: "distance", label: "Nearest Distance" }
];

const CategoryPage = () => {
    const { categorySlug } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const containerRef = useRef(null);

    // Redux Live Database State
    const categoriesState = useSelector((state) => state.categories);
    const tenantsState = useSelector((state) => state.tenants);

    useEffect(() => {
        dispatch(fetchCategories());
        dispatch(fetchTenants());
        dispatch(fetchServices());
    }, [dispatch]);

    // Active Category Object from Database
    const activeCategory = useMemo(() => {
        const found = (categoriesState.items || []).find(
            (c) => c.slug === categorySlug || c.name?.toLowerCase().replace(/\s+/g, "-") === categorySlug
        );
        if (found) {
            return {
                id: found.id,
                name: found.name,
                slug: found.slug || found.name.toLowerCase().replace(/\s+/g, "-"),
                description: found.description || `Accredited ${found.name} and specialized services across Egypt.`,
                icon: found.icon || "FiGrid",
                available_themes: found.available_themes || {}
            };
        }
        return {
            id: "cat-default",
            name: categorySlug ? categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1) : "Category",
            slug: categorySlug || "all",
            description: "Explore accredited providers and verified spaces.",
            icon: "FiGrid"
        };
    }, [categoriesState.items, categorySlug]);

    // Filter & Sort states
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCity, setSelectedCity] = useState("");
    const [minRating, setMinRating] = useState(0);
    const [selectedCapacity, setSelectedCapacity] = useState(0);
    const [openNowOnly, setOpenNowOnly] = useState(false);
    const [sortBy, setSortBy] = useState("rating");
    const [maxDistanceKm, setMaxDistanceKm] = useState(50);
    const [userCoordinates, setUserCoordinates] = useState(null);
    const [isNearMeActive, setIsNearMeActive] = useState(false);
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // GSAP Entrance
    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            tl.fromTo(
                `.${styles.breadcrumb}`,
                { y: -10, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.4 }
            )
            .fromTo(
                `.${styles.categoryHeader}`,
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5 },
                "-=0.2"
            );
        }, containerRef);

        return () => ctx.revert();
    }, [categorySlug]);

    // Handle Geolocation
    const handleNearMeTrigger = async () => {
        if (isNearMeActive) {
            setIsNearMeActive(false);
            setUserCoordinates(null);
            toast.info("GPS proximity filtering deactivated.");
            return;
        }

        try {
            const coords = await getCurrentBrowserPosition();
            setUserCoordinates(coords);
            setIsNearMeActive(true);
            setSortBy("distance");
            toast.success("Location acquired! Sorting by nearest first.");
        } catch (err) {
            toast.error(err.message || "Could not retrieve GPS coordinates.");
        }
    };

    const handleResetFilters = () => {
        setSearchQuery("");
        setSelectedCity("");
        setMinRating(0);
        setSelectedCapacity(0);
        setOpenNowOnly(false);
        setMaxDistanceKm(50);
        setIsNearMeActive(false);
        setUserCoordinates(null);
        setSortBy("rating");
        setCurrentPage(1);
        toast.info("Vertical filters reset.");
    };

    // Filter & Sort Pipeline on Live Database Data
    const filteredBusinesses = useMemo(() => {
        const rawTenants = tenantsState.items || [];
        const categoryTenants = rawTenants.filter(
            (t) => t.category_slug === activeCategory.slug || t.type_id === activeCategory.id || t.category_id === activeCategory.id || !categorySlug
        );

        return categoryTenants
            .map((b) => {
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
            })
            .filter((b) => {
                if (searchQuery.trim()) {
                    const q = searchQuery.toLowerCase();
                    const matchName = (b.name || "").toLowerCase().includes(q);
                    const matchDesc = (b.description || "").toLowerCase().includes(q);
                    const matchCity = (b.city || "").toLowerCase().includes(q);
                    const matchAddress = (b.address || "").toLowerCase().includes(q);
                    if (!matchName && !matchDesc && !matchCity && !matchAddress) return false;
                }

                if (selectedCity && !selectedCity.startsWith("All")) {
                    const bCity = (b.city || b.address || "").toLowerCase();
                    if (!bCity.includes(selectedCity.toLowerCase())) return false;
                }

                if (minRating > 0 && (b.rating || 0) < minRating) {
                    return false;
                }

                if (selectedCapacity > 0 && b.capacity && b.capacity < selectedCapacity) {
                    return false;
                }

                if (isNearMeActive && b.calculatedDistance !== null) {
                    if (b.calculatedDistance > maxDistanceKm) return false;
                }

                return true;
            })
            .sort((a, b) => {
                if (sortBy === "distance" && a.calculatedDistance !== null && b.calculatedDistance !== null) {
                    return a.calculatedDistance - b.calculatedDistance;
                }
                return (b.rating || 0) - (a.rating || 0);
            });
    }, [tenantsState.items, activeCategory, categorySlug, searchQuery, selectedCity, minRating, selectedCapacity, isNearMeActive, maxDistanceKm, userCoordinates, sortBy]);

    // Pagination
    const totalPages = Math.ceil(filteredBusinesses.length / itemsPerPage) || 1;
    const paginatedBusinesses = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredBusinesses.slice(start, start + itemsPerPage);
    }, [filteredBusinesses, currentPage]);

    const currentSortOption = SORT_OPTIONS.find((opt) => opt.value === sortBy) || SORT_OPTIONS[0];
    const isLoading = tenantsState.status === "loading";

    return (
        <div className={styles.categoryPageWrapper} ref={containerRef}>
            <PublicNavbar />

            {/* Breadcrumb & Vertical Header */}
            <section className={styles.heroSection}>
                <div className={styles.heroInner}>
                    <nav className={styles.breadcrumb}>
                        <Link to="/">Home</Link>
                        <FiChevronRight className={styles.breadIcon} />
                        <Link to="/explore">Explore</Link>
                        <FiChevronRight className={styles.breadIcon} />
                        <span className={styles.currentBread}>{activeCategory.name}</span>
                    </nav>

                    <div className={styles.categoryHeader}>
                        <h1 className={styles.categoryTitle}>{activeCategory.name}</h1>
                        <p className={styles.categorySub}>{activeCategory.description}</p>

                        <div className={styles.quickStatsRow}>
                            <span className={styles.statPill}>
                                <FiGrid className={styles.statIcon} />
                                <span>{filteredBusinesses.length} {filteredBusinesses.length === 1 ? "Space" : "Spaces"} in Egypt</span>
                            </span>
                            <span className={styles.statPill}>
                                <FiStar className={styles.statIcon} />
                                <span>Verified NOVIQ Providers</span>
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content Area */}
            <section className={styles.mainSection}>
                <div className={styles.mainInner}>
                    <div className={styles.layoutGrid}>
                        {/* Desktop Filter Sidebar */}
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
                        <div className={styles.resultsArea}>
                            {/* Sort & Search Topbar */}
                            <div className={styles.sortBar}>
                                <div className={styles.searchInline}>
                                    <FiSearch className={styles.searchIcon} />
                                    <input
                                        type="text"
                                        placeholder={`Search in ${activeCategory.name}...`}
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className={styles.inlineSearchInput}
                                    />
                                </div>

                                <div className={styles.sortAndFilterControls}>
                                    <div className={styles.sortGroup}>
                                        <span className={styles.sortLabel}>Sort by:</span>
                                        <div style={{ width: "170px" }}>
                                            <NoviqSelect
                                                options={SORT_OPTIONS}
                                                value={currentSortOption}
                                                onChange={(selected) => setSortBy(selected ? selected.value : "rating")}
                                                isSearchable={false}
                                            />
                                        </div>
                                    </div>

                                    {/* Mobile Drawer Trigger */}
                                    <button
                                        type="button"
                                        onClick={() => setMobileFilterOpen(true)}
                                        className={styles.mobileFilterBtn}
                                    >
                                        <FiFilter />
                                        <span>Filters</span>
                                    </button>
                                </div>
                            </div>

                            {/* Cards Grid or Live Empty State */}
                            {isLoading ? (
                                <div className={styles.loadingBox}>
                                    <FiLoader className={styles.spinIcon} />
                                    <span>Querying verified {activeCategory.name}...</span>
                                </div>
                            ) : paginatedBusinesses.length > 0 ? (
                                <div className={styles.businessGrid}>
                                    {paginatedBusinesses.map((b) => (
                                        <div key={b.id} className={styles.businessGridItem}>
                                            <BusinessCard
                                                business={b}
                                                calculatedDistance={b.calculatedDistance}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className={styles.emptyState}>
                                    <div className={styles.emptyIconCircle}>
                                        <FiCompass />
                                    </div>
                                    <h3 className={styles.emptyTitle}>No {activeCategory.name} Listed Yet</h3>
                                    <p className={styles.emptyText}>
                                        Be the first business owner to publish your {activeCategory.name} on NOVIQ and accept instant appointments.
                                    </p>
                                    <MainButton
                                        variant="primary"
                                        size="md"
                                        onClick={() => navigate("/register")}
                                        icon={<FiPlusCircle />}
                                    >
                                        List Your Space — Free
                                    </MainButton>
                                </div>
                            )}

                            {/* Numbered Pagination */}
                            {totalPages > 1 && (
                                <div className={styles.pagination}>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                        <button
                                            key={pageNum}
                                            type="button"
                                            className={`${styles.pageBtn} ${
                                                currentPage === pageNum ? styles.activePageBtn : ""
                                            }`}
                                            onClick={() => {
                                                setCurrentPage(pageNum);
                                                window.scrollTo({ top: 300, behavior: "smooth" });
                                            }}
                                        >
                                            {pageNum}
                                        </button>
                                    ))}
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

export default CategoryPage;
