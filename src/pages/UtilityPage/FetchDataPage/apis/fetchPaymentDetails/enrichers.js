/**
 * Enriches bid data with milestone information
 * @param {Array} bids - Original bid data
 * @param {Array} milestones - Milestone data from API
 * @param {Function} logger - Logger function
 * @returns {Array} - Enriched bid data with milestone info
 */
export function enrichBidsWithMilestones(
  bids,
  milestones,
  logger = console.log
) {
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

/**
 * Format milestone data to the required structure
 * @param {Array} milestones - Raw milestone data from API
 * @returns {Array} - Formatted milestone data
 */
export function formatMilestones(milestones) {
  if (!Array.isArray(milestones)) {
    return [];
  }

  return milestones.map((milestone) => ({
    transaction_id: milestone.transaction_id,
    bid_id: milestone.bid_id,
    project_id: milestone.project_id,
    amount: milestone.amount,
    status: milestone.status,
    time_created: milestone.time_created,
    reason: milestone.reason,
    other_reason: milestone.other_reason,
  }));
}
