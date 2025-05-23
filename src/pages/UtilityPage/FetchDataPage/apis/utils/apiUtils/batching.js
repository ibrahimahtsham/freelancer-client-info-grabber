/**
 * Check if we need to batch API calls
 * @param {Array} items - Items to check
 * @param {number} batchSize - Batch size
 * @returns {boolean} Whether batching is needed
 */
export function needsBatching(items, batchSize = 50) {
  return items && items.length > batchSize;
}

/**
 * Batch array items for API calls
 * @param {Array} items - Items to batch
 * @param {Function} processFn - Function to process each batch
 * @param {number} batchSize - Batch size
 * @returns {Promise<Array>} - Results from all batches
 */
export async function batchItems(items, processFn, batchSize = 10) {
  const results = [];
  const batches = [];

  // Split items into batches
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }

  // Process each batch
  for (const batch of batches) {
    const batchResults = await processFn(batch);
    results.push(...batchResults);
  }

  return results;
}

/**
 * Format query parameters correctly for API requests
 * @param {Object} params - Parameters object
 * @returns {string} - Correctly formatted query string
 */
export function formatQueryParams(params) {
  const queryParts = [];

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      // Handle arrays correctly - use multiple parameters with same name
      for (const item of value) {
        // Key already has [] at the end, don't add it again
        if (key.endsWith("[]")) {
          queryParts.push(`${key}=${encodeURIComponent(item)}`);
        } else {
          queryParts.push(`${key}[]=${encodeURIComponent(item)}`);
        }
      }
    } else if (value !== null && value !== undefined) {
      queryParts.push(
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
      );
    }
  }

  return queryParts.join("&");
}
