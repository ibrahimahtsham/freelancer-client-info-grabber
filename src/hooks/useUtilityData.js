import { useState, useEffect, useCallback } from "react";
import { fetchThreadsWithProjectAndOwnerInfo } from "../utils/api/analytics";

export function useUtilityData(
  fromDate,
  toDate,
  limit = null,
  shouldFetch = false,
  setShouldFetch,
  callbacks = {}
) {
  const [rows, setRows] = useState([]);

  // Memoize the fetchData function using useCallback
  const fetchData = useCallback(async () => {
    // Call onStart callback if provided
    if (callbacks.onStart) callbacks.onStart();

    try {
      // Use the comprehensive data fetching function with progress tracking
      const { threads, rateLimits } = await fetchThreadsWithProjectAndOwnerInfo(
        callbacks.onProgress,
        limit,
        fromDate,
        toDate
      );

      // Update local state
      setRows(threads);

      // Call onSuccess callback if provided
      if (callbacks.onSuccess) callbacks.onSuccess({ threads, rateLimits });
    } catch (err) {
      // Call onError callback if provided
      if (callbacks.onError) callbacks.onError(err);
    } finally {
      // Call onComplete callback if provided
      if (callbacks.onComplete) callbacks.onComplete();

      // Reset shouldFetch so the button can be clicked again
      if (setShouldFetch) setShouldFetch(false);
    }
  }, [fromDate, toDate, limit, callbacks, setShouldFetch]); // Add all dependencies

  // Initial data fetch when button is clicked
  useEffect(() => {
    if (!shouldFetch) return;
    fetchData();
  }, [shouldFetch, fetchData]); // Include fetchData in deps

  return { rows };
}
