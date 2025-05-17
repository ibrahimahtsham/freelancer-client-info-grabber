import { apiRequest } from "../request";
import { API_ENDPOINTS } from "../../../constants";

export async function fetchFirstMessageDate(threadId) {
  try {
    const response = await apiRequest(
      `${API_ENDPOINTS.THREADS}${threadId}/messages/?limit=1&offset=0`
    );

    if (response.error) {
      return null;
    }

    const firstMsg = response.data?.result?.messages?.[0];
    return firstMsg ? firstMsg.time_created : null;
  } catch (error) {
    return null;
  }
}
