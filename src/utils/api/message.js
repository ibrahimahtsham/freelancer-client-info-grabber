import { token } from "./config";
import { apiRequest } from "./request";

// Helper to get or create thread
async function getOrCreateThread(clientId, projectId) {
  // Try to get an existing thread
  const existingThreadsData = await apiRequest(
    `https://www.freelancer.com/api/messages/0.1/threads/?context_type=project&context=${projectId}`
  );

  if (existingThreadsData?.data?.result?.threads?.length > 0) {
    return existingThreadsData.data.result.threads[0].id;
  }

  // Create new thread
  const params = new URLSearchParams({
    "members[]": clientId,
    context_type: "project",
    context: projectId,
  });
  const threadData = await apiRequest(
    `https://www.freelancer.com/api/messages/0.1/threads/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    }
  );

  const threadId = threadData?.data?.result?.thread?.id;
  if (!threadId) throw new Error("Unable to create thread.");
  return threadId;
}

// Main function to send message (will get/create thread as needed)
export async function sendMessageWithThread(clientId, projectId, message) {
  const threadId = await getOrCreateThread(clientId, projectId);

  const params = new URLSearchParams({ message });
  const msgData = await apiRequest(
    `https://www.freelancer.com/api/messages/0.1/threads/${threadId}/messages/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    }
  );

  if (msgData.data.status !== "success") {
    throw new Error(msgData.data.message || "Message failed to send.");
  }

  return { msgData, threadId };
}
