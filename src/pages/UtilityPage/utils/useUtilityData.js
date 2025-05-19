import { useState, useCallback } from "react";
import { useUtility } from "../UtilityContext/hooks";
import { fetchThreadsWithProjectAndOwnerInfo } from "../FetchDataPage/apis/fetchThreadsWithProjectAndOwnerInfo";

/**
 * Custom hook for managing utility data operations
 * Handles fetching data with progress tracking
 */
export const useUtilityData = () => {
  // Get utility context data at the top level - only getting setRows since rows isn't used here
  const { setRows } = useUtility();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch thread data with progress tracking
   * @param {number|null} limit - Maximum number of threads to fetch or null for unlimited
   * @param {string} fromDate - Start date in YYYY-MM-DD format
   * @param {string} toDate - End date in YYYY-MM-DD format
   * @param {Function} progressCallback - Callback for progress updates
   * @returns {Promise<Object>} - Promise resolving to the fetched threads
   */
  const fetchData = useCallback(
    async (limit, fromDate, toDate, progressCallback) => {
      console.log("useUtilityData: fetchData called with", {
        limit,
        fromDate,
        toDate,
      });
      setLoading(true);
      setError(null);

      try {
        // Call the API to fetch threads with project and owner info
        const { threads } = await fetchThreadsWithProjectAndOwnerInfo(
          progressCallback,
          limit,
          fromDate,
          toDate
        );

        console.log(`Fetched ${threads.length} threads`);

        // Update rows in context
        setRows(threads);
        return threads;
      } catch (err) {
        console.error("Error in fetchData:", err);
        setError(err.message || "Failed to fetch data");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setRows]
  );

  /**
   * Save the current data
   * @returns {Promise<void>}
   */
  const saveData = useCallback(async () => {
    // If you have existing save functionality, implement it here
    console.log("Save data functionality would be implemented here");
    return { success: true };
  }, []);

  /**
   * Set progress manually (may be needed in some cases)
   */
  const setProgress = useCallback((percent, message) => {
    // This is a placeholder in case you need direct progress control
    console.log(`Manual progress update: ${percent}%, ${message}`);
  }, []);

  return {
    fetchData,
    saveData,
    setProgress,
    loading,
    error,
  };
};
