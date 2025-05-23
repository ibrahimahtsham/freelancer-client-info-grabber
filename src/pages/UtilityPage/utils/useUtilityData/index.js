import { useState, useCallback } from "react";
import { useUtility } from "../../UtilityContext/hooks";
import { fetchDataWithProgress } from "./fetcher";
import { saveDataToLocalStorage } from "./storage";
import { resetApiCallsStats } from "../../FetchDataPage/apis";

/**
 * Custom hook for managing utility data operations
 * Handles fetching data with progress tracking and API integration
 */
export const useUtilityData = () => {
  // Get utility context data
  const { setRows } = useUtility();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch data with progress tracking based on fetch type
   */
  const fetchData = useCallback(
    async (
      limit,
      fromDate,
      toDate,
      fetchType = "complete",
      progressCallback,
      logger = console.log
    ) => {
      logger(
        "useUtilityData: fetchData called with " +
          JSON.stringify({ limit, fromDate, toDate, fetchType }),
        "api"
      );

      setLoading(true);
      setError(null);

      // Reset API call stats
      resetApiCallsStats();

      try {
        // Delegate to the fetcher implementation
        const rows = await fetchDataWithProgress(
          limit,
          fromDate,
          toDate,
          fetchType,
          progressCallback,
          logger
        );

        // Update context with the processed data
        setRows(rows);
        return rows;
      } catch (err) {
        setError(err.message || "An unknown error occurred");
        logger(`Error: ${err.message}`, "error");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setRows]
  );

  /**
   * Save the current data
   */
  const saveData = useCallback(
    async (rows, filters = {}, datasetName = null) => {
      return saveDataToLocalStorage(rows, filters, datasetName);
    },
    []
  );

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
