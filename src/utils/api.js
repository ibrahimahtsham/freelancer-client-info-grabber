import { fetch } from "cross-fetch";

const token = "H7FfoHyqJxr9xKwECCgvseWyyCcMRu";

export const fetchClientInfo = async (projectId) => {
  try {
    const projectRes = await fetch(
      `https://www.freelancer.com/api/projects/0.1/projects/?projects[]=${projectId}`,
      {
        headers: { "freelancer-oauth-v1": token },
      }
    );

    const projectData = await projectRes.json();
    if (!projectData?.result?.projects?.length)
      throw new Error("Project not found.");

    const project = projectData.result.projects[0];
    const ownerId = project.owner_id;

    const userRes = await fetch(
      `https://www.freelancer.com/api/users/0.1/users/${ownerId}/`,
      {
        headers: { "freelancer-oauth-v1": token },
      }
    );

    const userData = await userRes.json();
    if (!userData?.result) throw new Error("Client not found.");

    // Fetch thread info
    const threadRes = await fetch(
      `https://www.freelancer.com/api/messages/0.1/threads/?context_type=project&context=${projectId}`,
      {
        headers: { "freelancer-oauth-v1": token },
      }
    );
    const threadData = await threadRes.json();
    const thread = threadData?.result?.threads?.[0] || null;

    return { project, client: userData.result, thread };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const sendMessage = async (threadId, message) => {
  try {
    const messageRes = await fetch(
      `https://www.freelancer.com/api/messages/0.1/threads/${threadId}/messages/`,
      {
        method: "POST",
        headers: {
          "freelancer-oauth-v1": token,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ message }),
      }
    );

    const msgData = await messageRes.json();
    if (!messageRes.ok || msgData.status !== "success") {
      throw new Error("Message failed to send.");
    }

    return msgData;
  } catch (error) {
    throw new Error(error.message);
  }
};
