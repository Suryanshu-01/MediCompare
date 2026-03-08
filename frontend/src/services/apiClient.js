import axios from "axios";
import {
  LOCAL_API_URL,
  REMOTE_API_URL,
  STORAGE_KEYS,
} from "../utils/constants";

// Track which backend URL is currently active
let currentBaseURL = LOCAL_API_URL;
let hasTestedLocal = false;

// Determine initial base URL based on environment
const isProduction =
  import.meta.env.PROD || import.meta.env.MODE === "production";

// In production, use remote by default. In development, try local first
if (isProduction) {
  currentBaseURL = REMOTE_API_URL;
  hasTestedLocal = true; // Skip local test in production
  console.log("🌐 BACKEND: Using REMOTE backend (Production mode)");
  console.log("📍 Remote URL:", REMOTE_API_URL);
} else {
  console.log("🔧 BACKEND: Starting with LOCAL backend (Development mode)");
  console.log("📍 Local URL:", LOCAL_API_URL);
  console.log("💡 Will fallback to remote if local is unavailable");
}

console.log("Environment:", import.meta.env.MODE);

const apiClient = axios.create({
  baseURL: currentBaseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 5000, // Reduced timeout for faster fallback
  withCredentials: true,
});

// REQUEST INTERCEPTOR
apiClient.interceptors.request.use(
  (config) => {
    const backendType = currentBaseURL === LOCAL_API_URL ? "LOCAL" : "REMOTE";
    console.log(
      `📡 BACKEND: ${config.method.toUpperCase()} request to ${backendType} backend:`,
      config.url,
    );

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
  async (error) => {
    const originalRequest = error.config;

    // Check if this is a network error (local backend not reachable)
    if (
      !error.response &&
      !hasTestedLocal &&
      currentBaseURL === LOCAL_API_URL
    ) {
      console.warn(
        "⚠️ BACKEND: Local backend not reachable, switching to remote backend...",
      );

      // Switch to remote backend
      currentBaseURL = REMOTE_API_URL;
      hasTestedLocal = true;
      apiClient.defaults.baseURL = REMOTE_API_URL;

      // Retry the request with remote backend
      originalRequest.baseURL = REMOTE_API_URL;
      originalRequest._retry = true;

      console.log("✅ BACKEND: Now using REMOTE backend:", REMOTE_API_URL);
      return apiClient(originalRequest);
    }

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

// Helper function for fetch-style requests with automatic fallback
export const fetchWithFallback = async (endpoint) => {
  try {
    // Try local backend first in development
    if (!hasTestedLocal && currentBaseURL === LOCAL_API_URL) {
      console.log(
        `🔍 BACKEND: Testing LOCAL backend connection for ${endpoint}`,
      );
      try {
        const response = await fetch(`${LOCAL_API_URL}${endpoint}`, {
          signal: AbortSignal.timeout(3000),
        });
        if (response.ok) {
          console.log(`✅ BACKEND: LOCAL backend connected successfully`);
          return response;
        }
        throw new Error("Local backend failed");
      } catch (localError) {
        console.warn(
          "⚠️ BACKEND: Local backend not reachable, switching to remote...",
        );
        currentBaseURL = REMOTE_API_URL;
        hasTestedLocal = true;
        apiClient.defaults.baseURL = REMOTE_API_URL;
        console.log("✅ BACKEND: Now using REMOTE backend:", REMOTE_API_URL);
      }
    }

    // Use current base URL (either local or remote)
    const backendType = currentBaseURL === LOCAL_API_URL ? "LOCAL" : "REMOTE";
    console.log(
      `📡 BACKEND: Fetching from ${backendType} backend: ${endpoint}`,
    );
    return fetch(`${currentBaseURL}${endpoint}`);
  } catch (error) {
    console.error("❌ BACKEND: Fetch error:", error);
    throw error;
  }
};

export default apiClient;
