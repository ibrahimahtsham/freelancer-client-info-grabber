import { apiRequest } from "../request";
import { API_ENDPOINTS, DEFAULT_VALUES } from "../../../constants";

export async function fetchPaidMilestonesForProject(
  projectId,
  myUserId = DEFAULT_VALUES.MY_USER_ID
) {
  try {
    const response = await apiRequest(
      `${API_ENDPOINTS.MILESTONES}?projects[]=${projectId}&bidders[]=${myUserId}`
    );

    if (response.error) {
      return { totalPaid: 0, milestones: [] };
    }

    // Convert milestones to array if it's an object with numerical keys
    let milestonesRaw = response.data?.result?.milestones;
    let milestones = [];

    if (Array.isArray(milestonesRaw)) {
      milestones = milestonesRaw;
    } else if (milestonesRaw && typeof milestonesRaw === "object") {
      milestones = Object.values(milestonesRaw);
    }

    // Filter for released/cleared milestones (paid)
    const paidMilestones = milestones.filter(
      (m) => m.status === "cleared" || m.status === "released"
    );

    // Sum the amounts
    const totalPaid = paidMilestones.reduce(
      (sum, m) => sum + (parseFloat(m.amount) || 0),
      0
    );

    return { totalPaid, milestones: paidMilestones };
  } catch (error) {
    return { totalPaid: 0, milestones: [] };
  }
}
