import axios from "axios";
import {
  LOCAL_API_URL,
  REMOTE_API_URL,
  STORAGE_KEYS,
} from "../utils/constants";

// Function to check if local backend is available
const checkLocalBackend = async () => {
  try {
    await axios.get(`${LOCAL_API_URL}/health`, { timeout: 2000 });
    return true;
  } catch (error) {
    return false;
  }
};

// Determine which backend to use
let baseURL = LOCAL_API_URL;
const isLocalAvailable = await checkLocalBackend();

if (!isLocalAvailable) {
  baseURL = REMOTE_API_URL;
} else {
}

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
