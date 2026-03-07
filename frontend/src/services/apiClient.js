import axios from "axios";
import {
  LOCAL_API_URL,
  REMOTE_API_URL,
  STORAGE_KEYS,
} from "../utils/constants";

// Determine base URL based on environment
// In production (Vercel), use the remote API
// In development, use localhost
const isProduction =
  import.meta.env.PROD || import.meta.env.MODE === "production";
const baseURL = isProduction
  ? REMOTE_API_URL
  : import.meta.env.VITE_API_URL || LOCAL_API_URL;

console.log("API Base URL:", baseURL);
console.log("Environment:", import.meta.env.MODE);

const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  withCredentials: true,
});

// REQUEST INTERCEPTOR
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// RESPONSE INTERCEPTOR
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject({
        message: "Network error. Please check your connection.",
      });
    }

    if (error.response.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.HOSPITAL);

      // Safer redirect
      window.location.replace("/");

      return Promise.reject({
        message: "Session expired. Please login again.",
      });
    }

    if (error.response.status === 403) {
      return Promise.reject({
        message: "You do not have permission to perform this action.",
      });
    }

    if (error.response.status === 404) {
      return Promise.reject({
        message: "Resource not found.",
      });
    }

    if (error.response.status >= 500) {
      return Promise.reject({
        message: "Server error. Please try again later.",
      });
    }

    return Promise.reject(error.response.data);
  },
);

export default apiClient;
