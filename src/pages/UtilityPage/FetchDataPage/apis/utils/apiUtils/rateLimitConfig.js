/**
 * Rate limiting configuration
 * Adjust these settings based on your API usage patterns
 */
export const rateLimitConfig = {
  // Default settings
  default: {
    // How aggressive to be with throughput (0-1)
    // Higher means faster but more likely to hit limits
    aggressiveness: 0.7,

    // Maximum requests per endpoint per minute
    maxRequestsPerMinute: 45,

    // Batch size for endpoints that support it
    batchSize: 50,

    // Maximum concurrent requests
    concurrency: 3,
  },

  // Override settings for specific endpoints
  endpoints: {
    "projects/0.1/bids": {
      aggressiveness: 0.6,
      maxRequestsPerMinute: 40,
    },
    "milestones/0.1/milestones": {
      aggressiveness: 0.5, // More conservative
      maxRequestsPerMinute: 30,
    },
  },
};

/**
 * Get config for specific endpoint
 */
export function getEndpointConfig(endpoint) {
  // Extract endpoint path without query parameters
  const endpointPath = endpoint?.split("?")[0] || "";

  // Find matching endpoint config or use default
  for (const key of Object.keys(rateLimitConfig.endpoints)) {
    if (endpointPath.includes(key)) {
      return {
        ...rateLimitConfig.default,
        ...rateLimitConfig.endpoints[key],
      };
    }
  }

  return rateLimitConfig.default;
}

/**
 * Update the aggressiveness setting for all rate limiting
 */
export function setRateLimitAggressiveness(value) {
  rateLimitConfig.default.aggressiveness = value;

  // Also update all endpoint-specific configurations
  Object.keys(rateLimitConfig.endpoints).forEach((endpoint) => {
    rateLimitConfig.endpoints[endpoint].aggressiveness = value;
  });
}
