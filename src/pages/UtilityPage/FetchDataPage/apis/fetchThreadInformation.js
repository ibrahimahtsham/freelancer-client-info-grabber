import { API_ENDPOINTS } from "../../../../constants";
import {
  monitoredApiRequest,
  batchItems,
  needsBatching,
  delay,
} from "./utils/apiUtils";
import { enrichWithThreadInfo } from "./utils/dataTransformers";

/**
 * Fetch thread/conversation information for projects
 * @param {Array<number>} projectIds - Array of project IDs
 * @param {Function} progressCallback - Callback for progress updates
 * @param {Function} logger - Logger function
 * @returns {Promise<Array>} - Array of thread information
 */
export async function fetchThreadInformation(
  projectIds,
  progressCallback = () => {},
  logger = console.log
) {
  // Ensure logger is a function
  const log = typeof logger === "function" ? logger : console.log;

  try {
    log(`Fetching threads for ${projectIds.length} projects`, "api");

    // Process projects individually or in small batches as needed
    const threads = [];
    let processedCount = 0;

    // For each project, fetch its threads
    for (let i = 0; i < projectIds.length; i++) {
      const projectId = projectIds[i];

      try {
        // Make API request to get threads for this project
        const endpoint = `${API_ENDPOINTS.THREADS}?contexts[]=${projectId}&context_type=project`;
        const response = await monitoredApiRequest(endpoint, {}, log);

        if (
          response.data &&
          response.data.result &&
          response.data.result.threads
        ) {
          const projectThreads = response.data.result.threads;

          // Add thread IDs to result array
          projectThreads.forEach((thread) => {
            // Add project ID to the thread object for reference
            thread.projectId = projectId;
            threads.push(thread);
          });
        }
      } catch (threadError) {
        log(
          `Error fetching threads for project ${projectId}: ${threadError.message}`,
          "error"
        );
        // Continue with next project even if this one fails
      }

      // Update processed count and progress
      processedCount++;
      const progressPercent =
        50 + Math.floor((processedCount / projectIds.length) * 20);

      if (i % 5 === 0 || i === projectIds.length - 1) {
        progressCallback(
          progressPercent,
          `Fetched threads for ${processedCount}/${projectIds.length} projects`
        );
      }
    }

    log(
      `Fetched ${threads.length} conversation threads across ${processedCount} projects`,
      "success"
    );
    return threads;
  } catch (error) {
    log(`Error fetching thread information: ${error.message}`, "error");
    throw error;
  }
}

/**
 * Fetches thread information for all projects, handling batching if needed
 * @param {Array<Object>} bids Bid data containing project IDs
 * @param {Function} progressCallback Progress update callback
 * @param {Function} logger Logger function
 * @returns {Promise<Object>} Enriched bid data with thread information
 */
export async function fetchAllThreadInformation(
  bids,
  progressCallback,
  logger = console.log
) {
  if (!bids || bids.length === 0) {
    return { data: [], rateLimits: {} };
  }

  // Extract unique project IDs from bids
  const projectIds = [...new Set(bids.map((bid) => bid.project_id))];

  logger(
    `Need to fetch threads for ${projectIds.length} unique projects`,
    "info"
  );

  // Check if we need to batch the requests
  let enrichedBids = [...bids];
  let lastRateLimits = {};

  if (needsBatching(projectIds)) {
    const batches = batchItems(projectIds);
    logger(
      `Batching ${projectIds.length} projects into ${batches.length} requests`,
      "info"
    );

    let processedBatches = 0;

    for (const batch of batches) {
      const { data, rateLimits } = await fetchThreadInformation(batch, logger);
      lastRateLimits = rateLimits;

      // Enrich the bid data with thread details
      enrichedBids = enrichWithThreadInfo(enrichedBids, data);

      // Update progress
      processedBatches++;
      if (progressCallback) {
        const progress = Math.round((processedBatches / batches.length) * 100);
        progressCallback(
          progress,
          `Fetched thread info: ${processedBatches}/${batches.length} batches (${batch.length} projects)`
        );
      }

      // Add delay between batches to avoid rate limits
      if (processedBatches < batches.length) {
        await delay(1000);
      }
    }
  } else {
    // Small enough to fetch in one request
    const { data, rateLimits } = await fetchThreadInformation(
      projectIds,
      logger
    );
    lastRateLimits = rateLimits;

    // Enrich the bid data with thread information
    enrichedBids = enrichWithThreadInfo(enrichedBids, data);

    if (progressCallback) {
      progressCallback(
        100,
        `Fetched threads for all ${projectIds.length} projects`
      );
    }
  }

  return {
    data: enrichedBids,
    rateLimits: lastRateLimits,
  };
}
