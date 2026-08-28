import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import { updateFormData } from "../../../../redux/slices/onboardingSlice";
import QuickBranchModal from "../components/QuickBranchModal";
import MainButton from "../../../../components/ui/button/MainButton";
import {
    FiCalendar,
    FiStar,
    FiImage,
    FiMapPin,
    FiUsers,
    FiLock,
    FiPlus,
    FiTrash2,
    FiEdit2,
    FiCheck,
    FiHome,
} from "react-icons/fi";
import { toast } from "react-toastify";
import styles from "./Step4Modules.module.css";

const MODULES_CONFIG = [
    {
        key: "bookings",
        title: "Online Bookings & Smart Scheduling",
        desc: "Core automated appointment booking, real-time availability slots, and calendar sync.",
        icon: FiCalendar,
        locked: true,
    },
    {
        key: "reviews",
        title: "Verified Customer Reviews & Ratings",
        desc: "Collect client ratings, showcase testimonials on your public storefront, and reply to feedback.",
        icon: FiStar,
        locked: false,
    },
    {
        key: "gallery",
        title: "Media Gallery & Storefront Showcase",
        desc: "Upload photos of your clinic facilities, salon styling cuts, or hotel suites to attract clients.",
        icon: FiImage,
        locked: false,
    },
    {
        key: "multi_branch",
        title: "Multi-Branch & Physical Locations",
        desc: "Enable multi-location routing to manage distinct operating branches with individual coordinates.",
        icon: FiMapPin,
        locked: false,
    },
    {
        key: "staff_management",
        title: "Staff & Team Member Invitations",
        desc: "Invite doctors, stylists, and assistants with role-based permissions and schedule assignments.",
        icon: FiUsers,
        locked: false,
    },
];

