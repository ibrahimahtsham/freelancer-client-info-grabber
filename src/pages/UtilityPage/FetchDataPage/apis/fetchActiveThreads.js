import { apiRequest } from "../../../../apis/request";
import { API_ENDPOINTS } from "../../../../constants";

// Helper function to delay execution
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Retry function with exponential backoff
async function retryFetch(fetchFunction, logger = console.log, maxRetries = 3) {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const waitTime = Math.pow(2, attempt) * 1000;
        logger(
          `Retry attempt ${
            attempt + 1
          } of ${maxRetries}. Waiting ${waitTime}ms...`,
          "warning"
        );
        await delay(waitTime);
      }

      logger(`Executing fetch attempt ${attempt + 1}`, "api");
      const result = await fetchFunction();
      logger(`Fetch attempt ${attempt + 1} successful`, "success");
      return result;
    } catch (error) {
      lastError = error;
      logger(`Fetch attempt ${attempt + 1} failed: ${error.message}`, "error");

      if (
        error.message.includes("429") ||
        error.message.includes("rate limit")
      ) {
        logger("Rate limit detected, waiting longer...", "warning");
        await delay(5000);
      } else {
        logger(
          `Error type: ${error.name}, Code: ${error.code || "unknown"}`,
          "error"
        );
      }
    }
  }

  logger("All retry attempts failed", "error");
  throw lastError || new Error("All retry attempts failed");
}

export async function fetchActiveThreads(
  fromDate = null,
  toDate = null,
  limit = null,
  logger = console.log
) {
  // Start with base URL and required folder parameter
  let url = `${API_ENDPOINTS.THREADS}?folder=active`;

  // Create array to hold query parameters
  const params = [];

  // Only add limit if it's provided (not null)
  if (limit !== null && limit > 0) {
    params.push(`limit=${limit}`);
  }

  // Add date range parameters if provided
  if (fromDate) {
    const fromTimestamp = Math.floor(new Date(fromDate).getTime() / 1000);
    params.push(`from_updated_time=${fromTimestamp}`);
  }

  if (toDate) {
    const toDateObj = new Date(toDate);
    toDateObj.setDate(toDateObj.getDate() + 1); // Include the entire day
    const toTimestamp = Math.floor(toDateObj.getTime() / 1000);
    params.push(`to_updated_time=${toTimestamp}`);
  }

  // Build the final URL with parameters
  if (params.length > 0) {
    url += `&${params.join("&")}`;
  }

  logger("Fetching active threads with URL: " + url, "api");
  logger(
    "Date range: " + fromDate + " to " + toDate + " Limit: " + limit,
    "info"
  );

  try {
    // Use retry mechanism for main request
    console.time("fetchActiveThreads");
    const { data, rateLimits, error } = await retryFetch(
      () => apiRequest(url),
      logger
    );
    console.timeEnd("fetchActiveThreads");

    // Check for API errors
    if (error) {
      logger("API error in fetchActiveThreads: " + error, "error");
      throw error;
    }

    if (data.status === "error") {
      logger(
        "Data status error in fetchActiveThreads: " + data.message,
        "error"
      );
      throw new Error(data.message || "Failed to fetch threads");
    }

    // Extract threads
    const threads = data?.result?.threads || [];
    logger(`Successfully fetched ${threads.length} threads`, "success");

    // Log rate limits
    logger("Rate limits: " + JSON.stringify(rateLimits), "info");

    return {
      threads,
      rateLimits,
    };
  } catch (error) {
    logger("Error in fetchActiveThreads: " + error, "error");
    throw error; // Propagate error so it can be handled upstream
  }
}
