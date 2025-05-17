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

export function isInTimeRange(dateStr, startHour, endHour) {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const hour = Number(
    date.toLocaleString("en-PK", {
      timeZone: "Asia/Karachi",
      hour: "2-digit",
      hour12: false,
    })
  );
  if (startHour < endHour) {
    return hour >= startHour && hour < endHour;
  } else {
    return hour >= startHour || hour < endHour;
  }
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

  // Format as day/month/year with time in Pakistan timezone
  return date.toLocaleString("en-PK", {
    timeZone: "Asia/Karachi",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}
