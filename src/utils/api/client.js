import { apiRequest } from "./request";

export async function fetchClientInfo(projectId) {
  const projectResponse = await apiRequest(
    `https://www.freelancer.com/api/projects/0.1/projects/?projects[]=${projectId}`
  );

  if (projectResponse.error) {
    throw projectResponse.error;
  }

  if (!projectResponse.data?.result?.projects?.length) {
    throw new Error("Project not found.");
  }

  const project = projectResponse.data.result.projects[0];
  const ownerId = project.owner_id;

  const userResponse = await apiRequest(
    `https://www.freelancer.com/api/users/0.1/users/${ownerId}/`
  );

  if (userResponse.error) {
    throw userResponse.error;
  }

  if (!userResponse.data?.result) {
    throw new Error("Client not found.");
  }

  // Fetch thread info
  const threadResponse = await apiRequest(
    `https://www.freelancer.com/api/messages/0.1/threads/?context_type=project&context=${projectId}`
  );

  const thread = threadResponse.data?.result?.threads?.[0] || null;

  return {
    project,
    client: userResponse.data.result,
    thread,
  };
}
