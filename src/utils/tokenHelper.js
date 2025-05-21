import { setCookie, getCookie } from "./cookieUtils";

// Use a single consistent token key
const TOKEN_COOKIE_KEY = "freelancer_api_token";

/**
 * Get the access token from cookies or storage
 * @returns {string|null} The access token or null if not found
 */
export function getAccessToken() {
  // Use the constant TOKEN_COOKIE_KEY instead of hardcoded string
  const tokenFromCookie = getCookie(TOKEN_COOKIE_KEY);
  if (tokenFromCookie) return tokenFromCookie;

  // Fall back to localStorage with same key
  try {
    const tokenFromStorage = localStorage.getItem(TOKEN_COOKIE_KEY);
    return tokenFromStorage;
  } catch (e) {
    console.error("Error accessing localStorage:", e);
  }

  return null;
}

/**
 * Save access token to both cookie and localStorage
 * @param {string} token - The access token to save
 */
export function saveAccessToken(token) {
  setCookie(TOKEN_COOKIE_KEY, token);
  try {
    localStorage.setItem(TOKEN_COOKIE_KEY, token);
  } catch (e) {
    console.error("Error setting localStorage:", e);
  }
  return true;
}

// These can just be aliases for the above functions to maintain compatibility
export const getStoredToken = getAccessToken;

export const saveToken = saveAccessToken;

export const clearToken = () => {
  setCookie(TOKEN_COOKIE_KEY, "");
  try {
    localStorage.removeItem(TOKEN_COOKIE_KEY);
  } catch (e) {
    console.error("Error removing from localStorage:", e);
  }
};
