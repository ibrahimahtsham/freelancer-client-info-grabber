/**
 * Check if a date should be disabled (weekends)
 * @param {Date} date - Date to check
 * @returns {boolean} - True if date should be disabled
 */
export const shouldDisableDate = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
};

/**
 * Validate date range to ensure from date is before to date
 * @param {Date} fromDate - Start date
 * @param {Date} toDate - End date
 * @returns {boolean} - True if valid, false otherwise
 */
export const validateDateRange = (fromDate, toDate) => {
  if (!fromDate || !toDate) return true;
  return toDate > fromDate;
};
