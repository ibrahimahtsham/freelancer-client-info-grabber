import { apiRequest } from "../request";
import { API_ENDPOINTS, DEFAULT_VALUES } from "../../../constants";

export async function fetchMyBidForProject(
  projectId,
  myUserId = DEFAULT_VALUES.MY_USER_ID
) {
  try {
    const response = await apiRequest(
      `${API_ENDPOINTS.BIDS}?projects[]=${projectId}&bidders[]=${myUserId}`
    );

    if (response.error) {
      return null;
    }

    const bids = response.data?.result?.bids || [];
    // There should be at most one bid from this user on this project
    return bids[0] || null;
  } catch {
    return null;
  }
}
