// API Configuration for React Native Habit Tracker
// This file centralizes all API-related configuration

// Environment-based API URL configuration
export const getApiUrl = (): string => {
  if (__DEV__) {
    // Development configuration
    // Choose the appropriate option based on your setup:

    // Option 1: iOS Simulator (uncomment if using iOS simulator)
    // return "http://localhost:3000/api";

    // Option 2: Android Emulator (uncomment if using Android emulator)
    // return "http://10.0.2.2:3000/api";

    // Option 3: Physical Device (currently active - your network IP)
    return "http://192.168.1.106:3000/api";

    // Option 4: Network IP (this is the same as Option 3 above)
    // Get your IP with: npx react-native-get-ip or ipconfig/ifconfig
    // return "http://YOUR_IP_ADDRESS:3000/api";
  } else {
    // Production configuration
    // Replace with your actual production API URL
    return "https://your-production-domain.com/api";
  }
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    SIGN_IN: "/mobile-auth/signin",
    SIGN_UP: "/mobile-auth/signup",
  },
  HABITS: {
    LIST: "/habits",
    CREATE: "/habits",
    UPDATE: (id: string) => `/habits/${id}`,
    DELETE: (id: string) => `/habits/${id}`,
    COMPLETE: (id: string) => `/habits/${id}/complete`,
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
