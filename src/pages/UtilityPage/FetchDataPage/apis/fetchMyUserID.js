import { monitoredApiRequest } from "./utils/apiUtils";
import { API_ENDPOINTS } from "../../../../constants";

// Cache the user ID to avoid redundant API calls
let cachedUserId = null;

/**
 * Fetch the current user's ID
 * @param {Function} logger - Logger function
 * @returns {Promise<number>} - User ID
 */
export async function fetchMyUserId(logger = console.log) {
  // Ensure logger is a function
  const log = typeof logger === "function" ? logger : console.log;

  try {
    // Return cached value if available
    if (cachedUserId) {
      log("Using cached user ID", "info");
      return cachedUserId;
    }

    log("Fetching current user ID", "api");

    // Make API request
    const endpoint = API_ENDPOINTS.SELF;
    const response = await monitoredApiRequest(endpoint, {}, log);

    if (!response.data || !response.data.result || !response.data.result.id) {
      throw new Error("Could not retrieve user ID from API response");
    }

    // Cache the result
    cachedUserId = response.data.result.id;
    log(`User ID: ${cachedUserId}`, "info");

    return cachedUserId;
  } catch (error) {
    log(`Error fetching user ID: ${error.message}`, "error");
    throw error;
  }
}

/**
 * Reset the cached user ID
 */
export function resetCachedUserId() {
  cachedUserId = null;
}
