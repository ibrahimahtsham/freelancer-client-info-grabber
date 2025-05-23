/**
 * Filter bids to get only awarded or accepted ones
 * @param {Array} bids - Array of bid objects
 * @returns {Array} - Array of awarded/accepted bids
 */
export function filterAwardedBids(bids) {
  if (!bids || !Array.isArray(bids)) {
    return [];
  }

  return bids.filter((bid) =>
    ["awarded", "accepted"].includes(bid.award_status)
  );
}

/**
 * Extract bid IDs from bid objects
 * @param {Array} bids - Array of bid objects
 * @returns {Array} - Array of bid IDs
 */
export function extractBidIds(bids) {
  if (!bids || !Array.isArray(bids)) {
    return [];
  }

  return bids
    .map((bid) => bid.bid_id || bid.id)
    .filter((id) => id !== undefined);
}

/**
 * Calculate progress for batched operations
 * @param {number} baseProgress - Base progress percentage
 * @param {number} processedBatches - Number of processed batches
 * @param {number} totalBatches - Total number of batches
 * @param {number} progressRange - Progress range to distribute
 * @returns {number} - Calculated progress percentage
 */
export function calculateBatchProgress(
  baseProgress,
  processedBatches,
  totalBatches,
  progressRange = 15
) {
  return (
    baseProgress + Math.floor((processedBatches / totalBatches) * progressRange)
  );
}
