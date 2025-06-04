// API Configuration for React Native Habit Tracker
// This file centralizes all API-related configuration

// Environment-based API URL configuration
export const getApiUrl = (): string => {
  if (__DEV__) {
    // Development configuration
    // For iOS Simulator: use localhost
    // For Android Emulator: use 10.0.2.2
    // For physical device: use your computer's IP address
    return "http://localhost:3000/api";
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
