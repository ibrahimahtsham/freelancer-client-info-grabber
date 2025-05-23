/**
 * Format the shift time for display
 * @param {Object} employee - Employee object with shift data
 * @returns {string} Formatted shift time string
 */
export function formatShiftTime(employee) {
  const start = `${employee.startHour}${employee.startAmPm.toLowerCase()}`;
  const end = `${employee.endHour}${employee.endAmPm.toLowerCase()}`;
  return `${start} to ${end}`;
}
