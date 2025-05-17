import { apiRequest } from "../request";
import { API_ENDPOINTS } from "../../../constants"; // Import constants

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
  limit = 5
) {
  // Start with base URL
  let url = API_ENDPOINTS.THREADS; // Use constant

  // Create array to hold query parameters
  const params = [];

  // Set the fixed limit
  params.push(`limit=${limit}`);

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
  url += `?${params.join("&")}`;

  try {
    // Use retry mechanism for main request
    const { data, rateLimits } = await retryFetch(() => apiRequest(url));

    // Check for API errors
    if (data.status === "error") {
      return { threads: [], rateLimits };
    }

    // Extract threads
    const threads = data?.result?.threads || [];

    return {
      threads,
      rateLimits,
    };
  } catch (error) {
    // Return empty threads array with rate limit info
    return {
      threads: [],
      rateLimits: { limit: "", remaining: "" },
    };
  }
}
