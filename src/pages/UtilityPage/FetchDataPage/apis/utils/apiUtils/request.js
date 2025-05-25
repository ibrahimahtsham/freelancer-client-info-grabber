import { apiRequest } from "../../../../../../apis/request";
import { trackApiCall } from "./tracking";
import { extractRateLimits, withRetry } from "./rateLimiting";
import { updateRateLimitState, smartDelay } from "./rateLimitManager";

/**
 * Monitored version of apiRequest that tracks API calls and handles rate limiting
 */
export async function monitoredApiRequest(
  endpoint,
  options = {},
  logger = console.log
) {
  const log = typeof logger === "function" ? logger : console.log;

  try {
    // Apply intelligent throttling based on previous rate limit data
    await smartDelay(endpoint, log);

    log(`API Request: ${endpoint}`, "api");
    const response = await apiRequest(endpoint, options);

    // Track the API call
    trackApiCall(endpoint, response);

    // Extract and parse rate limit info
    const rateLimits = extractRateLimits(response.headers);

    // Update dynamic rate limiting state with this response's headers
    updateRateLimitState(response.headers, endpoint);

    // Log warnings when getting close to limits
    if (rateLimits && rateLimits.remaining < 5) {
      log(
        `Rate limit warning: ${rateLimits.remaining}/${rateLimits.limit} remaining for ${endpoint}`,
        "warning"
      );
    }

    return {
      ...response,
      endpoint,
      rateLimits,
    };
  } catch (error) {
    trackApiCall(endpoint);

    // Check if this is a rate limit error (HTTP 429)
    if (error.status === 429) {
      log(`Rate limit exceeded for ${endpoint}. Backing off.`, "error");
      // Force rate limited status to true
      updateRateLimitState(
        {
          "ratelimit-remaining": "0",
          "ratelimit-limit": "50",
          "ratelimit-reset": "60",
        },
        endpoint
      );
    }

    log(`API Error (${endpoint}): ${error.message}`, "error");
    if (error.details)
      log(`Error details: ${JSON.stringify(error.details)}`, "error");

    throw error;
  }
}

/**
 * Retry API call with exponential backoff
 * @param {Function} apiCallFn - Function that makes the API call
 * @param {Object} options - Retry options
 * @returns {Promise<any>} - Result of the API call
 */
export function retryApiCall(apiCallFn, options = {}) {
  return withRetry(apiCallFn, options);
}

/**
 * Process API response to check for rate limiting
 * @param {Response} response - Fetch API Response object
 * @param {string} endpoint - API endpoint
 * @param {Function} logger - Optional logger function
 * @returns {Object} Processed response data with rate limit info
 */
export async function processApiResponse(
  response,
  endpoint,
  logger = console.log
) {
  // Track the API call
  trackApiCall(endpoint);

  // Extract rate limit headers
  const rateLimits = extractRateLimits(response.headers);
  if (rateLimits) {
    // Log if we're getting close to the rate limit
    if (rateLimits.remaining < 5) {
      logger(
        `Warning: API rate limit low - ${rateLimits.remaining} calls remaining`,
        "warning"
      );
    }
  }

  // Parse the response as JSON
  const data = await response.json();

  // Return structured result
  return {
    status: response.status,
    statusText: response.statusText,
    data,
    rateLimits,
    endpoint,
  };
}
