// local
import styles from "./CategoryCard.module.css";

// react-router
import { Link } from "react-router";

// react-icons
import {
    FiHeart,
    FiScissors,
    FiHome,
    FiActivity,
    FiLayers,
    FiUsers,
    FiArrowRight,
    FiCheckCircle,
    FiGrid
} from "react-icons/fi";

// Pure icon renderer function (declared outside render to prevent component recreation)
const renderCategoryIcon = (iconName, slug) => {
    if (iconName === "stethoscope" || slug === "clinics") {
        return <FiHeart className={styles.categoryIcon} />;
    }
    if (iconName === "scissors" || slug === "salons") {
        return <FiScissors className={styles.categoryIcon} />;
    }
    if (iconName === "bed" || slug === "hotels") {
        return <FiHome className={styles.categoryIcon} />;
    }
    if (iconName === "dumbbell" || slug === "fitness") {
        return <FiActivity className={styles.categoryIcon} />;
    }
    if (slug === "coworking") {
        return <FiLayers className={styles.categoryIcon} />;
    }
    if (slug === "consulting") {
        return <FiUsers className={styles.categoryIcon} />;
    }
    return <FiGrid className={styles.categoryIcon} />;
};

// Architecture Engine resolver based on 01-project-guide & 02-database-schema
const resolveCategoryStrategy = (slug) => {
    switch (slug) {
        case "clinics":
            return {
                engine: "Sequential Slot Engine",
                desc: "Medical practices, laser aesthetics & specialized restorative care.",
                feature: "Strict sequential buffers & specialist assignment"
            };
        case "salons":
            return {
                engine: "Multi-Staff Orchestration",
                desc: "Haute coiffure, master colorists & scalp therapy rituals.",
                feature: "Concurrent chair & staff service pipelines"
            };
        case "hotels":
            return {
                engine: "Date-Range Inventory Pools",
                desc: "Boutique stays, lagoon suites & thermal wellness retreats.",
                feature: "Nightly availability pools & automatic allocations"
            };
        case "fitness":
            return {
                engine: "Group Capacity & Headcount",
                desc: "Performance training labs, cryo chambers & private reformer.",
                feature: "Live waitlists & session headcount caps"
            };
        default:
            return {
                engine: "Universal Scheduling Engine",
                desc: "Verified appointment scheduling and resource booking.",
                feature: "Instant verification pass & digital check-in"
            };
    }
};

const CategoryCard = ({ category }) => {
    const strategy = resolveCategoryStrategy(category.slug);
    const color = category.theme_color || category.icon_color || "#0E7C86";

    return (
        <Link
            to={`/explore/${category.slug}`}
            className={styles.categoryCard}
            style={{ "--accent-color": color }}
        >
            <div className={styles.topHeader}>
                <div className={styles.iconFrame}>
                    {renderCategoryIcon(category.icon, category.slug)}
                </div>
                <span className={styles.engineBadge}>
                    {strategy.engine}
                </span>
            </div>

            <div className={styles.contentBody}>
                <h3 className={styles.categoryTitle}>{category.name}</h3>
                <p className={styles.categoryDescription}>
                    {category.description || strategy.desc}
                </p>

                <div className={styles.featureItem}>
                    <FiCheckCircle className={styles.checkIcon} />
                    <span>{strategy.feature}</span>
                </div>
            </div>

            <div className={styles.cardFooter}>
                <span className={styles.exploreActionText}>
                    Explore Spaces
                </span>
                <div className={styles.arrowCircle}>
                    <FiArrowRight />
                </div>
            </div>
        </Link>
    );
};

export default CategoryCard;
