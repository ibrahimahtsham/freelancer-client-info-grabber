import { useState, useCallback } from "react";
import { useUtility } from "../UtilityContext/hooks";
import { fetchThreadsWithProjectAndOwnerInfo } from "../FetchDataPage/apis/fetchThreadsWithProjectAndOwnerInfo";
import { saveCurrentDataset } from "../UtilityContext/datasetOperations";

/**
 * Custom hook for managing utility data operations
 * Handles fetching data with progress tracking
 */
export const useUtilityData = () => {
  // Get utility context data
  const { setRows } = useUtility();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch thread data with progress tracking
   * @param {number|null} limit - Maximum number of threads to fetch or null for unlimited
   * @param {string} fromDate - Start date in YYYY-MM-DD format
   * @param {string} toDate - End date in YYYY-MM-DD format
   * @param {Function} progressCallback - Callback for progress updates
   * @param {Function} logger - Optional logger function for detailed logging
   * @returns {Promise<Object>} - Promise resolving to the fetched threads
   */
  const fetchData = useCallback(
    async (limit, fromDate, toDate, progressCallback, logger = console.log) => {
      logger(
        "useUtilityData: fetchData called with " +
          JSON.stringify({ limit, fromDate, toDate }),
        "api"
      );

      setLoading(true);
      setError(null);

      try {
        // Call the API to fetch threads with project and owner info
        const { threads } = await fetchThreadsWithProjectAndOwnerInfo(
          progressCallback,
          limit,
          fromDate,
          toDate,
          logger
        );

        logger(`Fetched ${threads.length} threads`, "success");

        // Update rows in context
        setRows(threads);
        return threads;
      } catch (err) {
        logger("Error in fetchData: " + err.message, "error");
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
   * @param {Array<Object>} rows - Data rows to save
   * @returns {Promise<{success: boolean, datasetId: string|null}>}
   */
  const saveData = useCallback(async (rows) => {
    try {
      // Generate date range information (using today as default)
      const today = new Date();
      const formattedDate = today.toISOString().split("T")[0]; // YYYY-MM-DD

      // Save the dataset using the saveCurrentDataset function
      const datasetId = saveCurrentDataset(
        rows,
        formattedDate,
        formattedDate,
        null
      );

      return {
        success: !!datasetId,
        datasetId,
      };
    } catch (err) {
      console.error("Error saving data:", err);
      throw err;
    }
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
