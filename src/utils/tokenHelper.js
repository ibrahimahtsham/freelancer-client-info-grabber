import { setCookie, getCookie } from "./cookieUtils";

const TOKEN_COOKIE_KEY = "freelancer_api_token";

export const getStoredToken = () => {
  return getCookie(TOKEN_COOKIE_KEY) || null;
};

export const saveToken = (token) => {
  setCookie(TOKEN_COOKIE_KEY, token);
  return true;
};

export const clearToken = () => {
  setCookie(TOKEN_COOKIE_KEY, "");
};