export default function Step4Modules({ onToggleModule }) {
    const dispatch = useDispatch();
    const { formData } = useSelector((state) => state.onboarding);
    const modules = formData.modules || {};
    const branches = formData.branches || [];

    const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState(null);

    // If multi_branch is enabled and branches is empty, seed Main/HQ branch from Step 2 data
    useEffect(() => {
        if (modules.multi_branch && branches.length === 0) {
            const defaultHq = {
                id: `branch-main-${Date.now()}`,
                name: `${formData.name || "Main"} HQ Branch`,
                cityId: formData.location?.cityId || "cairo",
                cityName: formData.location?.cityName || "Cairo",
                arabicName: formData.location?.arabicName || "القاهرة",
                region: formData.location?.region || "Greater Cairo",
                lat: formData.location?.lat || 30.0444,
                lng: formData.location?.lng || 31.2357,
                address: formData.address || "Main Operating Address, Egypt",
                phone: formData.phone || "",
                is_main: true,
            };
            dispatch(updateFormData({ branches: [defaultHq] }));
        }
    }, [modules.multi_branch, branches.length, formData, dispatch]);

    const handleToggle = (key, currentVal, locked) => {
        if (locked) return;
        const updated = {
            ...modules,
            [key]: !currentVal,
        };
        dispatch(updateFormData({ modules: updated }));
        if (onToggleModule) onToggleModule(key, !currentVal);
    };

    const handleSaveBranch = (branchData) => {
        let updatedBranches = [];
        if (editingBranch) {
            updatedBranches = branches.map((b) =>
                b.id === editingBranch.id ? { ...b, ...branchData } : b
            );
            toast.success(`Branch "${branchData.name}" updated!`);
        } else {
            updatedBranches = [...branches, branchData];
            toast.success(`New branch "${branchData.name}" added!`);
        }
        dispatch(updateFormData({ branches: updatedBranches }));
        setIsBranchModalOpen(false);
        setEditingBranch(null);
    };

    const handleDeleteBranch = (branchId, e) => {
        e.stopPropagation();
        const branchToDelete = branches.find((b) => b.id === branchId);
        if (branchToDelete?.is_main) {
            toast.warn("The primary HQ branch cannot be deleted. You can edit its details instead.");
            return;
        }
        const updatedBranches = branches.filter((b) => b.id !== branchId);
        dispatch(updateFormData({ branches: updatedBranches }));
        toast.info("Branch removed");
    };

    const handleOpenEdit = (branch, e) => {
        e.stopPropagation();
        setEditingBranch(branch);
        setIsBranchModalOpen(true);
    };

    return (
        <div className={styles.stepContainer}>
            {/* Heading */}
            <div className={styles.headingGroup}>
                <span className={styles.stepKicker}>Step 4 — Business Modules</span>
                <h2 className={styles.stepTitle}>What capabilities do you need?</h2>
                <p className={styles.stepSubtitle}>
                    Enable or disable platform features tailored to your operations. You can fine-tune module settings and add operating branches anytime.
                </p>
            </div>

            {/* Modules List */}
            <div className={styles.modulesList}>
                {MODULES_CONFIG.map((mod) => {
                    const isEnabled = mod.locked ? true : !!modules[mod.key];

                    return (
                        <div key={mod.key} className={styles.moduleWrapper}>
                            <div
                                className={`${styles.moduleCard} ${
                                    isEnabled ? styles.enabledCard : ""
                                }`}
                                onClick={() => handleToggle(mod.key, isEnabled, mod.locked)}
                                role="button"
                                tabIndex={mod.locked ? -1 : 0}
                            >
                                {/* Left: Icon & Text */}
                                <div className={styles.cardLeft}>
                                    <div
                                        className={`${styles.iconCircle} ${
                                            isEnabled ? styles.activeIconCircle : ""
                                        }`}
                                    >
                                        <mod.icon size={22} />
                                    </div>
                                    <div className={styles.moduleText}>
                                        <div className={styles.titleRow}>
                                            <h3 className={styles.moduleTitle}>{mod.title}</h3>
                                            {mod.locked && (
                                                <span className={styles.lockedBadge}>
                                                    <FiLock size={10} /> Core Engine
                                                </span>
                                            )}
                                        </div>
                                        <p className={styles.moduleDesc}>{mod.desc}</p>
                                    </div>
                                </div>

                                {/* Right: Switch */}
                                <div className={styles.cardRight}>
                                    <div
                                        className={`${styles.toggleSwitch} ${
                                            isEnabled ? styles.switchOn : styles.switchOff
                                        } ${mod.locked ? styles.switchLocked : ""}`}
                                    >
                                        <div className={styles.toggleHandle} />
                                    </div>
                                </div>
                            </div>

                            {/* If Multi-Branch is toggled ON, render Branch Management panel */}
                            {mod.key === "multi_branch" && isEnabled && (
                                <div className={styles.branchesSubPanel}>
                                    <div className={styles.branchesHeader}>
                                        <div>
                                            <h4 className={styles.branchesTitle}>
                                                Physical Operating Branches ({branches.length})
                                            </h4>
                                            <p className={styles.branchesSubtitle}>
                                                Clients can filter and book services at their preferred branch location.
                                            </p>
                                        </div>
                                        <MainButton
                                            variant="primary"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingBranch(null);
                                                setIsBranchModalOpen(true);
                                            }}
                                            leftIcon={<FiPlus />}
                                        >
                                            Add Branch
                                        </MainButton>
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
                                                            <span className={styles.branchName}>
                                                                {branch.name}
                                                            </span>
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
                                                    <button
                                                        type="button"
                                                        className={styles.branchActionBtn}
                                                        onClick={(e) => handleOpenEdit(branch, e)}
                                                        title="Edit Branch"
                                                    >
                                                        <FiEdit2 size={14} />
                                                    </button>
                                                    {!branch.is_main && (
                                                        <button
                                                            type="button"
                                                            className={`${styles.branchActionBtn} ${styles.deleteActionBtn}`}
                                                            onClick={(e) => handleDeleteBranch(branch.id, e)}
                                                            title="Remove Branch"
                                                        >
                                                            <FiTrash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Quick Branch Modal */}
            <QuickBranchModal
                isOpen={isBranchModalOpen}
                onClose={() => {
                    setIsBranchModalOpen(false);
                    setEditingBranch(null);
                }}
                onSave={handleSaveBranch}
                existingBranch={editingBranch}
            />
        </div>
    );
}

Step4Modules.propTypes = {
    onToggleModule: PropTypes.func,
};
