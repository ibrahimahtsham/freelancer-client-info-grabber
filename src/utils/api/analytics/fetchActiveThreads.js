import { apiRequest } from "../request";

export async function fetchActiveThreads() {
  const data = await apiRequest(
    "https://www.freelancer.com/api/messages/0.1/threads/?context_type=project"
  );
  // Filter out support chat threads if needed (this example assumes threads with a context other than "support" are active)
  const threads = data?.result?.threads || [];
  return threads.filter((thread) => thread.context_type !== "support");
}
