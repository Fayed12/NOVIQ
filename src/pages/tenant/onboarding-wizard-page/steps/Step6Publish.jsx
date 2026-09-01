// local
import QuickServiceModal from "../components/QuickServiceModal";
import MainButton from "../../../../components/ui/button/MainButton";
import {
    addStarterServiceThunk,
    saveDraftStepThunk,
    updateFormData,
} from "../../../../redux/slices/onboardingSlice";
import styles from "./Step6Publish.module.css";

// prop-types
import PropTypes from "prop-types";

// react
import { useState } from "react";

// react-redux
import { useSelector, useDispatch } from "react-redux";

// react-toastify
import { toast } from "react-toastify";

// react icons
import {
    FiCheckCircle,
    FiAlertCircle,
    FiPlus,
    FiCheckSquare,
    FiMapPin,
    FiUsers,
    FiEdit2,
} from "react-icons/fi";

export default function Step6Publish() {
    const dispatch = useDispatch();
    const { formData, draftTenant } = useSelector((state) => state.onboarding);
    const { user } = useSelector((state) => state.auth || {});

    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [isAddingService, setIsAddingService] = useState(false);

    // Readiness items
    const hasCategory = !!formData.categoryId;
    const hasInfo = !!(formData.name && formData.slug);
    const hasTheme = !!formData.themeColor;
    const hasHours = !!(formData.workingHours && formData.workingHours.length > 0);
    const hasServices = (formData.services || []).length > 0;

    const isReadyToPublish =
        hasCategory && hasInfo && hasTheme && hasHours && hasServices;

    // Handle Quick Service Save (create or update)
    const handleSaveService = async (serviceData) => {
        const trimmedName = (serviceData.name || "").trim();
        const existingServices = formData.services || [];

        // Check duplicate name
        const isDupe = existingServices.some(
            (s) => (!editingService || s.id !== editingService.id) &&
                   (s.name || "").trim().toLowerCase() === trimmedName.toLowerCase()
        );

        if (isDupe) {
            toast.error(`A service with the name "${trimmedName}" already exists.`);
            return;
        }

        setIsAddingService(true);
        try {
            let activeTenantId = draftTenant?.id;

            // 1. If draftTenant is not created in Supabase yet, create it on-the-fly!
            if (!activeTenantId && user?.id) {
                const savedDraft = await dispatch(
                    saveDraftStepThunk({
                        userId: user.id,
                        stepData: {
                            category_id: formData.categoryId,
                            name: formData.name || "My Business",
                            slug: formData.slug || "my-business",
                            description: formData.description,
                            phone: formData.phone,
                            email: formData.email,
                            address: formData.address,
                            location: formData.location || null,
                            icon: formData.icon || "FiBriefcase",
                            icon_color: formData.iconColor || formData.themeColor || "#0E7C86",
                            logo_url: formData.logoUrl || null,
                            cover_url: formData.coverUrl || null,
                            theme_color: formData.themeColor,
                            theme_config: formData.themeConfig,
                            config: { modules: formData.modules },
                        },
                    })
                ).unwrap();
                activeTenantId = savedDraft?.id;
            }

            // 2. If we have a tenant ID in Supabase, persist the service to Supabase
            if (activeTenantId) {
                await dispatch(
                    addStarterServiceThunk({
                        tenantId: activeTenantId,
                        serviceData: {
                            ...serviceData,
                            name: trimmedName,
                        },
                    })
                ).unwrap();
            } else {
                // 3. Otherwise save to Redux form state locally
                const newService = {
                    id:
                        serviceData.id ||
                        (typeof crypto !== "undefined" && crypto.randomUUID
                            ? crypto.randomUUID()
                            : `srv-${Math.random().toString(36).slice(2, 9)}`),
                    name: trimmedName,
                    description: serviceData.description || null,
                    duration_minutes: serviceData.durationMinutes || 30,
                    price: serviceData.price || 0,
                    currency: serviceData.currency || "EGP",
                    cancellation_policy_id: serviceData.cancellation_policy_id || null,
                    icon: serviceData.icon || null,
                    icon_color: serviceData.icon_color || null,
                    theme_color: serviceData.theme_color || null,
                    image_url: serviceData.image_url || null,
                };
                const updatedList = editingService
                    ? existingServices.map((s) =>
                          s.id === editingService.id ? { ...s, ...newService } : s
                      )
                    : [...existingServices, newService];

                dispatch(updateFormData({ services: updatedList }));
            }

            setIsServiceModalOpen(false);
            setEditingService(null);
            toast.success(`Service "${trimmedName}" saved successfully!`);
        } catch (err) {
            console.error("Save service error:", err);
            const msg = typeof err === "string" ? err : err?.message || "Failed to save service.";
            toast.error(msg);
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
                    Review your core business setup before turning your space into a live, published business on NOVIQ.
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
                        {isReadyToPublish ? "100% Ready to Publish" : "Service Required"}
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

                    {/* Item 4: Initial Service Requirement */}
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
                                Initial Bookable Service
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
                                    At least 1 bookable service is required to allow initial customer checkouts.
                                </span>
                            )}
                        </div>
                        {hasServices ? (
                            <MainButton
                                variant="ghost"
                                size="xs"
                                onClick={() => {
                                    setEditingService(formData.services[0]);
                                    setIsServiceModalOpen(true);
                                }}
                                icon={<FiEdit2 size={13} />}
                            >
                                Edit Service
                            </MainButton>
                        ) : (
                            <MainButton
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                    setEditingService(null);
                                    setIsServiceModalOpen(true);
                                }}
                                leftIcon={<FiPlus />}
                            >
                                Add Service
                            </MainButton>
                        )}
                    </div>
                </div>
            </div>

            {/* Team Members & Resources Notice Card */}
            <div className={styles.teamDashboardCard}>
                <div className={styles.teamCardIconWrap}>
                    <FiUsers size={22} />
                </div>
                <div className={styles.teamCardContent}>
                    <div className={styles.teamCardHeaderRow}>
                        <h4 className={styles.teamCardTitle}>
                            Team Members & Service Assignment in Dashboard
                        </h4>
                        <span className={styles.teamCardBadge}>Next Step After Launch</span>
                    </div>
                    <p className={styles.teamCardDesc}>
                        Once published, you will be redirected to your <strong>Tenant Dashboard</strong> where you can add specialists, doctors, and staff members, and link each practitioner specifically to the services they provide.
                    </p>
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

            {/* Quick Service Modal */}
            <QuickServiceModal
                isOpen={isServiceModalOpen}
                onClose={() => {
                    setIsServiceModalOpen(false);
                    setEditingService(null);
                }}
                onSave={handleSaveService}
                isLoading={isAddingService}
                existingService={editingService}
                servicesList={formData.services || []}
                cancellationPolicyId={formData.cancellationPolicyId || formData.cancellationPolicy?.id || null}
                defaultIcon={formData.icon || "FiBriefcase"}
                defaultIconColor={formData.iconColor || formData.themeColor || "#0E7C86"}
                tenantId={draftTenant?.id}
            />
        </div>
    );
}

Step6Publish.propTypes = {
    onPublish: PropTypes.func,
    isPublishing: PropTypes.bool,
};
