/**
 * Utility functions for project time calculations and filtering
 * These are shared across the TimeBreakdowns page and Calculations page
 */

/**
 * Parse a project datetime string into a proper Date object
 * This function needs to safely handle undefined inputs
 */
export function parseProjectDateTime(dateTimeStr) {
  if (!dateTimeStr) {
    return null;
  }

  try {
    // Handle UNIX timestamp (seconds since epoch)
    if (typeof dateTimeStr === "number") {
      return new Date(dateTimeStr * 1000);
    }

    // Handle already Date object
    if (dateTimeStr instanceof Date) {
      return dateTimeStr;
    }

    // Handle bid_time in the new data structure (timestamp)
    if (!isNaN(dateTimeStr)) {
      return new Date(Number(dateTimeStr) * 1000);
    }

    // Otherwise parse as string
    return new Date(dateTimeStr);
  } catch (err) {
    console.warn(`Failed to parse date time: ${dateTimeStr}`, err);
    return null;
  }
}

/**
 * Check if a time falls within an employee's shift
 * @param {number} hour - Hour in 24-hour format
 * @param {number} startHour - Shift start hour in 24-hour format
 * @param {number} endHour - Shift end hour in 24-hour format
 * @returns {boolean} True if hour is within shift
 */
export function isInShift(hour, startHour, endHour) {
  // For overnight shifts (e.g., 22-7)
  if (startHour > endHour) {
    return hour >= startHour || hour < endHour;
  }
  // For normal shifts (e.g., 9-17)
  else {
    return hour >= startHour && hour < endHour;
  }
}

/**
 * Filter projects by employee shift
 * @param {Array} projects - Array of project objects
 * @param {Object} employee - Employee object with shift info
 * @param {number} employee.startHour24 - Shift start hour in 24-hour format
 * @param {number} employee.endHour24 - Shift end hour in 24-hour format
 * @returns {Object} Object with awarded and other project arrays
 */
export const filterProjectsByShift = (projects, employee) => {
  if (!projects || !employee) return { awarded: [], other: [] };

  const shiftProjects = projects.filter((project) => {
    const hour = parseProjectDateTime(project.projectUploadDate);
    return isInShift(hour, employee.startHour24, employee.endHour24);
  });

  return {
    awarded: shiftProjects.filter((project) => project.awarded === "Yes"),
    other: shiftProjects.filter((project) => project.awarded !== "Yes"),
  };
};

/**
 * Convert 12-hour time to 24-hour format
 */
export function to24Hour(hour, ampm) {
  hour = parseInt(hour, 10);
  if (ampm.toUpperCase() === "PM" && hour < 12) hour += 12;
  if (ampm.toUpperCase() === "AM" && hour === 12) hour = 0;
  return hour;
}
