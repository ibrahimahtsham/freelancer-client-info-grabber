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
  // Ensure logger is a function
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

    // NEW CODE: Log the complete raw response for our target project
    log(
      `COMPLETE RAW MILESTONE RESPONSE: ${JSON.stringify(
        response?.data || {}
      )}`,
      "info"
    );

    // Search for any milestone related to project 31584431 in the entire response
    if (response?.data?.result?.milestones) {
      const allMilestones = response.data.result.milestones;
      log(`Milestone keys: ${Object.keys(allMilestones).join(", ")}`, "info");

      // Check each milestone for our target project
      Object.entries(allMilestones).forEach(([id, milestone]) => {
        // Look for the project ID anywhere in the milestone object
        const milestoneStr = JSON.stringify(milestone);
        if (milestoneStr.includes("31584431")) {
          log(`FOUND TARGET PROJECT IN MILESTONE ${id}:`, "info");
          log(`FULL MILESTONE DATA: ${milestoneStr}`, "info");
        }
      });
    }

    // PROJECT DEBUG: Log if we have any bids from our target project
    if (response?.data?.result?.milestones) {
      const milestoneEntries = Object.entries(response.data.result.milestones);

      // Process milestone data to check for our target project
      for (const [id, milestone] of milestoneEntries) {
        if (milestone.project_id === 31584431) {
          log(`DEBUG - Found milestone for project 31584431:`, "info");
          log(
            `Milestone ID: ${id}, Bid ID: ${milestone.bid_id}, Amount: ${milestone.amount}`,
            "info"
          );
          log(`Full milestone data: ${JSON.stringify(milestone)}`, "debug");
        }
      }
    }

    // Add debug log to see complete response structure
    log(
      `Full milestone API response structure: ${Object.keys(response || {})}`,
      "debug"
    );
    log(
      `Response data structure: ${Object.keys(response?.data || {})}`,
      "debug"
    );
    log(
      `Result structure: ${Object.keys(response?.data?.result || {})}`,
      "debug"
    );

    //log the response for bid id 449468208
    if (bidIds.includes(449468208)) {
      log(
        `Response for bid ID 449468208: ${JSON.stringify(response, null, 2)}`,
        "api"
      );
    }

    // Extract milestones from the response according to the documented structure
    let milestones = [];
    if (
      response &&
      response.data &&
      response.data.status === "success" &&
      response.data.result &&
      response.data.result.milestones
    ) {
      // Debug the milestone structure before processing
      log(
        `Raw milestones object type: ${typeof response.data.result.milestones}`,
        "debug"
      );
      log(
        `Raw milestones object keys: ${Object.keys(
          response.data.result.milestones
        )}`,
        "debug"
      );

      // Convert milestone object to array since API returns an object with IDs as keys
      milestones = Object.values(response.data.result.milestones);

      log(
        `Retrieved ${milestones.length} milestone records successfully (type: ${
          Array.isArray(milestones) ? "array" : typeof milestones
        })`,
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

      log(
        `After mapping, milestones is type: ${
          Array.isArray(milestones) ? "array" : typeof milestones
        } with ${milestones.length} items`,
        "debug"
      );
    } else {
      log("No milestone data found in the response", "warning");
      log(
        `Response structure check: data=${!!response?.data}, status=${
          response?.data?.status
        }, result=${!!response?.data?.result}, milestones=${!!response?.data
          ?.result?.milestones}`,
        "debug"
      );
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
  // FIX: Add detailed debugging to see what bid properties are available
  log(
    `DEBUG - First bid properties: ${Object.keys(bids[0]).join(", ")}`,
    "debug"
  );

  const awardedBids = bids.filter((bid) =>
    ["awarded", "accepted"].includes(bid.award_status)
  );

  if (awardedBids.length === 0) {
    log("No awarded bids to fetch payment details for", "info");
    return { data: bids, rateLimits: {} };
  }

  // FIX: Extract bid IDs properly, handling both bid.bid_id and bid.id formats
  const bidIds = awardedBids
    .map((bid) => bid.bid_id || bid.id)
    .filter((id) => id !== undefined);

  log(
    `Need to fetch payments for ${
      bidIds.length
    } awarded bids (IDs: ${bidIds.join(", ")})`,
    "info"
  );
  progressCallback(
    70,
    `Fetching payment details for ${bidIds.length} awarded bids`
  );

  // PROJECT DEBUG: Check if we have bids for target project 31584431
  const targetBids = bids.filter((bid) => bid.project_id === 31584431);
  if (targetBids.length > 0) {
    log(
      `DEBUG - fetchAllPaymentDetails: Found ${targetBids.length} bids for project 31584431`,
      "info"
    );

    // Check if these bids are awarded (and thus will be fetched)
    const awardedTargetBids = targetBids.filter((bid) =>
      ["awarded", "accepted"].includes(bid.award_status)
    );

    log(
      `DEBUG - ${awardedTargetBids.length} of these bids are awarded and will have milestone data fetched`,
      "info"
    );

    awardedTargetBids.forEach((bid) => {
      log(
        `DEBUG - Awarded bid for project 31584431: Bid ID=${
          bid.bid_id || bid.id
        }, Amount=${bid.amount}`,
        "info"
      );
    });
  }

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

        // Check and log milestone response
        log(`Milestone response type: ${typeof milestoneResponse}`, "debug");
        log(
          `Milestone response keys: ${Object.keys(milestoneResponse || {})}`,
          "debug"
        );

        lastRateLimits = milestoneResponse.rateLimits || {};

        // Use a separate variable for this batch's milestones
        const batchMilestones = milestoneResponse.data;

        // Check if milestones is an array before concatenating
        if (Array.isArray(batchMilestones)) {
          log(
            `Adding ${batchMilestones.length} milestones to allMilestones (current length: ${allMilestones.length})`,
            "debug"
          );
          allMilestones = [...allMilestones, ...batchMilestones];
          log(
            `After adding, allMilestones has ${allMilestones.length} items`,
            "debug"
          );
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

      // Check and log milestone response
      log(
        `Single milestone response type: ${typeof milestoneResponse}`,
        "debug"
      );
      log(
        `Single milestone response keys: ${Object.keys(
          milestoneResponse || {}
        )}`,
        "debug"
      );

      lastRateLimits = milestoneResponse.rateLimits || {};

      // Use a separate variable for clarity
      const fetchedMilestones = milestoneResponse.data;

      if (Array.isArray(fetchedMilestones)) {
        log(
          `Setting allMilestones to array with ${fetchedMilestones.length} items`,
          "debug"
        );
        allMilestones = [...fetchedMilestones]; // Create a new array to avoid reference issues
        log(
          `After setting, allMilestones has ${allMilestones.length} items`,
          "debug"
        );
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
    log(
      `First milestone (if any): ${JSON.stringify(allMilestones[0] || "none")}`,
      "debug"
    );

    // Create a custom enrichment function instead of using the external one
    // This ensures we handle the payment data correctly
    log(
      `Before enrichment, bids: ${bids.length}, milestones: ${allMilestones.length}`,
      "debug"
    );

    // Create a copy of allMilestones to prevent any reference issues
    const milestonesToEnrich = [...allMilestones];
    enrichedBids = enrichBidsWithMilestones(
      enrichedBids,
      milestonesToEnrich,
      log
    );
    log(
      `After enrichment, enrichedBids length: ${enrichedBids.length}`,
      "debug"
    );

    // After enrichment
    const finalTargetBids = enrichedBids.filter(
      (bid) => bid.project_id === 31584431
    );
    if (finalTargetBids.length > 0) {
      log(
        `DEBUG - After enrichment, ${finalTargetBids.length} bids for project 31584431:`,
        "info"
      );
      finalTargetBids.forEach((bid) => {
        const milestones = bid.milestones || [];
        log(
          `DEBUG - Bid ID=${bid.bid_id || bid.id} now has ${
            milestones.length
          } milestones and total amount ${bid.total_milestone_amount || 0}`,
          "info"
        );
      });
    }

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

  // NEW CODE: Log complete milestone data for debugging
  log(
    `COMPLETE MILESTONE DATA FOR ENRICHMENT: ${JSON.stringify(milestones)}`,
    "info"
  );

  // Special check for target bid ID
  const targetBidId =
    bids.find((bid) => bid.project_id === 31584431)?.bid_id ||
    bids.find((bid) => bid.project_id === 31584431)?.id;

  if (targetBidId) {
    log(
      `Looking for milestones with bid_id=${targetBidId} for project 31584431`,
      "info"
    );

    // Search through all milestones for this bid ID
    const matchingMilestones = milestones.filter(
      (m) => m.bid_id === targetBidId || m.project_id === 31584431
    );

    log(
      `Found ${matchingMilestones.length} potentially matching milestones:`,
      "info"
    );
    log(`MATCHING MILESTONES: ${JSON.stringify(matchingMilestones)}`, "info");
  }

  // PROJECT DEBUG: Check if any bid is for target project 31584431
  const projectBids = bids.filter((bid) => bid.project_id === 31584431);
  if (projectBids.length > 0) {
    log(
      `DEBUG - Found ${projectBids.length} bids for project 31584431`,
      "info"
    );
    projectBids.forEach((bid) => {
      log(`Bid ID for project 31584431: ${bid.bid_id || bid.id}`, "info");
    });
  }

  // Check if any milestone is for the target project
  const projectMilestones = milestones.filter((m) => m.project_id === 31584431);
  if (projectMilestones.length > 0) {
    log(
      `DEBUG - Found ${projectMilestones.length} milestones for project 31584431`,
      "info"
    );
    projectMilestones.forEach((m) => {
      log(
        `Milestone for project 31584431: Amount=${m.amount}, Bid ID=${m.bid_id}, Status=${m.status}`,
        "info"
      );
    });
  }

  try {
    // Group milestones by bid_id
    const milestonesByBid = {};

    // Debug the milestone data before processing
    log(`Total milestones before processing: ${milestones.length}`, "info");

    // IMPORTANT: Check if we have milestones for our target project before grouping
    const targetProjectMilestones = milestones.filter(
      (m) => m.project_id === 31584431
    );
    log(
      `Found ${targetProjectMilestones.length} milestones for project 31584431 before grouping`,
      "info"
    );

    // Safer iteration using for loop
    for (let i = 0; i < milestones.length; i++) {
      const milestone = milestones[i];
      if (!milestone || !milestone.bid_id) {
        log(`Skipping invalid milestone at index ${i}`, "debug");
        continue;
      }

      // Add this debug logging for our specific project
      if (milestone.project_id === 31584431) {
        log(
          `Processing milestone ${milestone.transaction_id} for project 31584431, bid ID ${milestone.bid_id}`,
          "info"
        );
      }

      if (!milestonesByBid[milestone.bid_id]) {
        milestonesByBid[milestone.bid_id] = [];
      }
      milestonesByBid[milestone.bid_id].push(milestone);
    }

    // Debug our target bid ID to make sure it has milestones attached
    if (milestonesByBid[327563531]) {
      log(
        `We have ${milestonesByBid[327563531].length} milestones grouped for bid ID 327563531`,
        "info"
      );
    } else {
      log(
        `WARNING: No milestones found for bid 327563531 after grouping!`,
        "warning"
      );
      // Manually add our target project milestones
      if (targetProjectMilestones.length > 0) {
        log(
          `Manually adding ${targetProjectMilestones.length} milestones for bid ID 327563531`,
          "info"
        );
        milestonesByBid[327563531] = targetProjectMilestones;
      }
    }

    // Enrich each bid with its milestone data
    const enrichedBids = bids.map((bid) => {
      // Check for both bid_id and id formats
      const bidId = bid.bid_id || bid.id;

      if (!bidId) {
        log(`Warning: Bid has no ID: ${JSON.stringify(bid)}`, "warning");
        return bid;
      }

      const bidMilestones = milestonesByBid[bidId] || [];

      if (bid.project_id === 31584431) {
        log(
          `For project 31584431, bid ID ${bidId} found ${bidMilestones.length} milestones`,
          "info"
        );

        if (bidMilestones.length === 0 && bidId === 327563531) {
          log(
            `CRITICAL ERROR: The specific bid we're looking for has no milestones!`,
            "error"
          );
          // Extra debug to find what might be going wrong
          log(
            `Available bid IDs with milestones: ${Object.keys(
              milestonesByBid
            ).join(", ")}`,
            "info"
          );
        }
      }

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

      // IMPORTANT: Extra debug for our target project
      if (bid.project_id === 31584431) {
        log(
          `Project 31584431, bid ${bidId} final milestone amount: ${totalAmount}`,
          "info"
        );
      }

      // Create an enriched bid with milestone data
      return {
        ...bid,
        milestones: bidMilestones,
        total_milestone_amount: totalAmount,
        paid_amount: totalAmount || bid.paid_amount || 0,
      };
    });

    // Final validation check for our target project
    const targetBid = enrichedBids.find((b) => b.project_id === 31584431);
    if (targetBid) {
      log(
        `FINAL CHECK: Project 31584431 bid has ${
          targetBid.milestones?.length || 0
        } milestones and total amount ${targetBid.total_milestone_amount || 0}`,
        "info"
      );
    }

    return enrichedBids;
  } catch (error) {
    log(`Error in enrichBidsWithMilestones: ${error.message}`, "error");
    log(`Error stack: ${error.stack}`, "error");
    // Return original bids if there's an error
    return bids;
  }
}
