import { useState, useEffect } from "react";
import { fetchActiveThreads } from "../utils/api/analytics/fetchActiveThreads";

export function useUtilityData(
  fromDate,
  toDate,
  limit = 5,
  shouldFetch = false,
  setShouldFetch
) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rateLimits, setRateLimits] = useState({ limit: "", remaining: "" });
  const [error, setError] = useState(""); // Add error state

  // Function to fetch data
  const fetchData = async () => {
    setLoading(true);
    setError(""); // Clear previous errors

    try {
      const { threads, rateLimits } = await fetchActiveThreads(
        fromDate,
        toDate,
        limit
      );

      setRateLimits(rateLimits);

      // Process threads to match DataTable's expected structure
      const processedThreads = threads.map((thread) => {
        // Extract nested data from the thread object
        const threadData = thread.thread || {};
        const context = threadData.context || {};

        return {
          id: thread.id,
          threadId: thread.id,
          projectId: context.id || "N/A",
          contextType: context.type || "N/A",
          projectTitle: "N/A", // Will be populated later
          projectUploadDate: threadData.time_created
            ? new Date(threadData.time_created * 1000).toLocaleString()
            : "N/A",
          firstMessageDate: "N/A", // Would need another API call
          projectBidPrice: "N/A", // Would need another API call
          projectLink: context.id
            ? `https://www.freelancer.com/projects/${context.id}`
            : "",
          ownerName: "N/A", // Would need another API call
          ownerLocation: "N/A", // Would need another API call
          clientProfileLink: threadData.owner
            ? `https://www.freelancer.com/u/${threadData.owner}`
            : "",
          yourBidAmount: "N/A", // Would need another API call
          totalPaidMilestones: "N/A", // Would need another API call
          awarded: "N/A", // Would need another API call
          otherStatus: "N/A", // Would need another API call
        };
      });

      setRows(processedThreads);
    } catch (err) {
      // Proper error handling
      if (err.name === "ApiError") {
        setError(`API Error (${err.status}): ${err.message}`);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
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
    error, // Return error state
  };
}
