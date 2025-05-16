import { token } from "./config";

export async function apiRequest(url, options = {}) {
  const headers = {
    "freelancer-oauth-v1": token,
    ...options.headers,
  };

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data.message || res.statusText || "API request failed";
    throw new Error(message);
  }

  return data;
}
