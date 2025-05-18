import { apiRequest } from "../../../../apis/request";
import { API_ENDPOINTS, DEFAULT_VALUES } from "../../../../constants";

export async function fetchMyUserId() {
  try {
    const response = await apiRequest(API_ENDPOINTS.SELF);

    if (response.error) {
      console.warn(
        "Error fetching user ID, using default:",
        response.error.message
      );
      return DEFAULT_VALUES.MY_USER_ID; // Use default ID if API fails
    }

    return response.data?.result?.id || DEFAULT_VALUES.MY_USER_ID;
  } catch (error) {
    console.warn("Error fetching user ID, using default:", error.message);
    return DEFAULT_VALUES.MY_USER_ID; // Fallback to default ID
  }
}
