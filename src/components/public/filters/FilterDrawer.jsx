// local
import FilterSidebar from "./FilterSidebar";
import MainButton from "../../ui/button/MainButton";
import styles from "./FilterDrawer.module.css";

// react-icons
import { FiX, FiCheck } from "react-icons/fi";

const FilterDrawer = ({
    isOpen = false,
    onClose,
    filterProps,
    totalResultsCount = 0
}) => {
    if (!isOpen) return null;

    return (
        <div className={styles.drawerOverlay} onClick={onClose}>
            <div className={styles.drawerContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.drawerHeader}>
                    <h3 className={styles.drawerTitle}>Refine Results ({totalResultsCount})</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className={styles.closeBtn}
                        aria-label="Close filters"
                    >
                        <FiX />
                    </button>
                </div>

                <div className={styles.drawerBody}>
                    <FilterSidebar {...filterProps} />
                </div>

                <div className={styles.drawerFooter}>
                    <MainButton
                        variant="primary"
                        fullWidth
                        onClick={onClose}
                        icon={<FiCheck />}
                    >
                        Show {totalResultsCount} Results
                    </MainButton>
                </div>
            </div>
        </div>
    );
};

export default FilterDrawer;
