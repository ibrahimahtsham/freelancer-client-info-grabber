// filepath: src/utils/api/analytics/fetchPaidMilestonesForProject.js
import { apiRequest } from "../request";

export async function fetchPaidMilestonesForProject(projectId, userId) {
  // Replace the URL with the correct endpoint for fetching milestone info
  const milestoneData = await apiRequest(
    `https://www.freelancer.com/api/milestones/0.1/projects/${projectId}?user=${userId}`
  );
  const milestones = milestoneData?.result?.milestones || [];
  // Sum amounts for milestones with status "cleared" or "released"
  const totalPaid = milestones.reduce((sum, milestone) => {
    if (milestone.status === "released" || milestone.status === "cleared") {
      return sum + Number(milestone.amount);
    }
    return sum;
  }, 0);
  return totalPaid;
}
