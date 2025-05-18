export function formatEpochToPakistanTime(epochSeconds) {
  if (!epochSeconds) return "";
  const date = new Date(epochSeconds * 1000);
  return date.toLocaleString("en-PK", { timeZone: "Asia/Karachi" });
}

export function isInDateRange(dateStr, from, to) {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  return (!from || date >= from) && (!to || date <= to);
}

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

export function formatHour(hour) {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  return date.toLocaleString("en-PK", {
    hour: "numeric",
    hour12: true,
    timeZone: "Asia/Karachi",
  });
}

export function to24Hour(hour, ampm) {
  if (ampm === "AM") return hour === 12 ? 0 : hour;
  return hour === 12 ? 12 : hour + 12;
}

// New function for standardized date formatting
export function formatDate(dateInput) {
  if (!dateInput) return "N/A";

  // If it's already a date string, parse it
  let date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;

  // If input is a timestamp in seconds, convert to milliseconds
  if (typeof dateInput === "number" && dateInput < 10000000000) {
    date = new Date(dateInput * 1000);
  }

  // Check if date is valid
  if (isNaN(date.getTime())) return "Invalid Date";

  // Format as day/month/year format
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Add or update this function

export function formatDateTime(dateInput) {
  if (!dateInput) return "N/A";

  // If it's already a date string, parse it
  let date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;

  // If input is a timestamp in seconds, convert to milliseconds
  if (typeof dateInput === "number" && dateInput < 10000000000) {
    date = new Date(dateInput * 1000);
  }

  // Check if date is valid
  if (isNaN(date.getTime())) return "Invalid Date";

  // Format as day/month/year with time (including seconds) in Pakistan timezone
  return date.toLocaleString("en-PK", {
    timeZone: "Asia/Karachi",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit", // Added seconds
    hour12: true,
  });
}

export function formatDateDDMMYYYY(dateInput) {
  if (!dateInput) return "N/A";

  // If it's already a date string, parse it
  let date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;

  // If input is a timestamp in seconds, convert to milliseconds
  if (typeof dateInput === "number" && dateInput < 10000000000) {
    date = new Date(dateInput * 1000);
  }

  // Check if date is valid
  if (isNaN(date.getTime())) return "Invalid Date";

  // Format as DD-MM-YYYY
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}

export function formatTime(dateInput) {
  if (!dateInput) return "";

  // If it's already a date string, parse it
  let date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;

  // If input is a timestamp in seconds, convert to milliseconds
  if (typeof dateInput === "number" && dateInput < 10000000000) {
    date = new Date(dateInput * 1000);
  }

  // Check if date is valid
  if (isNaN(date.getTime())) return "";

  // Create time-only formatter
  return new Intl.DateTimeFormat("en-PK", {
    timeZone: "Asia/Karachi",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(date);
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
