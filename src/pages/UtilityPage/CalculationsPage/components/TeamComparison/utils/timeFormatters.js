export const formatCustomTime = (seconds) => {
  seconds = Math.floor(seconds);
  const d = Math.floor(seconds / (3600 * 24));
  seconds %= 3600 * 24;
  const h = Math.floor(seconds / 3600);
  seconds %= 3600;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  let result = "";
  if (d > 0) {
    result += `${d}d `;
  }
  if (h > 0) {
    result += `${h}h `;
  }
  if (m > 0) {
    result += `${m}m `;
  }
  result += `${s}s`;
  return result;
};
