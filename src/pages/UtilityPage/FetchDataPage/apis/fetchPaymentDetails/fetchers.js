import { API_ENDPOINTS } from "../../../../../constants";
import {
  monitoredApiRequest,
  batchItems,
  needsBatching,
  formatQueryParams,
  delay,
} from "../utils/apiUtils";
import { formatMilestones } from "./enrichers";
import {
  calculateBatchProgress,
  filterAwardedBids,
  extractBidIds,
} from "./utils";
import { enrichBidsWithMilestones } from "./enrichers";

/**
 * Fetch payment details for awarded bids
 * @param {Array<number>} bidIds - Array of bid IDs
 * @param {Function} progressCallback - Callback for progress updates
 * @param {Function} logger - Logger function
 * @returns {Promise<Object>} - Object with milestone data and rate limits
 */
export async function fetchPaymentDetails(
  bidIds,
  progressCallback = () => {},
  logger = console.log
) {
  const log = typeof logger === "function" ? logger : console.log;

  try {
    log(`Fetching payment details for ${bidIds.length} bids`, "api");

    // Use the proper milestones endpoint according to the API documentation
    const endpoint = API_ENDPOINTS.MILESTONES;

    // Format the parameters according to API requirements - bids[] format
    const params = {
      "bids[]": bidIds, // This should send all bid IDs in a single request
    };

    const queryString = formatQueryParams(params);
    const requestUrl = `${endpoint}?${queryString}`;

    // Make the API request with all bid IDs in a single call
    log(`Making milestone API request with ${bidIds.length} bid IDs`, "api");
    const response = await monitoredApiRequest(requestUrl, {}, log);

    // Extract milestones from the response according to the documented structure
    let milestones = [];
    if (
      response &&
      response.data &&
      response.data.status === "success" &&
      response.data.result &&
      response.data.result.milestones
    ) {
      // Convert milestone object to array since API returns an object with IDs as keys
      milestones = Object.values(response.data.result.milestones);

      log(
        `Retrieved ${milestones.length} milestone records successfully`,
        "success"
      );

      // Process milestone data to match the required format - include only relevant fields
      milestones = formatMilestones(milestones);
    } else {
      log("No milestone data found in the response", "warning");
    }

    progressCallback(85, `Fetched payment details for ${bidIds.length} bids`);

    // Return both the milestone data and any rate limiting information
    return {
      data: milestones,
      rateLimits: response?.headers?.["x-ratelimit-remaining"]
        ? {
            remaining: response.headers["x-ratelimit-remaining"],
            reset: response.headers["x-ratelimit-reset"],
          }
        : {},
    };
  } catch (error) {
    log(`Error fetching payment details: ${error.message}`, "error");
    throw error;
  }
}

/**
 * Fetches payment details for awarded bids, handling batching if needed
 * @param {Array<Object>} bids Bid data containing bid IDs
 * @param {Function} progressCallback Progress update callback
 * @param {Function} logger Logger function
 * @returns {Promise<Object>} Enriched bid data with payment details
 */
export async function fetchAllPaymentDetails(
  bids,
  progressCallback = () => {},
  logger = console.log
) {
  const log = typeof logger === "function" ? logger : console.log;

  if (!bids || bids.length === 0) {
    log("No bids provided to fetchAllPaymentDetails", "warning");
    return { data: [], rateLimits: {} };
  }

  // Filter to only fetch for awarded bids according to the API guidance
  const awardedBids = filterAwardedBids(bids);

  if (awardedBids.length === 0) {
    log("No awarded bids to fetch payment details for", "info");
    return { data: bids, rateLimits: {} };
  }

  // Extract bid IDs properly, handling both bid.bid_id and bid.id formats
  const bidIds = extractBidIds(awardedBids);

  log(`Need to fetch payments for ${bidIds.length} awarded bids`, "info");
  progressCallback(
    70,
    `Fetching payment details for ${bidIds.length} awarded bids`
  );

  // Check if we need to batch the requests based on API limits
  let enrichedBids = [...bids];
  let allMilestones = []; // Initialize as empty array
  let lastRateLimits = {};

  try {
    // Create a separate variable for milestone response
    let milestoneResponse;

    if (needsBatching(bidIds, 50)) {
      // Assuming 50 is the max batch size
      const batches = batchItems(bidIds, 50);
      log(
        `Batching ${bidIds.length} bids into ${batches.length} requests`,
        "info"
      );

      let processedBatches = 0;

      for (const batch of batches) {
        milestoneResponse = await fetchPaymentDetails(
          batch,
          (progress, message) => {
            // Adjust the progress to reflect the overall process
            const overallProgress = calculateBatchProgress(
              70,
              processedBatches,
              batches.length,
              15
            );
            progressCallback(overallProgress, message);
          },
          log
        );

        lastRateLimits = milestoneResponse.rateLimits || {};

        // Use a separate variable for this batch's milestones
        const batchMilestones = milestoneResponse.data;

        // Check if milestones is an array before concatenating
        if (Array.isArray(batchMilestones)) {
          allMilestones = [...allMilestones, ...batchMilestones];
        } else {
          log(
            `Warning: batchMilestones is not an array in batch ${
              processedBatches + 1
            }, it's: ${typeof batchMilestones}`,
            "warning"
          );
        }

        // Update progress
        processedBatches++;
        const progress =
          70 + Math.round((processedBatches / batches.length) * 15);
        progressCallback(
          progress,
          `Fetched payment details: ${processedBatches}/${batches.length} batches (${batch.length} bids)`
        );

        // Add delay between batches to avoid rate limits
        if (processedBatches < batches.length) {
          await delay(1000);
        }
      }
    } else {
      // Small enough to fetch in one request
      milestoneResponse = await fetchPaymentDetails(
        bidIds,
        progressCallback,
        log
      );

      lastRateLimits = milestoneResponse.rateLimits || {};

      // Use a separate variable for clarity
      const fetchedMilestones = milestoneResponse.data;

      if (Array.isArray(fetchedMilestones)) {
        allMilestones = [...fetchedMilestones]; // Create a new array to avoid reference issues
      } else {
        log(
          `Warning: fetchedMilestones is not an array, it's: ${typeof fetchedMilestones}`,
          "warning"
        );
        allMilestones = []; // Reset to empty array to avoid issues
      }

      progressCallback(
        85,
        `Fetched payments for all ${bidIds.length} awarded bids`
      );
    }

    // Debug check before passing to enrichment function
    if (!Array.isArray(allMilestones)) {
      log(
        `ERROR: allMilestones is not an array before enrichment: ${typeof allMilestones}`,
        "error"
      );
      allMilestones = []; // Force it to be an empty array to avoid errors
    }

    // Add more detailed logging about the milestones we have
    log(`Fetched ${allMilestones.length} milestone/payment records`, "info");

    // Create a copy of allMilestones to prevent any reference issues
    const milestonesToEnrich = [...allMilestones];
    enrichedBids = enrichBidsWithMilestones(
      enrichedBids,
      milestonesToEnrich,
      log
    );

    progressCallback(
      100,
      `Payment details processing complete for ${bidIds.length} bids`
    );

    return {
      data: enrichedBids,
      rateLimits: lastRateLimits,
    };
  } catch (error) {
    log(`Error in fetchAllPaymentDetails: ${error.message}`, "error");
    log(`Error stack: ${error.stack}`, "error");

    // Return original bids if there was an error
    return {
      data: bids,
      rateLimits: lastRateLimits,
    };
  }
}
