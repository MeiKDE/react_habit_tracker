// API Configuration for React Native Habit Tracker
// This file centralizes all API-related configuration
import { ENV_CONFIG } from "./env";

// Environment-based API URL configuration
export const getApiUrl = (): string => {
  // Check if we have a configured API URL from environment
  if (ENV_CONFIG.API_URL && ENV_CONFIG.API_URL !== "http://localhost:8081") {
    return ENV_CONFIG.API_URL;
  }

  if (__DEV__) {
    // Development configuration
    // IMPORTANT: Choose the correct option based on your setup:

    // ===== CHOOSE ONE OF THE FOLLOWING OPTIONS =====

    // Option 1: iOS Simulator (recommended for iOS simulator)
    return "http://localhost:3000/api";

    // Option 2: Android Emulator (uncomment if using Android emulator)
    // return "http://10.0.2.2:3000/api";

    // Option 3: Physical Device or Expo Go (uncomment and update IP if using physical device)
    // Get your computer's IP with: ifconfig | grep "inet " | grep -v 127.0.0.1
    // return "http://192.168.1.106:3000/api";

    // Option 4: Expo Tunnel (uncomment if using expo start --tunnel)
    // return "http://192.168.1.106:3000/api";

    // ===== END OPTIONS =====

    // Note: If you're still getting "Failed to fetch" errors:
    // 1. For iOS Simulator, use localhost:3000
    // 2. For Android Emulator, use 10.0.2.2:3000
    // 3. For Physical Device, use your computer's IP address with port 3000
    // 4. Make sure your Next.js server is running: cd ../nextjs-habit-tracker && npm run dev
  } else {
    // Production configuration
    // Replace with your actual production API URL
    return (
      ENV_CONFIG.FRONTEND_URL.replace(
        "http://localhost:3000",
        "https://your-production-domain.com"
      ) + "/api"
    );
  }
};

// API endpoints (matching NextJS structure)
export const API_ENDPOINTS = {
  AUTH: {
    SIGN_IN: "/auth/signin",
    SIGN_UP: "/auth/signup",
    SESSION: "/auth/session",
    DEBUG: "/auth/debug",
  },
  HABITS: {
    LIST: "/habits",
    CREATE: "/habits",
    UPDATE: (id: string) => `/habits/${id}`,
    DELETE: (id: string) => `/habits/${id}`,
    COMPLETE: (id: string) => `/habits/${id}/completions`,
    COMPLETIONS: (id: string) => `/habits/${id}/completions`,
  },
  COMPLETIONS: {
    LIST: "/completions",
  },
} as const;

// Storage keys for AsyncStorage
export const STORAGE_KEYS = {
  AUTH_TOKEN: "@auth_token",
  CURRENT_USER: "@current_user",
  USE_REMOTE_AUTH: "@use_remote_auth",
  USERS_LOCAL: "@users",
} as const;

// API response types (matching NextJS structure)
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: any;
}

// Common API configuration
export const API_CONFIG = {
  timeout: 10000, // 10 seconds
  headers: {
    "Content-Type": "application/json",
  },
} as const;

// Debug function to log current configuration
export const logApiConfig = () => {
  console.log("[API CONFIG] Current API URL:", getApiUrl());
  console.log("[API CONFIG] Environment Config:", {
    apiUrl: ENV_CONFIG.API_URL,
    frontendUrl: ENV_CONFIG.FRONTEND_URL,
    endpoint: ENV_CONFIG.APPWRITE_ENDPOINT,
    projectId: ENV_CONFIG.APPWRITE_PROJECT_ID?.substring(0, 8) + "...",
  });
  console.log(
    "[API CONFIG] Full signin URL:",
    `${getApiUrl()}${API_ENDPOINTS.AUTH.SIGN_IN}`
  );
};

// Network debugging helper
export const debugNetworkConfig = async () => {
  if (__DEV__) {
    console.log("🔍 [NETWORK DEBUG] Testing API connectivity...");

    try {
      const testUrl = `${getApiUrl()}${API_ENDPOINTS.AUTH.DEBUG}`;
      console.log("🔍 [NETWORK DEBUG] Testing URL:", testUrl);

      const response = await fetch(testUrl, {
        method: "GET",
        headers: API_CONFIG.headers,
      });

      console.log("🔍 [NETWORK DEBUG] Response status:", response.status);
      const result = await response.json();
      console.log("🔍 [NETWORK DEBUG] Response data:", result);

      return { success: true, status: response.status, data: result };
    } catch (error: any) {
      console.error("🔍 [NETWORK DEBUG] Connection failed:", error);
      return { success: false, error: error.message };
    }
  }
};
