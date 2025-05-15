export function formatEpochToPakistanTime(epochSeconds) {
  if (!epochSeconds) return "";
  const date = new Date(epochSeconds * 1000);
  return date.toLocaleString("en-PK", { timeZone: "Asia/Karachi" });
}
