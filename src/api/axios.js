import axios from "axios";

// Environment configuration
const isDev = import.meta.env.DEV; // Vite provides this boolean
const MODE = import.meta.env.MODE; // 'development' or 'production'

// API URLs - use env variables only, no defaults
const TESTING_URL = import.meta.env.VITE_TESTING_API_URL || import.meta.env.VITE_DEV_API_URL; // Testing/Development API URL
const PROD_URL = import.meta.env.VITE_PROD_API_URL; // Production API URL

// Check if we're in production mode - prioritize VITE_ENVIRONMENT over MODE
// MODE is always 'production' in builds, so we rely on VITE_ENVIRONMENT
const isProductionMode = import.meta.env.VITE_ENVIRONMENT === "production";

// Determine which API URL to use
// If production mode, use production URL, otherwise use testing URL
const API_BASE_URL = isProductionMode ? PROD_URL : TESTING_URL;

// Common API path prefixes
export const API_PREFIX = "/v2";
export const COMMON_PREFIX = `${API_PREFIX}/common`;
export const STATISTICS_PREFIX = `${API_PREFIX}/outlet_statistics`;

// App metadata
export const APP_VERSION = "2.1.1";
export const APP_TYPE = "money_dashboard"; // used for general references
export const APP_TYPE_VERSIONCHECK = "money_dashboard"; // required by check_version (backend expected spelling)
export const APP_TYPE_DASHBOARD = "money_dashboard"; // backend expected value for auth

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Log environment info for debugging (always log, not just in dev)
console.log(`[API Config] Environment Debug:`, {
  MODE,
  VITE_ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT,
  isProductionMode,
  VITE_TESTING_API_URL: import.meta.env.VITE_TESTING_API_URL,
  VITE_DEV_API_URL: import.meta.env.VITE_DEV_API_URL,
  VITE_PROD_API_URL: import.meta.env.VITE_PROD_API_URL,
  TESTING_URL,
  PROD_URL,
  API_BASE_URL,
});

// Request interceptor for adding auth token and app_source
axiosInstance.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem("access_token");

    if (isDev) {
      console.log("Debug - API Request:", {
        url: config.url,
        method: config.method,
        hasToken: !!token,
      });
    }

    // If token exists, add it to the headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Check if this is a POST request with data
    if (config.method === "post" && config.data) {
      // Parse the request data (in case it's a string)
      let requestData =
        typeof config.data === "string" ? JSON.parse(config.data) : config.data;

      // Add app_source parameter if it doesn't exist
      if (!requestData.app_source) {
        requestData.app_source = "admin";
      }

      // If outlet_id is null or undefined, try to get it from localStorage
      if (
        requestData.outlet_id === null ||
        requestData.outlet_id === undefined
      ) {
        const storedOutletId = localStorage.getItem("outlet_id");
        if (storedOutletId && storedOutletId !== "null") {
          requestData.outlet_id = Number(storedOutletId);
        }
      }

      // Update the config data
      config.data =
        typeof config.data === "string"
          ? JSON.stringify(requestData)
          : requestData;
    } else if (config.method === "get") {
      // For GET requests, add app_source as a query parameter
      config.params = {
        ...config.params,
        app_source: "admin",
      };
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (isDev) {
      console.error("API Response Error:", {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
      });
    }

    // Handle common error scenarios
    if (error.response) {
      const { status, data } = error.response;

      // Handle 401 Unauthorized - typically expired or invalid token
      if (status === 401) {
        // Clear the auth state if token is invalid
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_id");
        localStorage.removeItem("user_name");
        localStorage.removeItem("mobile_number");
        localStorage.removeItem("role");

        // If not on login page, redirect to login
        if (!window.location.pathname.includes("/login")) {
          // Use timeout to prevent immediate redirect during ongoing request handling
          setTimeout(() => (window.location.href = "/login"), 500);
        }
      }

      // Handle offline mode errors
      if (
        data?.detail &&
        (data.detail.includes("offline mode") ||
          data.detail.includes("This operation is not allowed in offline mode"))
      ) {
        // Dispatch custom event for offline mode modal
        window.dispatchEvent(
          new CustomEvent("offline:error", {
            detail: { error },
          })
        );
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
