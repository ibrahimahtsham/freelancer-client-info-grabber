import { useState, useEffect, useCallback } from "react";
import { getApiCallsStats, resetApiCallsStats } from "../apis";

export function useApiStats(loading) {
  // API calls monitoring
  const [apiCalls, setApiCalls] = useState({ total: 0, endpoints: {} });
  const [showApiStats, setShowApiStats] = useState(false);

  // Update API calls stats periodically while fetching
  useEffect(() => {
    let interval;

    if (loading) {
      // Update API stats every 2 seconds during fetch
      interval = setInterval(() => {
        try {
          const stats = getApiCallsStats();
          setApiCalls(stats);
        } catch (e) {
          console.error("Failed to update API stats:", e);
        }
      }, 2000);

      // Show API stats when loading starts
      setShowApiStats(true);
    } else if (interval) {
      clearInterval(interval);

      // Get final API stats when loading finishes
      try {
        const stats = getApiCallsStats();
        setApiCalls(stats);
      } catch (e) {
        console.error("Failed to get final API stats:", e);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading]);

  // Reset API stats
  const resetApiStats = useCallback(() => {
    resetApiCallsStats();
    setApiCalls({ total: 0, endpoints: {} });
  }, []);

  // Toggle API stats visibility
  const toggleApiStats = useCallback(() => {
    setShowApiStats((prev) => !prev);
  }, []);

  return {
    apiCalls,
    showApiStats,
    resetApiStats,
    toggleApiStats,
  };
}
