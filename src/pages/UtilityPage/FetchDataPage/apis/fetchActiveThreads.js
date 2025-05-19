import { apiRequest } from "../../../../apis/request";
import { API_ENDPOINTS } from "../../../../constants";

// Helper function to delay execution
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Retry function with exponential backoff
async function retryFetch(fetchFunction, maxRetries = 3) {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(
          `Retry attempt ${attempt + 1} of ${maxRetries}. Waiting ${
            Math.pow(2, attempt) * 1000
          }ms...`
        );
        await delay(Math.pow(2, attempt) * 1000);
      }

      console.log(`Executing fetch attempt ${attempt + 1}`);
      const result = await fetchFunction();
      console.log(`Fetch attempt ${attempt + 1} successful`);
      return result;
    } catch (error) {
      lastError = error;
      console.warn(`Fetch attempt ${attempt + 1} failed:`, error.message);

      if (
        error.message.includes("429") ||
        error.message.includes("rate limit")
      ) {
        console.log("Rate limit detected, waiting longer...");
        await delay(5000);
      } else {
        console.log(
          `Error type: ${error.name}, Code: ${error.code || "unknown"}`
        );
      }
    }
  }

  console.error("All retry attempts failed");
  throw lastError || new Error("All retry attempts failed");
}

export async function fetchActiveThreads(
  fromDate = null,
  toDate = null,
  limit = null
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

  console.log("Fetching active threads with URL:", url);
  console.log("Date range:", fromDate, "to", toDate, "Limit:", limit);

  try {
    // Use retry mechanism for main request
    console.time("fetchActiveThreads");
    const { data, rateLimits, error } = await retryFetch(() => apiRequest(url));
    console.timeEnd("fetchActiveThreads");

    // Check for API errors
    if (error) {
      console.error("API error in fetchActiveThreads:", error);
      throw error;
    }

    if (data.status === "error") {
      console.error("Data status error in fetchActiveThreads:", data.message);
      throw new Error(data.message || "Failed to fetch threads");
    }

    // Extract threads
    const threads = data?.result?.threads || [];
    console.log(`Successfully fetched ${threads.length} threads`);

    // Log rate limits
    console.log("Rate limits:", rateLimits);

    return {
      threads,
      rateLimits,
    };
  } catch (error) {
    console.error("Error in fetchActiveThreads:", error);
    throw error; // Propagate error so it can be handled upstream
  }
}
