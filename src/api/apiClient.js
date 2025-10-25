// apiClient.js
import axios from "axios";

// Create an axios client that will attach JWT tokens on every request.
// Pass a token function (like getValidAccessToken) from your component.
export const createApiClient = (getToken) => {
  const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL, // https://creatorlink.onrender.com
    headers: { "Content-Type": "application/json" },
  });

  client.interceptors.request.use(async (config) => {
    if (typeof getToken === "function") {
      const token = await getToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return client;
};
