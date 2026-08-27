// local
import styles from "./BookingTimeSlots.module.css";

// react-icons
import { FiClock, FiSun, FiMoon } from "react-icons/fi";

const DEFAULT_SLOTS = [
    { time: "09:00 AM", period: "morning" },
    { time: "09:45 AM", period: "morning" },
    { time: "10:30 AM", period: "morning" },
    { time: "11:15 AM", period: "morning" },
    { time: "01:00 PM", period: "afternoon" },
    { time: "01:45 PM", period: "afternoon" },
    { time: "02:30 PM", period: "afternoon" },
    { time: "03:15 PM", period: "afternoon" },
    { time: "04:00 PM", period: "afternoon" },
    { time: "05:00 PM", period: "evening" },
    { time: "05:45 PM", period: "evening" },
    { time: "06:30 PM", period: "evening" },
];

const BookingTimeSlots = ({
    selectedSlot = "",
    onSlotSelect,
    unavailableSlots = ["10:30 AM", "02:30 PM"],
    accentColor = "#0E7C86"
}) => {
    return (
        <div className={styles.slotsCard} style={{ "--accent-color": accentColor }}>
            <div className={styles.slotsHeader}>
                <div className={styles.headerTitleGroup}>
                    <FiClock className={styles.headerIcon} />
                    <h3 className={styles.headerTitle}>Available Time Slots</h3>
                </div>
                <span className={styles.timezoneBadge}>Local Time (UTC+03:00)</span>
            </div>

            {/* Morning Section */}
            <div className={styles.periodGroup}>
                <div className={styles.periodLabel}>
                    <FiSun className={styles.periodIcon} />
                    <span>Morning</span>
                </div>
                <div className={styles.slotsGrid}>
                    {DEFAULT_SLOTS.filter((s) => s.period === "morning").map((slot) => {
                        const isTaken = unavailableSlots.includes(slot.time);
                        const isSelected = selectedSlot === slot.time;

                        return (
                            <button
                                key={slot.time}
                                type="button"
                                disabled={isTaken}
                                onClick={() => onSlotSelect && onSlotSelect(slot.time)}
                                className={`${styles.slotBtn} ${isSelected ? styles.selectedSlot : ""} ${
                                    isTaken ? styles.takenSlot : ""
                                }`}
                            >
                                <span className={styles.slotTime}>{slot.time}</span>
                                {isTaken && <span className={styles.takenLabel}>Booked</span>}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Afternoon & Evening Section */}
            <div className={styles.periodGroup}>
                <div className={styles.periodLabel}>
                    <FiMoon className={styles.periodIcon} />
                    <span>Afternoon & Evening</span>
                </div>
                <div className={styles.slotsGrid}>
                    {DEFAULT_SLOTS.filter((s) => s.period !== "morning").map((slot) => {
                        const isTaken = unavailableSlots.includes(slot.time);
                        const isSelected = selectedSlot === slot.time;

                        return (
                            <button
                                key={slot.time}
                                type="button"
                                disabled={isTaken}
                                onClick={() => onSlotSelect && onSlotSelect(slot.time)}
                                className={`${styles.slotBtn} ${isSelected ? styles.selectedSlot : ""} ${
                                    isTaken ? styles.takenSlot : ""
                                }`}
                            >
                                <span className={styles.slotTime}>{slot.time}</span>
                                {isTaken && <span className={styles.takenLabel}>Booked</span>}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default BookingTimeSlots;
