import { useState, useCallback } from "react";
import { useUtility } from "../UtilityContext/hooks";
import {
  fetchMyUserId,
  fetchBidsWithProjectInfo,
  fetchMissingProjectDetails,
  fetchThreadInformation,
  fetchPaymentDetails,
  fetchClientProfiles,
  resetApiCallsStats,
  transformDataToRows,
} from "../FetchDataPage/apis";

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
   * @param {number|null} limit - Maximum number of results to fetch or null for unlimited
   * @param {string} fromDate - Start date in YYYY-MM-DD format
   * @param {string} toDate - End date in YYYY-MM-DD format
   * @param {string} fetchType - Type of data to fetch (complete, bids_only, etc)
   * @param {Function} progressCallback - Callback for progress updates
   * @param {Function} logger - Optional logger function for detailed logging
   * @returns {Promise<Array>} - Promise resolving to the processed data rows
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
        // Convert dates to timestamps
        const fromTimestamp = fromDate
          ? Math.floor(new Date(fromDate).getTime() / 1000)
          : null;
        const toTimestamp = toDate
          ? Math.floor(new Date(toDate).getTime() / 1000)
          : null;

        // Get user ID (needed for some API calls)
        progressCallback(5, "Fetching your user ID...");
        const userId = await fetchMyUserId(logger);
        logger(`Using user ID: ${userId}`, "api");

        // Step 1: Fetch bids with project info
        progressCallback(
          10,
          "Fetching bids with basic project and client info..."
        );
        const { bids, projects, users } = await fetchBidsWithProjectInfo(
          userId,
          fromTimestamp,
          toTimestamp,
          limit,
          progressCallback,
          logger
        );

        logger(
          `Fetched ${bids.length} bids, ${
            Object.keys(projects).length
          } projects, and ${Object.keys(users).length} users`,
          "info"
        );

        // Early return for bids-only fetch type
        if (fetchType === "bids_only") {
          const rows = transformDataToRows({ bids, projects, users });
          setRows(rows);
          return rows;
        }

        // Project IDs that need detailed info
        const projectIds = Object.keys(projects).map((id) => parseInt(id));

        // Step 2: Fetch detailed project information if needed
        let detailedProjects = {};
        if (fetchType === "complete" || fetchType === "projects_only") {
          progressCallback(
            30,
            `Fetching detailed project information for ${projectIds.length} projects...`
          );
          detailedProjects = await fetchMissingProjectDetails(
            projectIds,
            progressCallback,
            logger
          );
          logger(
            `Fetched detailed information for ${
              Object.keys(detailedProjects).length
            } projects`,
            "info"
          );
        }

        // Step 3: Fetch conversation threads if needed
        let threads = [];
        if (fetchType === "complete" || fetchType === "threads_only") {
          progressCallback(
            50,
            `Fetching conversation threads for ${projectIds.length} projects...`
          );
          threads = await fetchThreadInformation(
            projectIds,
            progressCallback,
            logger
          );
          logger(`Fetched ${threads.length} conversation threads`, "info");
        }

        // Step 4: Fetch payment details for awarded bids if needed
        let milestones = [];
        if (fetchType === "complete") {
          const awardedBidIds = bids
            .filter((bid) => bid.award_status === "awarded")
            .map((bid) => bid.id);

          if (awardedBidIds.length) {
            progressCallback(
              70,
              `Fetching payment details for ${awardedBidIds.length} awarded bids...`
            );
            milestones = await fetchPaymentDetails(
              awardedBidIds,
              progressCallback,
              logger
            );
            logger(
              `Fetched ${milestones.length} milestone/payment records`,
              "info"
            );
          }
        }

        // Step 5: Fetch detailed client information if needed
        let clientProfiles = {};
        if (fetchType === "complete" || fetchType === "clients_only") {
          const clientIds = Object.keys(users).map((id) => parseInt(id));

          progressCallback(
            85,
            `Fetching detailed profiles for ${clientIds.length} clients...`
          );
          clientProfiles = await fetchClientProfiles(
            clientIds,
            progressCallback,
            logger
          );
          logger(
            `Fetched detailed profiles for ${
              Object.keys(clientProfiles).length
            } clients`,
            "info"
          );
        }

        // Transform collected data into rows
        progressCallback(95, "Processing and transforming data...");
        const rows = transformDataToRows({
          bids,
          projects: { ...projects, ...detailedProjects },
          users: { ...users, ...clientProfiles },
          threads,
          milestones,
        });

        // Update context with the processed data
        setRows(rows);
        progressCallback(100, `Completed! Processed ${rows.length} data rows.`);

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
   * @param {Array<Object>} rows - Data rows to save
   * @returns {Promise<{success: boolean, datasetId: string|null}>}
   */
  const saveData = useCallback(async (rows) => {
    try {
      // Get current date range
      const now = new Date();
      const fromDate =
        rows.length > 0
          ? new Date(Math.min(...rows.map((r) => r.bid_time * 1000)))
          : now;
      const toDate =
        rows.length > 0
          ? new Date(Math.max(...rows.map((r) => r.bid_time * 1000)))
          : now;

      // Format dates for storage
      const fromDateStr = fromDate.toISOString().slice(0, 10);
      const toDateStr = toDate.toISOString().slice(0, 10);

      // Save using the utility context
      const datasetId = useUtility().saveCurrentDataset(
        fromDateStr,
        toDateStr,
        rows.length
      );

      return { success: !!datasetId, datasetId };
    } catch (err) {
      console.error("Error saving data:", err);
      return { success: false, datasetId: null };
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
