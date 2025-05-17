import { useState, useEffect } from "react";
import { fetchThreadsWithProjectAndOwnerInfo } from "../utils/api/analytics";

export function useUtilityData(
  fromDate,
  toDate,
  limit = null, // Changed to accept null for unlimited
  shouldFetch = false,
  setShouldFetch
) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rateLimits, setRateLimits] = useState({ limit: "", remaining: "" });
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");

  // Function to fetch data
  const fetchData = async () => {
    setLoading(true);
    setError("");
    setProgress(0);
    setProgressText("Initializing...");

    try {
      // Use the comprehensive data fetching function with progress tracking
      const { threads, rateLimits } = await fetchThreadsWithProjectAndOwnerInfo(
        (percent, text) => {
          setProgress(percent);
          setProgressText(text);
        },
        limit, // This can now be null
        fromDate,
        toDate
      );

      setRows(threads);
      setRateLimits(rateLimits);
    } catch (err) {
      // Proper error handling
      if (err.name === "ApiError") {
        setError(`API Error (${err.status}): ${err.message}`);
      } else {
        setError(err.message || "An unknown error occurred");
      }
    } finally {
      setLoading(false);
      setProgress(0);
      setProgressText("");
      // Reset shouldFetch so the button can be clicked again
      if (setShouldFetch) setShouldFetch(false);
    }
  };

  // Initial data fetch when button is clicked
  useEffect(() => {
    if (!shouldFetch) return;
    fetchData();
  }, [shouldFetch]);

  return {
    rows,
    loading,
    rateLimits,
    error,
    progress,
    progressText,
  };
}
