import { monitoredApiRequest } from "../../FetchDataPage/apis/utils/apiUtils";
import { API_ENDPOINTS } from "../../../../constants";

// Cache various pieces of user data
let cachedUserId = null;
let cachedUserDevices = null;
let cachedReputationData = null;
let cachedProfileData = null;
let cachedUserDetails = null;

/**
 * Fetch the current user's ID and enhanced profile data
 * @param {Function} logger - Logger function
 * @returns {Promise<number>} - User ID
 */
export async function fetchUserId(logger = console.log) {
  const log = typeof logger === "function" ? logger : console.log;

  try {
    if (cachedUserId) {
      return cachedUserId;
    }

    log("Fetching current user ID", "api");

    // Build the query params with URLSearchParams for better control
    const queryParams = new URLSearchParams();
    queryParams.append("avatar", "true");
    queryParams.append("country_details", "true");
    queryParams.append("profile_description", "true");
    queryParams.append("display_info", "true");
    queryParams.append("jobs", "true");
    queryParams.append("qualification_details", "true");
    queryParams.append("badge_details", "true");
    queryParams.append("status", "true");
    queryParams.append("reputation", "true");
    queryParams.append("reputation_extra", "true"); // Add extra reputation data
    queryParams.append("employer_reputation", "true");
    queryParams.append("employer_reputation_extra", "true"); // Add extra employer reputation

    // Create endpoint with query string
    const endpoint = `users/0.1/self?${queryParams.toString()}`;

    // Request enhanced data from self endpoint
    const response = await monitoredApiRequest(
      endpoint,
      {}, // No extra params since we built them into the endpoint
      log
    );

    if (!response.data?.result?.id) {
      throw new Error("Could not retrieve user ID from API response");
    }

    // Cache the enhanced profile data too
    cachedProfileData = response.data.result;
    cachedUserId = response.data.result.id;

    log(`User ID: ${cachedUserId}`, "info");
    return cachedUserId;
  } catch (error) {
    log(`Error fetching user ID: ${error.message}`, "error");
    throw error;
  }
}

/**
 * Fetch user devices data
 * @param {Function} logger - Logger function
 * @returns {Promise<Object>} - Device data
 */
export async function fetchUserDevices(logger = console.log) {
  const log = typeof logger === "function" ? logger : console.log;

  try {
    if (cachedUserDevices) {
      return cachedUserDevices;
    }

    log("Fetching user devices data", "api");
    const response = await monitoredApiRequest(
      "users/0.1/self/devices",
      {},
      log
    );

    if (!response.data?.result) {
      return { devices: [] }; // Return empty array if no devices
    }

    cachedUserDevices = response.data.result;
    return cachedUserDevices;
  } catch (error) {
    log(`Error fetching user devices: ${error.message}`, "error");
    return { devices: [] }; // Return empty array on error
  }
}

/**
 * Fetch user reputation data
 * @param {number} userId - User ID
 * @param {Function} logger - Logger function
 * @returns {Promise<Object>} - Reputation data
 */
export async function fetchUserReputation(userId, logger = console.log) {
  const log = typeof logger === "function" ? logger : console.log;

  try {
    if (cachedReputationData) {
      return cachedReputationData;
    }

    log("Fetching user reputation data", "api");

    // FIXED: The issue is in how the parameter is formatted
    // The API expects the parameter to be formatted as an array
    // Let's use the URLSearchParams approach to ensure correct encoding
    const queryParams = new URLSearchParams();
    queryParams.append("users[]", userId);
    queryParams.append("job_history", "true");
    queryParams.append("project_stats", "true");
    queryParams.append("rehire_rates", "true");

    // Create endpoint with query string directly
    const endpoint = `users/0.1/reputations?${queryParams.toString()}`;

    const response = await monitoredApiRequest(
      endpoint,
      {}, // No extra params since we built them into the endpoint
      log
    );

    if (!response.data?.result?.users || !response.data.result.users[userId]) {
      log(`No reputation data found for user ${userId}`, "warning");
      return {};
    }

    cachedReputationData = response.data.result.users[userId];
    return cachedReputationData;
  } catch (error) {
    log(`Error fetching user reputation: ${error.message}`, "error");
    return {}; // Return empty object on error
  }
}

