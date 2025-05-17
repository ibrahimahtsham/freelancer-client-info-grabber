import { apiRequest } from "../request";

export async function fetchFirstMessageDate(threadId) {
  const messagesData = await apiRequest(
    `https://www.freelancer.com/api/messages/0.1/threads/${threadId}/messages`
  );
  const messages = messagesData?.result?.messages || [];
  if (messages.length === 0) return null;
  // Get the earliest message timestamp
  messages.sort((a, b) => a.timestamp - b.timestamp);
  return messages[0].timestamp;
}
