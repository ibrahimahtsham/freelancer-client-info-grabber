/**
 * Parse project date/time from various formats
 * @param {string|number} dateTimeInput - Date/time as string or Unix timestamp
 * @returns {Date|null} Date object or null if parsing failed
 */
export function parseProjectDateTime(dateTimeInput) {
  // Handle undefined or null
  if (!dateTimeInput) {
    console.warn("Missing datetime value for project");
    return null;
  }

  try {
    // If it's a Unix timestamp (number or numeric string)
    if (typeof dateTimeInput === "number" || !isNaN(Number(dateTimeInput))) {
      // Convert from seconds to milliseconds if needed
      return new Date(Number(dateTimeInput) * 1000);
    }

    // Otherwise try to parse as date string
    const parsedDate = new Date(dateTimeInput);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    }

    console.warn(`Invalid date format: ${dateTimeInput}`);
    return null;
  } catch (error) {
    console.error(`Failed to parse date: ${dateTimeInput}`, error);
    return null;
  }
}

/**
 * Convert hours to 24-hour format
 * @param {number} hour - Hour in 12-hour format
 * @param {string} ampm - "AM" or "PM"
 * @returns {number} Hour in 24-hour format
 */
export function to24Hour(hour, ampm) {
  hour = parseInt(hour, 10);
  if (isNaN(hour)) return 0;

  if (ampm.toUpperCase() === "PM" && hour < 12) {
    return hour + 12;
  } else if (ampm.toUpperCase() === "AM" && hour === 12) {
    return 0;
  }
  return hour;
}