/**
 * Fetch user data from directory search
 * @param {string} username - Username to search for
 * @param {Function} logger - Logger function
 * @returns {Promise<Object>} - Directory data
 */
export async function searchUserByUsername(username, logger = console.log) {
  const log = typeof logger === "function" ? logger : console.log;

  try {
    log("Searching for freelancer data in directory by username", "api");

    // Build the query params with URLSearchParams to ensure proper encoding
    const queryParams = new URLSearchParams();
    queryParams.append("query", username); // Exact username search
    queryParams.append("avatar", "true");
    queryParams.append("jobs", "true");
    queryParams.append("profile_description", "true");
    queryParams.append("display_info", "true");
    queryParams.append("qualification_details", "true");
    queryParams.append("badge_details", "true");
    queryParams.append("reputation", "true");
    queryParams.append("reputation_extra", "true");
    queryParams.append("limit", "20"); // Increase limit to improve chances of finding user

    // Create endpoint with query string
    const endpoint = `users/0.1/users/directory?${queryParams.toString()}`;

    const response = await monitoredApiRequest(
      endpoint,
      {}, // No extra params since we built them into the endpoint
      log
    );

    if (
      !response.data?.result?.users ||
      response.data.result.users.length === 0
    ) {
      log("No users found in directory search", "warning");
      return {};
    }

    // Find the exact username match (case insensitive)
    const userData = response.data.result.users.find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );

    if (!userData) {
      log("Exact username match not found in directory results", "warning");
      log(
        `Found ${response.data.result.users.length} users but none matched '${username}'`,
        "info"
      );

      // Debug first few results
      if (response.data.result.users.length > 0) {
        const sampleUsers = response.data.result.users.slice(0, 3);
        log(
          `Sample usernames found: ${sampleUsers
            .map((u) => u.username)
            .join(", ")}`,
          "debug"
        );
      }

      return {};
    }

    log("Found user data in directory search", "success");
    return userData;
  } catch (error) {
    log(`Error searching user in directory: ${error.message}`, "error");
    return {}; // Return empty object on error
  }
}

/**
 * Fetch comprehensive user details
 * @param {Function} logger - Logger function
 * @returns {Promise<Object>} - Combined user data
 */
export async function fetchUserDetails(logger = console.log) {
  const log = typeof logger === "function" ? logger : console.log;

  try {
    // Return cached result if available
    if (cachedUserDetails) {
      return cachedUserDetails;
    }

    // Get the user ID and enhanced profile data
    await fetchUserId(log);

    // We now have cachedProfileData from the self endpoint with basic info
    if (!cachedProfileData) {
      throw new Error("Could not retrieve basic user profile");
    }

    const userId = cachedUserId;
    const username = cachedProfileData.username;

    log(
      `Fetching comprehensive profile for user ${userId} (${username})`,
      "api"
    );

    // Fetch additional data sources in parallel
    const [devices, reputation, directoryData] = await Promise.all([
      fetchUserDevices(log),
      fetchUserReputation(userId, log),
      // Use username for directory search
      searchUserByUsername(username, log),
    ]);

    // Combine all data sources, prioritizing the most detailed sources
    const combinedData = {
      ...cachedProfileData, // Start with enhanced self data
      devices: devices.devices || [], // Add devices
      full_reputation: reputation, // Add detailed reputation
      directory_data: directoryData || {}, // Add directory data
    };

    cachedUserDetails = combinedData;
    log("User details retrieved and combined successfully", "success");

    return cachedUserDetails;
  } catch (error) {
    log(`Error fetching comprehensive user details: ${error.message}`, "error");
    throw error;
  }
}

/**
 * Reset all cached data
 */
export function resetCachedUserData() {
  cachedUserId = null;
  cachedUserDevices = null;
  cachedReputationData = null;
  cachedProfileData = null;
  cachedUserDetails = null;
}
