/**
 * Format a timestamp for display
 * @param {string} savedAt - The timestamp to format
 * @returns {string} Formatted timestamp in DD/MM/YY HH:MM format
 */
export const getFormattedTimestamp = (savedAt) => {
  if (!savedAt) return "";
  const date = new Date(savedAt);
  if (isNaN(date.getTime())) return "";

  // Format as DD/MM/YY HH:MM
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};
