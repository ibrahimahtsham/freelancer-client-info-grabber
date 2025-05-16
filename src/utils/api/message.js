import { token } from "./config";

// Helper to get or create thread
async function getOrCreateThread(clientId, projectId) {
  // Try to get existing thread
  const existingThreadsRes = await fetch(
    `https://www.freelancer.com/api/messages/0.1/threads/?context_type=project&context=${projectId}`,
    { headers: { "freelancer-oauth-v1": token } }
  );
  const existingThreadsData = await existingThreadsRes.json();

  if (existingThreadsData?.result?.threads?.length > 0) {
    return existingThreadsData.result.threads[0].id;
  }

  // Create new thread
  const threadRes = await fetch(
    `https://www.freelancer.com/api/messages/0.1/threads/`,
    {
      method: "POST",
      headers: {
        "freelancer-oauth-v1": token,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        "members[]": clientId,
        context_type: "project",
        context: projectId,
      }),
    }
  );
  const threadData = await threadRes.json();
  if (!threadRes.ok)
    throw new Error(
      `Unable to create thread: ${threadData?.message || threadRes.statusText}`
    );
  const threadId = threadData?.result?.thread?.id;
  if (!threadId) throw new Error("Unable to create thread.");
  return threadId;
}

// Main function to send message (will get/create thread as needed)
export async function sendMessageWithThread(clientId, projectId, message) {
  const threadId = await getOrCreateThread(clientId, projectId);

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
  console.log("Send message response:", msgData);

  if (!messageRes.ok || msgData.status !== "success") {
    // Only throw the API's message field, or a generic fallback
    throw new Error(msgData.message || "Message failed to send.");
  }

  return { msgData, threadId };
}
