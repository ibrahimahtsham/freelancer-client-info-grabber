import { apiRequest } from "../../../apis/request";
import { API_ENDPOINTS } from "../../../constants"; // Import constants

// Helper to get or create thread
async function getOrCreateThread(clientId, projectId) {
  // Try to get an existing thread
  const existingThreadsData = await apiRequest(
    `${API_ENDPOINTS.THREADS}?context_type=project&context=${projectId}`
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
  const threadData = await apiRequest(API_ENDPOINTS.THREADS, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  const threadId = threadData?.data?.result?.thread?.id;
  if (!threadId) throw new Error("Unable to create thread.");
  return threadId;
}

// Main function to send message (will get/create thread as needed)
export async function sendMessageWithThread(clientId, projectId, message) {
  const threadId = await getOrCreateThread(clientId, projectId);

  const params = new URLSearchParams({ message });
  const msgData = await apiRequest(
    `${API_ENDPOINTS.THREADS}${threadId}/messages/`,
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
