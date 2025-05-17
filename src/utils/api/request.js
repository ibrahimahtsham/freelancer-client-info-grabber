import { token } from "./config";

export async function apiRequest(url, options = {}) {
  const headers = {
    "freelancer-oauth-v1": token,
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 429) {
    let retryAfter = response.headers.get("retry-after");
    if (!retryAfter) {
      retryAfter = "60"; // default wait time in seconds
    }
    const waitTime = isNaN(retryAfter) ? retryAfter : `${retryAfter} seconds`;
    throw new Error(
      `Rate limit exceeded. Please wait ${waitTime} before retrying.`
    );
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      data.message || response.statusText || "API request failed.";
    throw new Error(message);
  }
  return data;
}
