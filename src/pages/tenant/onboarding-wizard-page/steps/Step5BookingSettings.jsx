// local
import MainSelect from "../../../../components/ui/select/MainSelect";
import MainButton from "../../../../components/ui/button/MainButton";
import { updateFormData } from "../../../../redux/slices/onboardingSlice";
import styles from "./Step5BookingSettings.module.css";

// react
import { useMemo } from "react";

// react-redux
import { useSelector, useDispatch } from "react-redux";

// react-toastify
import { toast } from "react-toastify";

// react icons
import {
    FiCalendar,
    FiShield,
    FiCopy,
    FiCheckCircle,
    FiClock,
    FiPercent,
    FiInfo,
} from "react-icons/fi";

// Generate 30-minute interval time options from 00:00 to 23:30
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
    const hours = Math.floor(i / 2);
    const mins = i % 2 === 0 ? "00" : "30";
    const formattedHour = String(hours).padStart(2, "0");
    const timeVal = `${formattedHour}:${mins}`;
    const period = hours >= 12 ? "PM" : "AM";
    const displayHour = hours % 12 === 0 ? 12 : hours % 12;
    const label = `${displayHour}:${mins} ${period} (${timeVal})`;
    return { value: timeVal, label };
});

const CANCELLATION_PRESETS = [
    {
        value: "flexible",
        title: "Flexible Policy",
        subtitle: "100% Refund • Free cancellation up to 24h prior",
        label: "Flexible Policy — 100% Refund (Cancel up to 24h prior)",
        rule: { refundable: true, free_cancellation_hours: 24, fee_percentage: 0 },
        tag: "Recommended",
        color: "#10b981",
    },
    {
        value: "moderate",
        title: "Moderate Policy",
        subtitle: "100% Refund • Free cancellation up to 48h prior",
        label: "Moderate Policy — 100% Refund (Cancel up to 48h prior)",
        rule: { refundable: true, free_cancellation_hours: 48, fee_percentage: 0 },
        tag: "Balanced",
        color: "#0e7c86",
    },
    {
        value: "strict",
        title: "Strict Policy",
        subtitle: "50% Refund • Cancel up to 72h prior (50% fee)",
        label: "Strict Policy — 50% Refund (Cancel up to 72h prior)",
        rule: { refundable: true, free_cancellation_hours: 72, fee_percentage: 50 },
        tag: "High Demand",
        color: "#f59e0b",
    },
    {
        value: "non_refundable",
        title: "Non-Refundable Policy",
        subtitle: "No refunds upon cancellation (100% fee)",
        label: "Non-Refundable Policy — No refunds upon cancellation",
        rule: { refundable: false, free_cancellation_hours: 0, fee_percentage: 100 },
        tag: "Special Events",
        color: "#ef4444",
    },
];

