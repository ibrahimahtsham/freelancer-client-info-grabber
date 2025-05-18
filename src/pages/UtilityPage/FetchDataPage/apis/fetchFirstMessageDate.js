import { apiRequest } from "../../../../apis/request";
import { API_ENDPOINTS } from "../../../../constants";

export async function fetchFirstMessageDate(threadId) {
  try {
    // Using the messages API with threads[] parameter
    const response = await apiRequest(
      `${API_ENDPOINTS.MESSAGES}?threads[]=${threadId}&limit=1&offset=0&sort_field=time_created&sort_direction=asc`
    );

    if (response.error) {
      console.warn(
        `Error fetching first message date for thread ${threadId}:`,
        response.error.message
      );
      return null;
    }

    const messages = response.data?.result?.messages || [];

    // Return the timestamp of the first message if available
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
