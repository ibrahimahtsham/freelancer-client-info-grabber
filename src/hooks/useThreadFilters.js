import { useMemo } from "react";
import { isInDateRange, isInTimeRange } from "../utils/dateUtils";

export default function useThreadFilters(
  threads,
  from,
  to,
  hafsa,
  ibrahim,
  filtersApplied
) {
  // Helper to normalize award status
  function isAwarded(t) {
    return t.myBid && ["awarded", "accepted"].includes(t.myBid.award_status);
  }

  const allAwarded = useMemo(() => threads.filter(isAwarded), [threads]);
  const allNotAwarded = useMemo(
    () => threads.filter((t) => !isAwarded(t)),
    [threads]
  );

  function filterThreadsByRange(threads, startHour, endHour) {
    return threads.filter(
      (t) =>
        isInDateRange(t.projectUploadDate, from, to) &&
        isInTimeRange(t.projectUploadDate, startHour, endHour)
    );
  }

  let hafsaAwarded = [],
    hafsaNotAwarded = [],
    ibrahimAwarded = [],
    ibrahimNotAwarded = [];
  if (filtersApplied) {
    hafsaAwarded = filterThreadsByRange(allAwarded, hafsa.start, hafsa.end);
    hafsaNotAwarded = filterThreadsByRange(
      allNotAwarded,
      hafsa.start,
      hafsa.end
    );
    ibrahimAwarded = filterThreadsByRange(
      allAwarded,
      ibrahim.start,
      ibrahim.end
    );
    ibrahimNotAwarded = filterThreadsByRange(
      allNotAwarded,
      ibrahim.start,
      ibrahim.end
    );
  }

  return {
    allAwarded,
    allNotAwarded,
    hafsaAwarded,
    hafsaNotAwarded,
    ibrahimAwarded,
    ibrahimNotAwarded,
  };
}
