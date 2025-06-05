// API Configuration for React Native Habit Tracker
// This file centralizes all API-related configuration

// Environment-based API URL configuration
export const getApiUrl = (): string => {
  if (__DEV__) {
    // Development configuration
    // IMPORTANT: Choose the correct option based on your setup:

    // ===== CHOOSE ONE OF THE FOLLOWING OPTIONS =====

    // Option 1: iOS Simulator (uncomment if using iOS simulator)
    // return "http://localhost:3000/api";

    // Option 2: Android Emulator (uncomment if using Android emulator)
    // return "http://10.0.2.2:3000/api";

    // Option 3: Physical Device or Expo Go (currently active)
    return "http://192.168.1.106:3000/api";

    // Option 4: Expo Tunnel (uncomment if using expo start --tunnel)
    // return "http://192.168.1.106:3000/api";

    // ===== END OPTIONS =====

    // Note: If you're still getting "Failed to fetch" errors:
    // 1. For iOS Simulator, use localhost
    // 2. For Android Emulator, use 10.0.2.2
    // 3. For Physical Device, use your computer's IP (run: npm run get-ip)
    // 4. Make sure your Next.js server is running: cd ../nextjs-habit-tracker && npm run dev
  } else {
    // Production configuration
    // Replace with your actual production API URL
    return "https://your-production-domain.com/api";
  }
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    SIGN_IN: "/auth/signin",
    SIGN_UP: "/auth/signup",
  },
  HABITS: {
    LIST: "/habits",
    CREATE: "/habits",
    UPDATE: (id: string) => `/habits/${id}`,
    DELETE: (id: string) => `/habits/${id}`,
    COMPLETE: (id: string) => `/habits/${id}/completions`,
    COMPLETIONS: (id: string) => `/habits/${id}/completions`,
  },
} as const;

// Storage keys for AsyncStorage
export const STORAGE_KEYS = {
  AUTH_TOKEN: "@auth_token",
  CURRENT_USER: "@current_user",
  USE_REMOTE_AUTH: "@use_remote_auth",
  USERS_LOCAL: "@users",
} as const;

// API response types
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
  console.log(
    "[API CONFIG] Full signin URL:",
    `${getApiUrl()}${API_ENDPOINTS.AUTH.SIGN_IN}`
  );
};
