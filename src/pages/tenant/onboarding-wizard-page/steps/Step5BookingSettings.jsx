import { useMemo } from "react";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import { updateFormData } from "../../../../redux/slices/onboardingSlice";
import MainSelect from "../../../../components/ui/select/MainSelect";
import MainButton from "../../../../components/ui/button/MainButton";
import {
    FiClock,
    FiCalendar,
    FiShield,
    FiCopy,
    FiCheckCircle,
} from "react-icons/fi";
import { toast } from "react-toastify";
import styles from "./Step5BookingSettings.module.css";

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
        label: "Flexible Policy — 100% Refund (Cancel up to 24h prior)",
        rule: { refundable: true, free_cancellation_hours: 24, fee_percentage: 0 },
    },
    {
        value: "moderate",
        label: "Moderate Policy — 100% Refund (Cancel up to 48h prior)",
        rule: { refundable: true, free_cancellation_hours: 48, fee_percentage: 0 },
    },
    {
        value: "strict",
        label: "Strict Policy — 50% Refund (Cancel up to 72h prior)",
        rule: { refundable: true, free_cancellation_hours: 72, fee_percentage: 50 },
    },
    {
        value: "non_refundable",
        label: "Non-Refundable Policy — No refunds upon cancellation",
        rule: { refundable: false, free_cancellation_hours: 0, fee_percentage: 100 },
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
                        leftIcon={<FiCopy />}
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
                                    <button
                                        type="button"
                                        className={`${styles.closedToggleBtn} ${
                                            day.is_closed ? styles.btnActiveClosed : ""
                                        }`}
                                        onClick={() => handleToggleClosed(day.day_of_week)}
                                    >
                                        {day.is_closed ? "Mark Open" : "Mark Closed"}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Cancellation Policy Section */}
            <div className={styles.policyCard}>
                <div className={styles.policyHeader}>
                    <FiShield className={styles.policyIcon} />
                    <div>
                        <h3 className={styles.cardTitle}>Customer Cancellation Policy</h3>
                        <span className={styles.cardSubtitle}>
                            Rules governing client refunds when cancelling upcoming bookings.
                        </span>
                    </div>
                </div>

                <MainSelect
                    label="Select Cancellation Policy Preset"
                    options={CANCELLATION_PRESETS}
                    value={currentPolicyOption}
                    onChange={handlePolicyChange}
                    icon={FiShield}
                />
            </div>
        </div>
    );
}
