/**
 * Utility functions for project time calculations and filtering
 * These are shared across the TimeBreakdowns page and Calculations page
 */

/**
 * Parse date time string to extract hour in 24-hour format
 * @param {string} dateString - Format: DD-MM-YYYY HH:MM:SS AM/PM
 * @returns {number|null} Hour in 24-hour format or null if parsing failed
 */
export const parseProjectDateTime = (dateString) => {
  if (!dateString || dateString === "N/A") return null;

  try {
    // Parse DD-MM-YYYY HH:MM:SS AM/PM format
    const parts = dateString.split(" ");
    if (parts.length < 3) return null;

    const timePart = parts[1];
    const ampmPart = parts[2];

    // Parse time
    const [hours] = timePart.split(":").map(Number);

    // Convert to 24-hour format
    let hour24 = hours;
    if (ampmPart === "PM" && hours < 12) hour24 += 12;
    else if (ampmPart === "AM" && hours === 12) hour24 = 0;

    return hour24;
  } catch (e) {
    console.warn("Failed to parse date time:", dateString, e);
    return null;
  }
};

/**
 * Check if a time falls within an employee's shift
 * @param {number} hour - Hour in 24-hour format
 * @param {number} shiftStart - Shift start hour in 24-hour format
 * @param {number} shiftEnd - Shift end hour in 24-hour format
 * @returns {boolean} True if hour is within shift
 */
export const isInShift = (hour, shiftStart, shiftEnd) => {
  if (hour === null) return false;

  // Handle shifts that span across midnight
  if (shiftStart > shiftEnd) {
    return hour >= shiftStart || hour < shiftEnd;
  } else {
    return hour >= shiftStart && hour < shiftEnd;
  }
};

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
