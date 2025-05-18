import { token } from "./config";

// Define application-specific error class
export class ApiError extends Error {
  constructor(message, status, code, requestId) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }
}

export async function apiRequest(url, options = {}) {
  // Create default headers with the token
  const headers = {
    "freelancer-oauth-v1": token,
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Extract rate limit headers
    const rateLimits = {
      limit: response.headers.get("RateLimit-Limit") || "",
      remaining: response.headers.get("RateLimit-Remaining") || "",
    };

    // Handle rate limiting (429)
    if (response.status === 429) {
      return {
        data: {
          status: "error",
          message: "Rate limited. Please wait before making more requests.",
        },
        rateLimits: {
          ...rateLimits,
          isRateLimited: true,
          remaining: "0",
        },
        error: new ApiError("Rate limit exceeded", 429, "RATE_LIMITED", null),
      };
    }

    // Parse response body
    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Handle non-200 responses with structured error
    if (!response.ok) {
      // Extract API error details if available
      const errorMessage = data?.message || "Unknown API error";
      const errorCode = data?.error_code || `HTTP_${response.status}`;
      const requestId = data?.request_id;

      const error = new ApiError(
        errorMessage,
        response.status,
        errorCode,
        requestId
      );

      return {
        data: null,
        rateLimits,
        error,
      };
    }

    // Success case
    return {
      data,
      rateLimits,
      error: null,
    };
  } catch (error) {
    // Network/client-side errors
    return {
      data: null,
      rateLimits: { limit: "", remaining: "" },
      error: new ApiError(
        error.message || "Network error occurred",
        0,
        "NETWORK_ERROR",
        null
      ),
    };
  }
}
