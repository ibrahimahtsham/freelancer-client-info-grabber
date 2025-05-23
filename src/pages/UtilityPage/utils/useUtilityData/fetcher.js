import {
  fetchMyUserId,
  fetchBidsWithProjectInfo,
  fetchMissingProjectDetails,
  fetchThreadInformation,
  fetchAllPaymentDetails,
  fetchClientProfiles,
  transformDataToRows,
} from "../../FetchDataPage/apis";

/**
 * Core data fetching implementation with progress tracking
 * @param {number|null} limit - Maximum number of results to fetch or null for unlimited
 * @param {string} fromDate - Start date in YYYY-MM-DD format
 * @param {string} toDate - End date in YYYY-MM-DD format
 * @param {string} fetchType - Type of data to fetch (complete, bids_only, etc)
 * @param {Function} progressCallback - Callback for progress updates
 * @param {Function} logger - Logger function for detailed logging
 * @returns {Promise<Array>} - Promise resolving to the processed data rows
 */
export async function fetchDataWithProgress(
  limit,
  fromDate,
  toDate,
  fetchType,
  progressCallback,
  logger
) {
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
  progressCallback(10, "Fetching bids with basic project and client info...");
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
    return transformDataToRows({ bids, projects, users });
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
  let enrichedBids = [...bids]; // Start with a copy of the original bids
  if (fetchType === "complete") {
    progressCallback(70, `Fetching payment details for awarded bids...`);

    const paymentResult = await fetchAllPaymentDetails(
      enrichedBids,
      progressCallback,
      logger
    );

    // Use the enriched bids that already have milestones attached
    enrichedBids = paymentResult.data;

    logger(`Fetched payment details for bids`, "info");
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
    bids: enrichedBids, // Use the enriched bids that have milestones attached
    projects: { ...projects, ...detailedProjects },
    users: { ...users, ...clientProfiles },
    threads,
  });

  progressCallback(100, `Completed! Processed ${rows.length} data rows.`);
  return rows;
}
