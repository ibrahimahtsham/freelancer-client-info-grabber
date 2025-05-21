import { API_ENDPOINTS } from "../../../../constants";
import {
  monitoredApiRequest,
  batchItems,
  needsBatching,
  formatQueryParams,
  delay,
} from "./utils/apiUtils";
import { enrichWithMilestoneData } from "./utils/dataTransformers";

/**
 * Fetch payment details for awarded bids
 * @param {Array<number>} bidIds - Array of bid IDs
 * @param {Function} progressCallback - Callback for progress updates
 * @param {Function} logger - Logger function
 * @returns {Promise<Array>} - Array of payment/milestone information
 */
export async function fetchPaymentDetails(
  bidIds,
  progressCallback = () => {},
  logger = console.log
) {
  // Ensure logger is a function
  const log = typeof logger === "function" ? logger : console.log;

  try {
    log(`Fetching payment details for ${bidIds.length} bids`, "api");

    // Process bids in batches or individually based on API requirements
    const milestones = [];
    let processedCount = 0;

    // For each bid, fetch its milestones
    for (let i = 0; i < bidIds.length; i++) {
      const bidId = bidIds[i];

      try {
        // Make API request to get milestones for this bid
        const params = {};
        params["bids[]"] = [bidId]; // Use correct parameter name with []

        const queryString = formatQueryParams(params);
        const endpoint = `projects/0.1/milestones/?${queryString}`;
        const response = await monitoredApiRequest(endpoint, {}, log);

        if (
          response.data &&
          response.data.result &&
          response.data.result.milestones
        ) {
          const bidMilestones = response.data.result.milestones;

          // Add bid ID to each milestone for reference
          bidMilestones.forEach((milestone) => {
            milestone.bid_id = bidId;
            milestones.push(milestone);
          });
        }
      } catch (milestoneError) {
        log(
          `Error fetching milestones for bid ${bidId}: ${milestoneError.message}`,
          "error"
        );
        // Continue with next bid even if this one fails
      }

      // Update processed count and progress
      processedCount++;
      const progressPercent =
        70 + Math.floor((processedCount / bidIds.length) * 15);

      if (i % 5 === 0 || i === bidIds.length - 1) {
        progressCallback(
          progressPercent,
          `Fetched payment info for ${processedCount}/${bidIds.length} awarded bids`
        );
      }
    }

    log(
      `Fetched ${milestones.length} payment records across ${processedCount} bids`,
      "success"
    );
    return milestones;
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
  progressCallback,
  logger = console.log
) {
  if (!bids || bids.length === 0) {
    return { data: [], rateLimits: {} };
  }

  // Filter to only fetch for awarded bids
  const awardedBids = bids.filter((bid) =>
    ["awarded", "accepted"].includes(bid.award_status)
  );

  if (awardedBids.length === 0) {
    logger("No awarded bids to fetch payment details for", "info");
    return { data: bids, rateLimits: {} };
  }

  // Extract bid IDs from awarded bids
  const bidIds = awardedBids.map((bid) => bid.bid_id);

  logger(`Need to fetch payments for ${bidIds.length} awarded bids`, "info");

  // Check if we need to batch the requests
  let enrichedBids = [...bids];
  let lastRateLimits = {};

  if (needsBatching(bidIds)) {
    const batches = batchItems(bidIds);
    logger(
      `Batching ${bidIds.length} bids into ${batches.length} requests`,
      "info"
    );

    let processedBatches = 0;

    for (const batch of batches) {
      const { data, rateLimits } = await fetchPaymentDetails(batch, logger);
      lastRateLimits = rateLimits;

      // Enrich the bid data with payment details
      enrichedBids = enrichWithMilestoneData(enrichedBids, data);

      // Update progress
      processedBatches++;
      if (progressCallback) {
        const progress = Math.round((processedBatches / batches.length) * 100);
        progressCallback(
          progress,
          `Fetched payment details: ${processedBatches}/${batches.length} batches (${batch.length} bids)`
        );
      }

      // Add delay between batches to avoid rate limits
      if (processedBatches < batches.length) {
        await delay(1000);
      }
    }
  } else {
    // Small enough to fetch in one request
    const { data, rateLimits } = await fetchPaymentDetails(bidIds, logger);
    lastRateLimits = rateLimits;

    // Enrich the bid data with payment details
    enrichedBids = enrichWithMilestoneData(enrichedBids, data);

    if (progressCallback) {
      progressCallback(
        100,
        `Fetched payments for all ${bidIds.length} awarded bids`
      );
    }
  }

  return {
    data: enrichedBids,
    rateLimits: lastRateLimits,
  };
}
