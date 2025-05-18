import { getStoredToken } from "../utils/tokenHelper";

export const getToken = () => {
  return getStoredToken();
};

export const token = getStoredToken();
