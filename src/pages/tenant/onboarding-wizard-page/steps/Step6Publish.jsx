import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import {
    addStarterResourceThunk,
    addStarterServiceThunk,
} from "../../../../redux/slices/onboardingSlice";
import QuickResourceModal from "../components/QuickResourceModal";
import QuickServiceModal from "../components/QuickServiceModal";
import MainButton from "../../../../components/ui/button/MainButton";
import {
    FiCheckCircle,
    FiAlertCircle,
    FiPlus,
    FiUserCheck,
    FiCheckSquare,
    FiClock,
    FiDollarSign,
    FiMapPin,
    FiLayers,
    FiExternalLink,
} from "react-icons/fi";
import { toast } from "react-toastify";
import gsap from "gsap";
import styles from "./Step6Publish.module.css";

export default function Step6Publish({ onPublish, isPublishing }) {
    const dispatch = useDispatch();
    const { formData, draftTenant } = useSelector((state) => state.onboarding);

    const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [isAddingResource, setIsAddingResource] = useState(false);
    const [isAddingService, setIsAddingService] = useState(false);

    const celebrationRef = useRef(null);

    // Readiness items
    const hasCategory = !!formData.categoryId;
    const hasInfo = !!(formData.name && formData.slug);
    const hasTheme = !!formData.themeColor;
    const hasHours = !!(formData.workingHours && formData.workingHours.length > 0);
    const hasResources = (formData.resources || []).length > 0;
    const hasServices = (formData.services || []).length > 0;

    const isReadyToPublish =
        hasCategory && hasInfo && hasTheme && hasHours && hasResources && hasServices;

    // Handle Quick Resource Save
    const handleSaveResource = async (resourceData) => {
        if (!draftTenant?.id) {
            toast.error("Please complete previous steps first");
            return;
        }

        setIsAddingResource(true);
        try {
            await dispatch(
                addStarterResourceThunk({
                    tenantId: draftTenant.id,
                    resourceData,
                })
            ).unwrap();

            setIsResourceModalOpen(false);
            toast.success(`Bookable resource "${resourceData.name}" added successfully!`);
        } catch (err) {
            toast.error(err || "Failed to add resource");
        } finally {
            setIsAddingResource(false);
        }
    };

    // Handle Quick Service Save
    const handleSaveService = async (serviceData) => {
        if (!draftTenant?.id) {
            toast.error("Please complete previous steps first");
            return;
        }

        setIsAddingService(true);
        try {
            await dispatch(
                addStarterServiceThunk({
                    tenantId: draftTenant.id,
                    serviceData,
                })
            ).unwrap();

            setIsServiceModalOpen(false);
            toast.success(`Service "${serviceData.name}" added successfully!`);
        } catch (err) {
            toast.error(err || "Failed to add service");
        } finally {
            setIsAddingService(false);
        }
    };

    return (
        <div className={styles.stepContainer}>
            {/* Heading */}
            <div className={styles.headingGroup}>
                <span className={styles.stepKicker}>Step 6 — Final Review & Launch</span>
                <h2 className={styles.stepTitle}>Ready to launch your business?</h2>
                <p className={styles.stepSubtitle}>
                    Ensure your tenant checklist is fulfilled before turning your draft space into a live, published business on NOVIQ.
                </p>
            </div>

            {/* Checklist Overview Card */}
            <div className={styles.checklistCard}>
                <div className={styles.checklistHeader}>
                    <h3 className={styles.cardTitle}>Launch Readiness Checklist</h3>
                    <span
                        className={`${styles.statusBadge} ${
                            isReadyToPublish ? styles.readyBadge : styles.pendingBadge
                        }`}
                    >
                        {isReadyToPublish ? "100% Ready to Publish" : "Action Items Required"}
                    </span>
                </div>

                <div className={styles.itemsList}>
                    {/* Item 1: Category & Identity */}
                    <div className={styles.checkItem}>
                        <div className={styles.itemIconCol}>
                            {hasCategory && hasInfo ? (
                                <FiCheckCircle className={styles.doneIcon} />
                            ) : (
                                <FiAlertCircle className={styles.warningIcon} />
                            )}
                        </div>
                        <div className={styles.itemContent}>
                            <span className={styles.itemTitle}>
                                Business Identity & Egyptian Location
                            </span>
                            <span className={styles.itemMeta}>
                                {formData.name || "Unnamed"} •{" "}
                                {formData.selectedCategory?.name || "Category Selected"} •{" "}
                                {formData.location?.cityName || "Location set"}
                            </span>
                        </div>
                    </div>

                    {/* Item 2: Theme & Preset */}
                    <div className={styles.checkItem}>
                        <div className={styles.itemIconCol}>
                            {hasTheme ? (
                                <FiCheckCircle className={styles.doneIcon} />
                            ) : (
                                <FiAlertCircle className={styles.warningIcon} />
                            )}
                        </div>
                        <div className={styles.itemContent}>
                            <span className={styles.itemTitle}>Visual Brand & Accent Theme</span>
                            <span className={styles.itemMeta}>
                                {formData.themePreset || "Default Accent"} (
                                <span
                                    className={styles.colorDot}
                                    style={{ backgroundColor: formData.themeColor }}
                                />
                                {formData.themeColor})
                            </span>
                        </div>
                    </div>

                    {/* Item 3: Weekly Schedule */}
                    <div className={styles.checkItem}>
                        <div className={styles.itemIconCol}>
                            {hasHours ? (
                                <FiCheckCircle className={styles.doneIcon} />
                            ) : (
                                <FiAlertCircle className={styles.warningIcon} />
                            )}
                        </div>
                        <div className={styles.itemContent}>
                            <span className={styles.itemTitle}>Operational Working Hours</span>
                            <span className={styles.itemMeta}>
                                7-day schedule configured • Standard cancellation policy active
                            </span>
                        </div>
                    </div>

                    {/* Item 3.5: Operating Branches (if multi-branch active) */}
                    {formData.modules?.multi_branch && (
                        <div className={styles.checkItem}>
                            <div className={styles.itemIconCol}>
                                <FiCheckCircle className={styles.doneIcon} />
                            </div>
                            <div className={styles.itemContent}>
                                <span className={styles.itemTitle}>
                                    Physical Operating Branches ({(formData.branches || []).length})
                                </span>
                                <div className={styles.entityBadges}>
                                    {(formData.branches || []).map((b, i) => (
                                        <span key={i} className={styles.entityPill}>
                                            <FiMapPin size={11} /> {b.name} ({b.cityName || "Main HQ"})
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Item 4: Bookable Resource Requirement */}
                    <div className={styles.checkItem}>
                        <div className={styles.itemIconCol}>
                            {hasResources ? (
                                <FiCheckCircle className={styles.doneIcon} />
                            ) : (
                                <FiAlertCircle className={styles.warningIcon} />
                            )}
                        </div>
                        <div className={styles.itemContent}>
                            <span className={styles.itemTitle}>
                                Bookable Resource (Doctor / Stylist / Room / Station)
                            </span>
                            {hasResources ? (
                                <div className={styles.entityBadges}>
                                    {formData.resources.map((r, i) => (
                                        <span key={i} className={styles.entityPill}>
                                            <FiUserCheck size={11} /> {r.name}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <span className={styles.actionRequiredText}>
                                    At least 1 bookable resource is mandatory to accept bookings.
                                </span>
                            )}
                        </div>
                        {!hasResources && (
                            <MainButton
                                variant="secondary"
                                size="sm"
                                onClick={() => setIsResourceModalOpen(true)}
                                leftIcon={<FiPlus />}
                            >
                                Add Resource
                            </MainButton>
                        )}
                    </div>

                    {/* Item 5: Service Requirement */}
                    <div className={styles.checkItem}>
                        <div className={styles.itemIconCol}>
                            {hasServices ? (
                                <FiCheckCircle className={styles.doneIcon} />
                            ) : (
                                <FiAlertCircle className={styles.warningIcon} />
                            )}
                        </div>
                        <div className={styles.itemContent}>
                            <span className={styles.itemTitle}>
                                Bookable Service (Consultation / Treatment / Session)
                            </span>
                            {hasServices ? (
                                <div className={styles.entityBadges}>
                                    {formData.services.map((s, i) => (
                                        <span key={i} className={styles.entityPill}>
                                            <FiCheckSquare size={11} /> {s.name} ({s.price} {s.currency || "EGP"})
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <span className={styles.actionRequiredText}>
                                    At least 1 service is mandatory to allow customer checkouts.
                                </span>
                            )}
                        </div>
                        {!hasServices && (
                            <MainButton
                                variant="secondary"
                                size="sm"
                                onClick={() => setIsServiceModalOpen(true)}
                                leftIcon={<FiPlus />}
                            >
                                Add Service
                            </MainButton>
                        )}
                    </div>
                </div>
            </div>

            {/* Launch Banner Preview */}
            <div className={styles.summaryBanner}>
                <div className={styles.bannerInfo}>
                    <h4 className={styles.bannerTitle}>
                        Ready to go live at <code>noviq.io/{formData.slug || "your-slug"}</code>
                    </h4>
                    <p className={styles.bannerSubtitle}>
                        Upon publishing, your public storefront will be active on the NOVIQ marketplace and you will gain full access to your business management console.
                    </p>
                </div>
            </div>

            {/* Modals */}
            <QuickResourceModal
                isOpen={isResourceModalOpen}
                onClose={() => setIsResourceModalOpen(false)}
                onSave={handleSaveResource}
                isLoading={isAddingResource}
                branches={formData.branches || []}
            />

            <QuickServiceModal
                isOpen={isServiceModalOpen}
                onClose={() => setIsServiceModalOpen(false)}
                onSave={handleSaveService}
                isLoading={isAddingService}
            />
        </div>
    );
}

Step6Publish.propTypes = {
    onPublish: PropTypes.func,
    isPublishing: PropTypes.bool,
};
