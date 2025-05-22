import { API_ENDPOINTS } from "../../../../constants";
import {
  monitoredApiRequest,
  batchItems,
  needsBatching,
  formatQueryParams,
  delay,
} from "./utils/apiUtils";

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
      milestones = milestones.map((milestone) => ({
        transaction_id: milestone.transaction_id,
        bid_id: milestone.bid_id,
        project_id: milestone.project_id,
        amount: milestone.amount,
        status: milestone.status,
        time_created: milestone.time_created,
        reason: milestone.reason,
        other_reason: milestone.other_reason,
      }));
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
  const awardedBids = bids.filter((bid) =>
    ["awarded", "accepted"].includes(bid.award_status)
  );

  if (awardedBids.length === 0) {
    log("No awarded bids to fetch payment details for", "info");
    return { data: bids, rateLimits: {} };
  }

  // Extract bid IDs properly, handling both bid.bid_id and bid.id formats
  const bidIds = awardedBids
    .map((bid) => bid.bid_id || bid.id)
    .filter((id) => id !== undefined);

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
            const overallProgress =
              70 + Math.floor((processedBatches / batches.length) * 15);
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

/**
 * Enriches bid data with milestone information
 * @param {Array} bids - Original bid data
 * @param {Array} milestones - Milestone data from API
 * @param {Function} logger - Logger function
 * @returns {Array} - Enriched bid data with milestone info
 */
function enrichBidsWithMilestones(bids, milestones, logger = console.log) {
  const log = typeof logger === "function" ? logger : console.log;

  // Check if milestones is valid
  if (!milestones) {
    log("Milestones parameter is null or undefined", "warning");
    return bids;
  }

  if (!Array.isArray(milestones)) {
    log(
      `Milestones parameter is not an array, it's: ${typeof milestones}`,
      "warning"
    );
    return bids;
  }

  if (milestones.length === 0) {
    log("Milestones array is empty", "info");
    return bids;
  }

  log(
    `Enriching ${bids.length} bids with ${milestones.length} milestones`,
    "info"
  );

  try {
    // Group milestones by bid_id
    const milestonesByBid = {};

    // Iterate through milestones and group by bid_id
    for (let i = 0; i < milestones.length; i++) {
      const milestone = milestones[i];
      if (!milestone || !milestone.bid_id) {
        continue;
      }

      if (!milestonesByBid[milestone.bid_id]) {
        milestonesByBid[milestone.bid_id] = [];
      }
      milestonesByBid[milestone.bid_id].push(milestone);
    }

    // Enrich each bid with its milestone data
    const enrichedBids = bids.map((bid) => {
      // Check for both bid_id and id formats
      const bidId = bid.bid_id || bid.id;

      if (!bidId) {
        log(`Warning: Bid has no ID: ${JSON.stringify(bid)}`, "warning");
        return bid;
      }

      // Include both sources of milestones - directly attached to bid AND from milestonesByBid
      const bidMilestones = bid.milestones || milestonesByBid[bidId] || [];

      // Calculate total milestone amount
      let totalAmount = 0;
      for (let i = 0; i < bidMilestones.length; i++) {
        const milestone = bidMilestones[i];
        if (milestone && milestone.status === "cleared") {
          const amount =
            typeof milestone.amount === "number"
              ? milestone.amount
              : parseFloat(milestone.amount) || 0;
          totalAmount += amount;
        }
      }

      // Create an enriched bid with milestone data
      return {
        ...bid,
        milestones: bidMilestones,
        total_milestone_amount: totalAmount,
        paid_amount: totalAmount || bid.paid_amount || 0,
      };
    });

    return enrichedBids;
  } catch (error) {
    log(`Error in enrichBidsWithMilestones: ${error.message}`, "error");
    log(`Error stack: ${error.stack}`, "error");
    // Return original bids if there's an error
    return bids;
  }
}
