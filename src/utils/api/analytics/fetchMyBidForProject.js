// filepath: src/utils/api/analytics/fetchMyBidForProject.js
import { apiRequest } from "../request";

export async function fetchMyBidForProject(projectId, userId) {
  // Replace the URL with the correct endpoint for fetching bid info
  const bidData = await apiRequest(
    `https://www.freelancer.com/api/bids/0.1/projects/${projectId}/bids?user=${userId}`
  );
  return bidData?.result || {};
}
