/**
 * Returns first day of current month formatted as YYYY-MM-DD
 */
export function getFirstDayOfCurrentMonth() {
  const firstDay = new Date();
  firstDay.setDate(1);
  return firstDay;
}

/**
 * Returns first day of previous month formatted as YYYY-MM-DD
 */
export function getFirstDayOfPreviousMonth() {
  const firstDay = new Date();
  firstDay.setDate(1);
  firstDay.setMonth(firstDay.getMonth() - 1);
  return firstDay;
}
