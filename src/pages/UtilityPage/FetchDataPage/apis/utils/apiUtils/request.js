import { apiRequest } from "../../../../../../apis/request";
import { trackApiCall } from "./tracking";
import { extractRateLimits, withRetry } from "./rateLimiting";

/**
 * Monitored version of apiRequest that tracks API calls and handles rate limiting
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Request options
 * @param {Function} logger - Optional logger function
 * @returns {Promise<Object>} API response with additional metadata
 */
export async function monitoredApiRequest(
  endpoint,
  options = {},
  logger = console.log
) {
  // Ensure logger is a function
  const log = typeof logger === "function" ? logger : console.log;

  try {
    log(`API Request: ${endpoint}`, "api");

    // Debug log the request details
    const baseUrl = "https://www.freelancer.com/api/";
    const fullUrl = endpoint.startsWith("http")
      ? endpoint
      : `${baseUrl}${endpoint}`;
    log(`Full URL: ${fullUrl}`, "debug");

    // Make the API call
    const response = await apiRequest(endpoint, options);

    // Track the API call
    trackApiCall(endpoint, response);

    // Extract rate limit info if available
    const rateLimits = extractRateLimits(response.headers);

    // Check for rate limiting
    if (rateLimits && rateLimits.remaining < 5) {
      log(
        `Rate limit warning: ${rateLimits.remaining}/${rateLimits.limit} remaining`,
        "warning"
      );
    }

    // Return enhanced response object
    return {
      ...response,
      endpoint,
      rateLimits,
    };
  } catch (error) {
    // Track failed call
    trackApiCall(endpoint);

    // Enhanced error logging
    log(`API Error (${endpoint}): ${error.message}`, "error");

    // Log additional error details if available
    if (error.status) {
      log(`Status code: ${error.status}`, "error");
    }

    if (error.details) {
      log(`Error details: ${JSON.stringify(error.details)}`, "error");
    }

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
