// local
import styles from "./BookingCalendar.module.css";

// react
import { useState } from "react";

// date-fns
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameDay,
    isBefore,
    startOfToday,
    getDay
} from "date-fns";

// react-icons
import { FiChevronLeft, FiChevronRight, FiCalendar } from "react-icons/fi";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const BookingCalendar = ({
    selectedDate = new Date(),
    onDateSelect,
    accentColor = "#0E7C86"
}) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const today = startOfToday();

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startDayIndex = getDay(monthStart);

    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    return (
        <div className={styles.calendarCard} style={{ "--accent-color": accentColor }}>
            {/* Header: Month & Prev/Next Controls */}
            <div className={styles.calendarHeader}>
                <div className={styles.monthTitleGroup}>
                    <FiCalendar className={styles.calendarIcon} />
                    <h3 className={styles.monthTitle}>{format(currentMonth, "MMMM yyyy")}</h3>
                </div>
                <div className={styles.navControls}>
                    <button
                        type="button"
                        onClick={prevMonth}
                        disabled={isBefore(monthStart, startOfMonth(today))}
                        className={styles.monthNavBtn}
                        aria-label="Previous month"
                    >
                        <FiChevronLeft />
                    </button>
                    <button
                        type="button"
                        onClick={nextMonth}
                        className={styles.monthNavBtn}
                        aria-label="Next month"
                    >
                        <FiChevronRight />
                    </button>
                </div>
            </div>

            {/* Weekday Header */}
            <div className={styles.weekdaysGrid}>
                {DAYS_OF_WEEK.map((d) => (
                    <div key={d} className={styles.weekdayLabel}>
                        {d}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className={styles.daysGrid}>
                {/* Empty filler cells for start day offset */}
                {Array.from({ length: startDayIndex }).map((_, i) => (
                    <div key={`empty-${i}`} className={styles.emptyDayCell} />
                ))}

                {/* Days of Month */}
                {daysInMonth.map((day) => {
                    const isPast = isBefore(day, today);
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isCurrentDay = isSameDay(day, today);

                    return (
                        <button
                            key={day.toISOString()}
                            type="button"
                            disabled={isPast}
                            onClick={() => onDateSelect && onDateSelect(day)}
                            className={`${styles.dayCell} ${isSelected ? styles.selectedDay : ""} ${
                                isCurrentDay ? styles.todayCell : ""
                            } ${isPast ? styles.disabledDay : ""}`}
                        >
                            <span className={styles.dayNumber}>{format(day, "d")}</span>
                            {isCurrentDay && !isSelected && <div className={styles.todayDot} />}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BookingCalendar;
