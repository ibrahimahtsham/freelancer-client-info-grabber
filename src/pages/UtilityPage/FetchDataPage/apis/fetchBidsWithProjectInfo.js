import { monitoredApiRequest } from "./utils/apiUtils";
import { API_ENDPOINTS } from "../../../../constants";

/**
 * Fetch bids with project and client information in a single request
 * @param {number} userId - User ID to fetch bids for
 * @param {number} fromTimestamp - Start timestamp in seconds
 * @param {number} toTimestamp - End timestamp in seconds  
 * @param {number|null} limit - Maximum number of records to fetch (null for no limit)
 * @param {Function} progressCallback - Callback for progress updates
 * @param {Function} logger - Logger function for detailed logging
 * @returns {Promise<{bids: Array, projects: Object, users: Object}>} - Promise resolving to bid data
 */
export async function fetchBidsWithProjectInfo(
  userId,
  fromTimestamp,
  toTimestamp,
  limit = null,
  progressCallback = () => {},
  logger = console.log
) {
  // Ensure logger is a function
  const log = typeof logger === "function" ? logger : console.log;
  
  try {
    log("Fetching bids with project and client info", "api");
    
    // Build query parameters - FIX: Use proper parameter format for arrays
    const queryParams = new URLSearchParams();
    queryParams.append('bidders[]', userId); // Correct format for array parameters
    queryParams.append('project_details', 'true');
    queryParams.append('user_details', 'true');
    
    // Add time range parameters if provided
    if (fromTimestamp) {
      queryParams.append('from_time', fromTimestamp);
    }
    
    if (toTimestamp) {
      queryParams.append('to_time', toTimestamp);
    }
    
    // Initialize result containers
    const allBids = [];
    const projectsMap = {};
    const usersMap = {};
    
    // Pagination parameters
    let offset = 0;
    const pageSize = 50;
    let hasMore = true;
    
    // Loop until we fetch all results or hit the limit
    while (hasMore) {
      // Apply pagination parameters
      queryParams.set('offset', offset.toString());
      queryParams.set('limit', pageSize.toString());
      
      // Make the API request
      const endpoint = `projects/0.1/bids/?${queryParams.toString()}`;
      log(`Making request to: ${endpoint}`, "api");
      
      const response = await monitoredApiRequest(endpoint, {}, log);
      
      if (!response.data || !response.data.result) {
        log("No data returned from API or unexpected format", "error");
        break;
      }
      
      const { bids = [], projects = {}, users = {} } = response.data.result;
      
      if (bids.length === 0) {
        // No more results
        hasMore = false;
      } else {
        // Add current page results to our collections
        allBids.push(...bids);
        
        // Merge projects and users maps
        Object.assign(projectsMap, projects);
        Object.assign(usersMap, users);
        
        // Update progress
        progressCallback(
          Math.min(20, Math.floor(10 + (allBids.length / (limit || 1000)) * 10)),
          `Fetched ${allBids.length} bids so far...`
        );
        
        // Prepare for next page
        offset += bids.length;
        
        // Check if we've hit the limit
        if (limit && allBids.length >= limit) {
          log(`Reached limit of ${limit} bids, stopping pagination`, "info");
          hasMore = false;
        }
      }
    }
    
    log(`Successfully fetched ${allBids.length} bids with project and client info`, "success");
    return {
      bids: allBids,
      projects: projectsMap,
      users: usersMap
    };
  } catch (error) {
    log(`Error fetching bids with project info: ${error.message}`, "error");
    throw error;
  }
}

/**
 * Fetch all bids regardless of pagination (with auto-retry)
 * This is a convenience wrapper that handles rate limiting and retries
 */
export async function fetchAllBidsWithProjectInfo(
  userId,
  fromTimestamp,
  toTimestamp,
  limit = null,
  progressCallback = () => {},
  logger = console.log
) {
  // Ensure logger is a function
  const log = typeof logger === "function" ? logger : console.log;
  
  return fetchBidsWithProjectInfo(
    userId,
    fromTimestamp,
    toTimestamp,
    limit,
    progressCallback,
    log
  );
}
