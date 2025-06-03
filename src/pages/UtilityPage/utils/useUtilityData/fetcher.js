import {
  fetchMyUserId,
  fetchBidsWithProjectInfo,
  fetchMissingProjectDetails,
  fetchThreadInformation,
  fetchAllPaymentDetails,
  fetchClientProfiles,
  transformDataToRows,
} from "../../FetchDataPage/apis";
import { setRateLimitAggressiveness } from "../../FetchDataPage/apis/utils/apiUtils/rateLimitConfig";

/**
 * Core data fetching implementation with progress tracking
 * @param {number|null} limit - Maximum number of results to fetch or null for unlimited
 * @param {string} fromDate - Start date in YYYY-MM-DD format
 * @param {string} toDate - End date in YYYY-MM-DD format
 * @param {string} fetchType - Type of data to fetch (complete, bids_only, etc)
 * @param {Function} progressCallback - Callback for progress updates
 * @param {Function} logger - Logger function for detailed logging
 * @param {number} rateLimitAggressiveness - Rate limit aggressiveness (0 to 1)
 * @returns {Promise<Array>} - Promise resolving to the processed data rows
 */
export async function fetchDataWithProgress(
  limit,
  fromDate,
  toDate,
  fetchType,
  progressCallback,
  logger,
  rateLimitAggressiveness = 0.7,
  categoryTracker = null // Add category tracker parameter
) {
  // Update the global rate limit aggressiveness setting
  setRateLimitAggressiveness(rateLimitAggressiveness);

  // Convert dates to timestamps
  const fromTimestamp = fromDate
    ? Math.floor(new Date(fromDate).getTime() / 1000)
    : null;
  const toTimestamp = toDate
    ? Math.floor(new Date(toDate).getTime() / 1000)
    : null;

  // Category: User ID Lookup
  categoryTracker?.startCategory("user_id");
  progressCallback(5, "Fetching your user ID...");
  const userId = await fetchMyUserId(logger);
  logger(`Using user ID: ${userId}`, "api");
  categoryTracker?.endCategory("user_id");

  // Category: Main Bids Fetch
  categoryTracker?.startCategory("bids");
  progressCallback(10, "Fetching bids with basic project and client info...");
  const { bids, projects, users } = await fetchBidsWithProjectInfo(
    userId,
    fromTimestamp,
    toTimestamp,
    limit,
    (percent, message) => {
      categoryTracker?.updateCategoryProgress("bids", percent, message);
      progressCallback(10 + percent * 0.15, message); // 10-25% range
    },
    logger
  );
  categoryTracker?.endCategory("bids");

  logger(
    `Fetched ${bids.length} bids, ${
      Object.keys(projects).length
    } projects, and ${Object.keys(users).length} users`,
    "info"
  );

  // Early return for bids-only fetch type
  if (fetchType === "bids_only") {
    categoryTracker?.startCategory("processing");
    const result = transformDataToRows({ bids, projects, users });
    categoryTracker?.endCategory("processing");
    return result;
  }

  // Project IDs that need detailed info
  const projectIds = Object.keys(projects).map((id) => parseInt(id));

  // Category: Project Details
  let detailedProjects = {};
  if (fetchType === "complete" || fetchType === "projects_only") {
    categoryTracker?.startCategory("projects");
    progressCallback(
      30,
      `Fetching detailed project information for ${projectIds.length} projects...`
    );

    detailedProjects = await fetchMissingProjectDetails(
      projectIds,
      (percent, message) => {
        categoryTracker?.updateCategoryProgress("projects", percent, message);
        progressCallback(30 + percent * 0.2, message); // 30-50% range
      },
      logger
    );
    categoryTracker?.endCategory("projects");

    logger(
      `Fetched detailed information for ${
        Object.keys(detailedProjects).length
      } projects`,
      "info"
    );
  }

  // Category: Thread Information
  let threads = [];
  if (fetchType === "complete" || fetchType === "threads_only") {
    categoryTracker?.startCategory("threads");
    progressCallback(
      50,
      `Fetching conversation threads for ${projectIds.length} projects...`
    );

    threads = await fetchThreadInformation(
      projectIds,
      (percent, message) => {
        categoryTracker?.updateCategoryProgress("threads", percent, message);
        progressCallback(50 + percent * 0.2, message); // 50-70% range
      },
      logger
    );
    categoryTracker?.endCategory("threads");

    logger(`Fetched ${threads.length} conversation threads`, "info");
  }

  // Category: Payment Details
  let enrichedBids = [...bids];
  if (fetchType === "complete") {
    categoryTracker?.startCategory("payments");
    progressCallback(70, `Fetching payment details for awarded bids...`);

    const paymentResult = await fetchAllPaymentDetails(
      enrichedBids,
      (percent, message) => {
        categoryTracker?.updateCategoryProgress("payments", percent, message);
        progressCallback(70 + percent * 0.15, message); // 70-85% range
      },
      logger
    );

    enrichedBids = paymentResult.data;
    categoryTracker?.endCategory("payments");

    logger(`Fetched payment details for bids`, "info");
  }

  // Category: Client Profiles
  let clientProfiles = {};
  if (fetchType === "complete" || fetchType === "clients_only") {
    categoryTracker?.startCategory("clients");
    const clientIds = Object.keys(users).map((id) => parseInt(id));

    progressCallback(
      85,
      `Fetching detailed profiles for ${clientIds.length} clients...`
    );

    clientProfiles = await fetchClientProfiles(
      clientIds,
      (percent, message) => {
        categoryTracker?.updateCategoryProgress("clients", percent, message);
        progressCallback(85 + percent * 0.1, message); // 85-95% range
      },
      logger
    );
    categoryTracker?.endCategory("clients");

    logger(
      `Fetched detailed profiles for ${
        Object.keys(clientProfiles).length
      } clients`,
      "info"
    );
  }

  // Category: Data Processing
  categoryTracker?.startCategory("processing");
  progressCallback(95, "Processing and transforming data...");
  const rows = transformDataToRows({
    bids: enrichedBids,
    projects: { ...projects, ...detailedProjects },
    users: { ...users, ...clientProfiles },
    threads,
  });

  progressCallback(100, `Completed! Processed ${rows.length} data rows.`);
  categoryTracker?.endCategory("processing");

  return rows;
}
