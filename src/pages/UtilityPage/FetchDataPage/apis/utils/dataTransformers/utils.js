/**
 * Format epoch timestamp to locale string
 * @param {number} timestamp - Unix timestamp in seconds
 * @returns {string} Formatted date string
 */
export function formatTimestamp(timestamp) {
  if (!timestamp) return "";
  return new Date(timestamp * 1000).toLocaleString();
}
