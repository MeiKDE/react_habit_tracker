// Configuration for the Habit Tracker app
export const CONFIG = {
  // API Configuration
  API: {
    // Base URL for the Next.js backend
    BASE_URL: __DEV__
      ? "http://172.20.10.3:3000/api" // Development - using IP address for physical device testing
      : "https://your-production-url.com/api", // Production URL - replace with your actual domain

    // Timeout for API requests (in milliseconds)
    TIMEOUT: 10000,

    // Default settings
    USE_REMOTE_API: true, // Set to false to use local storage only
    USE_REMOTE_AUTH: true, // Set to false to use local auth only
  },

  // Local Storage Keys
  STORAGE_KEYS: {
    AUTH_TOKEN: "@auth_token",
    CURRENT_USER: "@current_user",
    USERS: "@users",
    HABITS: "@habits",
    COMPLETIONS: "@completions",
    USE_REMOTE_AUTH: "@use_remote_auth",
    USE_REMOTE_API: "@use_remote_api",
  },

  // App Settings
  APP: {
    NAME: "Habit Tracker",
    VERSION: "1.0.0",
  },

  // Development flags
  DEBUG: {
    ENABLE_LOGGING: __DEV__,
    SHOW_API_ERRORS: __DEV__,
  },
};

// Helper function to get the full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${CONFIG.API.BASE_URL}${endpoint}`;
};

// Helper function to check if we're in development mode
export const isDevelopment = (): boolean => {
  return __DEV__;
};

// Helper function for logging (only in development)
export const log = (message: string, ...args: any[]): void => {
  if (CONFIG.DEBUG.ENABLE_LOGGING) {
    console.log(`[Habit Tracker] ${message}`, ...args);
  }
};

// Helper function for error logging
export const logError = (message: string, error: any): void => {
  if (CONFIG.DEBUG.SHOW_API_ERRORS || !__DEV__) {
    console.error(`[Habit Tracker Error] ${message}`, error);
  }
};
