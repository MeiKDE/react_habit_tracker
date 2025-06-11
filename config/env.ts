import Constants from "expo-constants";

// Environment configuration for React Native/Expo
export const ENV_CONFIG = {
  // Appwrite API endpoint
  APPWRITE_ENDPOINT:
    Constants.expoConfig?.extra?.APPWRITE_ENDPOINT ||
    process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT ||
    "https://fra.cloud.appwrite.io/v1",

  // Appwrite project ID
  APPWRITE_PROJECT_ID:
    Constants.expoConfig?.extra?.APPWRITE_PROJECT_ID ||
    process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID ||
    "683db415003b8b011313",

  // Appwrite database ID
  APPWRITE_DATABASE_ID:
    Constants.expoConfig?.extra?.APPWRITE_DATABASE_ID ||
    process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID ||
    "683e6cb10010f47ea863",

  // Collection IDs
  USERS_COLLECTION_ID:
    Constants.expoConfig?.extra?.APPWRITE_USERS_COLLECTION_ID ||
    process.env.EXPO_PUBLIC_APPWRITE_USERS_COLLECTION_ID ||
    "users",

  HABITS_COLLECTION_ID:
    Constants.expoConfig?.extra?.APPWRITE_HABITS_COLLECTION_ID ||
    process.env.EXPO_PUBLIC_APPWRITE_HABITS_COLLECTION_ID ||
    "habits",

  HABIT_COMPLETIONS_COLLECTION_ID:
    Constants.expoConfig?.extra?.APPWRITE_HABIT_COMPLETIONS_COLLECTION_ID ||
    process.env.EXPO_PUBLIC_APPWRITE_HABIT_COMPLETIONS_COLLECTION_ID ||
    "habit_completions",

  // API URL for mobile app
  API_URL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:8081",

  // Frontend URL for CORS
  FRONTEND_URL: process.env.EXPO_PUBLIC_FRONTEND_URL || "http://localhost:3000",

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
