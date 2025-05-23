/**
 * Check if date is within a specified range
 */
export function isInDateRange(dateStr, from, to) {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  return (!from || date >= from) && (!to || date <= to);
}

/**
 * Check if time in date is within range
 */
export function isInTimeRange(dateInput, startHour, endHour) {
  if (!dateInput) return false;

  // If it's a string in DD-MM-YYYY format, parse it
  let date = dateInput;
  if (typeof dateInput === "string") {
    // If it includes time part, we're getting direct input from projectUploadDate
    if (dateInput.includes(" ")) {
      // Try to parse the time part directly
      const timePart = dateInput.split(" ")[1];
      if (timePart) {
        // Extract hour from time like "1:30 PM"
        const hour12 = parseInt(timePart.split(":")[0], 10);
        const isPM = timePart.toLowerCase().includes("pm");
        const hour24 =
          isPM && hour12 !== 12
            ? hour12 + 12
            : hour12 === 12 && !isPM
            ? 0
            : hour12;

        // Compare with startHour and endHour
        if (startHour < endHour) {
          return hour24 >= startHour && hour24 < endHour;
        } else {
          return hour24 >= startHour || hour24 < endHour;
        }
      }
    }
    // Default to Date object
    date = new Date(dateInput);
  }

  // Handle Date objects
  if (date instanceof Date) {
    const hour = date.getHours();
    if (startHour < endHour) {
      return hour >= startHour && hour < endHour;
    } else {
      return hour >= startHour || hour < endHour;
    }
  }

  return false;
}

/**
 * Check if a time falls within a shift range
 */
export function isInShift(hour, startHour, endHour) {
  if (hour === null) return false;

  // Handle shifts that span across midnight
  if (startHour > endHour) {
    return hour >= startHour || hour < endHour;
  } else {
    return hour >= startHour && hour < endHour;
  }
}
