import { apiRequest } from "../request";
import { API_ENDPOINTS } from "../../../constants";

export async function fetchFirstMessageDate(threadId) {
  try {
    // Following the exact API documentation structure
    // Remove sort parameters as they're not documented
    // Add thread_details to get more context if needed
    const response = await apiRequest(
      `${API_ENDPOINTS.MESSAGES}?threads[]=${threadId}&limit=1&offset=0&thread_details=true`
    );

    if (response.error) {
      console.warn(
        `Error response for thread ${threadId}:`,
        response.error.message
      );
      return null;
    }

    const messages = response.data?.result?.messages || [];

    // If we have messages, return the time of the first one
    // The API should return them in order (oldest first)
    if (messages.length > 0) {
      return messages[0].time_created;
    }

    return null;
  } catch (error) {
    console.warn(
      `Error fetching first message date for thread ${threadId}:`,
      error.message
    );
    return null;
  }
}
