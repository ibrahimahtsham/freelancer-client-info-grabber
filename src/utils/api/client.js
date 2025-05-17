import { token } from "./config";
import { apiRequest } from "./request";

export async function fetchClientInfo(projectId) {
  try {
    const projectData = await apiRequest(
      `https://www.freelancer.com/api/projects/0.1/projects/?projects[]=${projectId}`
    );

    if (!projectData?.data?.result?.projects?.length) {
      throw new Error("Project not found.");
    }

    const project = projectData.data.result.projects[0];
    const ownerId = project.owner_id;

    const userData = await apiRequest(
      `https://www.freelancer.com/api/users/0.1/users/${ownerId}/`
    );

    if (!userData?.data?.result) {
      throw new Error("Client not found.");
    }

    // Fetch thread info
    const threadData = await apiRequest(
      `https://www.freelancer.com/api/messages/0.1/threads/?context_type=project&context=${projectId}`
    );

    const thread = threadData?.data?.result?.threads?.[0] || null;

    const result = { project, client: userData.data.result, thread };

    return result;
  } catch (error) {
    console.error(`[DEBUG] Error in fetchClientInfo: ${error.message}`);
    console.error("[DEBUG] Error stack:", error.stack);
    throw new Error(error.message);
  }
}
