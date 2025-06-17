import Constants from "expo-constants";

// Helper function to get required environment variable
const getRequiredEnvVar = (key: string, envKey: string): string => {
  const value = Constants.expoConfig?.extra?.[key] || process.env[envKey];
  if (!value) {
    throw new Error(`Missing required environment variable: ${envKey}`);
  }
  return value;
};

// Helper function to get optional environment variable with fallback
const getOptionalEnvVar = (
  key: string,
  envKey: string,
  fallback: string
): string => {
  return Constants.expoConfig?.extra?.[key] || process.env[envKey] || fallback;
};

// Environment configuration for React Native/Expo
export const ENV_CONFIG = {
  // Appwrite API endpoint
  APPWRITE_ENDPOINT: getRequiredEnvVar(
    "APPWRITE_ENDPOINT",
    "EXPO_PUBLIC_APPWRITE_ENDPOINT"
  ),

  // Appwrite project ID
  APPWRITE_PROJECT_ID: getRequiredEnvVar(
    "APPWRITE_PROJECT_ID",
    "EXPO_PUBLIC_APPWRITE_PROJECT_ID"
  ),

  // Appwrite database ID
  APPWRITE_DATABASE_ID: getRequiredEnvVar(
    "APPWRITE_DATABASE_ID",
    "EXPO_PUBLIC_APPWRITE_DATABASE_ID"
  ),

  // Collection IDs
  USERS_COLLECTION_ID: getOptionalEnvVar(
    "APPWRITE_USERS_COLLECTION_ID",
    "EXPO_PUBLIC_APPWRITE_USERS_COLLECTION_ID",
    "users"
  ),

  HABITS_COLLECTION_ID: getOptionalEnvVar(
    "APPWRITE_HABITS_COLLECTION_ID",
    "EXPO_PUBLIC_APPWRITE_HABITS_COLLECTION_ID",
    "habits"
  ),

  HABIT_COMPLETIONS_COLLECTION_ID: getOptionalEnvVar(
    "APPWRITE_HABIT_COMPLETIONS_COLLECTION_ID",
    "EXPO_PUBLIC_APPWRITE_HABIT_COMPLETIONS_COLLECTION_ID",
    "habit_completions"
  ),

  // API URL for mobile app
  API_URL: getOptionalEnvVar(
    "",
    "EXPO_PUBLIC_API_URL",
    "http://localhost:8081/auth"
  ),

  // Frontend URL for CORS
  FRONTEND_URL: getOptionalEnvVar(
    "",
    "EXPO_PUBLIC_FRONTEND_URL",
    "http://localhost:3000/login"
  ),

  // Environment
  NODE_ENV: process.env.NODE_ENV || "development",
  IS_DEV: process.env.NODE_ENV !== "production",
};

// Validation function
export const validateConfig = (): boolean => {
  const required = [
    "APPWRITE_ENDPOINT",
    "APPWRITE_PROJECT_ID",
    "APPWRITE_DATABASE_ID",
    "USERS_COLLECTION_ID",
    "HABITS_COLLECTION_ID",
    "HABIT_COMPLETIONS_COLLECTION_ID",
  ];

  const missing = required.filter(
    (key) => !ENV_CONFIG[key as keyof typeof ENV_CONFIG]
  );

  if (missing.length > 0) {
    console.error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
    return false;
  }

  return true;
};

// Debug function
export const debugConfig = (): void => {
  if (__DEV__) {
    console.log("[ENV CONFIG]", {
      endpoint: ENV_CONFIG.APPWRITE_ENDPOINT,
      projectId: ENV_CONFIG.APPWRITE_PROJECT_ID?.substring(0, 8) + "...",
      databaseId: ENV_CONFIG.APPWRITE_DATABASE_ID?.substring(0, 8) + "...",
      collections: {
        users: ENV_CONFIG.USERS_COLLECTION_ID,
        habits: ENV_CONFIG.HABITS_COLLECTION_ID,
        completions: ENV_CONFIG.HABIT_COMPLETIONS_COLLECTION_ID,
      },
    });
  }
};

export default ENV_CONFIG;
