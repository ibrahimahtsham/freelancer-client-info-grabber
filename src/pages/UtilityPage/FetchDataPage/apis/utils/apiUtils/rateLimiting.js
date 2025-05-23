import { setRateLimited } from "./tracking";

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
 * Check if an error is retryable
 * @param {Error} error - The error to check
 * @returns {boolean} - Whether the error is retryable
 */
export function isRetryableError(error) {
  // Retry on network errors, rate limiting, and server errors
  if (!error.response) {
    return true; // Network error
  }

  const status = error.response.status;

  // Rate limiting (429) or server errors (5xx)
  return status === 429 || (status >= 500 && status < 600);
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
