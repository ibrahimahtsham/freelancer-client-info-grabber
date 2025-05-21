import { getAccessToken } from "../utils/tokenHelper"; // Add this import

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

/**
 * Makes a request to the Freelancer API
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Request options
 * @returns {Promise<Object>} Response data
 */
export async function apiRequest(endpoint, options = {}) {
  const baseUrl = "https://www.freelancer.com/api/";
  const url = endpoint.startsWith("http") ? endpoint : `${baseUrl}${endpoint}`;

  // Get the access token
  const accessToken = getAccessToken();

  if (!accessToken) {
    throw new Error(
      "No access token available. Please set up your API token first."
    );
  }

  // Set up headers with authorization
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
    ...options.headers,
  };

  // Make request with headers
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle HTTP errors
  if (!response.ok) {
    const error = new Error(
      `API request failed with status ${response.status}`
    );
    error.status = response.status;

    try {
      // Try to parse response as JSON for more error details
      error.details = await response.json();
    } catch {
      // If not JSON, get the text
      error.details = await response.text();
    }

    throw error;
  }

  // Get response data and headers
  const data = await response.json();

  // Return structured response object
  return {
    data,
    headers: response.headers,
    status: response.status,
    url: response.url,
  };
}
