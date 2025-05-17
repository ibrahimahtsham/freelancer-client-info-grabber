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
