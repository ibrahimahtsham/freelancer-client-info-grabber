import { token } from "./config";

export async function apiRequest(url, options = {}) {
  // Create default headers with the token
  const headers = {
    "freelancer-oauth-v1": token,
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    // Remove credentials: "include" as it's causing CORS issues
    headers,
  });

  // Extract rate limit headers if they exist
  const rateLimits = {
    limit: response.headers.get("RateLimit-Limit") || "",
    remaining: response.headers.get("RateLimit-Remaining") || "",
  };

  // Special handling for rate limiting
  if (response.status === 429) {
    // Handle rate limiting without logging
    return {
      data: {
        status: "error",
        message: "Rate limited. Please wait before making more requests.",
      },
      rateLimits: {
        limit: rateLimits.limit || "?",
        remaining: "0",
        isRateLimited: true,
      },
    };
  }

  // Check for error responses
  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`API request failed: ${response.status} - ${errorText}`);
  }

  let data;
  try {
    data = await response.json();
  } catch (error) {
    throw new Error("Invalid response format");
  }

  // Return both data and rate limit information
  return {
    data,
    rateLimits,
  };
}
