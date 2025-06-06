/**
 * Convert 12-hour format to 24-hour format
 */
export function to24Hour(hour, ampm) {
  if (ampm === "AM") return hour === 12 ? 0 : hour;
  return hour === 12 ? 12 : hour + 12;
}

/**
 * Parse time from project date string format: "DD-MM-YYYY HH:MM:SS AM/PM"
 * Returns hour in 24-hour format
 */
export function parseTime(dateString) {
  if (!dateString || dateString === "N/A") return null;

  try {
    const parts = dateString.split(" ");
    if (parts.length < 2) return null;

    const timePart = parts[1]; // Get time part
    const ampmPart = parts[2]; // Get AM/PM part

    // Extract hours from time part (HH:MM:SS)
    const hourStr = timePart.split(":")[0];
    const hour = parseInt(hourStr, 10);

    if (isNaN(hour)) return null;

    // Convert to 24-hour format
    return to24Hour(hour, ampmPart);
  } catch (e) {
    console.warn("Error parsing time:", dateString, e);
    return null;
  }
}
