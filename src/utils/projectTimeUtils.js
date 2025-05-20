/**
 * Utility functions for project time calculations and filtering
 * These are shared across the TimeBreakdowns page and Calculations page
 */

/**
 * Parse date time string to extract hour in 24-hour format
 * @param {string} dateTimeStr - Format: DD-MM-YYYY HH:MM:SS AM/PM
 * @returns {number|null} Hour in 24-hour format or null if parsing failed
 */
export function parseProjectDateTime(dateTimeStr) {
  try {
    // Extract time components from the dateTimeStr (e.g., "21-04-2025 10:31:05 pm")
    const timePart = dateTimeStr.split(" ")[1]; // "10:31:05"
    const amPm = dateTimeStr.split(" ")[2]; // "pm" or "am"
    const hourStr = timePart.split(":")[0]; // "10"
    const hour = parseInt(hourStr, 10);

    // Convert to 24-hour format
    if (amPm && amPm.toLowerCase() === "pm" && hour < 12) {
      return hour + 12; // 10pm = 22
    } else if (amPm && amPm.toLowerCase() === "am" && hour === 12) {
      return 0; // 12am = 0
    } else {
      return hour;
    }
  } catch (error) {
    console.error("Failed to parse date time:", dateTimeStr, error);
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
 * Convert 12-hour time to 24-hour time
 * @param {number|string} hour - Hour in 12-hour format
 * @param {string} ampm - "AM" or "PM"
 * @returns {number} Hour in 24-hour format
 */
export const to24Hour = (hour, ampm) => {
  hour = parseInt(hour, 10);

  if (ampm === "PM" && hour < 12) {
    return hour + 12;
  } else if (ampm === "AM" && hour === 12) {
    return 0;
  }
  return hour;
};
