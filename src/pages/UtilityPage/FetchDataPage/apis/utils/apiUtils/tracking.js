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
