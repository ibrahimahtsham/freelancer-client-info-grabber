import {
  monitoredApiRequest,
  batchItems,
  needsBatching,
  delay,
  formatQueryParams,
} from "./utils/apiUtils";
import { enrichWithClientData } from "./utils/dataTransformers";

/**
 * Helper function to process users in batches
 * @param {Array<number>} userIds - Array of user IDs
 * @param {number} batchSize - How many IDs to process in each batch
 * @returns {Array<Array<number>>} Array of ID batches
 */
function batchUserIds(userIds, batchSize = 5) {
  const batches = [];
  for (let i = 0; i < userIds.length; i += batchSize) {
    batches.push(userIds.slice(i, i + batchSize));
  }
  return batches;
}

/**
 * Fetch detailed profiles for clients
 * @param {Array<number>} clientIds - Array of client user IDs
 * @param {Function} progressCallback - Callback for progress updates
 * @param {Function} logger - Logger function
 * @returns {Promise<Object>} - Map of client IDs to profile information
 */
export async function fetchClientProfiles(
  clientIds,
  progressCallback = () => {},
  logger = console.log
) {
  // Ensure logger is a function
  const log = typeof logger === "function" ? logger : console.log;

  try {
    log(`Fetching profiles for ${clientIds.length} clients`, "api");

    // Process clients in batches to avoid exceeding request limits
    const batches = batchUserIds(clientIds);
    const clientProfiles = {};
    let processedCount = 0;

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];

      try {
        // Prepare query parameters and endpoint
        const params = {};

        // Add each user ID separately
        batch.forEach((id) => {
          params["users[]"] = params["users[]"] || [];
          params["users[]"].push(id);
        });

        // Add other parameters
        params.reputation = true;
        params.employer_reputation = true;
        params.status = true;
        params.jobs = true;
        params.badge_details = true;
        params.country_details = true;

        const queryString = formatQueryParams(params);
        const endpoint = `users/0.1/users/?${queryString}`;

        // Make API request for this batch
        const response = await monitoredApiRequest(endpoint, {}, log);

        if (
          response.data &&
          response.data.result &&
          response.data.result.users
        ) {
          const users = response.data.result.users;

          // Add each user to the result map
          Object.keys(users).forEach((userId) => {
            clientProfiles[userId] = users[userId];
          });
        }
      } catch (batchError) {
        log(
          `Error processing client batch ${i + 1}: ${batchError.message}`,
          "error"
        );
        // Continue with next batch even if this one fails
      }

      // Update processed count and progress
      processedCount += batch.length;
      const progressPercent =
        85 + Math.floor((processedCount / clientIds.length) * 10);
      progressCallback(
        progressPercent,
        `Processed profiles for ${processedCount}/${clientIds.length} clients`
      );
    }

    log(
      `Fetched detailed profiles for ${
        Object.keys(clientProfiles).length
      } clients`,
      "success"
    );
    return clientProfiles;
  } catch (error) {
    log(`Error fetching client profiles: ${error.message}`, "error");
    throw error;
  }
}

/**
 * Fetches client profiles for all clients, handling batching if needed
 * @param {Array<Object>} bids Bid data containing client IDs
 * @param {Function} progressCallback Progress update callback
 * @param {Function} logger Logger function
 * @returns {Promise<Object>} Enriched bid data with client profile details
 */
export async function fetchAllClientProfiles(
  bids,
  progressCallback,
  logger = console.log
) {
  if (!bids || bids.length === 0) {
    return { data: [], rateLimits: {} };
  }

  // Extract unique client IDs from bids
  const clientIds = [...new Set(bids.map((bid) => bid.client_id))];

  logger(
    `Need to fetch profiles for ${clientIds.length} unique clients`,
    "info"
  );

  // Check if we need to batch the requests
  let enrichedBids = [...bids];
  let lastRateLimits = {};

  if (needsBatching(clientIds)) {
    const batches = batchItems(clientIds);
    logger(
      `Batching ${clientIds.length} clients into ${batches.length} requests`,
      "info"
    );

    let processedBatches = 0;

    for (const batch of batches) {
      const { data, rateLimits } = await fetchClientProfiles(batch, logger);
      lastRateLimits = rateLimits;

      // Enrich the bid data with client details
      enrichedBids = enrichWithClientData(enrichedBids, data);

      // Update progress
      processedBatches++;
      if (progressCallback) {
        const progress = Math.round((processedBatches / batches.length) * 100);
        progressCallback(
          progress,
          `Fetched client profiles: ${processedBatches}/${batches.length} batches (${batch.length} clients)`
        );
      }

      // Add delay between batches to avoid rate limits
      if (processedBatches < batches.length) {
        await delay(1000);
      }
    }
  } else {
    // Small enough to fetch in one request
    const { data, rateLimits } = await fetchClientProfiles(clientIds, logger);
    lastRateLimits = rateLimits;

    // Enrich the bid data with client details
    enrichedBids = enrichWithClientData(enrichedBids, data);

    if (progressCallback) {
      progressCallback(
        100,
        `Fetched profiles for all ${clientIds.length} clients`
      );
    }
  }

  return {
    data: enrichedBids,
    rateLimits: lastRateLimits,
  };
}
