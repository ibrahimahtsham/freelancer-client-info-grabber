/**
 * Format epoch seconds to Pakistan time
 */
export function formatEpochToPakistanTime(epochSeconds) {
  if (!epochSeconds) return "";
  const date = new Date(epochSeconds * 1000);
  return date.toLocaleString("en-PK", { timeZone: "Asia/Karachi" });
}

/**
 * Format a date object or timestamp into a user-friendly string
 * @param {Date|number} date - Date object or timestamp
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}) {
  try {
    if (!date) return "N/A";

    if (typeof date === "number") {
      date = new Date(date);
    }

    if (typeof date === "string") {
      date = new Date(date);
    }

    if (!(date instanceof Date) || isNaN(date.getTime())) {
      console.warn("Invalid date:", date);
      return "Invalid date";
    }

    const defaultOptions = {
      dateStyle: "medium",
      timeStyle: "short",
    };

    return new Intl.DateTimeFormat("en-AU", {
      ...defaultOptions,
      ...options,
    }).format(date);
  } catch (error) {
    console.error("Date formatting error:", error);
    return "Error";
  }
}

/**
 * Format hour to 12-hour format with AM/PM
 */
export function formatHour(hour) {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  return date.toLocaleString("en-PK", {
    hour: "numeric",
    hour12: true,
    timeZone: "Asia/Karachi",
  });
}

/**
 * Format date and time according to Pakistan timezone
 */
export function formatDateTime(dateInput) {
  if (!dateInput) return "N/A";

  let date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;

  if (typeof dateInput === "number" && dateInput < 10000000000) {
    date = new Date(dateInput * 1000);
  }

  if (isNaN(date.getTime())) return "Invalid Date";

  return date.toLocaleString("en-PK", {
    timeZone: "Asia/Karachi",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

/**
 * Format date in DD-MM-YYYY format
 */
export function formatDateDDMMYYYY(dateInput) {
  if (!dateInput) return "N/A";

  let date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;

  if (typeof dateInput === "number" && dateInput < 10000000000) {
    date = new Date(dateInput * 1000);
  }

  if (isNaN(date.getTime())) return "Invalid Date";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}

/**
 * Format time only from date input
 */
export function formatTime(dateInput) {
  if (!dateInput) return "";

  let date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;

  if (typeof dateInput === "number" && dateInput < 10000000000) {
    date = new Date(dateInput * 1000);
  }

  if (isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-PK", {
    timeZone: "Asia/Karachi",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(date);
}

/**
 * Formats time hours and AM/PM for display
 */
export const getTimeDisplay = (hour, ampm) => `${hour}:00 ${ampm}`;
