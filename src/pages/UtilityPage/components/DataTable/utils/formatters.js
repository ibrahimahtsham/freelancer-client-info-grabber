import { formatDate } from "../../../../../utils/dateUtils";

/**
 * Format time from seconds to a human-readable format
 * @param {number} seconds - Time in seconds
 * @returns {string} - Formatted time string
 */
export function formatTimeFromSeconds(seconds) {
  if (!seconds || seconds <= 0) return "0s";

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m ${secs}s`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

/**
 * Format currency value
 * @param {number|string} value - Currency value
 * @returns {string} - Formatted currency string
 */
export function formatCurrency(value) {
  if (value === null || value === undefined) return "$0.00";
  const amount = typeof value !== "number" ? parseFloat(value) || 0 : value;
  return `$${amount.toFixed(2)}`;
}

/**
 * Format timestamp to date string
 * @param {number|Date|string} value - Timestamp value
 * @returns {string} - Formatted date string
 */
export function formatTimestamp(value) {
  if (!value) return "N/A";
  try {
    if (typeof value === "number") {
      return formatDate(new Date(value * 1000));
    }
    if (value instanceof Date) {
      return formatDate(value);
    }
    return formatDate(new Date(value));
  } catch (error) {
    console.warn("Failed to format date:", value, error);
    return "Invalid date";
  }
}
