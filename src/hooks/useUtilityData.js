import { useState, useEffect } from "react";
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

  // Function to fetch data
  const fetchData = async () => {
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
  };

  // Initial data fetch when button is clicked
  useEffect(() => {
    if (!shouldFetch) return;
    fetchData();
  }, [shouldFetch]);

  return { rows };
}
