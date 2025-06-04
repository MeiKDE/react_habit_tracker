// Configuration for the Habit Tracker app
export const CONFIG = {
  // API Configuration
  API: {
    // Base URL for the Next.js backend
    BASE_URL: __DEV__
      ? "http://192.168.1.106:3000/api" // Updated with correct IP address
      : "https://your-production-url.com/api", // Production URL - replace with your actual domain

    // Timeout for API requests (in milliseconds)
    TIMEOUT: 10000,

    // Default settings - FORCE remote API usage
    USE_REMOTE_API: true, // Force remote API
    USE_REMOTE_AUTH: true, // Force remote auth
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

// Helper function to test API connection
export const testApiConnection = async (): Promise<boolean> => {
  try {
    console.log(`[CONFIG] Testing API connection to: ${CONFIG.API.BASE_URL}`);

    // Create timeout signal
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(`${CONFIG.API.BASE_URL}/habits`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    console.log(
      `[CONFIG] API connection test response status: ${response.status}`
    );

    // Even if we get 401 (unauthorized), it means the server is reachable
    return response.status === 401 || response.status === 200;
  } catch (error) {
    console.error(`[CONFIG] API connection test failed:`, error);
    return false;
  }
};