export default function Step5BookingSettings() {
    const dispatch = useDispatch();
    const { formData } = useSelector((state) => state.onboarding);
    const workingHours = formData.workingHours || [];
    const policy = formData.cancellationPolicy || CANCELLATION_PRESETS[0];

    const currentPolicyOption = useMemo(() => {
        return (
            CANCELLATION_PRESETS.find((p) => p.value === policy.value) ||
            CANCELLATION_PRESETS[0]
        );
    }, [policy]);

    const handleHourChange = (dayOfWeek, field, value) => {
        const updated = workingHours.map((row) => {
            if (row.day_of_week === dayOfWeek) {
                return { ...row, [field]: value };
            }
            return row;
        });
        dispatch(updateFormData({ workingHours: updated }));
    };

    const handleToggleClosed = (dayOfWeek) => {
        const updated = workingHours.map((row) => {
            if (row.day_of_week === dayOfWeek) {
                return { ...row, is_closed: !row.is_closed };
            }
            return row;
        });
        dispatch(updateFormData({ workingHours: updated }));
    };

    // Quick Action: Copy Monday hours to Tuesday through Friday
    const handleApplyMondayToWeekdays = () => {
        const monday = workingHours.find((r) => r.day_of_week === 1);
        if (!monday) return;

        const updated = workingHours.map((row) => {
            if (row.day_of_week >= 2 && row.day_of_week <= 5) {
                return {
                    ...row,
                    open_time: monday.open_time,
                    close_time: monday.close_time,
                    is_closed: monday.is_closed,
                };
            }
            return row;
        });

        dispatch(updateFormData({ workingHours: updated }));
        toast.success("Applied Monday hours to all weekdays (Tue-Fri)!", {
            position: "top-center",
        });
    };

    const handlePolicyChange = (option) => {
        dispatch(
            updateFormData({
                cancellationPolicy: {
                    name: option.label,
                    value: option.value,
                    rule: option.rule,
                },
            })
        );
    };

    // Render custom option format inside the dropdown list
    const formatPolicyOption = (option) => (
        <div className={styles.optionLayout}>
            <div className={styles.optionContent}>
                <div className={styles.optionHeader}>
                    <span className={styles.optionTitle}>{option.title}</span>
                    {option.tag && (
                        <span
                            className={styles.optionTag}
                            style={{
                                color: option.color,
                                backgroundColor: `${option.color}18`,
                                borderColor: `${option.color}40`,
                            }}
                        >
                            {option.tag}
                        </span>
                    )}
                </div>
                <span className={styles.optionSubtitle}>{option.subtitle}</span>
            </div>
        </div>
    );

    return (
        <div className={styles.stepContainer}>
            {/* Heading */}
            <div className={styles.headingGroup}>
                <span className={styles.stepKicker}>Step 5 — Operating Schedule</span>
                <h2 className={styles.stepTitle}>Set your default hours & policies</h2>
                <p className={styles.stepSubtitle}>
                    Configure your weekly business working hours and choose your initial customer cancellation policy.
                </p>
            </div>

            {/* Weekly Hours Table Card */}
            <div className={styles.scheduleCard}>
                <div className={styles.cardHeader}>
                    <div className={styles.cardTitleGroup}>
                        <FiCalendar className={styles.headerIcon} />
                        <div>
                            <h3 className={styles.cardTitle}>Weekly Working Hours</h3>
                            <span className={styles.cardSubtitle}>
                                Customers can only book appointment slots during open hours.
                            </span>
                        </div>
                    </div>

                    <MainButton
                        variant="secondary"
                        size="sm"
                        onClick={handleApplyMondayToWeekdays}
                        icon={<FiCopy />}
                    >
                        Copy Mon to All Weekdays
                    </MainButton>
                </div>

                {/* 7 Days List */}
                <div className={styles.hoursList}>
                    {workingHours.map((day) => {
                        const openOption =
                            TIME_OPTIONS.find((t) => t.value === day.open_time) ||
                            TIME_OPTIONS[18]; // 09:00 default
                        const closeOption =
                            TIME_OPTIONS.find((t) => t.value === day.close_time) ||
                            TIME_OPTIONS[36]; // 18:00 default

                        return (
                            <div
                                key={day.day_of_week}
                                className={`${styles.hourRow} ${
                                    day.is_closed ? styles.closedRow : ""
                                }`}
                            >
                                <div className={styles.dayLabelCol}>
                                    <span className={styles.dayName}>{day.day_name}</span>
                                    {day.is_closed ? (
                                        <span className={styles.closedPill}>Closed</span>
                                    ) : (
                                        <span className={styles.openPill}>Open</span>
                                    )}
                                </div>

                                {!day.is_closed ? (
                                    <div className={styles.timePickersCol}>
                                        <div className={styles.selectWrapperMini}>
                                            <MainSelect
                                                options={TIME_OPTIONS}
                                                value={openOption}
                                                onChange={(opt) =>
                                                    handleHourChange(day.day_of_week, "open_time", opt.value)
                                                }
                                                isSearchable
                                            />
                                        </div>
                                        <span className={styles.timeSeparator}>to</span>
                                        <div className={styles.selectWrapperMini}>
                                            <MainSelect
                                                options={TIME_OPTIONS}
                                                value={closeOption}
                                                onChange={(opt) =>
                                                    handleHourChange(day.day_of_week, "close_time", opt.value)
                                                }
                                                isSearchable
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className={styles.dayOffNotice}>
                                        <span>No appointments scheduled on this day</span>
                                    </div>
                                )}

                                <div className={styles.toggleCol}>
                                    <MainButton
                                        variant={day.is_closed ? "outline" : "ghost"}
                                        size="xs"
                                        onClick={() => handleToggleClosed(day.day_of_week)}
                                    >
                                        {day.is_closed ? "Mark Open" : "Mark Closed"}
                                    </MainButton>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Cancellation Policy Section */}
            <div className={styles.policyCard}>
                <div className={styles.policyHeader}>
                    <div className={styles.policyIconCircle}>
                        <FiShield size={20} />
                    </div>
                    <div>
                        <h3 className={styles.cardTitle}>Customer Cancellation Policy</h3>
                        <span className={styles.cardSubtitle}>
                            Rules governing client refunds when cancelling upcoming bookings.
                        </span>
                    </div>
                </div>

                <div className={styles.policySelectWrapper}>
                    <MainSelect
                        label="Cancellation Policy Preset"
                        options={CANCELLATION_PRESETS}
                        value={currentPolicyOption}
                        onChange={handlePolicyChange}
                        icon={FiShield}
                        menuPlacement="top"
                        menuPosition="fixed"
                        menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                        formatOptionLabel={formatPolicyOption}
                    />
                </div>

                {/* Policy Highlights Summary Card */}
                <div className={styles.policySummaryBox}>
                    <div className={styles.summaryItem}>
                        <div className={styles.summaryIconWrap}>
                            <FiClock size={16} />
                        </div>
                        <div className={styles.summaryTextGroup}>
                            <span className={styles.summaryLabel}>Notice Window</span>
                            <strong className={styles.summaryValue}>
                                {currentPolicyOption.rule.free_cancellation_hours > 0
                                    ? `${currentPolicyOption.rule.free_cancellation_hours} Hours Prior`
                                    : "No Free Cancellation"}
                            </strong>
                        </div>
                    </div>

                    <div className={styles.summaryItem}>
                        <div className={styles.summaryIconWrap}>
                            <FiCheckCircle size={16} />
                        </div>
                        <div className={styles.summaryTextGroup}>
                            <span className={styles.summaryLabel}>Refund Eligibility</span>
                            <strong className={styles.summaryValue}>
                                {currentPolicyOption.rule.refundable
                                    ? currentPolicyOption.rule.fee_percentage === 0
                                        ? "100% Full Refund"
                                        : "50% Partial Refund"
                                    : "Non-Refundable"}
                            </strong>
                        </div>
                    </div>

                    <div className={styles.summaryItem}>
                        <div className={styles.summaryIconWrap}>
                            <FiPercent size={16} />
                        </div>
                        <div className={styles.summaryTextGroup}>
                            <span className={styles.summaryLabel}>Cancellation Fee</span>
                            <strong className={styles.summaryValue}>
                                {currentPolicyOption.rule.fee_percentage}% Retention
                            </strong>
                        </div>
                    </div>
                </div>

                <div className={styles.policyNotice}>
                    <FiInfo size={14} className={styles.noticeIcon} />
                    <span>
                        You can customize custom buffer intervals and cancellation exemptions in your Tenant Dashboard after publishing.
                    </span>
                </div>
            </div>
        </div>
    );
}
