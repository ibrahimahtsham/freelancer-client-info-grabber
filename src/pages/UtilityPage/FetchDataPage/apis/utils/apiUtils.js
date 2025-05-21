import { apiRequest } from "../../../../../apis/request";

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
 * Utility functions for API call tracking and rate limiting
 */

// Global tracking of API calls
let apiCallsStats = {
  total: 0,
  endpoints: {},
  rateLimits: null,
  rateLimited: false,
};

/**
 * Reset API call statistics
 */
export function resetApiCallsStats() {
  apiCallsStats = {
    total: 0,
    endpoints: {},
    rateLimits: null,
    rateLimited: false,
  };
}

/**
 * Get the current API call statistics
 * @returns {Object} API call statistics
 */
export function getApiCallsStats() {
  return { ...apiCallsStats };
}

/**
 * Track an API call
 * @param {string} endpoint - The API endpoint called
 * @param {Object} response - Response object containing rate limit headers
 */
export function trackApiCall(endpoint, response = null) {
  // Increment total calls
  apiCallsStats.total++;

  // Track calls by endpoint
  if (!apiCallsStats.endpoints[endpoint]) {
    apiCallsStats.endpoints[endpoint] = 0;
  }
  apiCallsStats.endpoints[endpoint]++;

  // Track rate limits if available in response
  if (response && response.rateLimits) {
    apiCallsStats.rateLimits = { ...response.rateLimits };
  }
}

/**
 * Set rate limited status
 * @param {boolean} isLimited - Whether API is rate limited
 */
export function setRateLimited(isLimited) {
  apiCallsStats.rateLimited = !!isLimited;
}

/**
 * Delay function with exponential backoff for rate limiting
 * @param {number} ms - Base delay in milliseconds
 * @param {number} attempt - Current attempt number (for exponential backoff)
 * @param {Function} logger - Optional logger function
 * @returns {Promise<void>}
 */
export function delay(ms, attempt = 1, logger = console.log) {
  const backoffMs = attempt > 1 ? ms * Math.pow(1.5, attempt - 1) : ms;
  const cappedDelay = Math.min(backoffMs, 30000); // Cap at 30 seconds

  if (attempt > 1) {
    logger(
      `Rate limit delay: ${Math.round(
        cappedDelay / 1000
      )}s (attempt ${attempt})`,
      "rate_limit"
    );
    setRateLimited(true);
  }

  return new Promise((resolve) => setTimeout(resolve, cappedDelay));
}

/**
 * Helper to extract rate limit info from API response headers
 * @param {Object} headers - Response headers object
 * @returns {Object|null} Rate limit info or null if not available
 */
export function extractRateLimits(headers) {
  if (!headers) return null;

  const limit = headers["x-ratelimit-limit"]
    ? parseInt(headers["x-ratelimit-limit"], 10)
    : null;
  const remaining = headers["x-ratelimit-remaining"]
    ? parseInt(headers["x-ratelimit-remaining"], 10)
    : null;
  const reset = headers["x-ratelimit-reset"]
    ? parseInt(headers["x-ratelimit-reset"], 10)
    : null;

  if (limit !== null && remaining !== null) {
    return { limit, remaining, reset };
  }

  return null;
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
    apiCallsStats.rateLimits = rateLimits;

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

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {Object} options - Retry options
 * @returns {Promise<any>} - Result of the function
 */
export async function withRetry(fn, options = {}) {
  const { maxRetries = 3, baseDelay = 1000, maxDelay = 10000 } = options;

  let lastError = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Attempt to execute the function
      return await fn();
    } catch (error) {
      lastError = error;

      // If this was the last attempt, don't wait - just throw
      if (attempt >= maxRetries) {
        throw error;
      }

      // Check if we should retry based on error type
      const shouldRetry = isRetryableError(error);
      if (!shouldRetry) {
        throw error;
      }

      // Calculate delay with exponential backoff and jitter
      const delay = Math.min(
        baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
        maxDelay
      );

      // Wait before next attempt
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // This should never be reached due to the throw above
  throw lastError;
}

/**
 * Check if an error is retryable
 * @param {Error} error - The error to check
 * @returns {boolean} - Whether the error is retryable
 */
function isRetryableError(error) {
  // Retry on network errors, rate limiting, and server errors
  if (!error.response) {
    return true; // Network error
  }

  const status = error.response.status;

  // Rate limiting (429) or server errors (5xx)
  return status === 429 || (status >= 500 && status < 600);
}

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
