import { apiRequest } from "./request";
import { API_ENDPOINTS } from "../../constants"; // Import constants

export async function fetchClientInfo(projectId) {
  const projectResponse = await apiRequest(
    `${API_ENDPOINTS.PROJECTS}?projects[]=${projectId}`
  );

  if (projectResponse.error) {
    throw projectResponse.error;
  }

  if (!projectResponse.data?.result?.projects?.length) {
    throw new Error("Project not found.");
  }

  const project = projectResponse.data.result.projects[0];
  const ownerId = project.owner_id;

  const userResponse = await apiRequest(`${API_ENDPOINTS.USERS}${ownerId}/`);

  if (userResponse.error) {
    throw userResponse.error;
  }

  if (!userResponse.data?.result) {
    throw new Error("Client not found.");
  }

  // Fetch thread info
  const threadResponse = await apiRequest(
    `${API_ENDPOINTS.THREADS}?context_type=project&context=${projectId}`
  );

  const thread = threadResponse.data?.result?.threads?.[0] || null;

  return {
    project,
    client: userResponse.data.result,
    thread,
  };
}
