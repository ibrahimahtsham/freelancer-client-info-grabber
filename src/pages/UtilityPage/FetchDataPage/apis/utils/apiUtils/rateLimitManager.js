import { setRateLimited } from "./tracking";
import { getEndpointConfig } from "./rateLimitConfig";

// Track rate limits by endpoint
const rateLimitState = {
  global: {
    windowLimits: [],
    nextRequestTime: 0,
  },
  endpoints: {},
};

/**
 * Parse rate limit headers with support for multiple windows
 * Handles complex formats: "50, 50;window=60, 1000;window=3600"
 */
export function parseRateLimitHeaders(headers) {
  if (!headers) return [];

  const limitHeader = headers["ratelimit-limit"] || headers["RateLimit-Limit"];
  const remainingHeader =
    headers["ratelimit-remaining"] || headers["RateLimit-Remaining"];

  if (!limitHeader || !remainingHeader) return [];

  const remaining = parseInt(remainingHeader, 10);
  const limits = [];

  // Split complex limit header by commas
  const limitParts = limitHeader.split(",").map((part) => part.trim());

  limitParts.forEach((part) => {
    // Check if this part has a window definition
    const windowMatch = part.match(/(\d+);window=(\d+)/);

    if (windowMatch) {
      limits.push({
        limit: parseInt(windowMatch[1], 10),
        window: parseInt(windowMatch[2], 10), // in seconds
        remaining,
      });
    } else {
      // Basic limit without window specification
      limits.push({
        limit: parseInt(part, 10),
        window: 60, // Default to 60 seconds if not specified
        remaining,
      });
    }
  });

  return limits;
}

/**
 * Calculate optimal delay based on rate limits and aggressiveness setting
 */
export function calculateOptimalDelay(limits, endpoint = "") {
  if (!limits || !limits.length) return 0;

  // Get the aggressiveness factor (0.1 to 1.0)
  const config = getEndpointConfig(endpoint);
  const aggressiveness = config.aggressiveness || 0.7; // Default to 0.7 if not set

  let maxDelay = 0;

  limits.forEach((limit) => {
    if (limit.remaining <= 0) {
      // We're out of requests for this window
      const safeDelay = (limit.window * 1000) / limit.limit; // ms per request
      maxDelay = Math.max(maxDelay, safeDelay);
    } else if (limit.remaining < limit.limit * 0.1) {
      // Less than 10% remaining - slow down significantly
      // Higher aggressiveness = less delay
      const safeDelay =
        (limit.window * 1000) /
        (limit.limit * limit.remaining * (0.5 + aggressiveness * 0.5));
      maxDelay = Math.max(maxDelay, safeDelay * (1.5 - aggressiveness * 0.5));
    } else if (limit.remaining < limit.limit * 0.3) {
      // Less than 30% remaining - moderate slowdown
      // Adjust based on aggressiveness - more aggressive = less delay
      const safeDelay =
        (limit.window * 1000) / (limit.limit * (1 + aggressiveness));
      maxDelay = Math.max(maxDelay, safeDelay);
    } else {
      // Plenty of requests remaining, minimal delay based on aggressiveness
      // More aggressive = practically no delay
      const minDelay = (1 - aggressiveness) * 50; // 0-50ms based on aggressiveness
      maxDelay = Math.max(maxDelay, minDelay);
    }
  });

  // Add jitter to avoid synchronized requests
  // Scale jitter based on aggressiveness (less jitter for more aggressive settings)
  const jitter = Math.random() * (100 * (1.2 - aggressiveness));
  return maxDelay + jitter;
}

/**
 * Update rate limit state from API response headers
 */
export function updateRateLimitState(headers, endpoint) {
  if (!headers) return;

  const limits = parseRateLimitHeaders(headers);
  if (!limits.length) return;

  const now = Date.now();

  // Update specific endpoint limits
  if (!rateLimitState.endpoints[endpoint]) {
    rateLimitState.endpoints[endpoint] = {
      windowLimits: [],
      nextRequestTime: 0,
    };
  }

  // Update with new limits
  rateLimitState.endpoints[endpoint].windowLimits = limits;

  // Calculate when the next request should be made
  const delay = calculateOptimalDelay(limits, endpoint);
  rateLimitState.endpoints[endpoint].nextRequestTime = now + delay;

  // Also update global state
  rateLimitState.global.windowLimits = limits;
  rateLimitState.global.nextRequestTime = Math.max(
    rateLimitState.global.nextRequestTime,
    now + delay * 0.8 // Slightly shorter for global to allow for endpoint-specific throttling
  );

  // Update rate limited status if very close to limit
  const isLimited = limits.some((limit) => limit.remaining <= 2);
  setRateLimited(isLimited);
}

/**
 * Get recommended delay before next API call
 * @param {string} endpoint - API endpoint
 * @returns {number} Recommended delay in milliseconds
 */
export function getRecommendedDelay(endpoint) {
  const now = Date.now();
  let recommendedDelay = 0;

  // Check endpoint-specific limits
  if (rateLimitState.endpoints[endpoint]) {
    const endpointState = rateLimitState.endpoints[endpoint];

    // Calculate delay based on time until next request
    if (now < endpointState.nextRequestTime) {
      recommendedDelay = Math.max(
        recommendedDelay,
        endpointState.nextRequestTime - now
      );
    }

    // Also calculate based on window limits if available
    if (endpointState.windowLimits && endpointState.windowLimits.length) {
      const dynamicDelay = calculateOptimalDelay(endpointState.windowLimits);
      recommendedDelay = Math.max(recommendedDelay, dynamicDelay);
    }
  }

  // Also check global state
  if (now < rateLimitState.global.nextRequestTime) {
    recommendedDelay = Math.max(
      recommendedDelay,
      rateLimitState.global.nextRequestTime - now
    );
  }

  // Add endpoint-specific logic if needed
  if (endpoint.includes("milestones")) {
    // Add extra delay for high-volume endpoints
    recommendedDelay += 200;
  }

  return recommendedDelay;
}

/**
 * Determine if we should delay the next request based on rate limits
 */
export function shouldDelayNextRequest(endpoint) {
  const now = Date.now();

  // Check endpoint-specific delay
  if (
    rateLimitState.endpoints[endpoint] &&
    now < rateLimitState.endpoints[endpoint].nextRequestTime
  ) {
    return {
      shouldDelay: true,
      delayMs: rateLimitState.endpoints[endpoint].nextRequestTime - now,
    };
  }

  // Check global delay
  if (now < rateLimitState.global.nextRequestTime) {
    return {
      shouldDelay: true,
      delayMs: rateLimitState.global.nextRequestTime - now,
    };
  }

  return { shouldDelay: false, delayMs: 0 };
}

/**
 * Smart delay function that adapts to rate limits
 */
export async function smartDelay(endpoint, logger = console.log) {
  const { shouldDelay, delayMs } = shouldDelayNextRequest(endpoint);

  if (shouldDelay && delayMs > 100) {
    // Only log significant delays
    const delaySeconds = Math.round(delayMs / 100) / 10;
    logger(
      `Rate limit throttling: waiting ${delaySeconds}s before next ${endpoint
        .split("/")
        .pop()} request`,
      "throttle"
    );
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return true;
  }

  return false;
}

// Add an alias for calculateOptimalDelay -> calculateDynamicDelay
// This fixes the export error without breaking existing code
export const calculateDynamicDelay = calculateOptimalDelay;
