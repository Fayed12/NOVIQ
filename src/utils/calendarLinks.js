/**
 * NOVIQ Calendar Integration Utility
 * Generates direct web calendar URLs (Google, Outlook) and creates downloadable .ics files.
 */

// Formats a date into UTC ISO format (YYYYMMDDTHHmmssZ) required by iCal/Google
const formatToUtcIso = (dateInput) => {
    if (!dateInput) return "";
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().replace(/-|:|\.\d+/g, "");
};

/**
 * Generates a Google Calendar event URL
 */
export const getGoogleCalendarUrl = ({
    title = "NOVIQ Booking Appointment",
    description = "",
    location = "",
    startTime,
    endTime,
}) => {
    const startIso = formatToUtcIso(startTime);
    // If end time is not provided, default to 1 hour after start
    const endIso = endTime ? formatToUtcIso(endTime) : formatToUtcIso(new Date(new Date(startTime).getTime() + 60 * 60 * 1000));

    const params = new URLSearchParams({
        action: "TEMPLATE",
        text: title,
        details: description,
        location: location || "",
        dates: `${startIso}/${endIso}`,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

/**
 * Generates an Outlook / Office 365 Web event URL
 */
export const getOutlookCalendarUrl = ({
    title = "NOVIQ Booking Appointment",
    description = "",
    location = "",
    startTime,
    endTime,
}) => {
    const startIso = new Date(startTime).toISOString();
    const endIso = endTime ? new Date(endTime).toISOString() : new Date(new Date(startTime).getTime() + 60 * 60 * 1000).toISOString();

    const params = new URLSearchParams({
        path: "/calendar/action/compose",
        rru: "addevent",
        subject: title,
        body: description,
        location: location || "",
        startdt: startIso,
        enddt: endIso,
    });

    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
};

/**
 * Generates and triggers download of an Apple Calendar / Universal .ics file
 */
export const downloadIcsCalendarFile = ({
    title = "NOVIQ Booking Appointment",
    description = "",
    location = "",
    startTime,
    endTime,
    bookingRef = "NOVIQ-BOOKING",
}) => {
    const startIso = formatToUtcIso(startTime);
    const endIso = endTime ? formatToUtcIso(endTime) : formatToUtcIso(new Date(new Date(startTime).getTime() + 60 * 60 * 1000));
    const nowIso = formatToUtcIso(new Date());

    const cleanDescription = (description || "").replace(/\n/g, "\\n");

    const icsLines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//NOVIQ Digital Booking Infrastructure//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        `UID:${bookingRef}-${Date.now()}@noviq.app`,
        `DTSTAMP:${nowIso}`,
        `DTSTART:${startIso}`,
        `DTEND:${endIso}`,
        `SUMMARY:${title}`,
        `DESCRIPTION:${cleanDescription}`,
        `LOCATION:${location || ""}`,
        "STATUS:CONFIRMED",
        "SEQUENCE:0",
        "END:VEVENT",
        "END:VCALENDAR",
    ];

    const icsContent = icsLines.join("\r\n");
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.href = url;
    downloadAnchor.setAttribute("download", `booking-${bookingRef}.ics`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    URL.revokeObjectURL(url);
};
