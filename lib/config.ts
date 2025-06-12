import { Platform } from "react-native";
import { Client } from "appwrite";

// Configuration for the Habit Tracker app
export const CONFIG = {
  // API Configuration
  API: {
    // Base URL for the Next.js backend
    BASE_URL: process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.7:3000",

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
    PLATFORM: Platform.OS,
  },

  // Development flags
  DEBUG: {
    ENABLE_LOGGING: __DEV__,
    SHOW_API_ERRORS: __DEV__,
  },

  APPWRITE: {
    ENDPOINT:
      process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT ||
      "https://cloud.appwrite.io/v1",
    PROJECT_ID: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || "",
    DATABASE_ID: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || "",
    USERS_COLLECTION_ID:
      process.env.EXPO_PUBLIC_APPWRITE_USERS_COLLECTION_ID || "users",
    HABITS_COLLECTION_ID:
      process.env.EXPO_PUBLIC_APPWRITE_HABITS_COLLECTION_ID || "habits",
    HABIT_COMPLETIONS_COLLECTION_ID:
      process.env.EXPO_PUBLIC_APPWRITE_HABIT_COMPLETIONS_COLLECTION_ID ||
      "habit_completions",
  },

  STORAGE: {
    SECURE_KEYS: {
      USER_TOKEN: "user_token",
      USER_DATA: "user_data",
      AUTH_SESSION: "auth_session",
    },
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
    if (__DEV__) {
      console.log(`[CONFIG] Testing API connection to: ${CONFIG.API.BASE_URL}`);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.API.TIMEOUT);

    const response = await fetch(`${CONFIG.API.BASE_URL}/api/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (__DEV__) {
      console.log(
        `[CONFIG] API connection test response status: ${response.status}`
      );
    }

    return response.ok;
  } catch (error) {
    if (__DEV__) {
      console.error(`[CONFIG] API connection test failed:`, error);
    }
    return false;
  }
};

// Validation functions
export const validateConfig = (): boolean => {
  const requiredFields = [
    CONFIG.APPWRITE.PROJECT_ID,
    CONFIG.APPWRITE.DATABASE_ID,
  ];

  return requiredFields.every((field) => field && field.trim() !== "");
};

export default CONFIG;
