import { getValidAccessToken } from "@/utils/authUtils";
import axios from "axios";

let authGetter = null;

export const setAuthTokenGetter = () => {
  authGetter = getValidAccessToken;
};
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await (authGetter ? authGetter() : getValidAccessToken());
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // ignore token errors; request may proceed unauthenticated if allowed
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.name === "CanceledError" || err.code === "ERR_CANCELED") {
      return Promise.reject(err);
    }
    // Don't create a new Error object - preserve the original error with response data
    // This allows error handlers to access err.response.data.errors for validation messages
    return Promise.reject(err);
  }
);

export default api;
