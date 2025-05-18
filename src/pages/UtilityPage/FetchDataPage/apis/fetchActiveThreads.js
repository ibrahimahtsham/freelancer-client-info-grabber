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
        await delay(Math.pow(2, attempt) * 1000);
      }
      return await fetchFunction();
    } catch (error) {
      lastError = error;

      if (
        error.message.includes("429") ||
        error.message.includes("rate limit")
      ) {
        await delay(5000);
      }
    }
  }

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

  try {
    // Use retry mechanism for main request
    const { data, rateLimits, error } = await retryFetch(() => apiRequest(url));

    // Check for API errors
    if (error) {
      console.error("API error:", error);
      throw error;
    }

    if (data.status === "error") {
      console.error("Data status error:", data.message);
      throw new Error(data.message || "Failed to fetch threads");
    }

    // Extract threads
    const threads = data?.result?.threads || [];

    return {
      threads,
      rateLimits,
    };
  } catch (error) {
    console.error("Error fetching threads:", error);
    throw error; // Propagate error so it can be handled upstream
  }
}
